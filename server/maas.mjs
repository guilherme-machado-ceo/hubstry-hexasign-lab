const DEFAULT_MODEL = 'GLM-5.2';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

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
    'If evidence is insufficient, put the issue in unknowns and do not make the claim.',
    'Return JSON only with summary, observations, unknowns.',
    'Each observation must contain claim, evidence, confidence, and status.',
  ].join(' ');

  const payload = {
    model,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: JSON.stringify({
          artifact: text,
          deterministic_hexa_metrics: metrics,
          instruction: 'Interpret the artifact only through the supplied facts. Do not introduce external factual claims.',
        }),
      },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(`${baseUrl}/v2/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) throw new Error(`MaaS HTTP ${response.status}: ${body.slice(0, 500)}`);

  const data = JSON.parse(body);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('MaaS response did not contain assistant content');

  const parsed = JSON.parse(content);
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
