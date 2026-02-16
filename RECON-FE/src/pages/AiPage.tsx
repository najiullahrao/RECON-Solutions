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
  Trash2,
  CheckCircle2,
  ArrowRight,
  Pencil
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
            <Link key={`link-${match.index}`} to={href} className="text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-500 dark:text-blue-400 transition-colors">
              {label}
            </Link>
          ) : (
            <a key={`link-${match.index}`} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-500 dark:text-blue-400 transition-colors">
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
              <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-stone-700 dark:text-stone-300 leading-relaxed">
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
    { icon: Lightbulb, text: 'What services do you offer?', color: 'text-blue-600' },
    { icon: TrendingUp, text: 'Typical project duration?', color: 'text-blue-600' },
    { icon: MessageCircle, text: 'Schedule a consultation?', color: 'text-blue-600' },
    { icon: Zap, text: 'Why choose us?', color: 'text-blue-600' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 pt-4 px-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            AI Assistant
          </div>
          <h1 className="text-3xl font-bold">Construction Expert AI</h1>
          <p className="opacity-90 mt-2 text-blue-100">Ask about estimates, timelines, or our building process.</p>
        </div>
      </div>

      <Card className="border-blue-100 shadow-2xl dark:border-blue-900/50">
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-stone-200">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-60">
                <Bot className="h-12 w-12 mb-4 text-stone-300" />
                <p>Start a conversation below</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-md">
                   {suggestedQuestions.map((s, i) => (
                     <button key={i} onClick={() => setQuestion(s.text)} className="text-xs p-3 border border-blue-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:border-blue-800/50">
                       {s.text}
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-md", msg.role === 'user' ? "bg-gradient-to-br from-blue-700 to-blue-800" : "bg-gradient-to-br from-blue-500 to-blue-600")}>
                    {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                  </div>
                  <div className={cn("relative group max-w-[80%]", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn("rounded-2xl px-5 py-3 shadow-md text-sm leading-relaxed transition-all duration-200", 
                      msg.role === 'user' ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none hover:shadow-lg" : "bg-white border border-blue-100 dark:bg-stone-900 dark:border-blue-900/50 rounded-tl-none hover:border-blue-200 dark:hover:border-blue-800")}>
                      <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                    
                    <div className={cn("mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      <button onClick={() => copyMessage(msg.content, i)} className="text-[10px] font-bold uppercase text-stone-400 hover:text-stone-600">
                        {copiedIndex === i ? "Copied" : "Copy"}
                      </button>
                      {msg.role === 'user' && (
                        <button onClick={() => editUserMessage(i)} className="text-[10px] font-bold uppercase text-stone-400 hover:text-stone-600 flex items-center gap-1">
                          <Pencil className="h-2 w-2" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-4">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-stone-800 border border-blue-100 dark:border-blue-900/50 rounded-2xl rounded-tl-none px-5 py-3 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-950/30 dark:to-stone-900/50">
            <form onSubmit={(e) => { e.preventDefault(); sendQuestion(); }} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={editingIndex !== null ? "Edit your message..." : "Ask a question..."}
                  className="h-12 bg-white dark:bg-stone-950 pr-12 rounded-xl border-blue-200 dark:border-blue-900/50"
                  disabled={loading}
                />
                {editingIndex !== null && (
                   <button type="button" onClick={() => {setEditingIndex(null); setQuestion('');}} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                     Cancel
                   </button>
                )}
              </div>
              <Button type="submit" disabled={!question.trim() || loading} className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-0 shadow-lg hover:shadow-xl transition-all">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="flex justify-between items-center mt-3">
               <p className="text-[10px] text-stone-400">AI-powered responses may vary.</p>
               {messages.length > 0 && (
                 <button onClick={clearChat} className="text-[10px] font-bold text-stone-400 hover:text-red-500 flex items-center gap-1">
                   <Trash2 className="h-3 w-3" /> Clear Chat
                 </button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}