import {PropsWithChildren, createContext, useContext, useState, useEffect, useCallback} from 'react';
//import {fetchCustomer} from "~/utils/Supabse";
import { useAuth } from './AuthProvider';
import { fetchCustomer } from '~/utils/Firebase';

const CustomerContext = createContext({});
interface Vendor{
  id: string
  name: string
  contactNo: number
  image: string
  status: boolean  
 
}
export default function CustomerProvider ({children} : PropsWithChildren) {
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const {userId} = useAuth();
    
    useEffect(()=>{
      if(userId){
        fetchCustomer(userId, setVendor);
      }
    }, [userId,vendor])
    return (
    <CustomerContext.Provider value ={{
      id: vendor?.id,
      name: vendor?.name, 
      contact: vendor?.ContactNo,  
      image: vendor?.image,
      status : vendor?.status
      }}>
        {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext);