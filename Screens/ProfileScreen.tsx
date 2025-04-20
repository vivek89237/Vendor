import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { View, Text, StyleSheet, ScrollView, Switch, Image, TextInput, Modal, TouchableOpacity, ToastAndroid } from 'react-native';
import { List, Divider, Avatar } from 'react-native-paper';
import { supabase } from '~/utils/supabaseConfig';
import { useCustomer } from '~/Provider/CustomerProvider';
import { updateVendor } from '~/utils/Firebase';
import { useAuth } from '~/Provider/AuthProvider';
import { updateVendorStatus, fetchCustomer } from '~/utils/Firebase';
import{ Feather, FontAwesome, MaterialIcons, Entypo, FontAwesome5, AntDesign } from '@expo/vector-icons';


enum TabType{
  HANDCART='HANDCART',
  VEHICLE='VEHICLE',
}

export default function ProfileScreen() {
  const { userId: id } = useAuth()
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState('');
  const [modal2Visible, setModal2Visible] = useState(false)
  const [vendor, setVendor ] = useState({})

  const [newValue, setNewValue] = useState('');

  useEffect(()=>{
    fetchCustomer(id, setVendor)
  }, [])

  const handleUpdate = async () => {
    setModalVisible(false);
    setModal2Visible(false);
    try {
      if(fieldToUpdate === 'name'){
        await updateVendor(id, { name: newValue })
      }
     
      if(fieldToUpdate === 'contact'){
        await updateVendor(id, {ContactNo: Number(newValue)})
      }

      if(fieldToUpdate === 'type'){
        await updateVendor(id, {type: newValue})
      }
      
      setFieldToUpdate('');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Avatar.Image size={72} source={{ uri: vendor?.image }} />
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{vendor?.name}</Text>
        </View>
            <View>
              {vendor?.status ? 
                  <Button  title={"ONLINE"}  style={{ backgroundColor: "#42E100", width:100 }}
                      onLongPress={async ()=>(  
                          //updateCustomer(id, false),
                          await updateVendorStatus(id, false),
                          ToastAndroid.show('The Staus has been updated to OFFLINE', ToastAndroid.SHORT)
                      )}
                  />
                    :
                  <Button  title={"OFFLINE"}  style={{ backgroundColor: "#F44336", width:100 }}
                      onLongPress={async()=>(

                        // updateCustomer(id, true),
                        await updateVendorStatus(id, true),
                          ToastAndroid.show('The Staus has been updated to ONLINE', ToastAndroid.SHORT)
                      )}
                  />
                  }
            </View>
      </View>

      <Divider />

      <View style={styles.list}>
        <List.Section>
          <List.Item
            title={vendor?.name}
            description="Update name"
            left={() => <List.Icon icon="account" />}
            onPress={() => {
              setNewValue(vendor?.name)
              setFieldToUpdate('name');
              setModalVisible(true);
            }}
          />
          <Divider />
          <List.Item
            title={vendor?.ContactNo}
            description="Update number"
            left={() => <List.Icon icon="phone" />}
            onPress={() => {
              setNewValue(vendor?.ContactNo + '');
              setFieldToUpdate('contact');
              setModalVisible(true);
            }}
          />
          <Divider />
          <List.Item
            title={vendor?.type}
            description="Update vehicle type"
            left={() => <List.Icon icon="phone" />}
            onPress={() => {
              setNewValue(vendor?.type + '');
              setFieldToUpdate('type');
              setModal2Visible(true);
            }}
          />
          <Divider />
          <List.Item
            title="Logout"
            left={() => <List.Icon icon="logout" />}
            onPress={() => supabase.auth.signOut()}
          />
          <Divider />
        </List.Section>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update {fieldToUpdate}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`Enter new ${fieldToUpdate}`}
              value={newValue}
              onChangeText={setNewValue}
              placeholderTextColor="#aaa"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => setModal2Visible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update {fieldToUpdate}</Text>
              <View style={styles.tab} >
                        <View>
                          <TouchableOpacity style={styles.button} onPress={() => setNewValue(TabType.HANDCART)}>
                            <FontAwesome5 name="walking" size={30} color={newValue === TabType.HANDCART ? "#51829B" : "#89A8B2"} /> 
                          </TouchableOpacity>
                        </View>
                        <View>
                          <TouchableOpacity style={styles.button} onPress={() => setNewValue(TabType.VEHICLE)}>
                            <FontAwesome5 name="car-side" size={30} color={newValue === TabType.VEHICLE ? "#51829B" : "#89A8B2"} /> 
                          </TouchableOpacity>
                        </View>
              </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModal2Visible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1F1F1F',
    justifyContent:"space-between"
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  list: {
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  tab:{
    flexDirection: 'row',
    justifyContent:'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap:20,
  },
  button:{
    backgroundColor: '#BDDDE4',
    borderRadius: 20,
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headContainer:{
    flexDirection: 'row',
    justifyContent:'space-between',
    marginBottom: 20,
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 10,
    width: "80%",
  },
});
