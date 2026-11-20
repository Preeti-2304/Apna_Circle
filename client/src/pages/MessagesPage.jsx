import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  Check,
  CheckCheck,
  MapPin,
  LifeBuoy,
} from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
      if (socket) {
        socket.emit('join_conversation', activeConversation._id);
      }
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (activeConversation && newMsg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
      // Update last message in sidebar conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversation
            ? { ...c, lastMessage: newMsg.text, lastMessageAt: newMsg.createdAt }
            : c
        )
      );
    };

    const handleTypingStart = ({ conversationId, userName }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUser(userName);
      }
    };

    const handleTypingStop = ({ conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, activeConversation?._id]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        const convos = res.data.conversations || [];
        setConversations(convos);

        if (initialConversationId) {
          const matched = convos.find((c) => c._id === initialConversationId);
          if (matched) setActiveConversation(matched);
          else if (convos.length > 0) setActiveConversation(convos[0]);
        } else if (convos.length > 0) {
          setActiveConversation(convos[0]);
        }
      }
    } catch (err) {
      console.error('[Fetch Conversations Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/chat/messages/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('[Fetch Messages Error]:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing_start', {
      conversationId: activeConversation._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    const currentText = text.trim();
    setText('');

    // Emit via socket for instant delivery
    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId: activeConversation._id,
        text: currentText,
      });
    } else {
      // Fallback to REST
      try {
        const res = await api.post(`/chat/messages/${activeConversation._id}`, {
          text: currentText,
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
          scrollToBottom();
        }
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
  };

  const activeOther = activeConversation?.otherParticipant;
  const isRecipientOnline = activeOther ? isUserOnline(activeOther._id) : false;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden flex flex-col md:flex-row h-[78vh]">
      {/* Left: Conversations list */}
      <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-200/80">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Message a friend or respond to a help request!
            </div>
          ) : (
            conversations.map((c) => {
              const other = c.otherParticipant;
              const isSelected = activeConversation?._id === c._id;
              const online = other ? isUserOnline(other._id) : false;

              return (
                <div
                  key={c._id}
                  onClick={() => setActiveConversation(c)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-white shadow-sm border border-slate-200/80'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={
                        other?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={other?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    {online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {other?.name || 'User'}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      activeOther?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={activeOther?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  {isRecipientOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeOther?.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {activeOther?.currentCity}
                    </span>
                    <span>•</span>
                    <span className={isRecipientOnline ? 'text-emerald-600 font-semibold' : ''}>
                      {isRecipientOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {activeConversation.relatedHelpRequest && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <LifeBuoy className="w-3 h-3" />
                  Help Request Chat
                </span>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/30">
              {messages.map((m) => {
                const isMine = m.sender?._id === user._id || m.sender === user._id;

                return (
                  <div
                    key={m._id}
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && (
                      <img
                        src={
                          m.sender?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt="sender"
                        className="w-6 h-6 rounded-full object-cover mb-1"
                      />
                    )}

                    <div
                      className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <div
                        className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                          isMine ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUser && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={handleTextChange}
                className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!text.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
