import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';
import { Bot, Send, User, Sparkles, ShieldCheck, TicketCheck } from 'lucide-react';

export default function AdminAIChatsPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [takeoverReply, setTakeoverReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/ai/conversations'));
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0) {
          setSelectedConvo(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeoverSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConvo || !takeoverReply.trim()) return;

    try {
      const res = await fetch(getApiUrl('/api/ai/takeover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedConvo.userId,
          adminReply: takeoverReply
        })
      });
      const data = await res.json();
      if (data.success) {
        setTakeoverReply('');
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="mb-6">
        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
          AI CUSTOMER SUPPORT OVERSIGHT
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
          Live AI Support Inspector & Human Takeover
        </h1>
        <p className="text-xs text-slate-500 mt-1">Monitor real-time AI responses, confidence scores, and intervene in customer chats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Conversations List */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-card space-y-3 h-[600px] overflow-y-auto">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-2">Customer AI Chats</h3>
          {conversations.map((convo, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedConvo(convo)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedConvo?.userId === convo.userId
                  ? 'border-purple-600 bg-purple-50/50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{convo.customerName || 'Customer'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${convo.escalated ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {convo.escalated ? 'ESCALATED' : 'AI ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-1">
                {convo.messages ? convo.messages[convo.messages.length - 1]?.text : 'No messages'}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Conversation Inspector & Takeover */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-card h-[600px] flex flex-col overflow-hidden">
          {selectedConvo ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedConvo.customerName || 'Customer'}</h4>
                  <span className="text-[10px] text-slate-400">User ID: {selectedConvo.userId} | AI Confidence: {Math.round((selectedConvo.confidence || 0.95) * 100)}%</span>
                </div>
                {selectedConvo.escalated && (
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <TicketCheck className="w-3.5 h-3.5" /> Support Ticket Escalated
                  </span>
                )}
              </div>

              {/* Chat Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
                {selectedConvo.messages?.map((msg, mIdx) => (
                  <div key={mIdx} className={`flex flex-col ${msg.sender === 'USER' ? 'items-start' : 'items-end'}`}>
                    <span className="text-[10px] text-slate-400 font-semibold mb-1">{msg.sender}</span>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                      msg.sender === 'USER'
                        ? 'bg-slate-800 text-white rounded-bl-xs'
                        : msg.sender === 'HUMAN_ADMIN'
                        ? 'bg-purple-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-br-xs'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Takeover Reply Input */}
              <form onSubmit={handleTakeoverSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type human admin response to intervene live..."
                  value={takeoverReply}
                  onChange={e => setTakeoverReply(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!takeoverReply.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  Send Admin Reply
                </button>
              </form>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold">Select a conversation to inspect AI log</div>
          )}
        </div>

      </div>
    </div>
  );
}
