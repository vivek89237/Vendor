import { Redirect } from 'expo-router';
import{ Feather, FontAwesome, MaterialIcons, Entypo, FontAwesome5} from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuth } from '~/Provider/AuthProvider';

export default function HomeLayout() {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs 
      screenOptions={{ tabBarActiveTintColor: 'green' }}
    >
       <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Map"
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="map-marker-alt" size={24} color={color} />,
        }}
      />
       <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color }) => <Entypo name="shopping-cart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Inventory"
        options={{
          title: 'Inventory',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialIcons name="inventory" size={24} color={color} />,
        }}
      /> 
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}