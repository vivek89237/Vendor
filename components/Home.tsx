import { useState, useEffect, useCallback } from 'react' 
import { useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native'
import { List, Divider, Avatar } from 'react-native-paper';
import { useCustomer } from '~/Provider/CustomerProvider';
import { Button } from './Button';
import { updateCustomer } from '~/utils/Supabse';
import { fetchInventory, getOrders } from '~/utils/Firebase'
import { STATUS, updateVendorStatus } from "~/utils/Firebase";
import{ Feather, FontAwesome, MaterialIcons, Entypo, FontAwesome5, AntDesign } from '@expo/vector-icons';

enum TabType{
  INVENTORY='inventory',
  CHARTS='charts',
  ORDERS ='orders',
}

const myMap = new Map<string, string>();
myMap.set(STATUS.ACCEPTED, 'smile-circle');
myMap.set(STATUS.PENDING, 'minuscircle');
myMap.set(STATUS.DELIVERED, 'smileo');
myMap.set(STATUS.CANCELLED, 'meho');
myMap.set(STATUS.REJECTED, 'frown');

const Home = () => {
    const { image, status, id, contact, name } = useCustomer();
    const [ orders, setOrders ] = useState(null)
    const [inventory, setInventory] = useState([]);
    const [tab, setTab] = useState('inventory');

    useFocusEffect(
      useCallback(() => {
        fetchInventory(contact, setInventory)
      }, [inventory, contact])
    )
    useFocusEffect(
      useCallback(() => {
        getOrders(contact, setOrders, [STATUS.ACCEPTED, STATUS.CANCELLED, STATUS.DELIVERED, STATUS.PENDING, STATUS.REJECTED])
      }, [orders, contact])
    )

    const getCount = (type:string) =>{
     const filteredOrders = orders.filter(item => {
        return item?.status === type
      })
      return filteredOrders.length;
    }

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
        <View style={styles.headerSection}>
            <Avatar.Image size={60} source={{ uri: image }} />
            <View style={styles.profileInfo}>
            <Text style={styles.profileName}>GoCart</Text>
          </View>
            <View>
            {status ? 
                <Button  title={"ONLINE"}  style={{ backgroundColor: "#42E100", width:100 }}
                    onLongPress={async ()=>(  
                      await Promise.all([
                        updateCustomer(id, false),
                        updateVendorStatus(false),
                      ]),
                      
                        ToastAndroid.show('The Staus has been updated to OFFLINE', ToastAndroid.LONG)
                    )}
                />
                  :
                <Button  title={"OFFLINE"}  style={{ backgroundColor: "#F44336", width:100 }}
                    onLongPress={async()=>(
                      await Promise.all([
                        updateCustomer(id, true),
                        updateVendorStatus(true),
                      ]),
                        ToastAndroid.show('The Staus has been updated to ONLINE', ToastAndroid.LONG)
                    )}
                />
                }
            </View>
        </View>

        <View style={styles.tab} >
          <View>
            <TouchableOpacity style={styles.button} onPress={() => setTab(TabType.INVENTORY)}>
              <MaterialIcons name="inventory" size={30} color={tab === TabType.INVENTORY ? "#51829B" : "#89A8B2"} /> 
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.button} onPress={() => setTab(TabType.ORDERS)}>
              <MaterialIcons name="fastfood" size={30} color={tab === TabType.ORDERS ? "#51829B" : "#89A8B2"} /> 
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.button} onPress={() => setTab(TabType.CHARTS)}>
              <AntDesign name="areachart" size={30} color={tab === TabType.CHARTS ? "#51829B" : "#89A8B2"} /> 
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.mainContainer} >
              {tab === TabType.INVENTORY && <View style={styles.inventory} >
                <ScrollView style={styles.scrollView}  showsVerticalScrollIndicator={false} >
                    <View style={styles.list}>
                            <List.Section>
                              {inventory?.map((item)=>(
                                <View key={item?.id} >
                                <List.Item 
                                title={item?.name}
                                description={item?.unit}
                                left={() => (
                                  <Avatar.Image size={50} source={{ uri: item?.image ?? '' }} />
                                )}
                                right={()=><Text>₹{item?.price}/- </Text>}
                              />
                              <Divider />
                                </View>
                              ))}
                            </List.Section>
                          </View>
                  </ScrollView>
              </View>}
             {tab === TabType.ORDERS && orders && <View style={styles.orders} >
                <ScrollView style={styles.scrollView}  showsVerticalScrollIndicator={false}>
                    <View style={styles.list}>
                            <List.Section>
                              {Object.values(STATUS).map((item, index)=>(
                                <View key={index} >
                                    <List.Item 
                                    title={item}
                                    // description={"des"}
                                   // style={{backgroundColor:getStatusColor(item)}}
                                    left={() => (
                                      <AntDesign name={myMap.get(item)} color={getStatusColor(item)} size={24} />
                                    )}
                                    right={()=><Text  style={{color:getStatusColor(item)}} >{getCount(item)}</Text>}
                                  />
                                  <Divider />
                              </View>
                              ))}
                            </List.Section>
                    </View>
                </ScrollView>
              </View>}
        </View>
    </View> 
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
      },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        height: '12%',
        backgroundColor: '#9ACBD0',
      },
      profileInfo: {
        marginLeft: 15,
      },
      profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
      },
      tab:{
        flexDirection: 'row',
        justifyContent:'space-around',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
      mainContainer:{
        flex: 1,
        paddingBottom: 10,
      },
      button:{
        backgroundColor: '#BDDDE4',
        borderRadius: 20,
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      scrollView:{
        
      },
      mainContainerScrollBar:{

      },
      list: {
        marginLeft: 15,
      },
      inventory:{

      },
      inventoryTitle:{

      },
      ordersTitle:{

      },
      orders:{

      },
     
})