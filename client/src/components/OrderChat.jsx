import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, MessageSquare, X } from 'lucide-react';

const OrderChat = ({ order, role, isOpen, onClose }) => {
  const { sendOrderMessage } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [order?.messages, isOpen]);

  useEffect(() => {
    if (isOpen && order) {
      const saved = sessionStorage.getItem('read_counts');
      const counts = saved ? JSON.parse(saved) : {};
      counts[order._id || order.id] = order.messages?.length || 0;
      sessionStorage.setItem('read_counts', JSON.stringify(counts));
      window.dispatchEvent(new Event('read_counts_updated'));
    }
  }, [isOpen, order?.messages?.length, order]);

  if (!isOpen || !order) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    const res = await sendOrderMessage(order.id, text);
    setLoading(false);
    if (res.success) {
      setText('');
    }
  };

  const messages = order.messages || [];

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-20 md:right-6 z-40 w-full md:w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-4 bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">
              {role === 'student' ? 'Delivery Chat' : 'Order Chat'} • {order.id}
            </h4>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">
              {role === 'student' ? `Delivery Partner: ${order.deliveryBoy || 'Awaiting Rider...'}` : `Student: ${order.customer}`}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:bg-slate-850 hover:text-white rounded-lg transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/40">
        {role === 'student' && !order.deliveryBoy && (
          <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-normal text-center space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-300">🛵 Awaiting Delivery Partner Assignment</p>
            <p className="opacity-90">Chat connects automatically as soon as a delivery partner accepts your package from the canteen!</p>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-350 dark:text-slate-700" />
            <p className="text-xs font-semibold text-slate-400">No messages yet. Start chatting with your delivery courier!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.role === role;
            return (
              <div 
                key={idx} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-sm leading-relaxed ${
                    isMe 
                      ? 'bg-indigo-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-850'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-450 mt-1 font-semibold">
                  {msg.sender.split(' ')[0]} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 1-Tap Quick Presets Bar */}
      {(!role || role !== 'student' || order.deliveryBoy) && (
        <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Quick:</span>
          {(role === 'student' ? [
            '📍 I am outside hostel',
            '🚶 Coming down now!',
            '🏢 Leave at reception',
            '📞 Please call my phone'
          ] : [
            '📍 Outside Hostel Gate',
            '🔔 Left at Security Desk',
            '👍 On my way!',
            '⏱️ Arriving in 2 mins'
          ]).map((preset, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={async () => {
                setLoading(true);
                const res = await sendOrderMessage(order.id, preset);
                setLoading(false);
              }}
              disabled={loading}
              className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full shrink-0 hover:bg-indigo-50 dark:hover:bg-indigo-955 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Send message form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex gap-2 items-center">
        <input
          type="text"
          placeholder={role === 'student' ? 'Type message to delivery partner...' : 'Type message to student...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading || (role === 'student' && !order.deliveryBoy)}
          className="flex-1 px-4 py-2 text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !text.trim() || (role === 'student' && !order.deliveryBoy)}
          className="h-8 w-8 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg flex items-center justify-center transition-colors shadow-md shadow-indigo-500/10 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default OrderChat;
