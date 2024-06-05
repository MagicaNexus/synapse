import { placeIcon } from '$assets/mapIcons';
import { createMarker, initializeMap, zoomToLocation } from '$utils/googlemaps';

getCentre();

function getCentre() {
  const latitude = document.body.getAttribute('lat');
  const longitude = document.body.getAttribute('lon');
  const mapElement = document.getElementById('centre-map');
  console.log('centre.js loaded');

  if (!mapElement || !latitude || !longitude) return;
  const map = initializeMap(mapElement);
  if (!map) return;
  const location = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
  createMarker(map, location, placeIcon);
  zoomToLocation(map, location);
  console.log('centre.js loaded');
}
