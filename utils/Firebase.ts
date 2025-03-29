import {firestore} from "./firebaseConfig";
import { 
    addDoc, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc,
    query, 
    where, 
    deleteDoc 
} from 'firebase/firestore';

export const STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
  }


const Ref = {
    ORDERS : "orders",
    VENDORS: "vendors",
}
let ordersRef = collection(firestore, Ref.ORDERS);

interface CartItem {
    id: number;
    name: string;
    price: string;
    quantity: number;
  }
  
interface Order {
    id: string;
    VendorName: string;
    cart: CartItem[];
    date: string;
    location: string;
    status: string;
    total: number;
    vendorContactNo: number;
  }
  
export const getOrders = async (vendorContactNo: number, setOrders, status:string[]) =>{
    try{
        let ordersQuery = query(ordersRef,  where('status','in', status), where('vendorContactNo','==',vendorContactNo));
        onSnapshot(ordersQuery, (response) =>{   
            let orders = response.docs.map((docs)=>{
                return {...docs.data(), id: docs.id};
            });
            setOrders(orders);
        })
    }catch(e){
        return e;
    }
}

export const updateStatus = async (id: string,  status: string) => {
    try {
      const orderRef = doc(firestore, "orders", id); // Use the document ID
      await updateDoc(orderRef, { status: status });
    } catch (e) {
      return e;
    }
}

export const updateLocation = async (latitude:number, longitude:number) => {
    try { 
        const userDocRef = doc(firestore, "vendors", "6MAkW7hqob18YFbmKkRb");
        await updateDoc(userDocRef, { latitude, longitude});
    } catch (e) {
        return e;
    }
}

