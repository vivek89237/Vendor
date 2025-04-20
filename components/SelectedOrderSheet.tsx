import { useEffect, useRef, useCallback } from 'react';
import { Text, View, Alert, Linking  } from 'react-native';
import { Button } from './Button';
import { FontAwesome6, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useOrder } from './OrderProvider';
import { updateStatus, STATUS, updateAcceptedOrders } from '~/utils/Firebase';
import { Avatar } from 'react-native-paper';
import { useAuth } from '~/Provider/AuthProvider';

const image = "https://zfcmfksnxyzfgrbhxsts.supabase.co/storage/v1/object/sign/userdummyimage/customerImage.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ1c2VyZHVtbXlpbWFnZS9jdXN0b21lckltYWdlLndlYnAiLCJpYXQiOjE3NDIzMTgxNjYsImV4cCI6MTc3Mzg1NDE2Nn0.KcsjwoUZTWOxcw8M1Kvx-sV4bYMCnoyVvBWgYPUYLzA"

export default function SelectedOrderSheet() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { selectedOrder, routeTime, routeDistance, setSelectedOrder, setDirection } = useOrder();
    const { id } = useAuth()
    useEffect(() => {
        if (selectedOrder) {
            bottomSheetRef.current?.expand();
        }
    },[selectedOrder])
    const handleSheetChange = useCallback((index) => {
        if (index === -1) {
          setSelectedOrder(null);
        }
      }, []);
   
    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={[200]}
                enablePanDownToClose
                onChange={handleSheetChange}
                backgroundStyle={{ backgroundColor: "#414442" }}
            >
                <BottomSheetView style={{ flex: 1, padding: 15 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Avatar.Image size={65} source={{ uri: image }} />
                        <View style={{ flex: 1, gap: 5 }}>
                            <View style={{ flex: 1, flexDirection:"row", gap:10}}>
                                <Ionicons name="call" size={24} color="#9ACBD0" />
                                <Text style={{ color: "white", fontSize: 20, fontWeight: '600' }} onLongPress={()=>{
                                    Alert.alert(
                                        "Call Confirmation", 
                                        `Do you want to call ${selectedOrder?.customerContact} ?`, 
                                        [
                                          { text: "Cancel", style: "cancel" },
                                          {
                                            text: "Call",
                                            onPress: () => Linking.openURL(`tel:${selectedOrder?.customerContact}`),
                                          },
                                        ]
                                      );
                                }} >{selectedOrder?.customerContact}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection:"row", gap:10}}>
                                <FontAwesome5 name="location-arrow" size={24} color="#9ACBD0" />
                                <Text style={{ color: "gray", fontSize: 15 }} onLongPress={()=>Alert.alert("Address",selectedOrder?.location)} >{`${selectedOrder?.location||""}`.slice(0, 15)+"..."}</Text>
                            </View>
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
                        onLongPress={() =>  {
                            Alert.alert(
                                "Delivery Confirmation", 
                                `Is the order delivered ?`, 
                                [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Yes",
                                    onPress: async() => {
                                        await updateStatus(selectedOrder.id, STATUS.DELIVERED)
                                        await updateAcceptedOrders(id)
                                        bottomSheetRef.current?.close()
                                        setDirection(null)
                                        setSelectedOrder(null)
                                    },
                                },
                                ]
                            );
                            }
                        }
                        style={{ backgroundColor: "#42E100" }} 
                        /> 
                        
                         <Button 
                         title='Cancel'
                        //  onLongPress={() => handleLongPress("The order has been canceled!", STATUS.CANCELLED)}
                         onLongPress={() =>  {
                            Alert.alert(
                                "Cacellation Confirmation", 
                                `Do you want to cancel the order ?`, 
                                [
                                { text: "No", style: "cancel" },
                                {
                                    text: "Yes",
                                    onPress: async() =>{
                                         await updateStatus(selectedOrder.id, STATUS.CANCELLED)
                                         bottomSheetRef.current?.close()
                                         setDirection(null)
                                         setSelectedOrder(null)
                                    },
                                },
                                ]
                            );
                            }
                        }
                         style={{ backgroundColor: "red" }} 
                         />
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </>
    );
}
