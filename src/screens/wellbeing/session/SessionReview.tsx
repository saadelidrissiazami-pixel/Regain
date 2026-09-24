import { useState } from 'react';
import { View } from 'react-native';

import { MoodScale } from '../../../components/cards/MoodScale';
import { errorMessage, InlineNotice } from '../../../components/feedback';
import { Appear, Button, Field, Screen, ScreenHeader, Text } from '../../../components/ui';
import { cleanReflections, promptsForCategory, type Reflection } from '../../../features/wellbeing/reflection';
import type { SessionReview as Review } from '../../../lib/wellbeing';

/** After the session: a rating on 5 levels, open questions, a note. All of it optional. */
export function SessionReview({
  category,
  initialNote,
  saving,
  error,
  onSubmit,
  onSkip,
}: {
  category?: string;
  initialNote?: string;
  saving: boolean;
  error?: unknown;
  onSubmit: (review: Required<Pick<Review, 'mood' | 'reflections' | 'note'>>) => void;
  /** Leaving without rating: the session still counts as done. */
  onSkip: () => void;
}) {
  const prompts = promptsForCategory(category);
  const [mood, setMood] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(() => prompts.map(() => ''));
  const [note, setNote] = useState(initialNote ?? '');
  const reflections: Reflection[] = prompts.map((prompt, i) => ({ prompt, answer: answers[i] ?? '' }));
  const submit = () => onSubmit({ mood, reflections: cleanReflections(reflections), note });

  return (
    <Screen keyboard footer={<Button label="Valider" loading={saving} onPress={submit} />}>
      <ScreenHeader
        title="How do you feel?"
        subtitle="After this session"
        onBack={() => (saving ? undefined : onSkip())}
        backLabel="Close without rating"
      />
      <Appear>
        <MoodScale value={mood} onChange={setMood} />
      </Appear>

      <View style={{ marginTop: 28 }}>
        {prompts.map((prompt, i) => (
          <Appear key={prompt} index={i + 1}>
            <Field
              label={prompt}
              value={answers[i]}
              onChangeText={(text) => setAnswers((current) => current.map((a, j) => (i === j ? text : a)))}
              multiline
              placeholder="Your answer… (optional)"
            />
          </Appear>
        ))}
        <Appear index={prompts.length + 1}>
          <Field
            label="Un petit mot ? (facultatif)"
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="e.g. calmer, less on edge…"
            hint="Your answers stay private — you read them back in your journal."
          />
        </Appear>
      </View>
      {error ? <InlineNotice tone="error" message={errorMessage(error)} /> : null}
      <Text variant="caption" tone="ink3" style={{ marginTop: 4 }}>
        How you felt feeds your tracking and the sessions you get offered.
      </Text>
    </Screen>
  );
}
