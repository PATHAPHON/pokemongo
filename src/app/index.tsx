import { Redirect } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';

export default function Index() {
  const { isAuthenticated, isLoading } = useTrainer();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
