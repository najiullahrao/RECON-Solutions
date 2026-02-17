import { motion } from 'framer-motion';
import { Bot, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

function InfinityLoopPattern() {
  return (
    <div
      className="absolute inset-0 opacity-[0.06]"
      aria-hidden
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.15) 40px,
          rgba(255,255,255,0.15) 41px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.1) 40px,
          rgba(255,255,255,0.1) 41px
        )`,
      }}
    />
  );
}

const mockUserMessage = 'What is the estimated cost for a 5-marla renovation?';
const mockAiResponse = `Based on typical 5-marla scope, here’s a rough breakdown:

• Structure & finishing: PKR 35–45 lac  
• Electrical & plumbing: PKR 4–6 lac  
• Flooring & tiling: PKR 5–8 lac  
• Painting & fixtures: PKR 2–4 lac  

Total range: PKR 46–63 lac (varies by materials and location). For a detailed quote tailored to your plot and choices, book a consultation or share more details.`;

export function AiAssistantSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#1a1a1a] py-16 text-white md:py-24"
      aria-labelledby="ai-section-heading"
    >
      <InfinityLoopPattern />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="ai-section-heading" className="font-sans text-3xl font-bold tracking-tight md:text-4xl" style={{ letterSpacing: '-0.02em' }}>
            AI-Powered Project Guidance
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Get instant estimations and structural guidance. Our AI assistant helps you plan your project in seconds.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 max-w-2xl rounded-sm border border-white/10 bg-[#252525]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#800000]">
              <Bot className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-white">RECON AI Assistant</p>
              <p className="text-xs text-white/60">Instant estimations & guidance</p>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-sm rounded-tr-none bg-[#800000]/20 px-4 py-3 text-sm text-white">
                {mockUserMessage}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#800000]/30">
                <Bot className="h-4 w-4 text-[#800000]" aria-hidden />
              </div>
              <div className="rounded-sm rounded-tl-none border border-white/10 bg-[#2a2a2a] px-4 py-3 text-sm leading-relaxed text-white/90">
                {mockAiResponse}
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-white/10 px-4 py-3">
            <input
              type="text"
              readOnly
              placeholder="Ask about cost, design, or timeline..."
              className="flex-1 rounded-sm border border-white/10 bg-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]"
              aria-label="Chat input (demo)"
            />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-sm border-none bg-[#800000] text-white transition-colors hover:bg-[#6b0000]"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to={ROUTES.AI}
            className="inline-flex items-center gap-2 rounded-sm border-none bg-[#800000] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#6b0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          >
            <Bot className="h-5 w-5" aria-hidden />
            Try AI Assistant
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
