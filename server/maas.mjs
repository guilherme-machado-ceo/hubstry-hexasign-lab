const DEFAULT_MODEL = 'glm-5.2';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const OBSERVATION_SCHEMA = {
  name: 'hexasign_observation',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      summary: { type: 'string' },
      observations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            claim: { type: 'string' },
            evidence: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  source: { type: 'string', enum: ['hexasign-engine', 'user-input'] },
                  field: { type: 'string' },
                  value: { type: ['number', 'string', 'boolean'] },
                  excerpt: { type: 'string' },
                },
                required: ['source', 'field', 'value', 'excerpt'],
              },
            },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            status: { type: 'string', enum: ['SUPPORTED', 'PARTIALLY_SUPPORTED', 'UNCERTAIN', 'UNSUPPORTED'] },
          },
          required: ['claim', 'evidence', 'confidence', 'status'],
        },
      },
      unknowns: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['summary', 'observations', 'unknowns'],
  },
};

export async function callMaaS({ text, metrics }) {
  const baseUrl = requiredEnv('MAAS_BASE_URL').replace(/\/$/, '');
  const apiKey = requiredEnv('MAAS_API_KEY');
  const model = process.env.MAAS_MODEL || DEFAULT_MODEL;

  const system = [
    'You are the HexaSign Lab observation layer.',
    'You are NOT the authority for HexaSign mathematics.',
    'Never invent, modify, recompute, or estimate HexaSign metric values.',
    'Only interpret the supplied deterministic facts.',
    'Every observation MUST cite at least one supplied HexaSign metric as evidence.',
    'For metric evidence, copy the exact numeric value supplied by the engine.',
    'If evidence is insufficient, put the issue in unknowns and do not make the claim.',
    'Do not introduce external factual claims about the artifact.',
    'Do not compute, derive, aggregate, average, normalize, estimate, or transform metric values.',
    'Only cite and interpret values exactly as supplied by the HexaSign engine.',
  ].join(' ');

  const payload = {
    model,
    stream: false,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: JSON.stringify({
          artifact: text,
          deterministic_hexa_metrics: metrics,
          instruction: 'Interpret only the supplied artifact and deterministic facts.',
        }),
      },
    ],
    temperature: 0,
    max_tokens: 4096,
    tools: [{
      type: 'function',
      function: {
        name: 'hexasign_observation',
        description: 'Return the structured observation of the supplied deterministic HexaSign facts.',
        parameters: OBSERVATION_SCHEMA.schema,
      },
    }],
    tool_choice: { type: 'function', function: { name: 'hexasign_observation' } },
  };

  const RETRYABLE_STATUSES = new Set([502, 504, 520]);
  const RETRY_DELAY_MS = Number(process.env.MAAS_RETRY_DELAY_MS ?? 15000);
  const MAX_ATTEMPTS = 2; // 1 tentativa + 1 retry

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const sanitizeUpstreamError = (status, rawBody) => {
    if (/<!doctype|<html/i.test(rawBody)) {
      return `O gateway Digiti está temporariamente indisponível (HTTP ${status}). Tente novamente em instantes.`;
    }
    return `MaaS HTTP ${status}: ${rawBody.slice(0, 500)}`;
  };

  let response;
  let body = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    body = await response.text();
    if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS) break;
    console.error(JSON.stringify({ event: 'maas_retry', status: response.status, attempt }));
    await sleep(RETRY_DELAY_MS);
  }

  if (!response.ok) throw new Error(sanitizeUpstreamError(response.status, body));

  const data = JSON.parse(body);
  const choice = data?.choices?.[0];
  const finishReason = choice?.finish_reason;
  const toolCall = choice?.message?.tool_calls
    ?.find((c) => c?.function?.name === 'hexasign_observation');
  const diag = { event: 'maas_observe', finishReason, usage: data?.usage ?? null,
                 toolCallPresent: Boolean(toolCall) };

  if (finishReason === 'length') {
    console.error(JSON.stringify({ ...diag, error: 'TRUNCATED' }));
    throw new Error('MaaS observation truncated (finish_reason=length)');
  }
  if (!toolCall) {
    console.error(JSON.stringify({ ...diag, error: 'NO_TOOL_CALL' }));
    throw new Error('MaaS did not return the required hexasign_observation tool call');
  }
  let parsed;
  try {
    parsed = JSON.parse(toolCall.function.arguments);
  } catch {
    console.error(JSON.stringify({ ...diag, error: 'ARGUMENTS_NOT_JSON' }));
    throw new Error('MaaS tool call arguments were not valid JSON');
  }

  return {
    provider: 'Huawei Cloud MaaS',
    model: data?.model || model,
    modelVersion: data?.model || model,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    observations: Array.isArray(parsed.observations) ? parsed.observations : [],
    unknowns: Array.isArray(parsed.unknowns) ? parsed.unknowns : [],
    validation: { status: 'INVALID', errors: ['NOT_VALIDATED'] },
  };
}
