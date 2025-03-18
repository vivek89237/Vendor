import { ShapeSource, SymbolLayer, CircleLayer , Images} from "@rnmapbox/maps"
import pin from "~/assets/pin.png";

export default function ShowOrder({onPointPress, ordersFeatures}){
    return(
        <ShapeSource 
          id="scooters" 
          cluster
          onPress={onPointPress}
          shape={ordersFeatures} 
        >
          <SymbolLayer
            id="clusters-coount"
            style={{
              textField: ['get', 'point_count'],
              textSize: 15,
              textColor:"#ffffff",
              textPitchAlignment:"map"
            }}
          >
          </SymbolLayer>
          <CircleLayer
            id="clusters"
           
            filter={['has', 'point_count']}
            style={{
              circleColor : '#42E100',
              circleRadius: 10,
              circleOpacity:0.7,
              circleStrokeWidth: 2,
              circleStrokeColor: 'white',
            }}
          />
          <SymbolLayer 
            id="scooter-icons"
            filter={['!' ,['has', 'point_count']]} 
            style={{
              iconImage: 'pin',
              iconSize : 0.3,
              iconAllowOverlap: true,
              iconAnchor : 'bottom'
            }} 
          />
          <Images images={{pin}}  />
        </ShapeSource>
    )
}