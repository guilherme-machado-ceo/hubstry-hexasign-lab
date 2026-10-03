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
    response_format: {
      type: 'json_schema',
      json_schema: OBSERVATION_SCHEMA,
    },
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) throw new Error(`MaaS HTTP ${response.status}: ${body.slice(0, 500)}`);

  const data = JSON.parse(body);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('MaaS response did not contain assistant content');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('MaaS returned non-JSON content despite structured-output request');
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
