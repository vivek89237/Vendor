import {PropsWithChildren, createContext, useContext, useState, useEffect} from 'react'
import * as Location from 'expo-location'
import { getDirections } from '../utils/directions'
import { useCustomer } from '~/Provider/CustomerProvider';


export enum VehicleType{
  HANDCART='HANDCART',
  VEHICLE='VEHICLE'
}

export enum Way{
  WALKING='walking',
  DRIVING='driving'
}

export function vehicleType(type:any){
  switch (type){
    case VehicleType.HANDCART:
      return Way.WALKING
    case VehicleType.VEHICLE:
      return Way.DRIVING
    default :
      return Way.WALKING
  }
    
}
const OrderContext = createContext({});

export default function OrderProvider({children} : PropsWithChildren) {
    const [direction, setDirection] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { type } = useCustomer()

    useEffect(()=>{
        const fetchDircections = async ()=>{
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              alert("Permission to access location was denied");
              return;
            }
    
            let myLocation = await Location.getCurrentPositionAsync({});
        
            const newDirection = await getDirections(
              [myLocation.coords.longitude, myLocation.coords.latitude],
              [selectedOrder?.customerCoordinates[1], selectedOrder?.customerCoordinates[0]],
              vehicleType(type)
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
                setDirection,
                directionCoordinate: direction?.routes?.[0]?.geometry?.coordinates,
                routeTime: direction?.routes?.[0]?.duration,
                routeDistance: direction?.routes?.[0]?.distance,
                }}>
                {children}
            </OrderContext.Provider>
        )
}

export const useOrder = () => useContext(OrderContext);