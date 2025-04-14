import { useState } from 'react';
import { Button } from '~/components/Button';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, Modal, TouchableOpacity } from 'react-native';
import { List, Divider, Avatar } from 'react-native-paper';
import { supabase } from '~/utils/supabaseConfig';
import { useCustomer } from '~/Provider/CustomerProvider';
import { updateVendor } from '~/utils/Firebase';

export default function ProfileScreen() {

  const { image, id, name, contact, status } = useCustomer();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState('');
  const [newValue, setNewValue] = useState({
    contact: contact,
    image: image,
    name: name
  });

  const handleUpdate = async () => {
    setModalVisible(false);
    try {
      if(fieldToUpdate === 'name'){
        await updateVendor(id, { name })
      }
     
      if(fieldToUpdate === 'contact'){
        await updateVendor(id, {ContactNo: Number(contact)})
      }
      
      setFieldToUpdate('');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Avatar.Image size={72} source={{ uri: image }} />
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name}</Text>
          </View>
          <View>
            {status ? 
              <Button disabled={true} title={"ONLINE"}  style={{ backgroundColor: "#42E100" }} />
              :
              <Button disabled={true} title={"OFFLINE"}  style={{ backgroundColor: "#F44336" }} />
            }
          </View>
      </View>

      <Divider />

      <View style={styles.list}>
        <List.Section>
          <List.Item
            title={name}
            description="Update name"
            left={() => <List.Icon icon="account" />}
            onPress={() => {
              setNewValue(name)
              setFieldToUpdate('name');
              setModalVisible(true);
            }}
          />
          <Divider />
          <List.Item
            title={contact}
            description="Update number"
            left={() => <List.Icon icon="phone" />}
            onPress={() => {
              setNewValue(contact + '');
              setFieldToUpdate('contact');
              setModalVisible(true);
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
