import { Redirect, Slot } from 'expo-router';
import { useAuth } from '~/Provider/AuthProvider';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
