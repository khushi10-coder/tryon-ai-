
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Wand2, ShieldCheck, Zap } from 'lucide-react';
import { ChatMessage } from '../types';
import { getStylingAdvice } from '../services/geminiService';

interface ChatbotProps {
  imageUrl: string;
  initialHistory?: ChatMessage[];
  onMessageAdded?: (msg: ChatMessage) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ imageUrl, initialHistory = [], onMessageAdded }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isActive, setIsActive] = useState(initialHistory.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (forcedInput?: string) => {
    const messageText = forcedInput || input;
    if (!messageText.trim() || isTyping) return;

    if (!isActive) setIsActive(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    onMessageAdded?.(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getStylingAdvice(imageUrl, messageText, messages);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
      onMessageAdded?.(modelMsg);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having a little trouble analyzing that right now. Could you please try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActivate = () => {
    setIsActive(true);
    handleSend("Analyze my new look and suggest some styling tips!");
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[680px] bg-white rounded-[3rem] border border-gray-100 luxury-shadow p-12 text-center group">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-500">
           <Sparkles size={48} className="animate-pulse" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Meet Aura</h3>
        <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 max-w-xs mx-auto">
          Our AI Style Concierge is ready to analyze your look and provide personalized advice.
        </p>
        <button 
          onClick={handleActivate}
          className="bg-black text-white px-10 py-5 rounded-[1.5rem] font-black tracking-tight text-lg shadow-2xl hover:bg-indigo-600 transition-all flex items-center space-x-3 active:scale-95"
        >
          <Zap size={20} />
          <span>Activate Stylist</span>
        </button>
        <div className="mt-8 flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <ShieldCheck size={14} />
           <span>Multimodal Vision Enabled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[680px] bg-white rounded-[3rem] border border-gray-100 luxury-shadow overflow-hidden">
      <div className="bg-black px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
            <Wand2 size={20} />
          </div>
          <div>
            <h3 className="text-white font-black tracking-tight text-lg">Aura Stylist</h3>
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Concierge</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfcfc]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`max-w-[90%] px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none shadow-xl' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-4 rounded-3xl border border-gray-100 rounded-tl-none shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.6s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.6s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-white">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about jewelry or shoes..."
            className="w-full bg-gray-50 border-gray-100 border rounded-2xl pl-6 pr-14 py-4 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 p-3 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
            disabled={!input.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
