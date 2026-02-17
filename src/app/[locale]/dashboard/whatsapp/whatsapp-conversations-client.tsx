'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WhatsAppMessage } from '@/types/whatsapp';
import { displayPhoneNumber } from '@/types/whatsapp';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, User, Phone, ExternalLink, Loader2 } from 'lucide-react';

interface Conversation {
  customer_phone: string;
  customer_name: string | null;
  lead_id: string | null;
  lead_name: string | null;
  last_message_at: string;
  last_message_content: string | null;
  unread_count: number;
}

interface WhatsAppConversationsClientProps {
  dealerId: string;
}

export function WhatsAppConversationsClient({ dealerId }: WhatsAppConversationsClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load conversations
  useEffect(() => {
    loadConversations();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('whatsapp_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          loadConversations();
          if (selectedConversation) {
            loadMessages(selectedConversation.customer_phone);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      // Get all messages grouped by customer phone
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          from_number,
          to_number,
          contact_name,
          content,
          timestamp,
          direction,
          lead_id,
          leads (
            id,
            first_name,
            last_name
          )
        `)
        .eq('dealer_id', dealerId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by customer phone
      const conversationMap = new Map<string, Conversation>();

      data?.forEach((msg: any) => {
        const customerPhone = msg.direction === 'inbound' ? msg.from_number : msg.to_number;
        
        if (!conversationMap.has(customerPhone)) {
          conversationMap.set(customerPhone, {
            customer_phone: customerPhone,
            customer_name: msg.contact_name || null,
            lead_id: msg.lead_id || null,
            lead_name: msg.leads
              ? `${msg.leads.first_name} ${msg.leads.last_name}`
              : null,
            last_message_at: msg.timestamp,
            last_message_content: msg.content,
            unread_count: 0, // TODO: Track unread messages
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Fehler beim Laden der Konversationen');
    }
  };

  const loadMessages = async (customerPhone: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('dealer_id', dealerId)
        .or(`from_number.eq.${customerPhone},to_number.eq.${customerPhone}`)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.customer_phone);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    const conversation = selectedConversation;
    const leadId = conversation.lead_id;

    if (!leadId) {
      toast.error('Kein Lead gefunden für diese Konversation');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          message: messageInput,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Clear input
      setMessageInput('');

      // Reload messages
      await loadMessages(conversation.customer_phone);
      await loadConversations();

      toast.success('Nachricht gesendet!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Conversations List */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Konversationen</h2>
          <p className="text-sm text-slate-600">{conversations.length} Gespräche</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {conversations.map((conv) => (
              <button
                key={conv.customer_phone}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                  selectedConversation?.customer_phone === conv.customer_phone
                    ? 'bg-slate-100'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {conv.customer_name || conv.lead_name || displayPhoneNumber(conv.customer_phone)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {displayPhoneNumber(conv.customer_phone)}
                      </p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge variant="default" className="ml-2">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {conv.last_message_content || '[Kein Text]'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(conv.last_message_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <p>Keine Konversationen vorhanden</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Chat View */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.customer_name ||
                    selectedConversation.lead_name ||
                    displayPhoneNumber(selectedConversation.customer_phone)}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {displayPhoneNumber(selectedConversation.customer_phone)}
                </p>
              </div>
              {selectedConversation.lead_id && (
                <a
                  href={`/dashboard/leads/${selectedConversation.lead_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Lead öffnen
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.direction === 'outbound'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p
                            className={`text-xs ${
                              msg.direction === 'outbound' ? 'text-green-100' : 'text-slate-500'
                            }`}
                          >
                            {format(new Date(msg.timestamp), 'HH:mm', { locale: de })}
                          </p>
                          {msg.direction === 'outbound' && (
                            <span
                              className={`text-xs ${
                                msg.status === 'read'
                                  ? 'text-blue-200'
                                  : msg.status === 'delivered'
                                  ? 'text-green-200'
                                  : 'text-green-300'
                              }`}
                            >
                              {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht schreiben..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isSending || !messageInput.trim()}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Wählen Sie eine Konversation aus</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
