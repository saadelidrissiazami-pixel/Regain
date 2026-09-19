import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { z } from 'zod';

import { InlineNotice } from '../../src/components/feedback';
import { Appear, Button, Field, haptic, Screen, Shake, Text } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, '6 caractères minimum'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const theme = useTheme();
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
    const { data, error } = mode === 'sign-in' ? await supabase.auth.signInWithPassword(values) : await supabase.auth.signUp(values);
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
    setInfo('Compte créé. Si la confirmation par e-mail est active, vérifie ta boîte mail puis connecte-toi.');
  };

  return (
    <Screen keyboard contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <Animated.View entering={ZoomIn.duration(260)}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <Ionicons name="leaf" size={28} color={theme.onPrimary} />
        </View>
      </Animated.View>
      <Appear index={1} key={mode}>
        <Text variant="title" accessibilityRole="header">
          {mode === 'sign-in' ? 'Content de te revoir' : 'Bienvenue sur Regain'}
        </Text>
        <Text variant="body" tone="ink2" style={{ marginTop: 6, marginBottom: 28 }}>
          {mode === 'sign-in' ? 'Connecte-toi pour retrouver ta semaine.' : 'Crée ton compte pour commencer.'}
        </Text>
      </Appear>

      <Appear index={2}>
        <Shake trigger={serverError}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Adresse e-mail"
                placeholder="toi@exemple.fr"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Mot de passe"
                placeholder="6 caractères minimum"
                secureTextEntry
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.password?.message}
              />
            )}
          />
        </Shake>
      </Appear>

      {serverError ? <InlineNotice tone="error" message={serverError} /> : null}
      {info ? <InlineNotice tone="success" message={info} /> : null}

      <Appear index={3}>
        <View style={{ marginTop: 16 }}>
          <Button label={mode === 'sign-in' ? 'Se connecter' : "S'inscrire"} loading={submitting} onPress={handleSubmit(onSubmit)} />
          <Button
            label={mode === 'sign-in' ? 'Pas encore de compte ? Inscris-toi' : 'Déjà un compte ? Connecte-toi'}
            variant="ghost"
            onPress={() => {
              haptic.selection();
              setServerError(null);
              setInfo(null);
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      </Appear>
    </Screen>
  );
}
