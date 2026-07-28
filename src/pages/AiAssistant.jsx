// src/pages/AiAssistant.jsx — Admin AI Q&A (app help + live summaries)
import React, { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Trash2 } from "lucide-react";
import { askAdminAi } from "../api/aiApi";
import { getZones } from "../api/adminApi";

const BRAND = "#FF8C00";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200";

const QUICK_QUESTIONS = [
  {
    label: "How does zone visibility work?",
    question: "How does zone visibility work?",
    context_type: "app_help",
  },
  {
    label: "How does payout currency work?",
    question: "How does payout currency work?",
    context_type: "app_help",
  },
  {
    label: "Show pending orders today",
    question: "Show pending orders today",
    context_type: "live_summary",
  },
  {
    label: "Show pending payouts",
    question: "Show pending payouts",
    context_type: "live_summary",
  },
  {
    label: "Show refund summary",
    question: "Show refund summary",
    context_type: "live_summary",
  },
  {
    label: "Show top vendors this month",
    question: "Show top vendors this month",
    context_type: "live_summary",
  },
];

const AiAssistant = () => {
  const [question, setQuestion] = useState("");
  const [contextType, setContextType] = useState("app_help");
  const [zoneId, setZoneId] = useState("");
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getZones(500);
        const payload = res.data?.data;
        const list = payload?.data ?? payload ?? [];
        if (!cancelled) setZones(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setZones([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const extractError = (err) => {
    const data = err?.response?.data;
    const validation = data?.errors || data?.data;
    if (validation && typeof validation === "object" && !Array.isArray(validation)) {
      const flat = Object.values(validation).flat().filter(Boolean);
      if (flat.length) return flat.join(" ");
    }
    return data?.message || err?.message || "AI request failed";
  };

  const submitQuestion = async (override = null) => {
    const nextQuestion = String(override?.question ?? question).trim();
    const nextContext = override?.context_type || contextType;

    if (!nextQuestion) {
      setError("Please enter a question.");
      return;
    }
    if (nextQuestion.length > 2000) {
      setError("Question must be 2000 characters or fewer.");
      return;
    }

    if (override?.context_type) {
      setContextType(override.context_type);
    }
    setQuestion(nextQuestion);
    setError("");
    setLoading(true);

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: nextQuestion,
      context_type: nextContext,
      zone_id: zoneId || null,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await askAdminAi({
        question: nextQuestion,
        context_type: nextContext,
        zone_id: zoneId || undefined,
      });

      const ok = res.data?.success !== false && res.data?.data;
      if (!ok) {
        throw {
          response: {
            data: {
              message: res.data?.message || "AI request failed",
            },
          },
        };
      }

      const answer = res.data.data.answer || "No answer returned.";
      const summary = res.data.data.summary;
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: answer,
          context_type: nextContext,
          summary: summary || null,
        },
      ]);
      setQuestion("");
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "error",
          text: msg,
          context_type: nextContext,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) submitQuestion();
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setQuestion("");
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Bot className="w-6 h-6" style={{ color: BRAND }} />
            AI Assistant
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Ask app-help questions or request live operational summaries. Requests go through the
            backend only — no OpenAI keys in the browser.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" /> Clear chat
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="text-sm font-medium text-gray-700">Quick questions</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={loading}
              onClick={() => submitQuestion(item)}
              className="px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[420px] max-h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !loading ? (
            <div className="h-full min-h-[280px] flex items-center justify-center text-center text-gray-500 text-sm px-6">
              Ask a question below, or use a quick question. Use{" "}
              <span className="font-medium text-gray-700 mx-1">App help</span> for how the product
              works, or <span className="font-medium text-gray-700 mx-1">Live summary</span> for
              current orders, payouts, refunds, and vendors.
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[10px] opacity-80 mt-1">
                        {msg.context_type}
                        {msg.zone_id ? ` · zone #${msg.zone_id}` : ""}
                      </div>
                    </div>
                  </div>
                );
              }
              if (msg.role === "error") {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-red-50 text-red-700 border border-red-100">
                      {msg.text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-gray-50 text-gray-800 border border-gray-100 space-y-2">
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.summary ? (
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">
                          View structured summary
                        </summary>
                        <pre className="mt-2 overflow-x-auto bg-white border border-gray-100 rounded-lg p-2 text-[11px] text-gray-600">
                          {JSON.stringify(msg.summary, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-gray-50 text-gray-600 border border-gray-100">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: BRAND }} />
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Context type</label>
              <select
                className={inputClass}
                value={contextType}
                onChange={(e) => setContextType(e.target.value)}
                disabled={loading}
              >
                <option value="app_help">App help</option>
                <option value="live_summary">Live summary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Zone filter {contextType === "live_summary" ? "(optional)" : "(optional, live only)"}
              </label>
              <select
                className={inputClass}
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={loading}
              >
                <option value="">All zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name || `Zone #${z.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Question</label>
              <textarea
                className={`${inputClass} min-h-[72px] resize-y`}
                placeholder="Ask about the app or request a live summary…"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                maxLength={2000}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg text-white disabled:opacity-60 h-[42px] mb-0.5"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ask
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
