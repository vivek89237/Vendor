import { LineLayer, ShapeSource } from '@rnmapbox/maps';
import { Position } from '@rnmapbox/maps/lib/typescript/src/types/Position';
import { useOrder } from './OrderProvider';

export default function LineRoute({
  coordinates,
  id = 'routeSource',
}: {
  coordinates: Position[];
  id?: string;
}) {
  const {selectedOrder} = useOrder()
  return (
    <ShapeSource
      id={id}
      lineMetrics
      shape={{
        properties: {},
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
      }}>
      {selectedOrder && <LineLayer
        id="exampleLineLayer"
        style={{
          lineColor: '#42E100',
          lineCap: 'round',
          lineJoin: 'round',
          lineWidth: 7,
        }}
      />}
    </ShapeSource>
  );
}