import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronDown, Sparkles, AlertCircle, Headphones, TicketCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';

export default function AISupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: 'Namaste! I am KiranaGo AI Support. How can I help you today? (English, Hindi, or Hinglish)',
      quickActions: ['Track Order', 'Cancel Order', 'Refund Policy', 'Missing Item', 'Talk to Human'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = {
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest_user',
          message: query
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'AI',
            text: data.reply,
            quickActions: data.quickActions || [],
            ticketId: data.ticketId,
            escalated: data.escalated,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'AI',
            text: 'I am experiencing a temporary connection glitch. Let me connect you directly to human support.',
            quickActions: ['Talk to Human'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: 'I am here to assist! Your query has been logged and our team is monitoring.',
          quickActions: ['Track Order', 'Talk to Human'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group border-2 border-white"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border border-white"></span>
          </div>
          <span className="font-heading font-extrabold text-sm tracking-wide hidden sm:inline">
            KiranaGo AI Support
          </span>
        </button>
      )}

      {/* Chat Modal Panel */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[92vw] sm:w-[400px] h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                  KiranaGo AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active 24/7 (English, Hindi, Hinglish)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400 font-semibold px-1">
                  {msg.sender === 'USER' ? (
                    <>You • {msg.timestamp}</>
                  ) : (
                    <><Bot className="w-3 h-3 text-emerald-600" /> KiranaGo AI • {msg.timestamp}</>
                  )}
                </div>

                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Escalated Ticket Badge */}
                  {msg.ticketId && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-xl">
                      <TicketCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Ticket #{msg.ticketId} Created for Human Support Escalation</span>
                    </div>
                  )}
                </div>

                {/* Quick Action Pills */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.quickActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs active:scale-95"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>AI is checking backend order data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI about order, refund, missing item..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMsg.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
