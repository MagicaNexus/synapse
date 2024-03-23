import type { AddressData } from '$interfaces/AddressData';

export function getUserLocation(): Promise<google.maps.LatLng> {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = new google.maps.LatLng(latitude, longitude);
          resolve(userLocation);
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser'));
    }
  });
}

export function handleLocationError(error: GeolocationPositionError): void {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.error(
        'User denied the request for Geolocation. Please enable location access in your browser settings.'
      );
      break;
    default:
      console.error('An unknown error occurred.');
  }
}

export function extractLatLon(data: AddressData): { lat: number; lon: number } {
  const { coordinates } = data.features[0].geometry;
  const lat = coordinates[1];
  const lon = coordinates[0];
  return { lat, lon };
}
