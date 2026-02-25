import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiApi } from '../api';
import { isApiError } from '../types/api';
import type { ChatMessage } from '../types/api';
import { getCachedChatMessages, setCachedChatMessages, clearCachedChat } from '../lib/chatCache';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  Zap,
  CheckCircle2,
  Pencil,
  Copy,
  Check,
  RotateCcw,
  HardHat,
  Clock,
  ChevronDown,
} from 'lucide-react';

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRe = /(\*\*[^*]+\*\*)/g;
  const subParts = text.split(boldRe);

  subParts.forEach((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      parts.push(
        <strong key={`bold-${i}`} className="font-semibold text-stone-800 dark:text-stone-200">
          {part.slice(2, -2)}
        </strong>
      );
    } else {
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = linkRe.exec(part)) !== null) {
        if (match.index > lastIndex) parts.push(part.slice(lastIndex, match.index));
        const label = match[1];
        const href = match[2];
        const isSameSite = href.startsWith('/') && !href.startsWith('//');
        parts.push(
          isSameSite ? (
            <Link
              key={`link-${match.index}`}
              to={href}
              className="font-medium text-[#800000] underline underline-offset-2 decoration-[#800000]/30 hover:decoration-[#800000] transition-colors"
            >
              {label}
            </Link>
          ) : (
            <a
              key={`link-${match.index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#800000] underline underline-offset-2 decoration-[#800000]/30 hover:decoration-[#800000] transition-colors"
            >
              {label}
            </a>
          )
        );
        lastIndex = linkRe.lastIndex;
      }
      if (lastIndex < part.length) parts.push(part.slice(lastIndex));
    }
  });
  return parts;
}

// ─── Message formatter ────────────────────────────────────────────────────────
function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) return <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{content}</div>;

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: string[] = [];

  const flushList = (key: number) => {
    if (currentList.length === 0) return;
    elements.push(
      <ul key={`list-${key}`} className="my-3 space-y-1.5">
        {currentList.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="mt-[5px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#800000]/10 dark:bg-[#800000]/25">
              <CheckCircle2 className="h-2.5 w-2.5 text-[#800000]" />
            </span>
            <span className="text-[14px] text-stone-700 dark:text-stone-300 leading-relaxed flex-1">
              {renderContent(item)}
            </span>
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(idx); return; }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[-*\d.]+\s+/, ''));
      return;
    }

    flushList(idx);

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100) {
      elements.push(
        <h4
          key={idx}
          className="mt-5 mb-1.5 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-[#800000] dark:text-[#e06060]"
        >
          <span className="h-px flex-1 bg-[#800000]/15 dark:bg-[#800000]/30" />
          {renderContent(trimmed.replace(/\*\*/g, ''))}
          <span className="h-px flex-1 bg-[#800000]/15 dark:bg-[#800000]/30" />
        </h4>
      );
    } else {
      elements.push(
        <p key={idx} className="my-1.5 text-[14px] leading-relaxed text-stone-700 dark:text-stone-300">
          {renderContent(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return <div className="space-y-0.5 min-w-0">{elements}</div>;
}

// ─── Time helper ──────────────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AiPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(getCachedChatMessages(userId)); }, [userId]);

  useEffect(() => {
    if (messages.length > 0) setCachedChatMessages(messages, userId);
    else clearCachedChat(userId);
  }, [messages, userId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'instant' as ScrollBehavior });
  }, [messages, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setShowScrollBtn(false);
  };

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: q };
    const baseMessages = editingIndex !== null ? messages.slice(0, editingIndex) : messages;
    const baseTimes = editingIndex !== null ? timestamps.slice(0, editingIndex) : timestamps;
    setMessages([...baseMessages, userMessage]);
    setTimestamps([...baseTimes, getTime()]);
    setQuestion('');
    setEditingIndex(null);
    setLoading(true);

    const res = await aiApi.chat({ messages: [...baseMessages, userMessage] });
    setLoading(false);

    if (isApiError(res)) {
      setError(res.error.message);
      return;
    }

    const data = res.data as { response?: string; reply?: string; message?: { content: string } };
    const reply = data?.response ?? data?.reply ?? data?.message?.content ?? 'No reply.';
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setTimestamps((t) => [...t, getTime()]);
  };

  const clearChat = () => {
    clearCachedChat(userId);
    setMessages([]);
    setTimestamps([]);
    setError(null);
  };

  const editUserMessage = (index: number) => {
    setEditingIndex(index);
    setQuestion(messages[index].content);
    inputRef.current?.focus();
  };

  const copyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const suggestedQuestions = [
    { icon: HardHat,       text: 'What services do you offer?',   gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50 dark:bg-amber-950/30',    border: 'border-amber-200/70 dark:border-amber-800/40'   },
    { icon: TrendingUp,    text: 'Typical project timelines?',    gradient: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-50 dark:bg-emerald-950/30',border: 'border-emerald-200/70 dark:border-emerald-800/40'},
    { icon: MessageCircle, text: 'Book a consultation?',          gradient: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',      border: 'border-blue-200/70 dark:border-blue-800/40'     },
    { icon: Zap,           text: 'Why choose RECON?',             gradient: 'from-[#800000] to-[#a00000]',   bg: 'bg-red-50 dark:bg-red-950/30',        border: 'border-red-200/70 dark:border-red-800/40'       },
    { icon: Lightbulb,     text: 'How are estimates calculated?', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30',  border: 'border-violet-200/70 dark:border-violet-800/40' },
    { icon: Clock,         text: "What's your process?",          gradient: 'from-rose-500 to-pink-500',     bg: 'bg-rose-50 dark:bg-rose-950/30',      border: 'border-rose-200/70 dark:border-rose-800/40'     },
  ];

  return (
    <div className="mx-auto max-w-4xl pb-12 pt-6 px-4 flex flex-col gap-5">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6b0000] via-[#800000] to-[#9a0000] shadow-2xl">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-14 -right-14 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <div className="relative z-10 px-7 py-7 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · AI Assistant
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight" style={{ letterSpacing: '-0.025em' }}>
              Construction Expert AI
            </h1>
            <p className="mt-2 text-white/65 text-sm sm:text-[15px] max-w-md leading-relaxed">
              Instant answers on estimates, timelines, materials and our full building process.
            </p>
          </div>
          <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
            <Sparkles className="h-7 w-7 text-white/90" />
          </div>
        </div>
      </div>

      {/* ── Chat Shell ───────────────────────────────────────────────── */}
      <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#800000] to-[#a00000] shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 leading-none">RECON AI</p>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5 leading-none">● Active</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-[11.5px] font-medium text-stone-400 hover:text-[#800000] dark:hover:text-[#e06060] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <RotateCcw className="h-3 w-3" />
              Clear chat
            </button>
          )}
        </div>

        {/* ── Message list ─────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 h-[520px] overflow-y-auto overscroll-contain px-5 py-5 space-y-5"
          style={{
            background: 'linear-gradient(160deg, #fafaf9 0%, #ffffff 100%)',
          }}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center select-none">
              <div className="relative mb-5">
                <div className="absolute inset-0 scale-[2] bg-[#800000]/8 blur-2xl rounded-full" />
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#800000] to-[#a00000] shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-[15px] font-semibold text-stone-700 dark:text-stone-300">How can I help you today?</h3>
              <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-1 mb-6 text-center max-w-xs">
                Pick a prompt to get started or type your own question below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-2xl">
                {suggestedQuestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => { setQuestion(s.text); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className={cn(
                        'group text-left px-3.5 py-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
                        s.bg, s.border
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient} shadow-sm`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-[12.5px] font-medium text-stone-700 dark:text-stone-300 leading-snug pt-0.5 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                          {s.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const time = timestamps[i];
            return (
              <div
                key={i}
                className={cn('group flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300', isUser ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div className={cn(
                  'h-9 w-9 shrink-0 rounded-xl flex items-center justify-center shadow-sm mt-0.5',
                  isUser
                    ? 'bg-gradient-to-br from-[#7a0000] to-[#9a0000]'
                    : 'bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600'
                )}>
                  {isUser
                    ? <User className="h-4 w-4 text-white" />
                    : <Bot className="h-4 w-4 text-[#800000] dark:text-[#e06060]" />
                  }
                </div>

                {/* Bubble + meta */}
                <div className={cn('flex flex-col gap-1', isUser ? 'items-end max-w-[78%]' : 'items-start max-w-[82%]')}>
                  <div className={cn(
                    'rounded-2xl px-4 py-3.5 shadow-sm transition-shadow duration-200 group-hover:shadow-md',
                    isUser
                      ? 'bg-gradient-to-br from-[#7a0000] to-[#9a0000] text-white rounded-tr-none'
                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-none'
                  )}>
                    <FormattedMessage content={msg.content} isUser={isUser} />
                  </div>

                  {/* Timestamp + actions */}
                  <div className={cn('flex items-center gap-1.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
                    {time && (
                      <span className="text-[10.5px] text-stone-350 dark:text-stone-500 select-none tabular-nums">{time}</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        title="Copy message"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 hover:border-[#800000]/40 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm transition-all"
                      >
                        {copiedIndex === i
                          ? <Check className="h-3 w-3 text-emerald-500" />
                          : <Copy className="h-3 w-3 text-stone-400" />
                        }
                      </button>
                      {isUser && (
                        <button
                          onClick={() => editUserMessage(i)}
                          title="Edit message"
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 hover:border-[#800000]/40 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm transition-all"
                        >
                          <Pencil className="h-3 w-3 text-stone-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 animate-in fade-in duration-200">
              <div className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 shadow-sm mt-0.5">
                <Bot className="h-4 w-4 text-[#800000] dark:text-[#e06060] animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#800000]/50 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#800000]/50 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#800000]/50 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-3 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-stone-500 hover:text-[#800000] dark:hover:text-[#e06060]"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Input area ───────────────────────────────────────────── */}
        <div className="border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3.5 pb-4">

          {/* Edit banner */}
          {editingIndex !== null && (
            <div className="flex items-center justify-between mb-2.5 px-3 py-2 rounded-xl bg-[#800000]/6 dark:bg-[#800000]/18 border border-[#800000]/15 dark:border-[#800000]/30">
              <span className="text-[12px] font-medium text-[#800000] dark:text-[#e06060] flex items-center gap-1.5">
                <Pencil className="h-3 w-3" />
                Editing message — reply history below will be removed
              </span>
              <button
                onClick={() => { setEditingIndex(null); setQuestion(''); }}
                className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ml-3 shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendQuestion(); }} className="flex gap-2.5 items-end">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                rows={1}
                value={question}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about construction…"
                disabled={loading}
                className={cn(
                  'w-full resize-none rounded-xl border-2 bg-stone-50 dark:bg-stone-800 px-4 py-3 text-[14px] text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none transition-all duration-200 leading-relaxed',
                  'border-stone-200 dark:border-stone-600 focus:border-[#800000] dark:focus:border-[#800000] focus:bg-white dark:focus:bg-stone-800 focus:shadow-[0_0_0_3px_rgba(128,0,0,0.07)]',
                  loading && 'opacity-60 cursor-not-allowed'
                )}
                style={{ minHeight: '48px', maxHeight: '140px', overflowY: 'auto' }}
              />
            </div>

            <Button
              type="submit"
              disabled={!question.trim() || loading}
              className={cn(
                'shrink-0 h-12 w-12 rounded-xl border-none p-0 transition-all duration-200',
                question.trim() && !loading
                  ? 'bg-gradient-to-br from-[#800000] to-[#a00000] hover:from-[#8f0000] hover:to-[#b00000] hover:scale-105 shadow-md hover:shadow-lg text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed'
              )}
            >
              <Send className="h-[18px] w-[18px]" />
            </Button>
          </form>

          <div className="flex items-center justify-between mt-2 px-0.5">
            <p className="text-[10.5px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[9px] border border-stone-200 dark:border-stone-700">Enter</kbd>
              send ·
              <kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[9px] border border-stone-200 dark:border-stone-700">⇧ Enter</kbd>
              new line
            </p>
            {question.length > 0 && (
              <span className={cn('text-[10.5px] tabular-nums transition-colors', question.length > 900 ? 'text-red-400' : 'text-stone-300 dark:text-stone-600')}>
                {question.length}/1000
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}