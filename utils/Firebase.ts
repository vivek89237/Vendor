import { ToastAndroid } from "react-native";
import {firestore} from "./firebaseConfig";
import { 
    addDoc, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc,
    query, 
    where, 
    deleteDoc,
    getDocs,
    increment,
    getDoc
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
let vendorsRef = collection(firestore, Ref.VENDORS);

export interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit?: string
}

export interface Order {
  id: string;
  VendorName: string;
  cart: CartItem[];
  date: string;
  location: string;
  status: string;
  total: number;
  customerContact: number;
  isScheduled?: boolean
  isScheduledAccepted?: boolean
}

interface Vendor{
    id?: string,
    name?: string,
    ContactNo: number,
    image: string,
}
  
export const getOrders = async (id: string, setOrders:any, status:string[]) =>{
    
    try {
        let ordersQuery = query(
            ordersRef,
            where('status', 'in', status),
            where('id', '==', id),
            where('isScheduled','==', false)
        );

        onSnapshot(ordersQuery, async (response) => {
            const orders = await Promise.all(
                response.docs.map(async (doc) => {
                    const data = doc.data();
                    const orderDateStr = data?.date;
                    const [day, month, year] = orderDateStr.split('-');
                    const orderDate = new Date(`${year}-${month}-${day}`); 
                    const today = new Date();
                    if( orderDate.getDate() < today.getDate() && orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear() && [STATUS.ACCEPTED, STATUS.PENDING].includes(data?.status) ){
                        await updateDoc(doc.ref, { isScheduled: false, status: STATUS.CANCELLED, isScheduledAccepted: false })
                    }

                    return { ...data, id: doc.id };
                })
            );

            setOrders(orders);
        });
        } catch (e) {
            console.error(e);
        }

}

export const getScheduledOrders = async (id:string, setScheduledOrders:any) =>{
    try{
        let ordersQuery = query(ordersRef, where('id','==',id), where('isScheduled','==', true));
        onSnapshot(ordersQuery, async (response) => {
            const orders = await Promise.all(
                response.docs.map(async (doc) => {
                    const data = doc.data();
                    const orderDateStr = data?.date;
                    const [day, month, year] = orderDateStr.split('-');
                    const orderDate = new Date(`${year}-${month}-${day}`); 
                    const today = new Date();
                    if( orderDate.getDate() === today.getDate() && orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear() && data?.isScheduled ){
                        await updateDoc(doc.ref, { isScheduled: false, isScheduledAccepted: false })
                    }

                    return { ...data, id: doc.id };
                })
            );

            setScheduledOrders(orders);
        });
    }catch(e){
        return e;
    }
}

export const updateStatus = async (id: string,  status: string ) => {
    try {
      const orderRef = doc(firestore, Ref.ORDERS, id); // Use the document ID
        await updateDoc(orderRef, { status: status, isScheduled:false });
    } catch (e) {
      return e;
    }
}

export const updateOrder = async (id: string,  data:any ) => {
    try {
      const orderRef = doc(firestore, Ref.ORDERS, id); // Use the document ID
        await updateDoc(orderRef, data);
    } catch (e) {
      return e;
    }
}

export const updateLocation = async (latitude:number, longitude:number, id:string) => {
    try { 
        const userDocRef = doc(firestore, Ref.VENDORS, id);
        await updateDoc(userDocRef, { latitude, longitude});
    } catch (e) {
        return e;
    }
}

export const fetchInventory = async (id:string, setInventory:any) =>{
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

export const fetchCustomer = async (id:string, setVendors:any)=>{
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

export const updateVendor = async (id: string, data: any) =>{
    try {
        const vendorRef = doc(firestore, Ref.VENDORS, id); 
        await updateDoc( vendorRef, data );
      } catch (e) { 
        return e;
      }
}

export const updateAcceptedOrders = async (id:string) =>{
    const vendorRef = doc(firestore,  Ref.VENDORS, id);

    try {
      await updateDoc(vendorRef, {
        totalDelivery: 4
      });
      console.log(`totalDelivery updated by 1`);
    } catch (error) {
      console.error("Error updating field:", error);
    }
}


export const updateVendorStock = async (vendorId: string, cartItems: any, op:string) => {
  try {
    const vendorRef = doc(firestore, "vendors", vendorId);
    const vendorSnap = await getDoc(vendorRef);

    if (!vendorSnap.exists()) {
      console.error("Vendor not found");
      return;
    }
    
    const vendorData = vendorSnap.data();
    const vegetables = vendorData.vegetables || [];

    const updatedVegetables = vegetables.map((veg: any) => {
      const matchingCartItem = cartItems.find(item => item.id === veg.id);
      if (matchingCartItem) {
        if(op === 'add'){
            return {
                ...veg,
                quantity: Math.max(Number(veg?.quantity)  - Number( matchingCartItem?.quantity), 0) + "", // avoid negative quantity
              };
        }
        else if(op === 'sub'){
            return {
                ...veg,
                quantity: Math.max(Number(veg?.quantity) + Number( matchingCartItem?.quantity), 0) + "", // avoid negative quantity
              };
        }
      }
      return veg;
    });

    await updateDoc(vendorRef, {
      vegetables: updatedVegetables,
    });
    ToastAndroid.show("Vendor stock updated successfully.", ToastAndroid.SHORT)

  } catch (error) {
    console.error("Error updating vendor stock:", error);
  }
};
