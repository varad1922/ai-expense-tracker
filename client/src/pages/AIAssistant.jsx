import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Card from '../components/ui/Card';

/**
 * AIAssistant page — demonstrates:
 *
 *  useState:
 *   - Lazy initialiser for messages (reads localStorage once, not on every render)
 *   - `sending` boolean to disable the form while a request is in flight
 *   - Functional updater form: setMessages(prev => [...]) for safe sequential updates
 *
 *  useEffect:
 *   1. Persist messages to localStorage whenever they change ([messages] dependency)
 *   2. Auto-scroll the chat window to the latest message ([messages] dependency)
 *   3. AbortController — cancels the in-flight AI fetch if the user navigates away
 *      (the cleanup function calls controller.abort())
 *
 *  Component composition:
 *   - The response now uses the Card compound component for structured output display
 *   - MessageBubble is a locally-scoped presentational sub-component
 *
 *  Env wiring (Task 9):
 *   - Uses VITE_API_URL from import.meta.env, not a hardcoded localhost URL
 *
 *  Structured outputs (Task 4):
 *   - The AI now returns { response, insights, suggestedCategory, confidenceScore }
 *   - We render each field separately for a richer UX
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const MAX_HISTORY = 50; // prevent unbounded localStorage growth

// ── MessageBubble sub-component ────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
      }}
    >
      {/* Main bubble */}
      <div
        style={{
          background: isUser ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
          color: isUser ? 'white' : 'var(--text-primary)',
          padding: 'var(--space-sm) var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {msg.content}
      </div>

      {/* Structured output extras — only for AI messages with insights */}
      {!isUser && msg.insights && msg.insights.length > 0 && (
        <Card variant="accent" style={{ marginTop: 'var(--space-xs)' }}>
          <Card.Header>💡 Insights</Card.Header>
          <Card.Body style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              {msg.insights.map((insight, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{insight}</li>
              ))}
            </ul>
          </Card.Body>
          {msg.suggestedCategory && (
            <Card.Footer>
              Suggested category:&nbsp;
              <strong style={{ color: 'var(--accent-primary)' }}>{msg.suggestedCategory}</strong>
            </Card.Footer>
          )}
        </Card>
      )}

      {/* Confidence score badge for AI responses */}
      {!isUser && typeof msg.confidenceScore === 'number' && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'flex-start', paddingLeft: '4px' }}>
          Confidence: {Math.round(msg.confidenceScore * 100)}%
        </span>
      )}
    </motion.div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const AIAssistant = () => {
  const { user } = useContext(AuthContext);

  // useState — lazy initialiser: the function runs once on mount, not every render.
  // This avoids calling JSON.parse(localStorage...) on every re-render.
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_messages');
      return saved ? JSON.parse(saved) : [
        { role: 'assistant', content: 'Hello! I am your AI financial assistant. How can I help you today?' },
      ];
    } catch {
      return [{ role: 'assistant', content: 'Hello! I am your AI financial assistant. How can I help you today?' }];
    }
  });

  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false); // disables form while awaiting response

  const chatEndRef   = useRef(null); // for auto-scroll
  const abortRef     = useRef(null); // holds the current AbortController

  // useDocumentTitle side effect — updates <title> tag on every page visit
  useDocumentTitle('AI Assistant');

  // ── useEffect 1: persist messages to localStorage ─────────────────────────
  // Dependency: [messages] — runs after every messages state change.
  // Cap at MAX_HISTORY entries to prevent unbounded localStorage growth.
  useEffect(() => {
    const toStore = messages.slice(-MAX_HISTORY);
    localStorage.setItem('ai_messages', JSON.stringify(toStore));
  }, [messages]);

  // ── useEffect 2: auto-scroll chat to the latest message ───────────────────
  // Dependency: [messages] — scrolls down every time a new message is added.
  // The cleanup is not needed here (no subscription/timer), but the dependency
  // array is critical: without it the scroll would only happen once on mount.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── useEffect 3: cancel in-flight request on unmount ──────────────────────
  // Empty dependency array [] — cleanup runs only on unmount.
  // This ensures we don't try to update state after the component is gone.
  useEffect(() => {
    return () => {
      // Abort any pending AI request when the user navigates away
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || sending) return;

    // Functional updater: safe even if React batches multiple setMessages calls
    setMessages((prev) => [...prev, { role: 'user', content: trimmedInput }]);
    setInput('');
    setSending(true);

    // Add thinking indicator
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Thinking...' }]);

    // Create a fresh AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ prompt: trimmedInput }),
        signal: controller.signal, // link fetch to AbortController
      });

      if (controller.signal.aborted) return; // user navigated away

      const data = await res.json();

      // Replace 'Thinking...' with the structured AI response
      setMessages((prev) => {
        const rest = prev.slice(0, -1); // remove last 'Thinking...' message
        return [
          ...rest,
          {
            role: 'assistant',
            content: data.response ?? 'Sorry, I could not generate a response.',
            insights: data.insights ?? [],
            suggestedCategory: data.suggestedCategory ?? null,
            confidenceScore: data.confidenceScore ?? null,
          },
        ];
      });
    } catch (err) {
      if (err.name === 'AbortError') return; // component unmounted — do nothing

      console.error('[AIAssistant] fetch failed:', err.message);
      setMessages((prev) => {
        const rest = prev.slice(0, -1);
        return [...rest, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }];
      });
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you?' }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="container"
      style={{ padding: 'var(--space-xl) 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2>AI Financial Assistant 🤖</h2>
        <button
          onClick={clearHistory}
          className="btn"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}
        >
          Clear history
        </button>
      </div>

      <div
        className="glass-panel"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', overflow: 'hidden' }}
      >
        {/* Message list */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}
          </AnimatePresence>
          {/* Invisible anchor for auto-scroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSend}
          style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}
        >
          <input
            type="text"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending..."
            disabled={sending}
            style={{ flex: 1, opacity: sending ? 0.7 : 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
