import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import logger from '@/lib/logger';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface ConversationWithLastMessage extends Conversation {
  messages?: Message[];
}

export interface ConversationQueryOptions {
  restrictToAgentId?: string | null;
  includeUnassigned?: boolean;
  limit?: number;
  offset?: number;
  filterMode?: 'all' | 'unassigned' | 'funnel' | 'pending' | 'stale' | 'offline' | 'bot_off' | 'urgent';
  assignmentFilter?: 'all' | 'mine' | 'unassigned';
  currentUserId?: string | null;
  sessionFilter?: {
    type: 'whatsapp' | 'telegram' | 'twilio';
    id: string;
    identifier: string;
  } | null;
  searchTerm?: string;
  leadIds?: string[];
  offlineAgentIds?: string[];
}

export class ConversationService {
  /**
   * Obtiene todas las conversaciones del usuario actual
   */
  static async getConversations(
    userId: string,
    opts?: ConversationQueryOptions
  ): Promise<ConversationWithLastMessage[]> {
    try {
      // Seleccionar columnas necesarias (excluyendo mensajes) para reducir egress
      let query = supabase
        .from('conversations')
        .select('id, user_id, pushname, phone_number, whatsapp_number, last_message, last_message_time, unread_count, status, channel_type, telegram_bot_id, twilio_connection_id, facebook_connection_id, lead_id, created_at, updated_at, contact_name, casino_user_created, casino_username, last_inbound_message_time, payment_receipt_detected_at, payment_receipt_sent, assigned_to, assigned_at, assigned_by')
        .eq('user_id', userId);

      if (opts?.restrictToAgentId) {
        if (opts.includeUnassigned) {
          query = query.or(`assigned_to.eq.${opts.restrictToAgentId},assigned_to.is.null`);
        } else {
          query = query.eq('assigned_to', opts.restrictToAgentId);
        }
      }

      if (opts?.assignmentFilter === 'mine' && opts.currentUserId) {
        query = query.eq('assigned_to', opts.currentUserId);
      } else if (opts?.assignmentFilter === 'unassigned') {
        query = query.is('assigned_to', null);
      }

      if (opts?.sessionFilter) {
        if (opts.sessionFilter.type === 'whatsapp') query = query.eq('whatsapp_number', opts.sessionFilter.identifier);
        if (opts.sessionFilter.type === 'telegram') query = query.eq('telegram_bot_id', opts.sessionFilter.id);
        if (opts.sessionFilter.type === 'twilio') query = query.eq('twilio_connection_id', opts.sessionFilter.id);
      }

      const filterMode = opts?.filterMode || 'all';
      if (filterMode === 'unassigned') query = query.is('lead_id', null);
      if (filterMode === 'pending') query = query.gt('unread_count', 0);
      if (filterMode === 'stale') {
        query = query.gt('unread_count', 0).lt('last_inbound_message_time', new Date(Date.now() - 30 * 60 * 1000).toISOString());
      }
      if (filterMode === 'offline' && opts?.offlineAgentIds?.length) query = query.in('assigned_to', opts.offlineAgentIds);
      if (filterMode === 'urgent') query = query.or('payment_receipt_detected_at.not.is.null,last_message.ilike.%comprobante%');
      if (filterMode === 'funnel' && opts?.leadIds?.length) query = query.in('lead_id', opts.leadIds);
      if (filterMode === 'funnel' && opts?.leadIds && opts.leadIds.length === 0) return [];

      const normalizedSearch = opts?.searchTerm?.trim();
      if (normalizedSearch && normalizedSearch.length >= 2) {
        const safeSearch = normalizedSearch.replace(/[,%]/g, '');
        query = query.or(`pushname.ilike.%${safeSearch}%,phone_number.ilike.%${safeSearch}%,contact_name.ilike.%${safeSearch}%`);
      }

      const limit = opts?.limit ?? 100;
      const offset = opts?.offset ?? 0;
      const { data, error } = await query
        .neq('channel_type', 'webchat')
        .order('last_message_time', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }

  /**
   * Obtiene una conversación específica por ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getConversationById:', error);
      throw error;
    }
  }

  /**
   * Busca conversaciones por nombre o número de teléfono
   */
  static async searchConversations(userId: string, searchTerm: string): Promise<ConversationWithLastMessage[]> {
    try {
      // Seleccionar columnas necesarias (excluyendo mensajes) para reducir egress
      const { data, error } = await supabase
        .from('conversations')
        .select('id, user_id, pushname, phone_number, whatsapp_number, last_message, last_message_time, unread_count, status, channel_type, telegram_bot_id, twilio_connection_id, facebook_connection_id, lead_id, created_at, updated_at, contact_name, casino_user_created, casino_username, last_inbound_message_time, payment_receipt_detected_at, payment_receipt_sent, assigned_to, assigned_at, assigned_by')
        .eq('user_id', userId)
        .or(`pushname.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .order('last_message_time', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching conversations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchConversations:', error);
      throw error;
    }
  }

  /**
   * Obtiene los mensajes de una conversación específica
   */
  static async getMessages(conversationId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      // Seleccionar solo columnas necesarias para reducir egress
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, user_id, content, message, direction, message_type, is_bot, status, created_at, attachment_url, file_url, metadata, responded_by')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      // Retornar en orden cronológico (más antiguos primero)
      return (data || []).reverse();
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  /**
   * Envía un nuevo mensaje usando el edge function de Supabase
   */
  static async sendMessage(
    conversationId: string,
    userId: string,
    message: string,
    sessionName: string,
    phoneNumber: string,
    channelType?: string,
    telegramBotId?: string | null,
    twilioConnectionId?: string | null
  ): Promise<Message | null> {
    try {
      // Si es WebChat, usar web-chat-send
      if (channelType === 'webchat') {
        logger.debug('[ConversationService] Sending via WebChat');
        
        const { data, error } = await supabase.functions.invoke('web-chat-send', {
          body: {
            conversationId,
            message,
            userId
          }
        });

        if (error) {
          console.error('[ConversationService] Error calling web-chat-send:', error);
          throw error;
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send WebChat message');
        }

        logger.debug('[ConversationService] WebChat message sent successfully');
        return data.savedMessage;
      }
      
      // Si es Telegram, usar telegram-send-message
      if (channelType === 'telegram' && telegramBotId) {
        logger.debug('[ConversationService] Sending via Telegram');
        
        const { data, error } = await supabase.functions.invoke('telegram-send-message', {
          body: {
            chatId: phoneNumber,
            message,
            userId,
            conversationId,
            telegramBotId,
            isBot: false
          }
        });

        if (error) {
          console.error('[ConversationService] Error calling telegram-send-message:', error);
          throw error;
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send Telegram message');
        }

        logger.debug('[ConversationService] Telegram message sent successfully');
        return data.savedMessage;
      }

      // Si es Twilio, usar twilio-send-message
      if (channelType === 'twilio' && twilioConnectionId) {
        logger.debug('[ConversationService] Sending via Twilio');
        
        const { data, error } = await supabase.functions.invoke('twilio-send-message', {
          body: {
            twilioConnectionId,
            phoneNumber,
            message,
            userId,
            conversationId,
            isBot: false
          }
        });

        if (error) {
          console.error('[ConversationService] Error calling twilio-send-message:', error);
          throw error;
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send Twilio message');
        }

        logger.debug('[ConversationService] Twilio message sent successfully');
        return data.savedMessage;
      }
      
      // Si es WhatsApp, usar waha-send-message
      logger.debug('[ConversationService] Sending via WhatsApp');
      
      const { data, error } = await supabase.functions.invoke('waha-send-message', {
        body: {
          sessionName,
          phoneNumber,
          message,
          userId,
          conversationId
        }
      });

      if (error) {
        console.error('[ConversationService] Error calling waha-send-message:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send WhatsApp message');
      }

      logger.debug('[ConversationService] WhatsApp message sent successfully');
      return data.savedMessage;
    } catch (error) {
      console.error('[ConversationService] Error in sendMessage:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje solo al webhook sin guardarlo en la base de datos
   */
  static async sendMessageToWebhookOnly(messageData: {
    user_id: string;
    conversation_id?: string;
    whatsapp_number: string;
    instance_name: string;
    pushname?: string;
    message?: string;
    message_type?: string;
    direction: string;
    attachment_url?: string;
    file_url?: string;
    is_bot?: boolean;
  }): Promise<void> {
    try {
      const webhookUrl = 'https://n8n.kanbanpro.com.ar/webhook/enviar-mensaje';
      
      // Generar ID único para el mensaje
      const messageId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const payload = {
        id: messageId,
        user_id: messageData.user_id,
        conversation_id: messageData.conversation_id,
        whatsapp_number: messageData.whatsapp_number,
        instance_name: messageData.instance_name,
        pushname: messageData.pushname,
        message: messageData.message,
        message_type: messageData.message_type || 'text',
        direction: messageData.direction,
        attachment_url: messageData.attachment_url,
        file_url: messageData.file_url,
        is_bot: messageData.is_bot || false,
        created_at: now,
        updated_at: now,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook response error: ${response.status}`);
      }

      logger.debug('Message sent to webhook successfully');
    } catch (error) {
      console.error('Error sending to webhook:', error);
      throw error; // Lanzamos el error para que se maneje en el componente
    }
  }

  /**
   * Envía mensaje al webhook de n8n
   */
  private static async sendToWebhook(messageData: Message): Promise<void> {
    try {
      const webhookUrl = 'https://n8n.kanbanpro.com.ar/webhook/enviar-mensaje';
      
      // Obtener información de la conversación para los campos faltantes
      const { data: conversation } = await supabase
        .from('conversations')
        .select('whatsapp_number, pushname')
        .eq('id', messageData.conversation_id)
        .single();
      
      const payload = {
        id: messageData.id,
        user_id: messageData.user_id,
        conversation_id: messageData.conversation_id,
        whatsapp_number: conversation?.whatsapp_number || '',
        pushname: conversation?.pushname || '',
        message: messageData.message,
        message_type: messageData.message_type,
        direction: messageData.direction,
        attachment_url: messageData.attachment_url,
        file_url: messageData.file_url,
        is_bot: messageData.is_bot,
        created_at: messageData.created_at,
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      logger.debug('Message sent to webhook successfully');
    } catch (error) {
      console.error('Error sending to webhook:', error);
      // No lanzamos el error para que no afecte el flujo principal
    }
  }

  /**
   * Actualiza el último mensaje de una conversación
   */
  static async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    lastMessageAt: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          last_message: lastMessage,
          last_message_time: lastMessageAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Error updating conversation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateConversationLastMessage:', error);
      throw error;
    }
  }

  /**
   * Marca los mensajes de una conversación como leídos
   */
  static async markAsRead(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          unread_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Error marking conversation as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  /**
   * Obtiene el conteo de conversaciones no leídas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Usar RPC para calcular en la base de datos y reducir egress
      const { data, error } = await supabase.rpc('get_unread_count', { user_uuid: userId });

      if (error) {
        console.error('Error getting unread count:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios en tiempo real de conversaciones
   */
  static subscribeToConversations(userId: string, callback: (payload: any) => void) {
    // Unique channel name per subscription to avoid reusing an already-subscribed channel
    const channelName = `conversations-${userId}-${crypto.randomUUID()}`;
    
    return supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Realtime] Conversation change received:', payload.eventType, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Conversations subscription status:', status);
      });
  }

  /**
   * Suscribirse a cambios en tiempo real de mensajes
   */
  static subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
    // Unique channel name per subscription to avoid reusing an already-subscribed channel
    const channelName = `messages-${conversationId}-${crypto.randomUUID()}`;
    
    return supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('[Realtime] Message change received:', payload.eventType, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Messages subscription status:', status);
      });
  }

  /**
   * Actualiza la sesión de WhatsApp asociada a una conversación
   */
  static async updateConversationSession(
    conversationId: string,
    newWhatsAppNumber: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          whatsapp_number: newWhatsAppNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Error updating conversation session:', error);
        throw error;
      }

      console.log('[ConversationService] Session updated successfully');
    } catch (error) {
      console.error('Error in updateConversationSession:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje con archivo adjunto
   */
  static async sendMessageWithAttachment(
    conversationId: string,
    userId: string,
    message: string,
    sessionName: string,
    phoneNumber: string,
    fileUrl: string,
    fileName: string,
    mimeType: string,
    channelType?: string,
    telegramBotId?: string | null,
    twilioConnectionId?: string | null
  ): Promise<Message | null> {
    try {
      console.log('[ConversationService] Sending message with attachment...', {
        channelType,
        fileName,
        mimeType
      });

      // Si es Telegram, usar telegram-send-file
      if (channelType === 'telegram' && telegramBotId) {
        console.log('[ConversationService] Sending via Telegram with file...');
        
        const { data, error } = await supabase.functions.invoke('telegram-send-file', {
          body: {
            chatId: phoneNumber,
            fileUrl,
            caption: message,
            mimeType,
            userId,
            conversationId,
            telegramBotId,
            isBot: false
          }
        });

        if (error) {
          console.error('[ConversationService] Error calling telegram-send-file:', error);
          throw error;
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send Telegram file');
        }

        console.log('[ConversationService] Telegram file sent successfully');
        return data.savedMessage;
      }

      // Si es Twilio, usar twilio-send-file
      if (channelType === 'twilio' && twilioConnectionId) {
        console.log('[ConversationService] Sending via Twilio with file...');
        
        const { data, error } = await supabase.functions.invoke('twilio-send-file', {
          body: {
            twilioConnectionId,
            phoneNumber,
            message,
            fileUrl,
            fileName,
            mimeType,
            userId,
            conversationId
          }
        });

        if (error) {
          console.error('[ConversationService] Error calling twilio-send-file:', error);
          throw error;
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to send Twilio file');
        }

        console.log('[ConversationService] Twilio file sent successfully');
        return data.savedMessage;
      }

      // Si es WhatsApp (WAHA), usar waha-send-file
      console.log('[ConversationService] Sending via WhatsApp with file...');
      
      const { data, error } = await supabase.functions.invoke('waha-send-file', {
        body: {
          sessionName,
          phoneNumber,
          message,
          fileUrl,
          fileName,
          mimeType,
          userId,
          conversationId
        }
      });

      if (error) {
        console.error('[ConversationService] Error calling waha-send-file:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send WhatsApp file');
      }

      console.log('[ConversationService] WhatsApp file sent successfully');
      return data.savedMessage;
    } catch (error) {
      console.error('[ConversationService] Error in sendMessageWithAttachment:', error);
      throw error;
    }
  }
}