import { Stack } from 'expo-router';
import OrderProvider from '~/components/OrderProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthProvider from '~/Provider/AuthProvider';
import CustomerProvider, { useCustomer } from '~/Provider/CustomerProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import * as Location from "expo-location";
import { updateLocation } from "~/utils/Firebase";

export default function Layout() {
  const { id } = useCustomer()
  useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          return;
        }
  
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
          (loc) => {
            const { latitude, longitude } = loc.coords;
            updateLocation(latitude, longitude, id)
          }
        );
      })();
    }, []);
  return( 
    <GestureHandlerRootView>
      <AuthProvider>
        {/* <CustomerProvider> */}
          <OrderProvider>
            <Stack>
              <Stack.Screen name='auth' options={{ title: 'GoCart'  }} />
              <Stack.Screen name='(home)' options={{headerShown: false}} />
            </Stack>
          </OrderProvider>
        {/* </CustomerProvider> */}
      </AuthProvider>
    </GestureHandlerRootView>
 );
}
