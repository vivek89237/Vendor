import {PropsWithChildren, createContext, useContext, useState, useEffect, useCallback} from 'react';
import {fetchCustomer} from "~/utils/Supabse";
import { useAuth } from './AuthProvider';

const CustomerContext = createContext({});

export default function CustomerProvider ({children} : PropsWithChildren) {
    const [vendor, setVendor] = useState({});
    const {userId} = useAuth();
    
    useEffect(()=>{
      fetchCustomer(userId, setVendor);
    }, [userId])

    return (
    <CustomerContext.Provider value ={{
      id: vendor?.id,
      name: vendor?.name, 
      contact: vendor?.contact,  
      image: vendor?.image,
      }}>
        {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext);