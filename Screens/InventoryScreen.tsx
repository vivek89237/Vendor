import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faHome,
  faShoppingBag,
  faHeart,
  faUser,
  faTrash,
  faTag,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '~/components/Button'
import { firestore } from "../utils/firebaseConfig";
import { collection, query, where, getDocs, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { useCustomer } from '~/Provider/CustomerProvider';
import { useAuth } from '~/Provider/AuthProvider';

interface InventoryItem {
  id: string;
  vegetable: string;
  price: string;
  unit: string;
  image: string;
}

const InventoryScreen: React.FC = () => {
  // const {contact, id} = useCustomer()
  const { userId: id } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [availableVegetables, setAvailableVegetables] = useState<InventoryItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVegetable, setSelectedVegetable] = useState<InventoryItem | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false); // Loader state
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      const vendorQuery = query(collection(firestore, "vendors"), where("id", "==", id));
      try {
        const querySnapshot = await getDocs(vendorQuery);
        if (!querySnapshot.empty) {
          const vendorData = querySnapshot.docs[0].data();
          const vendorVegetables = vendorData.vegetables || [];
          setInventory(vendorVegetables);
        } else {
          console.error("Vendor with specified ContactNo not found!");
        }
      } catch (error) {
        console.error("Error fetching inventory: ", error);
      }
    };
  
    loadInventory();
  }, []);

  useEffect(() => {
    const vegetableCollection = collection(firestore, 'vegetableItems');
    const unsubscribe = onSnapshot(vegetableCollection, (snapshot) => {
      const vegetables = snapshot.docs.map((doc) => ({
        id: doc.id,
        vegetable: doc.data().vegetable,
        price: '', 
        unit: doc.data().unit || 'kg',
        image: doc.data().image,
      }));
      setAvailableVegetables(vegetables);
    });

    return () => unsubscribe();
  }, []);

  const filteredVegetables = availableVegetables.filter((item) =>
    item.vegetable.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updatePrice = async (vegId: string, newPrice: string) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === vegId ? { ...item, price: newPrice } : item
      )
    );
  
    try {
      const vendorQuery = query(
        collection(firestore, "vendors"),
        where("id", "==", id)
      );
      const querySnapshot = await getDocs(vendorQuery);
  
      if (!querySnapshot.empty) {
        const vendorDocRef = querySnapshot.docs[0].ref;
  
        // Get the current vegetables array from Firestore
        const vendorData = querySnapshot.docs[0].data();
        const updatedVegetables = vendorData.vegetables.map((veg: any) =>
          veg.id === vegId ? { ...veg, price: newPrice } : veg
        );
  
        // Update the database with the new vegetables array
        await updateDoc(vendorDocRef, { vegetables: updatedVegetables });
        console.log("Price updated successfully in database");
      } else {
        console.error("Vendor document not found!");
      }
    } catch (error) {
      console.error("Error updating price: ", error);
    }
  };

  const confirmRemoveVegetable = (vegId: string) => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this vegetable from your inventory?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => removeVegetable(vegId)
        }
      ]
    );
  };
  
  const removeVegetable = async (vegId: string) => {
    setInventory((prevInventory) =>
      prevInventory.filter((item) => item.id !== vegId)
    );
  
    try {
      // Query the 'vendors' collection to find the vendor document
      const vendorQuery = query(
        collection(firestore, "vendors"),
        where("id", "==", id)
      );
      const querySnapshot = await getDocs(vendorQuery);
  
      if (!querySnapshot.empty) {
        const vendorDocRef = querySnapshot.docs[0].ref;
  
        // Get the current vegetables array from Firestore
        const vendorData = querySnapshot.docs[0].data();
        const updatedVegetables = vendorData.vegetables.filter(
          (veg: any) => veg.id !== vegId
        );
  
        // Update the database with the new vegetables array
        await updateDoc(vendorDocRef, { vegetables: updatedVegetables });
        console.log("Vegetable removed successfully from database");
      } else {
        console.error("Vendor document not found!");
      }
    } catch (error) {
      console.error("Error removing vegetable: ", error);
    }
  };

  const addVegetableToInventory = async () => {
    if (selectedVegetable) {
      setLoading(true); // Start loader
      const vendorQuery = query(collection(firestore, "vendors"), where("id", "==", id));
  
      try {
        const querySnapshot = await getDocs(vendorQuery);
  
        if (!querySnapshot.empty) {
          const vendorDocRef = querySnapshot.docs[0].ref;
          const vendorData = querySnapshot.docs[0].data();
          const existingVegetables = vendorData.vegetables || [];
  
          // Check if the vegetable already exists in the vendor's database
          const vegetableExistsInDB = existingVegetables.some(
            (veg: any) => veg.id === selectedVegetable.id
          );
  
          if (vegetableExistsInDB) {
            alert("This vegetable is already in your inventory!");
            setLoading(false); // Stop loader
            return;
          }
  
          // Proceed with adding the vegetable if it doesn't exist in the database
          const vegetableData = {
            id: selectedVegetable.id ?? "unknown-id", 
            name: selectedVegetable.vegetable ?? "unknown-name", 
            price: price ?? 0,
            quantity: quantity ?? 0,
            unit: unit ?? "unknown-unit", 
            image: selectedVegetable.image ?? "",
          };
  
          await updateDoc(vendorDocRef, {
            vegetables: arrayUnion(vegetableData),
          });
          
          console.log("vegetable added")
          // Update local inventory state
          const vegetableToAdd = { ...selectedVegetable, price, unit };
          setInventory([...inventory, vegetableToAdd]);
  
          // Close the modal and reset fields
          setIsModalVisible(false);
          setPrice("");
          setUnit("");
        } else {
          console.error("Vendor document not found!");
        }
      } catch (error) {
        console.error("Error updating vegetable: ", error);
      } finally {
        setLoading(false); // Stop loader
      }
    }
  };

  const handleUpdatePrice = (item) => {
    setSelectedItem(item);
    setPriceModalVisible(true);
  };

  const handleSavePrice = (id, newPrice) => {
    setProducts(products.map((item) =>
      item.id === id ? { ...item, price: newPrice } : item
    ));
  };

  const handleUpdateQuantity = (item) => {
    setSelectedItem(item);
    setQuantityModalVisible(true);
  };

  const handleSaveQuantity = (id, newQuantity) => {
    setProducts(products.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Confirm Removal',
      `Do you want to Remove this ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            setProducts(products.filter(product => product.id !== item.id));
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  const PriceUpdateModal = ({ visible, item, onClose, onUpdate }) => {
    // const [newPrice, setNewPrice] = useState(item ? item.price.replace('$', '') : '');
  
    const handleUpdate = () => {
      if (price && !isNaN(parseFloat(price))) {
        onUpdate(item.id, `$${price}`);
        onClose();
      } else {
        Alert.alert('Invalid Price', 'Please enter a valid price');
      }
    };
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Price for {item ? item.name : ''}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new price"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateButton} onPress={updatePrice(item?.id, price)}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Component for quantity update modal
  const QuantityUpdateModal = ({ visible, item, onClose, onUpdate }) => {
   
  
    const handleUpdate = () => {
      const newQuantity = parseFloat(quantity);
      if (newQuantity && !isNaN(newQuantity) && newQuantity > 0) {
        onUpdate(item.id, newQuantity);
        onClose();
      } else {
        Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      }
    };
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Quantity for {item ? item.name : ''}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new quantity"
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          accessibilityLabel={item?.alt}
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>
            {item?.name} <Text style={styles.productUnit}>{item?.unit}</Text>
          </Text>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.quantity}>Quantity: {item?.quantity}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.priceButton}
            onPress={() => handleUpdatePrice(item)} // update price handler
          >
            <FontAwesomeIcon icon={faTag} size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item)} // update quantity handler
          >
            <FontAwesomeIcon icon={faPlus} size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => confirmRemoveVegetable(item?.id)} // remove item handler
          >
            <FontAwesomeIcon icon={faTrash} size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderVegetableOption = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity onPress={() => { setSelectedVegetable(item); setUnit(item.unit); }}>
      <View style={styles.vegetableOption}>
        <Image source={{ uri: item.image }} style={styles.vegetableImage} />
        <Text style={styles.text}>{item.vegetable}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Add"
          style={{backgroundColor:'#1F7D53'}}
          onPress={() => {
            setSelectedVegetable(null);
            setIsModalVisible(true);
          }}
        />
      </View>
      <FlatList
        data={inventory}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          setPrice('');
          setUnit('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select a Vegetable and Enter Details</Text>
           {/* Search Bar */}
           <TextInput
              style={styles.searchInput}
              placeholder="Search vegetables"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
                        {!selectedVegetable && (
            <FlatList
                data={filteredVegetables}
                renderItem={renderVegetableOption}
                keyExtractor={(item) => item.id}
              />
            )}
            
            {selectedVegetable && (
              <View style={styles.modalForm}>
                <Text style={styles.selectedVegetableText}>
                  Selected: {selectedVegetable.vegetable}
                </Text>
                <View style={styles.priceRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Enter Price (Rs)"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <Text style={styles.unitText}> {unit} </Text>
                </View>
                <View style={styles.priceRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Enter Quantity (Rs)"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                  <Text style={styles.unitText}> {unit} </Text>
                </View>
                <View style={styles.modalButtonList}>
                  <Button title="Add to Inventory" onPress={addVegetableToInventory} />
                  <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                </View>
                {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
              </View>
            )}
          </View>
        </View>
      </Modal>
      {selectedItem && (
        <>
          <PriceUpdateModal
            visible={priceModalVisible}
            item={selectedItem}
            onClose={() => {
              setPriceModalVisible(false);
              setSelectedItem(null);
            }}
            onUpdate={handleSavePrice}
          />
          
          <QuantityUpdateModal
            visible={quantityModalVisible}
            item={selectedItem}
            onClose={() => {
              setQuantityModalVisible(false);
              setSelectedItem(null);
            }}
            onUpdate={handleSaveQuantity}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  cardList: { 
    paddingVertical: 10 
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productUnit: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
    gap: 6, // optional: or use marginBottom in buttons below
  },
  priceButton: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 6,
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    padding: 6,
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: '#F44336',
    padding: 6,
    borderRadius: 6,
  },
  cardImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  cardInfo: { 
    alignItems: 'center', 
    width: '100%' 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  priceInput: { 
    borderBottomWidth: 1, 
    padding: 5, 
    width: "20%", 
    marginRight: 10 
  },
  unitText: { 
    fontSize: 16 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 20, 
    width: '80%' 
  },
  modalHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  modalForm: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  selectedVegetableText: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  modalButtonList: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  vegetableOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    marginBottom: 10, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 5 
  },
  vegetableImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    marginRight: 10 
  },
  searchInput: {
     height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingLeft: 10 
    },
  text: { 
    fontSize: 16 
  },


// Modal styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#3B7A57',
  marginBottom: 16,
},
modalInput: {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  marginBottom: 20,
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
cancelButton: {
  backgroundColor: '#9CA3AF',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  width: '48%',
  alignItems: 'center',
},
updateButton: {
  backgroundColor: '#3B7A57',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  width: '48%',
  alignItems: 'center',
},
buttonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},
});

export default InventoryScreen;
