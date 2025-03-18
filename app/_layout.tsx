import { Stack } from 'expo-router';
import OrderProvider from '~/components/OrderProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthProvider from '~/Provider/AuthProvider';
import CustomerProvider from '~/Provider/CustomerProvider';
import { StatusBar } from 'expo-status-bar';
export default function Layout() {
  return( 
    <GestureHandlerRootView>
      <AuthProvider>
        <CustomerProvider>
          <OrderProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </OrderProvider>
        </CustomerProvider>
      </AuthProvider>
    </GestureHandlerRootView>
 );
}
