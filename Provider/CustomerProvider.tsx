import {PropsWithChildren, createContext, useContext, useState, useEffect} from 'react';
// import { getCustomer } from '~/utils/Firebase';
// import {fetchCustomer} from "~/utils/Supabase";
import { useAuth } from './AuthProvider';

const CustomerContext = createContext({});


export default function CustomerProvider ({children} : PropsWithChildren) {
    const [customer, setCustomer] = useState({});
    const {userId} = useAuth();
    // useEffect(()=>{
    //   fetchCustomer(userId, setCustomer);
    // }, [customer])
    //console.log("customer", customer.Name );
    return (
    <CustomerContext.Provider value ={{
      customerId: customer?.id,
      customerName: customer?.Name, 
      customerContact: customer?.ContactNo, 
      customerAddress : customer?.Address,  
      customerImage: customer?.image,
      customerCoordinates : customer?.coordinates,
      }}>
        {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext);