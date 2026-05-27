import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionStats {
  session_id: string;
  session_type: 'twilio' | 'whatsapp' | 'telegram' | 'webchat';
  total_conversations: number;
  received_messages: number;
  sent_messages: number;
  last_message_at: string | null;
}

const fetchSessionStats = async (userId: string): Promise<Record<string, SessionStats>> => {
  const statsMap: Record<string, SessionStats> = {};

  // Twilio
  const { data: twilioConversations } = await supabase
    .from('conversations')
    .select('id, twilio_connection_id, last_message_time')
    .eq('user_id', userId)
    .not('twilio_connection_id', 'is', null);

  if (twilioConversations) {
    const twilioGroups: Record<string, { convIds: string[]; lastMessage: string | null }> = {};
    twilioConversations.forEach(conv => {
      const connId = conv.twilio_connection_id!;
      if (!twilioGroups[connId]) twilioGroups[connId] = { convIds: [], lastMessage: null };
      twilioGroups[connId].convIds.push(conv.id);
      if (
        !twilioGroups[connId].lastMessage ||
        (conv.last_message_time && conv.last_message_time > twilioGroups[connId].lastMessage!)
      ) {
        twilioGroups[connId].lastMessage = conv.last_message_time;
      }
    });

    for (const [connId, group] of Object.entries(twilioGroups)) {
      const { count: receivedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', group.convIds)
        .eq('direction', 'inbound');

      const { count: sentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', group.convIds)
        .eq('direction', 'outbound');

      statsMap[connId] = {
        session_id: connId,
        session_type: 'twilio',
        total_conversations: group.convIds.length,
        received_messages: receivedCount || 0,
        sent_messages: sentCount || 0,
        last_message_at: group.lastMessage,
      };
    }
  }

  // WhatsApp
  const { data: whatsappConversations } = await supabase
    .from('conversations')
    .select('id, phone_number, whatsapp_number, last_message_time')
    .eq('user_id', userId)
    .is('twilio_connection_id', null)
    .is('telegram_bot_id', null)
    .or('channel_type.eq.whatsapp,channel_type.is.null');

  const { data: whatsappConnections } = await supabase
    .from('whatsapp_connections')
    .select('id, phone_number')
    .eq('user_id', userId);

  if (whatsappConnections && whatsappConversations) {
    for (const conn of whatsappConnections) {
      const connConvs = whatsappConversations.filter(
        c => c.whatsapp_number === conn.phone_number || (!c.whatsapp_number && conn.phone_number)
      );

      if (connConvs.length > 0) {
        const convIds = connConvs.map(c => c.id);

        const { count: receivedCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .eq('direction', 'inbound');

        const { count: sentCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .eq('direction', 'outbound');

        const lastMessage = connConvs.reduce((latest, c) => {
          if (!c.last_message_time) return latest;
          if (!latest || c.last_message_time > latest) return c.last_message_time;
          return latest;
        }, null as string | null);

        statsMap[conn.id] = {
          session_id: conn.id,
          session_type: 'whatsapp',
          total_conversations: connConvs.length,
          received_messages: receivedCount || 0,
          sent_messages: sentCount || 0,
          last_message_at: lastMessage,
        };
      } else {
        statsMap[conn.id] = {
          session_id: conn.id,
          session_type: 'whatsapp',
          total_conversations: 0,
          received_messages: 0,
          sent_messages: 0,
          last_message_at: null,
        };
      }
    }
  }

  // Telegram
  const { data: telegramConversations } = await supabase
    .from('conversations')
    .select('id, telegram_bot_id, last_message_time')
    .eq('user_id', userId)
    .not('telegram_bot_id', 'is', null);

  if (telegramConversations) {
    const telegramGroups: Record<string, { convIds: string[]; lastMessage: string | null }> = {};
    telegramConversations.forEach(conv => {
      const botId = conv.telegram_bot_id!;
      if (!telegramGroups[botId]) telegramGroups[botId] = { convIds: [], lastMessage: null };
      telegramGroups[botId].convIds.push(conv.id);
      if (
        !telegramGroups[botId].lastMessage ||
        (conv.last_message_time && conv.last_message_time > telegramGroups[botId].lastMessage!)
      ) {
        telegramGroups[botId].lastMessage = conv.last_message_time;
      }
    });

    for (const [botId, group] of Object.entries(telegramGroups)) {
      const { count: receivedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', group.convIds)
        .eq('direction', 'inbound');

      const { count: sentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', group.convIds)
        .eq('direction', 'outbound');

      statsMap[botId] = {
        session_id: botId,
        session_type: 'telegram',
        total_conversations: group.convIds.length,
        received_messages: receivedCount || 0,
        sent_messages: sentCount || 0,
        last_message_at: group.lastMessage,
      };
    }
  }

  const { data: allTelegramBots } = await supabase
    .from('telegram_bots')
    .select('id')
    .eq('user_id', userId);

  if (allTelegramBots) {
    for (const bot of allTelegramBots) {
      if (!statsMap[bot.id]) {
        statsMap[bot.id] = {
          session_id: bot.id,
          session_type: 'telegram',
          total_conversations: 0,
          received_messages: 0,
          sent_messages: 0,
          last_message_at: null,
        };
      }
    }
  }

  // Web chatbots
  const { data: webChatbots } = await supabase
    .from('web_chatbots')
    .select('id')
    .eq('user_id', userId);

  if (webChatbots) {
    const { data: landingConversations } = await supabase
      .from('landing_chat_conversations')
      .select('id, updated_at')
      .eq('user_id', userId);

    if (landingConversations && landingConversations.length > 0) {
      const landingConvIds = landingConversations.map(c => c.id);

      const { count: receivedCount } = await supabase
        .from('landing_chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', landingConvIds)
        .eq('direction', 'inbound');

      const { count: sentCount } = await supabase
        .from('landing_chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', landingConvIds)
        .eq('direction', 'outbound');

      const lastMessage = landingConversations.reduce((latest, c) => {
        if (!c.updated_at) return latest;
        if (!latest || c.updated_at > latest) return c.updated_at;
        return latest;
      }, null as string | null);

      for (const chatbot of webChatbots) {
        statsMap[chatbot.id] = {
          session_id: chatbot.id,
          session_type: 'webchat',
          total_conversations: landingConversations.length,
          received_messages: receivedCount || 0,
          sent_messages: sentCount || 0,
          last_message_at: lastMessage,
        };
      }
    } else {
      for (const chatbot of webChatbots) {
        statsMap[chatbot.id] = {
          session_id: chatbot.id,
          session_type: 'webchat',
          total_conversations: 0,
          received_messages: 0,
          sent_messages: 0,
          last_message_at: null,
        };
      }
    }
  }

  return statsMap;
};

export const useSessionStats = (userId: string | null) => {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['session-stats', userId],
    queryFn: () => fetchSessionStats(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const getStatsBySessionId = (sessionId: string): SessionStats | null => {
    return stats[sessionId] || null;
  };

  return {
    stats,
    loading: isLoading,
    getStatsBySessionId,
  };
};
