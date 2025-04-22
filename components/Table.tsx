import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';


const Table = ({data, price}:{data:any, price:number}) => {

  const renderItem = ({ item }:{item:any}) => {
    const total = item?.quantity*item?.price
    return (
      <View style={styles.row}>
        <Text style={styles.cellN}>{ item?.unit === 'g'? item?.quantity*1000 : item?.quantity}</Text>
        <Text style={styles.cell}>{item?.unit}</Text>
        <Text style={styles.cell}>{item?.name}</Text>
        <Text style={styles.cell}>{item?.price}</Text>
        <Text style={styles.cell}>{total.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cellN}>#</Text>
        <Text style={styles.cell}>Unit</Text>
        <Text style={styles.cell}>Name</Text>
        <Text style={styles.cell}>Price(₹)</Text>
        <Text style={styles.cell}>Total(₹)</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.footer}>
        <Text style={styles.cell}>Total Amount:</Text>
        <Text style={styles.cell}>₹{price.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingLeft:0,
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingLeft:0,
    padding: 10,
    marginTop: 10,
    fontWeight: 'bold',
    justifyContent:'space-evenly'
  },
  row: {
    flexDirection: 'row',
    paddingLeft:0,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cellN:{
    flex: 0.5,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
});

export default Table;