import React, { useState, useEffect, useRef  } from "react";
import {
  View,
  Text,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { getOrders, STATUS, updateStatus, updateOrder, Order, getScheduledOrders, updateVendorStock } from "~/utils/Firebase";
import { useCustomer } from "~/Provider/CustomerProvider";
import OrderStatusDropdown from '~/components/OrderStatusDropdown '
import {Button} from '~/components/Button'
import { useRouter } from 'expo-router';
import { useOrder } from "~/components/OrderProvider";
import { FontAwesome6, Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import Table from "~/components/Table";

const OrderScreen: React.FC = () => {
  const router = useRouter();
  const {setSelectedOrder} = useOrder()
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(STATUS.PENDING);
  const [scheduled, setScheduled] = useState(false)
  const [scheduledOrders, setScheduledOrders] = useState<Order[]>([]);
  const { id, totalDelivery } = useCustomer()


  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScheduled(true);
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      await getOrders(id, setOrders, [
        STATUS.ACCEPTED,
        STATUS.CANCELLED,
        STATUS.DELIVERED,
        STATUS.PENDING,
        STATUS.REJECTED,
      ]);

      await getScheduledOrders(id, setScheduledOrders)
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders.filter((order) => order.status === selectedStatus && !order?.isScheduled ));
  }, [selectedStatus, orders]);
  

  const trackOrder = (id: string) => {
    Alert.alert("Track Order", `Tracking information for Order ID: ${id}`);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={[styles.orderContainer, {borderLeftColor: `${getStatusColor(item.status)}`}]}>
      <View style={{flexDirection: "row", justifyContent:"space-between"}}>
        <Text style={styles.vendorName}>{item.customerContact}</Text>
        <Text style={styles.text}>{item.date}</Text>
      </View>
      <View style={{flexDirection:"row", justifyContent:"flex-end"}} ><Text style={styles.text}>{item.location}</Text></View>
      
      <View>
      <ScrollView style={styles.itemsContainer}>
          {/* {item?.cart?.map((orderItem, index) => (
            <Text key={index} style={styles.itemText}>
              {orderItem?.quantity} {orderItem?.unit} {orderItem?.name}
            </Text>
          ))} */}
          <Table data={item?.cart} price={item.total} />
        </ScrollView>
      </View>
      {item.status === STATUS.PENDING && (
        <View style={styles.buttonContainer}>
          <Button title="Location" onPress={() => {
              setSelectedOrder(item)
              router.push({
                pathname:'/(home)/Map',
              }) 
            }
          } 

          style={{backgroundColor:"#7AE2CF"}} />
          <Button title="Accept" onPress={() =>{ 
          updateStatus(item.id, STATUS.ACCEPTED)
             updateVendorStock(id, item?.cart, 'add' )}} style={{backgroundColor:"#1F7D53"}} />
          <Button title="Reject" onPress={() => updateStatus(item.id, STATUS.REJECTED)} style={{backgroundColor:"#BF3131"}} />
        </View>
      )}

      {item.status === STATUS.ACCEPTED && (
        <View style={styles.buttonContainer}>
          <Button title="Track Order" onPress={() =>  {
              setSelectedOrder(item)
              router.push({
                pathname:'/(home)/Map',
              }) 
            }} style={{backgroundColor:"#7AE2CF"}} />
        </View>
      )}
    </View>
  );

  const renderOrderScheduled = ({ item }: { item: Order }) => (
    item?.isScheduled &&
    <View style={[styles.orderContainer, {borderLeftColor: '#FF0B55'}]}>
      <View style={{flexDirection: "row", justifyContent:"space-between"}}>
        <Text style={styles.vendorName}>{item.customerContact}</Text>
        <Text style={styles.text}>{item.date}</Text>
      </View>
      <View style={{flexDirection:"row", justifyContent:"flex-end"}} ><Text style={styles.text}>{item.location}</Text></View>
      
      <View>
      <ScrollView style={styles.itemsContainer}>
          {/* {item?.cart?.map((orderItem, index) => (
            <Text key={index} style={styles.itemText}>
              {orderItem?.quantity} {orderItem?.unit} {orderItem?.name}
            </Text>
          ))} */}
          <Table data={item?.cart} price={item.total} />
        </ScrollView>
      </View>
      {item.status === STATUS.PENDING && (
        <View style={styles.buttonContainer}>
          {!item?.isScheduledAccepted && <Button title="Location"  disabled={item?.isScheduledAccepted} onPress={() => {
              setSelectedOrder(item)
              router.push({
                pathname:'/(home)/Map',
              }) 
            }
          } 

          style={{backgroundColor:"#7AE2CF"}} />}
          {!item?.isScheduledAccepted && <Button title="Accept" disabled={item?.isScheduledAccepted} onPress={() => updateOrder(item.id, {isScheduledAccepted: true})} style={{backgroundColor:"#1F7D53"}} />}
          <Button title="Reject" onPress={() => updateOrder(item.id, {isScheduledAccepted: false, isScheduled: false, status: STATUS.REJECTED }) } style={{backgroundColor:"#BF3131"}} />
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
      <View style={styles.header} >
        <View style={{flex:6}} >
        <OrderStatusDropdown 
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setScheduled={setScheduled}
        />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <AntDesign
          name="clockcircle"
          size={45}
          color="#FF0B55"
          onPress={handlePress}
        />
      </Animated.View>
    </View>
        
      </View>
      {!scheduled ? 
        <>
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
        </> :
        <>
          {scheduledOrders.length === 0 ? (
            <>
              <Text style={{textAlign: "center", marginBottom: 5}}>No scheduled orders found.</Text>
              <Text style={{textAlign: "center", marginBottom: 20}}>Dropdown to view Pending orders.</Text>
            </>
            ) : (
              <FlatList
                data={scheduledOrders}
                renderItem={renderOrderScheduled}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
              />
            )}
        </>
        }
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
  header:{
    marginVertical: 10,
    flexDirection:'row',
    justifyContent:'space-evenly',
    gap:10
  },
  itemsContainer: {
    maxHeight: 200,
    marginTop:10,
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
    flexDirection: "row",
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