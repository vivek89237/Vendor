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
    // PREORDER: "Preorder",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
  }


const Ref = {
    ORDERS : "orders",
    VENDORS: "vendors",
}
let ordersRef = collection(firestore, Ref.ORDERS);
let vendorsRef = collection(firestore, Ref.VENDORS);

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
  
export const getOrders = async (id: string, setOrders, status:string[]) =>{
    try{
        let ordersQuery = query(ordersRef,  where('status','in', status), where('id','==',id));
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

export const updateLocation = async (latitude:number, longitude:number, id:string) => {
    try { 
        const userDocRef = doc(firestore, "vendors", id);
        await updateDoc(userDocRef, { latitude, longitude});
    } catch (e) {
        return e;
    }
}

export const fetchInventory = async (id:string, setInventory) =>{
    try{
        let inventoryQuery = query(vendorsRef, where('id','==',id));
       return onSnapshot(inventoryQuery, (response) =>{   
            let items = response.docs.map((docs)=>{
                return docs.data().vegetables
            })
            setInventory(items[0]);
        })
    }catch(e){
        return e;
    }
}

export const updateVendorStatus = async (id: string, status:boolean) =>{
    try {
        const userDocRef = doc(firestore, Ref.VENDORS, id);
        await updateDoc(userDocRef, { status });
    } catch (e) {
        return e;
    }
}

export const fetchCustomer = async (id:string, setVendors)=>{
    try{
        const userDocRef = query(vendorsRef, where('id','==',id));
        onSnapshot(userDocRef, (response) =>{   
            let orders = response?.docs?.map((docs)=>{
                return docs.data();
            });
            setVendors(orders[0]);
        })
    }catch(e){
        return e;
    }
}