import { placeIcon } from '$assets/mapIcons';
import { createMarker, initMap, zoomToLocation } from '$utils/googlemaps';

export const getCentre = () => {
  const latitude = document.body.getAttribute('lat');
  const longitude = document.body.getAttribute('lon');
  const mapElement = document.getElementById('centre-map');
  if (!mapElement || !latitude || !longitude) return;
  const map = initMap(mapElement);
  const location = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
  createMarker(map, location, placeIcon);
  zoomToLocation(map, location);
};
