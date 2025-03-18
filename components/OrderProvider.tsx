import {PropsWithChildren, createContext, useContext, useState, useEffect} from 'react'
import * as Location from 'expo-location'
import { getDirections } from './directions'

const OrderContext = createContext({});

export default function OrderProvider({children} : PropsWithChildren) {
    const [direction, setDirection] = useState({});
    const [selectedOrder, setSelectedOrder] = useState({});

    useEffect(()=>{
        const fetchDircections = async ()=>{
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              console.log('Permission to access location was denied');
              return;
            }
    
            let myLocation = await Location.getCurrentPositionAsync({});
    
            const newDirection = await getDirections(
              [myLocation.coords.longitude, myLocation.coords.latitude],
              [selectedOrder?.customerCoordinates[0], selectedOrder?.customerCoordinates[1]]
            );
            setDirection(newDirection);
          };
    
        if(selectedOrder){
            fetchDircections();
        }
    }, [selectedOrder])

        return(
            <OrderContext.Provider value={{
                selectedOrder,
                direction, 
                setSelectedOrder,
                directionCoordinate: direction?.routes?.[0]?.geometry?.coordinates,
                routeTime: direction?.routes?.[0]?.duration,
                routeDistance: direction?.routes?.[0]?.distance,
                }}>
                {children}
            </OrderContext.Provider>
        )
}

export const useOrder = () => useContext(OrderContext);