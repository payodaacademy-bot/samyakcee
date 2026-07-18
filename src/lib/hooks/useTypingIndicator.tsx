'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseTypingIndicatorReturn {
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  otherUsersTyping: string[];
}

export function useTypingIndicator(channelId: string, userId?: string): UseTypingIndicatorReturn {
  const [isTyping, setIsTypingState] = useState(false);
  const [otherUsersTyping, setOtherUsersTyping] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase || !channelId) return;

    const channel = supabase
      .channel(`typing:${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setOtherUsersTyping((prev) => {
            if (payload.isTyping) {
              return prev.includes(payload.userId) ? prev : [...prev, payload.userId];
            } else {
              return prev.filter((id) => id !== payload.userId);
            }
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userId]);

  const setTyping = (typing: boolean) => {
    setIsTypingState(typing);
    if (!supabase) return;

    supabase.channel(`typing:${channelId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: typing },
    });

    if (typing) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
    }
  };

  return { isTyping, setTyping, otherUsersTyping };
}
