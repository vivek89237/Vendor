import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, Image, View } from 'react-native';
import { Button } from './Button';
import { useEffect, useRef } from 'react';
import { useOrder } from './OrderProvider';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SelectedOrderSheet() {
    const navigation = useNavigation();
    const { selectedOrder, routeTime, routeDistance } = useOrder();

    const bottomSheetRef = useRef<BottomSheet>(null);
    console.log("bottomSheet")
    useEffect(() => {
        if (true) {
            bottomSheetRef.current?.expand();
        }
    }, [selectedOrder])

    console.log(selectedOrder)
    return (
        <View>
            { selectedOrder &&   <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={[200]}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: "#414442" }}
            >
                <BottomSheetView style={{ flex: 1, padding: 15 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Image src={"https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fcustomer%2F&psig=AOvVaw3NLuyXJRrip5mx_YfaSk_F&ust=1737358392013000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCJjj78CigYsDFQAAAAAdAAAAABAE"} style={{ width: 60, height: 60 }} />
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
                    <View style={{ flex: 1, padding: 20 }}>
                    
                        <Button 
                        title='Delivered' 
                        style={{ backgroundColor: "#42E100" }} 
                       // onPress={() => navigation.navigate('VegetableListVendor')}
                        /> 
                         <Button 
                         title='Cancel' 
                         style={{ backgroundColor: "#414442" }} 
                         />
                        
                    </View>
                </BottomSheetView>
            </BottomSheet>}
        </View>

    );
}
