import { useEffect, useRef , useState} from 'react';
import { Text, Image, View, ToastAndroid } from 'react-native';
import { Button } from './Button';
import { FontAwesome6 } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useOrder } from './OrderProvider';
import Toast from "react-native-toast-message";
// import {cancelOrder} from './firebase'
export default function BottomSheetComponent() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [message, setMessage] = useState("Hold the button for 5 seconds");

    const { selectedOrder, routeTime, routeDistance } = useOrder();
    useEffect(() => {
        if (selectedOrder) {
            bottomSheetRef.current?.expand();
        }
    },[selectedOrder])

    const timerRef = useRef(null);

    const handlePressIn = (msg) => {
      timerRef.current = setTimeout(() => {
        ToastAndroid.showWithGravityAndOffset(
            msg,
            ToastAndroid.LONG,
            ToastAndroid.CENTER,
            25,
            50,
          );
      }, 3000);
    };
  
    const handlePressOut = () => {
      clearTimeout(timerRef.current);
    };

    return (
        <>
             <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={[200]}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: "#414442" }}
            >
                <BottomSheetView style={{ flex: 1, padding: 15 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        {/* <Image src={} style={{ width: 60, height: 60 }} /> */}
                        <View style={{ flex: 1, gap: 5 }}>
                            <Text style={{ color: "white", fontSize: 20, fontWeight: '600' }} >{selectedOrder?.name}</Text>
                            <Text style={{ color: "gray", fontSize: 15 }} >{selectedOrder?.id}</Text>
                        </View>
                        <View style={{ gap: 8 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: 'flex-start' }}>
                                <FontAwesome6 name="bolt-lightning" size={24} color="#42E100" />
                                <Text style={{ color: "white", fontSize: 18, fontWeight: 'bold' }}>{(routeDistance / 1000).toFixed(1)} Kms</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: 'flex-start' }}>
                                <FontAwesome6 name="clock" size={24} color="#42E100" />
                                <Text style={{ color: "white", fontSize: 18, fontWeight: 'bold' }}>{Math.ceil(routeTime / 60)} mins</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 20, gap:10 }}>
                        
                        <Button 
                        title='Delivered' 
                        onPressIn={()=>handlePressIn("The order has been delivered!")}
                        onPressOut={handlePressOut}
                        style={{ backgroundColor: "#42E100" }} 
                        /> 
                        
                         <Button 
                         title='Cancel'
                         onPressIn={()=>handlePressIn("The order has been canceled!")}
                         onPressOut={handlePressOut}
                         style={{ backgroundColor: "red" }} 
                         />
                        
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </>

    );
}