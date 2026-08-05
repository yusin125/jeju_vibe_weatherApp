import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import type { City, TemperatureUnit, WeatherData } from '@/types';
import { buildWeatherContext, sendChatMessage, type ChatTurn } from '@/lib/chat';

interface ChatBotProps {
  city: City;
  data: WeatherData | null;
  unit: TemperatureUnit;
}

interface DisplayMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

const GREETING: DisplayMessage = {
  role: 'model',
  text: '이 지역 날씨에 대해 궁금한 걸 물어보세요. 예: "오늘 우산 챙겨야 해?", "내일 뭐 입지?"',
};

export function ChatBot({ city, data, unit }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [apiHistory, setApiHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const weatherContext = useMemo(
    () => (data ? buildWeatherContext(city, data, unit) : null),
    [city, data, unit],
  );

  useEffect(() => {
    if (isOpen) listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !weatherContext) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(trimmed, apiHistory, weatherContext);
      setApiHistory((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'model', text: reply }]);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '챗봇 응답을 가져오지 못했어요.';
      setMessages((prev) => [...prev, { role: 'model', text: message, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] max-h-[70vh] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white sm:right-6">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">날씨 챗봇</p>
                <p className="text-[11px] text-slate-400">{city.name} 날씨 기반 답변</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="닫기"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : msg.isError
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3.5 py-2.5 text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs font-medium">답변 작성 중...</span>
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={weatherContext ? '메시지를 입력하세요' : '날씨 정보를 불러오는 중...'}
              disabled={!weatherContext || loading}
              maxLength={500}
              className="w-full min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!weatherContext || loading || !input.trim()}
              aria-label="전송"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="날씨 챗봇 열기"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white transition-transform hover:scale-105 sm:right-6"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
