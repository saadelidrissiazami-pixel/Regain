import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Text, TextInput } from '../../src/components/typography';
import { fetchCoachHistory, type CoachMessage } from '../../src/lib/coach';
import { sendFitnessChatMessage } from '../../src/lib/fitness';
import { useAuthStore } from '../../src/store/authStore';

function Bubble({ message }: { message: Pick<CoachMessage, 'role' | 'content'> }) {
  const isUser = message.role === 'user';
  return (
    <View
      className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? 'self-end bg-primary' : 'self-start bg-surface shadow-sm'}`}
    >
      <Text className={isUser ? 'text-sm text-white' : 'text-sm leading-5 text-ink'}>{message.content}</Text>
    </View>
  );
}

export default function FitnessChatScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const historyQuery = useQuery({
    queryKey: ['fitnessChat', userId],
    queryFn: () => fetchCoachHistory(userId!),
    enabled: !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendFitnessChatMessage(message),
    onSuccess: () => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['fitnessChat', userId] });
    },
  });

  const messages: Pick<CoachMessage, 'role' | 'content'>[] = [
    ...(historyQuery.data ?? []),
    ...(sendMutation.isPending && sendMutation.variables ? [{ role: 'user' as const, content: sendMutation.variables }] : []),
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
      keyboardVerticalOffset={20}
    >
      <View className="px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
            ← Retour
          </Text>
        </Pressable>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-[28px] leading-8 text-ink">
          Mon coach forme
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !historyQuery.isLoading ? (
          <View className="mt-2 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <Text className="text-sm leading-5 text-ink-soft">
              Une question sur un exercice, une idée de repas, un coup de moins bien ? Je connais votre programme et
              vos objectifs, demandez-moi.
            </Text>
          </View>
        ) : null}

        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {sendMutation.isPending ? (
          <View className="mb-3 self-start rounded-2xl bg-surface px-4 py-3 shadow-sm">
            <ActivityIndicator size="small" color="#FF6B57" />
          </View>
        ) : null}

        {sendMutation.isError ? (
          <Text className="mb-3 text-xs text-red-700">{(sendMutation.error as Error).message}</Text>
        ) : null}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-line bg-paper px-5 py-3 pb-8">
        <TextInput
          className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3 text-ink"
          placeholder="Écrivez à votre coach…"
          placeholderTextColor="#B5AB9A"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          maxLength={2000}
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
