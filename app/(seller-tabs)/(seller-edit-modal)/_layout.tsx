import { Stack } from 'expo-router';

export default function SellerEditModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        presentation: 'modal',
      }}
    />
  );
}
