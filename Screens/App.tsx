import MapScreen from "./MapScreen";
import { Tabs } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
export default function App(){
    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: "#4CAF50",
            tabBarStyle: { backgroundColor: "#fff", paddingBottom: 5 },
          }}
        >
            <Tabs.Screen 
                name="MapScreen"
                options={{
                    title: "MapScreen",
                    tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
             />
            {/* Add other screens here */}
        </Tabs>
    )
}