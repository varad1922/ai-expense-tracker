import { useState, useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';

const AIAssistant = () => {
  const { expenses } = useContext(ExpenseContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI financial assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      let response = `Based on your records, your total spending is $${totalSpent.toFixed(2)}. `;
      
      if (input.toLowerCase().includes('advice')) {
        response += 'I recommend keeping your discretionary spending below 30% of your income.';
      } else {
        response += 'Is there anything specific you would like to know about your expenses?';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>AI Financial Assistant</h2>
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '70%'
            }}>
              {msg.content}
            </div>
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
    </div>
  );
};

export default AIAssistant;
