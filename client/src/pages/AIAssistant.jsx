import { useState, useContext, useEffect } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AIAssistant = () => {
  const { expenses } = useContext(ExpenseContext);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_messages');
    if (saved) return JSON.parse(saved);
    return [{ role: 'assistant', content: 'Hello! I am your AI financial assistant. How can I help you today?' }];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('ai_messages', JSON.stringify(messages));
  }, [messages]);

  const { user } = useContext(AuthContext);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      
      setMessages(prev => {
        const temp = [...prev];
        temp.pop(); // remove 'Thinking...'
        return [...temp, { role: 'assistant', content: data.response }];
      });
    } catch (error) {
      console.error("Error communicating with AI", error);
      setMessages(prev => {
        const temp = [...prev];
        temp.pop(); // remove 'Thinking...'
        return [...temp, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }];
      });
    }
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
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>AI Financial Assistant 🤖</h2>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '70%',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {msg.content}
            </motion.div>
          ))}
        </div>
        
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <input 
            type="text" 
            className="form-input" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
