import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';

interface WebchatStats {
  totalConversations: number;
  casinoUsersCreated: number;
  paymentReceiptsSent: number;
  conversionRate: number;
  receiptRate: number;
}

interface CreatedUser {
  id: string;
  casino_username: string | null;
  contact_name: string | null;
  created_at: string | null;
  payment_receipt_sent: boolean | null;
  payment_receipt_detected_at: string | null;
}

interface DailyStats {
  date: string;
  conversations: number;
  users_created: number;
  receipts: number;
}

interface WebchatStatsResult {
  stats: WebchatStats;
  createdUsers: CreatedUser[];
  dailyStats: DailyStats[];
}

const DEFAULT_STATS: WebchatStats = {
  totalConversations: 0,
  casinoUsersCreated: 0,
  paymentReceiptsSent: 0,
  conversionRate: 0,
  receiptRate: 0,
};

const fetchWebchatStats = async (effectiveUserId: string): Promise<WebchatStatsResult> => {
  const { count: totalConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', effectiveUserId)
    .eq('channel_type', 'webchat');

  const { count: casinoUsersCreated } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', effectiveUserId)
    .eq('channel_type', 'webchat')
    .eq('casino_user_created', true);

  const { count: paymentReceiptsSent } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', effectiveUserId)
    .eq('channel_type', 'webchat')
    .eq('payment_receipt_sent', true);

  const { data: usersData } = await supabase
    .from('conversations')
    .select('id, casino_username, contact_name, created_at, payment_receipt_sent, payment_receipt_detected_at')
    .eq('user_id', effectiveUserId)
    .eq('channel_type', 'webchat')
    .eq('casino_user_created', true)
    .order('created_at', { ascending: false })
    .limit(50);

  const total = totalConversations || 0;
  const users = casinoUsersCreated || 0;
  const receipts = paymentReceiptsSent || 0;

  const conversionRate = total > 0 ? (users / total) * 100 : 0;
  const receiptRate = users > 0 ? (receipts / users) * 100 : 0;

  const stats: WebchatStats = {
    totalConversations: total,
    casinoUsersCreated: users,
    paymentReceiptsSent: receipts,
    conversionRate,
    receiptRate,
  };

  const { data: allConversations } = await supabase
    .from('conversations')
    .select('created_at, casino_user_created, payment_receipt_sent')
    .eq('user_id', effectiveUserId)
    .eq('channel_type', 'webchat')
    .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  const dailyMap = new Map<string, DailyStats>();
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, conversations: 0, users_created: 0, receipts: 0 });
  }

  allConversations?.forEach(conv => {
    const dateStr = conv.created_at?.split('T')[0];
    if (dateStr && dailyMap.has(dateStr)) {
      const day = dailyMap.get(dateStr)!;
      day.conversations += 1;
      if (conv.casino_user_created) day.users_created += 1;
      if (conv.payment_receipt_sent) day.receipts += 1;
    }
  });

  return {
    stats,
    createdUsers: usersData || [],
    dailyStats: Array.from(dailyMap.values()),
  };
};

export const useWebchatStats = () => {
  const { effectiveUserId } = useEffectiveUserId();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['webchat-stats', effectiveUserId],
    queryFn: () => fetchWebchatStats(effectiveUserId!),
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    stats: data?.stats ?? DEFAULT_STATS,
    createdUsers: data?.createdUsers ?? [],
    dailyStats: data?.dailyStats ?? [],
    loading: isLoading,
    refetch,
  };
};
