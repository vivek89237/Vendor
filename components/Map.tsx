import { StyleSheet, View} from 'react-native';
import { useEffect, useState } from 'react'
import Mapbox, { MapView, Camera, LocationPuck } from '@rnmapbox/maps';
import ShowOrder from './ShowOrder'
import LineRoute from './LineRoute'
import { featureCollection, point } from '@turf/helpers'
import { useOrder } from './OrderProvider'
import { useCustomer } from '~/Provider/CustomerProvider';
import { getOrders, Order, getScheduledOrders } from '~/utils/Firebase'
import {STATUS} from '~/utils/Firebase'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

const Map = () => {
  const { selectedOrder, setSelectedOrder, directionCoordinate, } = useOrder();
  const { id } = useCustomer()
  const [orders, setOrders] = useState<Order[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<Order[]>([]);
  const points = [...orders, ...scheduledOrders.filter((order)=>!order?.isScheduledAccepted && order?.isScheduled)]?.map(order => point([order.customerCoordinates[1], order.customerCoordinates[0]], { order }));
  const ordersFeatures = featureCollection(points);
  const onPointPress = (event) => {
    if (event.features[0]?.properties?.order) {
      setSelectedOrder(event.features[0]?.properties?.order);
    }
  };

  useEffect(() => {
    getOrders(id, setOrders, [STATUS.ACCEPTED, STATUS.PENDING]);
    getScheduledOrders(id, setScheduledOrders)
  }, []);

    return (
      <View style={styles.container}>
        {/* styleURL="mapbox://styles/mapbox/dark-v11" */}
        <MapView style={styles.map}  styleURL="mapbox://styles/mapbox/dark-v11" >
          <Camera followZoomLevel={10} followUserLocation />
          <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
          <ShowOrder onPointPress={onPointPress} ordersFeatures={ordersFeatures} />
         
          {directionCoordinate && [STATUS.ACCEPTED, STATUS.PENDING].includes(selectedOrder?.status) && <LineRoute coordinates={directionCoordinate} />}
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
  