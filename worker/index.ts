type TutorRequest = {
  message?: string;
  profile?: unknown;
  diagnosticSummary?: unknown;
};

type Env = {
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
};

type AiResult = {
  ok: boolean;
  provider?: 'gemini' | 'openai';
  answer?: string;
  status?: number;
  error?: string;
};

const TUTOR_SYSTEM_PROMPT = [
  'Ты AI-репетитор по математике для школьника.',
  'Отвечай по-русски, спокойно, коротко и пошагово.',
  'Главный приоритет — последнее сообщение ученика в поле message.',
  'diagnosticSummary и profile используй только как вторичный контекст: не меняй тему на слабую тему диагностики, если ученик спросил о другом.',
  'Если сообщение очень короткое, например "%", считай, что ученик просит объяснить проценты.',
  'Не давай просто ответ: объясни ход решения и задай один проверочный вопрос.',
  'Не начинай длинные лекции не по теме вопроса.',
].join(' ');

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

function normalizeTutorMessage(message: string) {
  const trimmed = message.trim();
  if (trimmed === '%') {
    return 'Объясни проценты: что значит процент и как найти 25% от 120.';
  }
  return trimmed;
}

function makeTutorInput(message: string, profile: unknown, diagnosticSummary: unknown) {
  return JSON.stringify({
    message: normalizeTutorMessage(message),
    originalMessage: message,
    profile,
    diagnosticSummary,
    instruction: 'Ответь именно на message. Диагностику используй только для выбора простоты объяснения.',
  });
}

async function askGemini(env: Env, message: string, profile: unknown, diagnosticSummary: unknown): Promise<AiResult> {
  if (!env.GEMINI_API_KEY) {
    return { ok: false, provider: 'gemini', error: 'missing_gemini_key' };
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': env.GEMINI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: TUTOR_SYSTEM_PROMPT }],
        },
        contents: [
          {
            parts: [{ text: makeTutorInput(message, profile, diagnosticSummary) }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 700,
        },
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        provider: 'gemini',
        status: response.status,
        error: rawText.slice(0, 500),
      };
    }

    const data = JSON.parse(rawText) as any;
    const answer = data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text ?? '').join('').trim();

    if (!answer) {
      return { ok: false, provider: 'gemini', status: response.status, error: 'empty_gemini_answer' };
    }

    return { ok: true, provider: 'gemini', answer };
  } catch (error) {
    return {
      ok: false,
      provider: 'gemini',
      error: error instanceof Error ? error.message : 'unknown_gemini_error',
    };
  }
}

async function askOpenAi(env: Env, message: string, profile: unknown, diagnosticSummary: unknown): Promise<AiResult> {
  if (!env.OPENAI_API_KEY) {
    return { ok: false, provider: 'openai', error: 'missing_openai_key' };
  }

  try {
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
            content: TUTOR_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: makeTutorInput(message, profile, diagnosticSummary),
          },
        ],
      }),
    });

    const rawText = await openAiResponse.text();

    if (!openAiResponse.ok) {
      return {
        ok: false,
        provider: 'openai',
        status: openAiResponse.status,
        error: rawText.slice(0, 500),
      };
    }

    const data = JSON.parse(rawText) as any;
    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return { ok: false, provider: 'openai', status: openAiResponse.status, error: 'empty_openai_answer' };
    }

    return { ok: true, provider: 'openai', answer };
  } catch (error) {
    return {
      ok: false,
      provider: 'openai',
      error: error instanceof Error ? error.message : 'unknown_openai_error',
    };
  }
}

async function askBestProvider(env: Env, message: string, profile: unknown, diagnosticSummary: unknown): Promise<AiResult> {
  const gemini = await askGemini(env, message, profile, diagnosticSummary);
  if (gemini.ok) return gemini;

  const openai = await askOpenAi(env, message, profile, diagnosticSummary);
  if (openai.ok) return openai;

  return {
    ok: false,
    error: `gemini:${gemini.status ?? gemini.error}; openai:${openai.status ?? openai.error}`,
  };
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

  const ai = await askBestProvider(env, message, body.profile ?? null, body.diagnosticSummary ?? null);

  if (!ai.ok) {
    return json({
      answer: fallbackTutor(message),
      mode: 'fallback',
      warning: ai.error,
    });
  }

  return json({ answer: ai.answer, mode: 'ai', provider: ai.provider });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/tutor-status') {
      return json({
        ok: true,
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        openaiConfigured: Boolean(env.OPENAI_API_KEY),
      });
    }

    if (url.pathname === '/api/tutor-test') {
      const gemini = await askGemini(env, 'Объясни коротко: 25% от 120.', null, null);
      const openai = gemini.ok ? null : await askOpenAi(env, 'Объясни коротко: 25% от 120.', null, null);
      const best = gemini.ok ? gemini : openai;

      return json({
        ok: true,
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        openaiConfigured: Boolean(env.OPENAI_API_KEY),
        aiOk: Boolean(best?.ok),
        provider: best?.provider ?? null,
        status: best?.status ?? null,
        error: best?.error ?? null,
        answer: best?.answer ?? null,
      });
    }

    if (url.pathname === '/api/tutor') {
      return handleTutor(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
