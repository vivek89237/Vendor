import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import {STATUS} from '~/utils/Firebase'
import { Button } from "./Button";
interface OrderStatusDropdownProps {
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
}
const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({ selectedStatus, setSelectedStatus }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleSelectStatus = (status:string) => {
    setSelectedStatus(status);
    setDropdownVisible(false);
  };

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
    <View style={styles.dropdownContainer}>
      <Button
        title={`${selectedStatus}    ▼` || "Select Status ▼"}
        onPress={() => setDropdownVisible(true)}
        style={[styles.dropdownButton, {backgroundColor:`${getStatusColor(selectedStatus)}`}]}
      />
    
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <FlatList
              data={Object.values(STATUS)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectStatus(item)}
                  style={[styles.dropdownItem, { backgroundColor: getStatusColor(item) }]}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    marginVertical: 10,
  },
  dropdownButton: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});

export default OrderStatusDropdown;
