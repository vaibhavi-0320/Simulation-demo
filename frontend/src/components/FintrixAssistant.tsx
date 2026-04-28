import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import fintrixLogo from "../assets/fintrix-logo.png";
import { useViewport } from "../hooks/useViewport";
import { formatAddress } from "../lib/utils";
import { askFintrixAssistant, type AssistantHistoryMessage } from "../services/aiService";
import type { Invoice } from "../types";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export function triggerChatNotification(message: string) {
  window.dispatchEvent(new CustomEvent("fintrix:chat-notify", {
    detail: { message, timestamp: new Date().toISOString() },
  }));
}

const QUICK_QUESTIONS = [
  "How do I fund an invoice?",
  "What is a Trust Score?",
  "How does repayment work?",
  "How do I connect my wallet?",
  "What returns can I expect?",
];

function riskLevel(score?: number) {
  const value = Number(score || 0);
  if (value < 40) return "Low";
  if (value < 65) return "Medium";
  return "High";
}

function getDealApy(deal: Invoice) {
  return Number(deal.yield ?? deal.discount ?? 0);
}

export function FintrixAssistant({
  view,
  walletAddress,
  walletBalance,
  invoices,
  currentDeal,
  notification,
}: {
  view: string;
  walletAddress?: string | null;
  walletBalance?: number;
  invoices?: Invoice[];
  currentDeal?: Invoice | null;
  notification?: string | null;
}) {
  const { isMobile } = useViewport();
  const [open, setOpen] = useState(false);
  const [showRiskNudge, setShowRiskNudge] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I am Fintrix AI. Ask me about invoice uploads, Trust Scores, wallets, funding, or repayments.",
    },
  ]);
  const assistantRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeStreamRef = useRef(0);
  const mountedRef = useRef(true);

  const hiddenViews = new Set(["landing", "loading"]);
  const shouldHide = hiddenViews.has(view);

  const riskContext = useMemo(() => {
    if (view === "marketplace") {
      return {
        level: "High Attention",
        suggestion: "Before funding, verify risk score, yield consistency, and repayment horizon.",
      };
    }
    if (view === "simulation") {
      return {
        level: "Medium Attention",
        suggestion: "Before creating a simulation, re-check buyer identity, due date, and invoice amount.",
      };
    }
    if (view === "deal-detail") {
      return {
        level: "Review",
        suggestion: "Before funding, confirm Trust Score, APY, maturity date, and settlement expectations.",
      };
    }
    return {
      level: "Standard",
      suggestion: "Use risk checks before each decision to reduce avoidable funding mistakes.",
    };
  }, [view]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeStreamRef.current += 1;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!notification || shouldHide) return;
    setMessages((current) => [
      ...current,
      { id: `notify-${Date.now()}`, role: "assistant", text: notification },
    ]);
  }, [notification, shouldHide]);

  useEffect(() => {
    const handler = (event: Event) => {
      if (shouldHide) return;
      const customEvent = event as CustomEvent<{ message: string; timestamp: string }>;
      setMessages((current) => [
        ...current,
        { id: `event-${customEvent.detail.timestamp}`, role: "assistant", text: customEvent.detail.message },
      ]);
      setOpen(true);
    };

    window.addEventListener("fintrix:chat-notify", handler as EventListener);
    return () => window.removeEventListener("fintrix:chat-notify", handler as EventListener);
  }, [shouldHide]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePress(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (target && assistantRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsidePress);
    document.addEventListener("touchstart", closeOnOutsidePress);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePress);
      document.removeEventListener("touchstart", closeOnOutsidePress);
    };
  }, [open]);

  useEffect(() => {
    if (shouldHide) {
      setOpen(false);
    }
  }, [shouldHide]);

  function applyPrompt(prompt: string) {
    setOpen(true);
    setQuestion(prompt);
  }

  async function typeAssistantMessage(messageId: string, fullText: string) {
    const streamId = Date.now();
    activeStreamRef.current = streamId;

    for (let index = 1; index <= fullText.length; index += 1) {
      if (!mountedRef.current || activeStreamRef.current !== streamId) {
        return;
      }

      const slice = fullText.slice(0, index);
      setMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, text: slice } : message))
      );

      await new Promise((resolve) => window.setTimeout(resolve, 20));
    }
  }

  function buildHistory(nextQuestion: string): AssistantHistoryMessage[] {
    return messages
      .map((message) => ({ role: message.role, text: message.text }))
      .filter((message) => message.text.trim().length > 0)
      .slice(-10)
      .concat({ role: "user", text: nextQuestion });
  }

  async function sendQuestion(promptOverride?: string) {
    const nextQuestion = (promptOverride ?? question).trim();
    if (!nextQuestion || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: nextQuestion,
    };

    setOpen(true);
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const { answer } = await askFintrixAssistant({
        question: nextQuestion,
        view,
        walletAddress: walletAddress ?? null,
        history: buildHistory(nextQuestion),
      });

      const assistantMessageId = `assistant-${Date.now()}`;
      setLoading(false);
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: "",
        },
      ]);

      await typeAssistantMessage(assistantMessageId, answer);
    } catch (error) {
      console.error("Fintrix assistant error:", error);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "Something went wrong. Please try again.",
        },
      ]);
      setLoading(false);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  if (shouldHide) return null;

  return (
    <div
      ref={assistantRef}
      className="fixed z-[9999] flex flex-col items-end gap-4"
      style={{
        right: isMobile ? "1rem" : "24px",
        bottom: isMobile ? "1rem" : "24px",
        left: "auto",
      }}
    >
      {!open && showRiskNudge ? (
        <div className="max-w-[320px] rounded-2xl border border-yellow-300/30 bg-[#151a25]/95 px-4 py-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl" style={{ alignSelf: isMobile ? "stretch" : "auto", maxWidth: isMobile ? "100%" : undefined }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 text-yellow-300" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-200">Risk Detector</p>
              <p className="mt-1 text-xs leading-5 text-white/80">{riskContext.suggestion}</p>
            </div>
            <button onClick={() => setShowRiskNudge(false)} className="text-white/45 hover:text-white/80" aria-label="Dismiss risk suggestion">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-[28px] border border-white/10 bg-[#07152d]/95 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl" style={{ width: isMobile ? "min(92vw, 380px)" : undefined, maxHeight: isMobile ? "70vh" : undefined }}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#07152d] text-white shadow-[inset_0_0_30px_rgba(255,255,255,0.12)]">
                <img src={fintrixLogo} alt="Fintrix AI logo" className="h-full w-full object-contain object-center" />
              </div>
              <div>
                <p className="font-headline text-lg font-semibold">FINTRIX AI</p>
                <p className="text-xs text-white/60">{walletAddress ? `Wallet ${formatAddress(walletAddress)}` : "No wallet connected"}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-2 text-white/75 transition hover:bg-white/15 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: isMobile ? "calc(70vh - 150px)" : undefined }}>
            <div className="rounded-2xl border border-yellow-300/30 bg-yellow-500/10 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-yellow-200">Pre-decision Risk Detector: {riskContext.level}</p>
              <p className="mt-1 text-xs text-white/80">{riskContext.suggestion}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyPrompt("Run a risk check before I fund this invoice. What should I verify first?")} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:bg-white/10">
                Pre-funding checklist
              </button>
              <button onClick={() => applyPrompt("What are the top red flags in this decision based on current context?")} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:bg-white/10">
                Detect red flags
              </button>
            </div>
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((quickQuestion) => (
                  <button
                    key={quickQuestion}
                    onClick={() => void sendQuestion(quickQuestion)}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.04em] text-white/70 hover:bg-white/10"
                  >
                    {quickQuestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} style={{ whiteSpace: "pre-line" }} className={message.role === "assistant" ? "mr-8 rounded-2xl bg-white/8 px-4 py-3 text-sm leading-6 text-white/80" : "ml-8 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-black"}>
                {message.text}
              </div>
            ))}
            {loading ? (
              <div className="mr-8 flex w-[64px] items-center justify-center gap-1.5 rounded-2xl bg-white/8 px-4 py-4">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[22px] border border-white/10 bg-black/30 p-2">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                rows={isMobile ? 2 : 3}
                placeholder="Ask about wallets, funding, invoices, portfolio, or troubleshooting..."
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
              />
              <div className="flex items-center justify-between px-2 pb-1 pt-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">Context: {view}</span>
                <button onClick={() => void sendQuestion()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black">
                  Send <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer"
        aria-label="Open Fintrix AI assistant"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? "52px" : "64px",
          height: isMobile ? "52px" : "64px",
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          zIndex: 9999,
        }}
      >
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(69,123,199,0.24),transparent_52%)] blur-xl" />
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 ring-offset-2 ring-offset-black border border-white/10 bg-[#07152d] shadow-[0_8px_18px_rgba(0,0,0,0.35)]">
          <img src={fintrixLogo} alt="Fintrix AI" className="h-full w-full rounded-full object-contain object-center" />
        </span>
      </button>
    </div>
  );
}
