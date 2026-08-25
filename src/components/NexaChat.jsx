import React, { useState, useEffect, useRef } from 'react';
import { sendNexaChatMessage } from '../services/nexaAiService';
import { supabase } from '../supabaseClient';

export default function NexaChat({ userProfile }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || loading) return;

    setError(null);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const responseContent = await sendNexaChatMessage({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        userProfile,
      });

      setMessages([...newMessages, { role: 'assistant', content: responseContent }]);
    } catch (err) {
      setError('Unable to reach NEXA right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionPrompts = [
    { label: "What's my smartest next step?", prompt: "Based on my background, what's my smartest next step?" },
    { label: "Which opportunity should I prioritize?", prompt: "Which type of opportunity should I prioritize right now?" },
    { label: "Review my current roadmap", prompt: "Can you review my general career roadmap and suggest key focus areas?" },
    { label: "Help me plan the next 30 days", prompt: "Help me create an actionable plan for the next 30 days." },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)] text-[var(--text-primary)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">NEXA</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Your next step, figured out.</p>
            </div>
            
            {/* Suggestion Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl w-full mt-4">
              {suggestionPrompts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(item.prompt)}
                  className="nexa-card p-3 rounded-xl text-left text-xs font-medium hover:border-[var(--accent-strong)] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-strong)] text-white rounded-br-none'
                    : 'nexa-card bg-[var(--surface-card)] text-[var(--text-primary)] rounded-bl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="nexa-card p-4 rounded-2xl text-sm text-[var(--text-secondary)] animate-pulse">
              NEXA is thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => handleSend(messages[messages.length - 1]?.content)} className="underline font-semibold">
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-primary)]">
        <div className="flex items-center gap-3 nexa-ai-input p-2 rounded-xl">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NEXA about goals, opportunities, or next steps..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none px-2"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || loading}
            className="nexa-btn-primary px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}