import { StyleSheet, View} from 'react-native';
import { useEffect, useState } from 'react'
import Mapbox, { MapView, Camera, LocationPuck } from '@rnmapbox/maps';
import ShowOrder from './ShowOrder'
import LineRoute from './LineRoute'
import { featureCollection, point } from '@turf/helpers'
import { useOrder } from './OrderProvider'
import { useCustomer } from '~/Provider/CustomerProvider';
import { getOrders } from '~/utils/Firebase'
import {STATUS} from '~/utils/Firebase'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

const Map = () => {
  const { selectedOrder, setSelectedOrder, directionCoordinate } = useOrder();
  const { contact } = useCustomer();
  const [orders, setOrders] = useState([]);
  const points = orders?.map(order => point([order.customerCoordinates[0], order.customerCoordinates[1]], { order }));
  const ordersFeatures = featureCollection(points);
  
  const onPointPress = (event) => {
    console.log("pressed")
    if (event.features[0]?.properties?.order) {
      setSelectedOrder(event.features[0]?.properties?.order);
    }
  };

  useEffect(() => {
    getOrders(contact, setOrders, [STATUS.ACCEPTED]);
  }, [selectedOrder]);

    return (
      <View style={styles.container}>
        {/* styleURL="mapbox://styles/mapbox/dark-v11" */}
        <MapView style={styles.map}  styleURL="mapbox://styles/mapbox/dark-v11" >
          <Camera followZoomLevel={10} followUserLocation />
          <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
          <ShowOrder onPointPress={onPointPress} ordersFeatures={ordersFeatures} />
          {directionCoordinate && selectedOrder && <LineRoute coordinates={directionCoordinate} />}
        </MapView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
  });
  
  export default Map;
  