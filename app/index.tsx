import { useSession } from '@/context/SessionContext';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import colors from '@/constants/colors';

export default function RootIndex() {
  const { isAuthenticated, isLoading, user } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.ink }}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Route based on role
  if (user?.role === 'Seller') {
    return <Redirect href="/(seller-tabs)" />;
  }

  return <Redirect href="/(buyer-tabs)" />;
}
