type TutorRequest = {
  message?: string;
  profile?: unknown;
  diagnosticSummary?: unknown;
};

type Env = {
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

function fallbackTutor(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('дроб') || normalized.includes('fraction')) {
    return 'Разберём дроби по шагам. Дробь показывает часть целого. Например, 8/12 можно сократить: 8 и 12 делятся на 4, значит 8/12 = 2/3. Попробуй сам: сократи 10/15.';
  }

  if (normalized.includes('процент') || normalized.includes('%') || normalized.includes('скид')) {
    return 'Процент — это часть от 100. Например, 25% = 1/4. Если цена 120 ₪ и скидка 25%, то скидка 120 / 4 = 30, новая цена 120 − 30 = 90.';
  }

  if (normalized.includes('уравн') || normalized.includes('x')) {
    return 'В уравнении нужно оставить x один. Например: x + 9 = 20. Вычитаем 9 из обеих частей: x = 20 − 9 = 11.';
  }

  return 'Я готов помочь. Напиши задачу по математике, и я объясню её коротко, по шагам, с примером и проверочным вопросом.';
}

async function handleTutor(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: TutorRequest;
  try {
    body = (await request.json()) as TutorRequest;
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = String(body.message ?? '').trim();
  if (!message) {
    return json({ error: 'Message is required' }, { status: 400 });
  }

  if (!env.OPENAI_API_KEY) {
    return json({ answer: fallbackTutor(message), mode: 'fallback', warning: 'missing_openai_key' });
  }

  const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Ты AI-репетитор по математике для школьника. Отвечай по-русски, спокойно, коротко и пошагово. Не давай просто ответ: объясни ход решения и задай один проверочный вопрос.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            message,
            profile: body.profile ?? null,
            diagnosticSummary: body.diagnosticSummary ?? null,
          }),
        },
      ],
    }),
  });

  if (!openAiResponse.ok) {
    return json({
      answer: fallbackTutor(message),
      mode: 'fallback',
      warning: `openai_http_${openAiResponse.status}`,
    });
  }

  const data = (await openAiResponse.json()) as any;
  const answer = data?.choices?.[0]?.message?.content ?? fallbackTutor(message);
  return json({ answer, mode: 'ai' });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/tutor-status') {
      return json({
        ok: true,
        openaiConfigured: Boolean(env.OPENAI_API_KEY),
      });
    }

    if (url.pathname === '/api/tutor') {
      return handleTutor(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
