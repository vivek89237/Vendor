const BASE_URL = 'https://api.mapbox.com';

interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
  }>;
}

export async function getDirections(
  from: [number, number], 
  to: [number, number],
  type: string
): Promise<DirectionsResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/directions/v5/mapbox/${type}/${from[0]},${from[1]};${to[0]},${to[1]}?alternatives=false&annotations=distance,duration&continue_straight=true&geometries=geojson&overview=full&steps=false&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json: DirectionsResponse = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
}
