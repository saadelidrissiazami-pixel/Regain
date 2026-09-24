import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

import { goBack } from '../src/lib/navigation';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState, InlineNotice } from '../src/components/feedback';
import { Card, haptic, IconButton, ScreenHeader, Text, TextInput } from '../src/components/ui';
import { fetchCoachHistory, sendCoachMessage, type CoachMessage, type CoachSubject } from '../src/lib/coach';
import { usePremium } from '../src/lib/premium';
import { useAuthStore } from '../src/store/authStore';
import { useTheme } from '../src/theme/ThemeProvider';

const OPENING: Record<CoachSubject, string> = {
  forme: 'A question about your session, your meals or your recovery? Write it the way you would say it.',
  'bien-etre': 'Tell me how you are feeling, or what is in the way right now. No judgement.',
};

function Bubble({ message }: { message: Pick<CoachMessage, 'role' | 'content'> }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        backgroundColor: isUser ? theme.primary600 : theme.surface,
        borderWidth: isUser ? 0 : 1,
        borderColor: theme.line,
      }}
    >
      <Text variant="bodySm" style={isUser ? { color: theme.bg } : undefined}>
        {message.content}
      </Text>
    </View>
  );
}

/** The conversational coach. The programme and the meals stay rule-generated; here we answer
 *  questions, explain, encourage — the things rules cannot do. */
export default function CoachScreen() {
  const theme = useTheme();
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const params = useLocalSearchParams<{ sujet?: string }>();
  const subject: CoachSubject = params.sujet === 'forme' ? 'forme' : 'bien-etre';

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const historyQuery = useQuery({
    queryKey: ['coachHistory', userId],
    queryFn: () => fetchCoachHistory(userId!),
    enabled: !!userId && isPremium,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendCoachMessage(message, subject),
    onSuccess: () => {
      haptic.success();
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['coachHistory', userId] });
    },
  });

  const messages: Pick<CoachMessage, 'role' | 'content'>[] = [
    ...(historyQuery.data ?? []),
    ...(sendMutation.isPending ? [{ role: 'user' as const, content: sendMutation.variables }] : []),
  ];

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  if (!premiumLoading && !isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20, paddingTop: 60 }}>
        <ScreenHeader title="Your coach" subtitle="Ask a question, any time" onBack={() => goBack(subject === 'forme' ? '/(tabs)/fitness' : '/(tabs)/wellbeing')} />
        <EmptyState
          icon="chatbubbles-outline"
          title="Your coach is part of Premium"
          body="Ask about your sessions, your meals or your energy, and get an answer that takes your goals into account."
          actionLabel="See what Premium adds"
          onAction={() => router.push('/paywall?source=locked')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 60 }}>
        <ScreenHeader title="Your coach" subtitle="Ask a question, any time" onBack={() => goBack(subject === 'forme' ? '/(tabs)/fitness' : '/(tabs)/wellbeing')} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !historyQuery.isLoading ? (
          <Card>
            <Text variant="bodySm" tone="ink2">
              {OPENING[subject]}
            </Text>
          </Card>
        ) : null}

        {messages.map((message, index) => (
          <Bubble key={index} message={message} />
        ))}

        {sendMutation.isPending ? (
          <View style={{ alignSelf: 'flex-start', marginBottom: 10, paddingVertical: 10 }}>
            <ActivityIndicator size="small" color={theme.primary600} />
          </View>
        ) : null}

        {/* A spent quota, an outage or an undeployed function all arrive here with their real message. */}
        {sendMutation.isError ? <InlineNotice tone="error" message={(sendMutation.error as Error).message} /> : null}
        {historyQuery.isError ? <InlineNotice tone="error" message="Your history could not be loaded." /> : null}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: theme.divider,
          backgroundColor: theme.surface,
        }}
      >
        <TextInput
          style={{ flex: 1 }}
          placeholder="Write to your coach…"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
        />
        {/* `send` does nothing while the field is empty: the opacity says so at a glance. */}
        <View style={{ opacity: sendMutation.isPending || input.trim().length === 0 ? 0.4 : 1 }}>
          <IconButton icon="arrow-up" label="Envoyer" variant="primary" onPress={send} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
