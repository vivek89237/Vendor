import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { getOrders, STATUS, updateStatus } from "~/utils/Firebase";
import { useCustomer } from "~/Provider/CustomerProvider";
import OrderStatusDropdown from '~/components/OrderStatusDropdown '
import {Button} from '~/components/Button'

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit?: string
}

interface Order {
  id: string;
  VendorName: string;
  cart: CartItem[];
  date: string;
  location: string;
  status: string;
  total: number;
  customerContact: number;
}

const OrderScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(STATUS.PENDING);
  const { contact, id } = useCustomer();

  useEffect(() => {
    const fetchOrders = async () => {
      await getOrders(id, setOrders, [
        STATUS.ACCEPTED,
        STATUS.CANCELLED,
        STATUS.DELIVERED,
        STATUS.PENDING,
        STATUS.REJECTED,
        
      ]);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
  }, [selectedStatus, orders]);

  const trackOrder = (id: string) => {
    Alert.alert("Track Order", `Tracking information for Order ID: ${id}`);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={[styles.orderContainer, {borderLeftColor: `${getStatusColor(item.status)}`}]}>
      <Text style={styles.vendorName}>{item.customerContact}</Text>
      <Text style={styles.text}><Text style={styles.boldText}>Location:</Text> {item.location}</Text>
      <Text style={styles.text}><Text style={styles.boldText}>Date:</Text> {item.date}</Text>
      <Text style={styles.totalPrice}>₹{item.total}</Text>
      <View>
      <ScrollView style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Order Items:</Text>
          {item?.cart?.map((orderItem, index) => (
            <Text key={index} style={styles.itemText}>
              {orderItem.quantity} Kg {orderItem.name}
            </Text>
          ))}
        </ScrollView>
      </View>
      {item.status === STATUS.PENDING && (
        <View style={styles.buttonContainer}>
          <Button title="Accept" onPress={() => updateStatus(item.id, STATUS.ACCEPTED)} style={{backgroundColor:"#1F7D53"}} />
          <Button title="Reject" onPress={() => updateStatus(item.id, STATUS.REJECTED)} style={{backgroundColor:"#BF3131"}} />
        </View>
      )}

      {item.status === STATUS.ACCEPTED && (
        <View style={styles.trackContainer}>
          <Button title="Track Order" onPress={() => trackOrder(item.id)} style={{backgroundColor:"#98D2C0"}} />
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      [STATUS.ACCEPTED]: "#4CAF50",  // Green
      [STATUS.PENDING]: "#006A71",   // Orange
      [STATUS.CANCELLED]: "#F44336",  // Red
      [STATUS.DELIVERED]: "#2196F3", // Blue
      [STATUS.REJECTED]: "#9E9E9E", // Gray
    };
    return colors[status] || "#000";
  };
  
  return (
    <View style={styles.container}>
     <OrderStatusDropdown 
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
     />


      {filteredOrders.length === 0 ? (
       <>
         <Text style={{textAlign: "center", marginBottom: 5}}>No orders found.</Text>
         <Text style={{textAlign: "center", marginBottom: 20}}>Dropdown to view Accepted orders.</Text>
       </>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  activeFilter: {
    borderWidth: 2,
    borderColor: "#000",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  itemsContainer: {
    maxHeight: 150,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  orderContainer: {
    backgroundColor: "#F7F7F7",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderLeftWidth: 5,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  accepted: { backgroundColor: "#28a745", color: "white" },
  pending: { backgroundColor: "#ffc107", color: "black" },
  rejected: { backgroundColor: "#dc3545", color: "white" },
  delivered: { backgroundColor: "#17a2b8", color: "white" },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "column",
    gap:10,
    justifyContent: "space-between",
    marginTop: 10,
  },
  trackContainer: {
    marginTop: 10,
  },
  spacing: {
    width: 10,
  },
  noOrdersText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
    marginTop: 50,
  },
});

export default OrderScreen;