import { Redirect, Slot } from 'expo-router';

import { useAuth } from '~/Provider/AuthProvider';

export default function HomeLayout() {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="./auth" />;
  }

  return <Slot />;
}