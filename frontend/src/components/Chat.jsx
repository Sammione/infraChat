import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Chat = ({ role }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hello ${role}! I am your assistant. How can I help you with the company documents today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/ask`, { message: userMessage });
            setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container glass-panel">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', opacity: 0.7, fontSize: '0.8rem' }}>
                            {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
                            {msg.role === 'ai' ? 'AI ASSISTANT' : 'YOU'}
                        </div>
                        {msg.content}
                    </div>
                ))}
                {loading && (
                    <div className="message ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={16} />
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask anything about the documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
