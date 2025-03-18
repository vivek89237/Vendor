import {firestore} from "../firebaseConfig.js";
import {ToastAndroid} from 'react-native';
import { 
    addDoc, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc,
    query, 
    where, 
    setDoc, 
    deleteDoc 
} from 'firebase/firestore';
import { getDatabase, ref, onValue } from "firebase/database";

let ordersRef = collection(firestore, "orders");

export const getOrders=(vendorContactNo, setOrders)=>{
    try{
        let ordersQuery = query(ordersRef,  where('status','==','Accepted'), where('customerContact','==',vendorContactNo));
        onSnapshot(ordersQuery, (response) =>{   
            let orders = response.docs.map((docs)=>docs.data());
            setOrders(orders)
        })
    }catch(e){
        return e;
    }
}

// export const cancelOrder = (customerContact, vendorContactNo)