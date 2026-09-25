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
import { t } from '../../src/lib/i18n';
import { useTheme } from '../../src/theme/ThemeProvider';

const schema = z.object({
  email: z.string().email(t('That email address does not look right')),
  password: z.string().min(6, t('6 characters minimum')),
});

type FormValues = z.infer<typeof schema>;

// Supabase phrases its errors for developers. We rewrite the ones actually encountered and let
// the original through for the rest: the real message stays more useful than a
// “something went wrong” that hides the cause.
function authErrorMessage(error: { message: string }): string {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return t('That email or password is not right.');
  if (message.includes('email not confirmed')) {
    return t('This account is not confirmed yet. Open the link we emailed you, then come back and sign in.');
  }
  if (message.includes('user already registered')) return t('An account already exists for this address. Sign in instead.');
  if (message.includes('email rate limit exceeded')) {
    return t('Too many attempts on this address. Try again in a few minutes.');
  }
  return error.message;
}

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
      setServerError(authErrorMessage(error));
      return;
    }
    haptic.success();
    if (data.session) {
      // app/index.tsx then decides between onboarding and the plan.
      router.replace('/');
      return;
    }
    // No session on sign-up: this project requires email confirmation. Naming the address is
    // worth it, because a typo is the most common explanation for a message that “never arrived”.
    setInfo(t('Account created. Open the confirmation link sent to {email}, then sign in.', { email: values.email }));
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
          {mode === 'sign-in' ? t('Good to see you again') : t('Welcome to Regain')}
        </Text>
        <Text variant="body" tone="ink2" style={{ marginTop: 6, marginBottom: 28 }}>
          {mode === 'sign-in' ? t('Sign in to pick your week back up.') : t('Create your account to get started.')}
        </Text>
      </Appear>

      <Appear index={2}>
        <Shake trigger={serverError}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={t('Email address')}
                placeholder="you@example.com"
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
                label={t('Password')}
                placeholder={t('6 characters minimum')}
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
          <Button label={mode === 'sign-in' ? t('Sign in') : t('Sign up')} loading={submitting} onPress={handleSubmit(onSubmit)} />
          <Button
            label={mode === 'sign-in' ? t('No account yet? Sign up') : t('Already have an account? Sign in')}
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
