'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  user_id?: string;
}

interface UseRealtimeChatReturn {
  messages: RealtimeMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function useRealtimeChat(channelId: string): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase || !channelId) return;

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as RealtimeMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      await supabase.channel(`chat:${channelId}`).send({
        type: 'broadcast',
        event: 'message',
        payload: {
          id: Date.now().toString(),
          content,
          role: 'user',
          created_at: new Date().toISOString(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, channelId]);

  return { messages, isLoading, sendMessage };
}
