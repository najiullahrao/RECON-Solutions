import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiApi } from '../api';
import { isApiError } from '../types/api';
import type { ChatMessage } from '../types/api';
import { getCachedChatMessages, setCachedChatMessages, clearCachedChat } from '../lib/chatCache';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
  ArrowRight,
  Pencil,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

/** Improved link and bold text renderer */
function renderContent(text: string): React.ReactNode[] {
  // First, handle Bold text: **text**
  const parts: React.ReactNode[] = [];
  const boldRe = /(\*\*[^*]+\*\*)/g;
  const subParts = text.split(boldRe);

  subParts.forEach((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      parts.push(<strong key={`bold-${i}`} className="font-bold text-stone-900 dark:text-white">{part.slice(2, -2)}</strong>);
    } else {
      // For non-bold parts, handle links: [label](path)
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      
      while ((match = linkRe.exec(part)) !== null) {
        if (match.index > lastIndex) {
          parts.push(part.slice(lastIndex, match.index));
        }
        const label = match[1];
        const href = match[2];
        const isSameSite = href.startsWith('/') && !href.startsWith('//');
        
        parts.push(
          isSameSite ? (
            <Link key={`link-${match.index}`} to={href} className="text-[#800000] underline decoration-[#800000]/30 hover:decoration-[#800000] transition-colors">
              {label}
            </Link>
          ) : (
            <a key={`link-${match.index}`} href={href} target="_blank" rel="noopener noreferrer" className="text-[#800000] underline decoration-[#800000]/30 hover:decoration-[#800000] transition-colors">
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

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) return <div className="whitespace-pre-wrap">{content}</div>;

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: string[] = [];

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-3 space-y-2 ml-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#800000]/10">
                <CheckCircle2 className="h-3 w-3 text-[#800000]" />
              </div>
              <span className="text-[#1a1a1a] leading-relaxed">
                {renderContent(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(idx);
      return;
    }

    // Detect Bullet Points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      currentList.push(trimmed.replace(/^[-*\d.]+\s+/, ''));
      return;
    }

    flushList(idx);

    // Detect Headers
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100) {
      elements.push(
        <h4 key={idx} className="mt-4 mb-2 flex items-center gap-2 text-base font-bold text-stone-900 dark:text-stone-100">
          <ArrowRight className="h-4 w-4 text-blue-500" />
          {renderContent(trimmed.replace(/\*\*/g, ''))}
        </h4>
      );
    } else {
      // Regular Paragraph
      elements.push(
        <p key={idx} className="my-2 leading-relaxed text-stone-700 dark:text-stone-300">
          {renderContent(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return <div className="space-y-1">{elements}</div>;
}

export function AiPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load cache for current user (or guest) when userId changes (login/logout/switch account)
  useEffect(() => {
    setMessages(getCachedChatMessages(userId));
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) setCachedChatMessages(messages, userId);
    else clearCachedChat(userId);
  }, [messages, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q || loading) return;
    
    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: q };
    const baseMessages = editingIndex !== null ? messages.slice(0, editingIndex) : messages;
    
    setMessages([...baseMessages, userMessage]);
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
  };

  const clearChat = () => {
    clearCachedChat(userId);
    setMessages([]);
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

  const suggestedQuestions = [
    { icon: Lightbulb, text: 'What services do you offer?', gradient: 'from-amber-500 to-orange-500' },
    { icon: TrendingUp, text: 'Typical project duration?', gradient: 'from-emerald-500 to-teal-500' },
    { icon: MessageCircle, text: 'Schedule a consultation?', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Zap, text: 'Why choose us?', gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 pt-6 px-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#800000] via-[#900000] to-[#700000] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            AI Assistant
          </div>
          <h1 className="text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>Construction Expert AI</h1>
          <p className="opacity-90 mt-2 text-lg">Ask about estimates, timelines, or our building process.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[550px] overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-stone-200 bg-gradient-to-b from-stone-50/50 to-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-60">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[#800000]/20 blur-xl rounded-full"></div>
                  <Bot className="h-12 w-12 text-stone-300 relative z-10" />
                </div>
                <p>Start a conversation below</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-md">
                   {suggestedQuestions.map((s, i) => {
                     const Icon = s.icon;
                     return (
                       <button key={i} onClick={() => setQuestion(s.text)} className="text-xs p-3 border-2 border-stone-200 rounded-xl hover:bg-[#f9f9f9] text-left transition-all duration-200 hover:border-[#800000] hover:-translate-y-0.5 flex items-center gap-2 text-[#4a0000]">
                         <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}>
                           <Icon className="h-3 w-3" />
                         </div>
                         {s.text}
                       </button>
                     );
                   })}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-[#800000]" : "bg-[#800000]")}>
                    {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                  </div>
                  <div className={cn("relative group max-w-[80%]", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn("rounded-2xl px-5 py-4 text-[15px] leading-relaxed transition-all duration-200 shadow-md hover:shadow-lg", 
                      msg.role === 'user' ? "bg-gradient-to-br from-[#800000] to-[#900000] text-white rounded-tr-none" : "bg-white border-2 border-stone-100 rounded-tl-none")}>
                      <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                    
                    <div className={cn("mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      <button onClick={() => copyMessage(msg.content, i)} className="p-1.5 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors">
                        {copiedIndex === i ? <Check className="h-3 w-3 text-[#800000]" /> : <Copy className="h-3 w-3 text-stone-400" />}
                      </button>
                      {msg.role === 'user' && (
                        <button onClick={() => editUserMessage(i)} className="p-1.5 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors">
                          <Pencil className="h-3 w-3 text-stone-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#800000] flex items-center justify-center animate-pulse">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white border-2 border-stone-100 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1 items-center shadow-md">
                  <div className="w-1.5 h-1.5 bg-[#800000] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-[#800000] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#800000] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-[#f9f9f9]">
            <form onSubmit={(e) => { e.preventDefault(); sendQuestion(); }} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={editingIndex !== null ? "Edit your message..." : "Ask a question..."}
                  className="h-14 bg-white pr-12 rounded-xl border-2 border-stone-200"
                  disabled={loading}
                />
                {editingIndex !== null && (
                   <button type="button" onClick={() => {setEditingIndex(null); setQuestion('');}} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800000] hover:text-[#6b0000] transition-colors">
                     Cancel
                   </button>
                )}
              </div>
              <Button type="submit" disabled={!question.trim() || loading} className="h-14 w-14 rounded-xl border-none bg-gradient-to-br from-[#800000] to-[#a00000] hover:from-[#900000] hover:to-[#b00000] hover:scale-105 text-white p-0 transition-all">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="flex justify-between items-center mt-3">
               <p className="text-[10px] text-[#1a1a1a]/60">AI-powered responses may vary.</p>
               {messages.length > 0 && (
                 <button onClick={clearChat} className="text-[10px] font-bold text-[#1a1a1a]/60 hover:text-[#800000] flex items-center gap-1">
                   <RotateCcw className="h-3 w-3" /> Clear Chat
                 </button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}