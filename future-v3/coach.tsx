import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { Text, TextInput } from '../src/components/typography';
import { fetchCoachHistory, sendCoachMessage, type CoachMessage } from '../src/lib/coach';
import { useAuthStore } from '../src/store/authStore';

function Bubble({ message }: { message: Pick<CoachMessage, 'role' | 'content'> }) {
  const isUser = message.role === 'user';
  return (
    <View className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? 'self-end bg-primary' : 'self-start bg-surface shadow-sm'}`}>
      <Text className={isUser ? 'text-sm text-white' : 'text-sm text-ink'}>{message.content}</Text>
    </View>
  );
}

export default function CoachScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const historyQuery = useQuery({
    queryKey: ['coachHistory', userId],
    queryFn: () => fetchCoachHistory(userId!),
    enabled: !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendCoachMessage(message),
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['coachHistory', userId] });
    },
  });

  const optimisticMessages: Pick<CoachMessage, 'role' | 'content'>[] = [
    ...(historyQuery.data ?? []),
    ...(sendMutation.isPending ? [{ role: 'user' as const, content: sendMutation.variables! }] : []),
  ];

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-paper"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View className="px-5 pb-3 pt-16">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
          Always here
        </Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-[28px] leading-8 text-ink">
          Your coach
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {optimisticMessages.length === 0 && !historyQuery.isLoading ? (
          <View className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <Text className="text-sm text-ink-soft">
              Tell me how you are feeling, or ask me to adapt your week — I am here to help, with no
              judgement.
            </Text>
          </View>
        ) : null}

        {optimisticMessages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {sendMutation.isPending ? (
          <View className="mb-3 max-w-[60%] self-start rounded-2xl bg-surface px-4 py-3 shadow-sm">
            <ActivityIndicator size="small" color="#FF6B57" />
          </View>
        ) : null}

        {sendMutation.isError ? (
          <Text className="mb-3 text-xs text-red-700">{(sendMutation.error as Error).message}</Text>
        ) : null}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-line bg-paper px-5 py-3">
        <TextInput
          className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3 text-ink"
          placeholder="Write to your coach…"
          placeholderTextColor="#B5AB9A"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          disabled={sendMutation.isPending || !input.trim()}
          className="h-11 w-11 items-center justify-center rounded-full bg-primary"
        >
          <Text className="text-base text-white">→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
