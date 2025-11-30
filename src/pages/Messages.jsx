import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('conversation');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find(c => c.id === conversationId);
      if (convo) selectConversation(convo);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedConvo) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConvo]);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const allConvos = await base44.entities.Conversation.list('-last_message_date');
    const conversations = Array.isArray(allConvos) ? allConvos : [];
    const myConvos = conversations.filter(c => c && c.participant_emails?.includes(userData.email));
    setConversations(myConvos);
    setIsLoading(false);
  };

  const loadMessages = async () => {
    if (!selectedConvo) return;
    const msgs = await base44.entities.Message.filter({ conversation_id: selectedConvo.id }, 'created_date');
    const messages = Array.isArray(msgs) ? msgs : [];
    setMessages(messages);

    // Mark messages as read
    const unreadMsgs = messages.filter(m => m && !m.is_read && m.sender_email !== user.email);
    await Promise.all(unreadMsgs.map(m => base44.entities.Message.update(m.id, { is_read: true })));
  };

  const selectConversation = async (convo) => {
    setSelectedConvo(convo);
    const msgs = await base44.entities.Message.filter({ conversation_id: convo.id }, 'created_date');
    const messages = Array.isArray(msgs) ? msgs : [];
    setMessages(messages);

    // Mark as read
    const unreadMsgs = messages.filter(m => m && !m.is_read && m.sender_email !== user.email);
    await Promise.all(unreadMsgs.map(m => base44.entities.Message.update(m.id, { is_read: true })));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;

    setIsSending(true);

    await base44.entities.Message.create({
      conversation_id: selectedConvo.id,
      sender_email: user.email,
      sender_name: user.display_name || user.full_name || user.email,
      content: newMessage.trim()
    });

    await base44.entities.Conversation.update(selectedConvo.id, {
      last_message: newMessage.trim(),
      last_message_date: new Date().toISOString()
    });

    setNewMessage('');
    await loadMessages();
    setIsSending(false);
  };

  const getOtherParticipant = (convo) => {
    const idx = convo.participant_emails?.findIndex(e => e !== user?.email);
    return {
      email: convo.participant_emails?.[idx] || '',
      name: convo.participant_names?.[idx] || convo.participant_emails?.[idx] || 'Unknown'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-stone-900">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0 h-full overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-stone-500">
                  <MessageCircle className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map(convo => {
                  const other = getOtherParticipant(convo);
                  const isSelected = selectedConvo?.id === convo.id;
                  return (
                    <div
                      key={convo.id}
                      onClick={() => selectConversation(convo)}
                      className={`p-4 border-b cursor-pointer hover:bg-stone-50 transition-colors ${
                        isSelected ? 'bg-stone-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-stone-200 text-stone-600">
                            {other.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 truncate">{other.name}</p>
                          <p className="text-sm text-stone-500 truncate">{convo.last_message || 'No messages yet'}</p>
                        </div>
                        {convo.last_message_date && (
                          <span className="text-xs text-stone-400">
                            {format(new Date(convo.last_message_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-0 shadow-lg md:col-span-2 flex flex-col overflow-hidden">
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-stone-200 text-stone-600">
                        {getOtherParticipant(selectedConvo).name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-stone-900">{getOtherParticipant(selectedConvo).name}</p>
                      <Link 
                        to={createPageUrl(`OrganizerProfile?email=${getOtherParticipant(selectedConvo).email}`)}
                        className="text-sm text-stone-500 hover:text-stone-700"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
                  {messages.map(msg => {
                    const isOwn = msg.sender_email === user.email;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwn ? 'bg-stone-900 text-white' : 'bg-white shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-stone-400' : 'text-stone-400'}`}>
                            {format(new Date(msg.created_date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full"
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()} className="rounded-full">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-500">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-stone-300 mb-4" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}