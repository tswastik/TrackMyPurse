import { Redirect } from 'expo-router';

import { useStore } from '@/lib/store';

export default function Index() {
  const { state } = useStore();
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  if (!state.signedIn) return <Redirect href="/auth" />;
  return <Redirect href="/lock" />;
}
