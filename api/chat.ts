import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-flash-latest';
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 20;
const MAX_CONTEXT_LENGTH = 4000;

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

function buildSystemInstruction(weatherContext: unknown): string {
  const contextJson = JSON.stringify(weatherContext ?? {}).slice(0, MAX_CONTEXT_LENGTH);
  return [
    '당신은 한국어로 답하는 친절한 날씨 어시스턴트입니다.',
    '아래 JSON은 사용자가 지금 화면에서 보고 있는 실시간 날씨 데이터(도시, 현재 날씨, 시간별/일별 예보, 미세먼지)입니다.',
    '이 데이터를 근거로 옷차림, 우산, 야외활동 등 실용적인 조언을 짧고 자연스럽게 답하세요.',
    '데이터에 없는 정보는 추측하지 말고 모른다고 답하세요.',
    '날씨와 무관한 질문에는 정중히 답을 거절하고 날씨 관련 질문을 유도하세요.',
    '채팅 UI가 마크다운을 렌더링하지 않으니 **굵게**, 목록 기호(*, -) 같은 마크다운 서식을 쓰지 말고 일반 문장으로만 답하세요.',
    '```json',
    contextJson,
    '```',
  ].join('\n');
}

function sanitizeHistory(history: unknown): ChatTurn[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (turn): turn is ChatTurn =>
        turn &&
        (turn.role === 'user' || turn.role === 'model') &&
        typeof turn.text === 'string',
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({ role: turn.role, text: turn.text.slice(0, MAX_MESSAGE_LENGTH) }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되어 있지 않아요.' });
    return;
  }

  const { message, history, weatherContext } = (req.body ?? {}) as {
    message?: unknown;
    history?: unknown;
    weatherContext?: unknown;
  };

  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message가 필요해요.' });
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.` });
    return;
  }

  const turns = sanitizeHistory(history);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      ...turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: buildSystemInstruction(weatherContext) },
    });

    res.status(200).json({ reply: response.text ?? '' });
  } catch (err) {
    console.error('Gemini chat error:', err);
    res.status(502).json({ error: 'Gemini 응답을 가져오지 못했어요. 잠시 후 다시 시도해주세요.' });
  }
}
