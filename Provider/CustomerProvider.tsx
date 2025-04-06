import {PropsWithChildren, createContext, useContext, useState, useEffect, useCallback} from 'react';
import {fetchCustomer} from "~/utils/Supabse";
import { useAuth } from './AuthProvider';

const CustomerContext = createContext({});
interface Vendor{
  id: string
  name: string
  contact: number
  image: string
  status: boolean  
 
}
export default function CustomerProvider ({children} : PropsWithChildren) {
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const {userId} = useAuth();
    
    useEffect(()=>{
      fetchCustomer(userId, setVendor);
    }, [userId,vendor])
    return (
    <CustomerContext.Provider value ={{
      id: vendor?.id,
      name: vendor?.name, 
      contact: vendor?.contact,  
      image: vendor?.image,
      status : vendor?.status
      }}>
        {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext);