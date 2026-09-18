import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Appear, haptic, PressableScale, Shake } from '../../src/components/motion';
import { Text, TextInput } from '../../src/components/typography';
import { z } from 'zod';

import { router } from 'expo-router';

import { supabase } from '../../src/lib/supabase';

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, '6 caractères minimum'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setInfo(null);
    setSubmitting(true);
    const { data, error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword(values)
        : await supabase.auth.signUp(values);
    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }
    haptic.success();
    if (data.session) {
      // La redirection vers l'onboarding ou le planning est ensuite gérée par app/index.tsx.
      router.replace('/');
      return;
    }
    setInfo('Compte créé. Si la confirmation par e-mail est active, vérifiez votre boîte mail puis connectez-vous.');
  };

  return (
    <View className="flex-1 justify-center bg-paper px-7">
      <Animated.View entering={ZoomIn.springify().damping(11).stiffness(140)}>
        <View className="mb-8 h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <Text className="text-2xl">🌱</Text>
        </View>
      </Animated.View>
      <Appear index={1} key={mode}>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-1 text-[28px] text-ink">
          {mode === 'sign-in' ? 'Content de vous revoir' : 'Bienvenue sur Regain'}
        </Text>
        <Text className="mb-7 text-sm text-ink-soft">
          {mode === 'sign-in' ? 'Connectez-vous pour retrouver votre semaine.' : 'Créez votre compte pour commencer.'}
        </Text>
      </Appear>

      <Appear index={2}>
        <Shake trigger={serverError}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="mb-1 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink"
                placeholder="Adresse e-mail"

                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email ? <Text className="mb-2 text-xs text-red-700">{errors.email.message}</Text> : null}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="mb-1 mt-2 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink"
                placeholder="Mot de passe"

                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password ? <Text className="mb-2 text-xs text-red-700">{errors.password.message}</Text> : null}
        </Shake>
      </Appear>

      {serverError ? <Text className="mt-2 text-xs text-red-700">{serverError}</Text> : null}
      {info ? <Text className="mt-2 text-xs text-primary">{info}</Text> : null}

      <Appear index={3}>
        <PressableScale onPress={handleSubmit(onSubmit)} disabled={submitting} feedback="medium" className="mt-6 items-center rounded-full bg-ink px-5 py-4">
          {submitting ? (
            <ActivityIndicator className="text-paper" />
          ) : (
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
              {mode === 'sign-in' ? 'Se connecter' : "S'inscrire"}
            </Text>
          )}
        </PressableScale>
      </Appear>

      <Pressable
        onPress={() => {
          haptic.selection();
          setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
        }}
        className="mt-4 items-center"
      >
        <Text className="text-sm text-ink-soft">
          {mode === 'sign-in' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-primary">
            {mode === 'sign-in' ? 'Inscrivez-vous' : 'Connectez-vous'}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
