import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { colors } from '../constants/theme';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoaded = mode === 'sign-in' && !verifying ? signInLoaded : signUpLoaded;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setVerifying(false);
    setCode('');
    setError(null);
  }

  async function handleSubmit() {
    if (!isLoaded || !signIn || !signUp || submitting) return;

    if (verifying ? !code.trim() : !email.trim() || !password) {
      setError(verifying ? 'Enter the verification code from your email.' : 'Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (verifying) {
        const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });

        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId });
        } else {
          setError('Check the verification code and try again.');
        }
      } else if (mode === 'sign-up') {
        const result = await signUp.create({ emailAddress: email.trim(), password });

        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId });
        } else {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setVerifying(true);
          setCode('');
        }
      } else {
        const result = await signIn.create({ identifier: email.trim(), password });

        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId });
        } else {
          setError('Sign-in could not be completed. Check your details and try again.');
        }
      }
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  }

  const heading = verifying ? 'Check your email' : mode === 'sign-in' ? 'Welcome back' : 'Create your account';
  const buttonLabel = submitting
    ? 'Please wait…'
    : verifying
      ? 'Verify email'
      : mode === 'sign-in'
        ? 'Sign in'
        : 'Create account';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.brand}>TRAIL LOG</Text>
        <View style={styles.card}>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.subheading}>
            {verifying
              ? `Enter the code sent to ${email.trim()}.`
              : mode === 'sign-in'
                ? 'Sign in to open your hiking log.'
                : 'Use an email and password to start your hiking log.'}
          </Text>

          {verifying ? (
            <View style={styles.fields}>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                accessibilityLabel="Verification code"
                autoComplete="one-time-code"
                autoFocus
                editable={!submitting}
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setCode}
                onSubmitEditing={() => void handleSubmit()}
                placeholder="123456"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={code}
              />
            </View>
          ) : (
            <View style={styles.fields}>
              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!submitting}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  textContentType="emailAddress"
                  value={email}
                />
              </View>
              <View>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  accessibilityLabel="Password"
                  autoCapitalize="none"
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  editable={!submitting}
                  onChangeText={setPassword}
                  onSubmitEditing={() => void handleSubmit()}
                  placeholder="Your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  style={styles.input}
                  textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
                  value={password}
                />
              </View>
            </View>
          )}

          {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}

          <Button
            disabled={!isLoaded || submitting}
            label={buttonLabel}
            onPress={() => void handleSubmit()}
            style={styles.submitButton}
          />

          {verifying ? (
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => {
                setVerifying(false);
                setCode('');
                setError(null);
              }}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>Use a different email</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => changeMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {mode === 'sign-in' ? 'New to Trail Log? ' : 'Already have an account? '}
                <Text style={styles.switchTextStrong}>{mode === 'sign-in' ? 'Create account' : 'Sign in'}</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function errorMessage(error: unknown) {
  if (isClerkAPIResponseError(error) && error.errors.length > 0) {
    return error.errors[0].longMessage ?? error.errors[0].message;
  }

  return 'This could not be completed. Check your details and try again.';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheading: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  fields: {
    gap: 18,
    marginTop: 26,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  switchButton: {
    alignSelf: 'center',
    marginTop: 18,
    padding: 6,
  },
  switchText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  switchTextStrong: {
    color: colors.primary,
    fontWeight: '700',
  },
});
