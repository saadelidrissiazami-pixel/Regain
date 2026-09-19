import { useState } from 'react';
import { View } from 'react-native';

import { MoodScale } from '../../../components/cards/MoodScale';
import { errorMessage, InlineNotice } from '../../../components/feedback';
import { Appear, Button, Field, Screen, ScreenHeader, Text } from '../../../components/ui';
import { cleanReflections, promptsForCategory, type Reflection } from '../../../features/wellbeing/reflection';
import type { SessionReview as Review } from '../../../lib/wellbeing';

/** Après la séance : ressenti en 5 niveaux, questions ouvertes, petit mot. Tout est facultatif. */
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
  /** Quitter sans noter : la séance compte quand même comme faite. */
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
        title="Comment te sens-tu ?"
        subtitle="Après cette séance"
        onBack={() => (saving ? undefined : onSkip())}
        backLabel="Fermer sans noter"
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
              placeholder="Ta réponse… (facultatif)"
            />
          </Appear>
        ))}
        <Appear index={prompts.length + 1}>
          <Field
            label="Un petit mot ? (facultatif)"
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Ex. : plus calme, moins de stress…"
            hint="Tes réponses restent privées : tu les relis dans ton journal."
          />
        </Appear>
      </View>
      {error ? <InlineNotice tone="error" message={errorMessage(error)} /> : null}
      <Text variant="caption" tone="ink3" style={{ marginTop: 4 }}>
        Ton ressenti nourrit ton suivi et les séances qu&apos;on te propose.
      </Text>
    </Screen>
  );
}
