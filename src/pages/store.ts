import { defaultIcon, geolocationIcon, placeIcon } from '$assets/mapIcons';
import {
  addMarkerClickEventListener,
  createAutocomplete,
  createInfoWindowContent,
  createMarker,
  initMap,
  updateMap,
  updatePlaces,
  updateUserLocation,
  zoomToLocation,
} from '$utils/googlemaps';

export const getStore = () => {
  const mapElement = document.getElementById('store-locator-map');
  const inputElement = document.getElementById('input') as HTMLInputElement;
  if (!mapElement || !inputElement) return;
  const map = initMap(mapElement);
  const geolocationButton = document.getElementById('geolocation');
  const bounds = new google.maps.LatLngBounds();
  const autocomplete = createAutocomplete(inputElement);
  const places = document.querySelectorAll<HTMLElement>('[sy-element="item"]');
  const infoWindows: google.maps.InfoWindow[] = [];
  let marker: google.maps.Marker;

  autocomplete.addListener('place_changed', () => {
    const { location } = autocomplete.getPlace().geometry!;
    updateMap(map, marker, location, defaultIcon as google.maps.Icon);
    updatePlaces(location, places);
  });

  updateUserLocation(map, places);
  places.forEach((place) => setPlace(place, map));

  function setPlace(place: HTMLElement, map: google.maps.Map<HTMLElement>) {
    const getElementInnerHTML = (selector: string): string =>
      place.querySelector(selector)!.innerHTML;
    const getElementAttribute = (selector: string, attribute: string): string =>
      place.querySelector(selector)!.getAttribute(attribute)!;

    const placeId = getElementInnerHTML('[sy-element="placeId"]');
    const imageUrl = getElementAttribute('[sy-element="image"]', 'src');
    const enseigne = getElementInnerHTML('[sy-element="enseigne"]');
    const city = getElementInnerHTML('[sy-element="city"]');
    const slug = getElementInnerHTML('[sy-element="slug"]');
    const url = `${document.location.origin}/nos-centres/${slug}`;
    const direction = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    const { innerHTML: latitude } = place.querySelector('[sy-element="latitude"]')!;
    const { innerHTML: longitude } = place.querySelector('[sy-element="longitude"]')!;
    const position = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
    const marker = createMarker(map, position, placeIcon);
    const infoWindowContent = createInfoWindowContent(city, enseigne, imageUrl, direction, url);
    const itemClickMap = place.querySelector('[sy-element="item-click-map"]') as HTMLElement;
    const distanceElement = place.querySelector('[sy-element="distance"]') as HTMLElement;
    if (distanceElement) {
      //set element to display none
      distanceElement.style.display = 'none';
    }

    bounds.extend(position);
    map.fitBounds(bounds);

    addMarkerClickEventListener(marker, map, position, infoWindows, infoWindowContent);

    let hoverTimer: number;

    itemClickMap.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        openInfoWindow();
      }, 1000);
    });

    itemClickMap.addEventListener('click', () => {
      openInfoWindow();
    });

    function openInfoWindow() {
      infoWindows.forEach((infoWindow) => infoWindow.close());
      const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });
      infoWindow.open(map, marker);
      infoWindows.push(infoWindow);
      zoomToLocation(map as google.maps.Map<Element>, position);
    }

    itemClickMap.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });
  }

  geolocationButton?.addEventListener('click', async () => {
    //get position from the local storage
    const userLocation = JSON.parse(localStorage.getItem('userLocation')!);
    if (!userLocation) return;
    if (!userLocation.latitude || !userLocation.longitude) return;
    const { latitude, longitude } = userLocation;
    const position = new google.maps.LatLng(latitude, longitude);
    updateMap(map, marker, position, geolocationIcon);
    updatePlaces(position, places);
  });
};

/*checkBusinessStatus(placeId, map as google.maps.Map<Element>)
      .then((status) => {
        if (status === 'Open') {
          place.querySelector('[sy-element="status"]')!.innerHTML = 'Ouvert';
          place.querySelector('[sy-element="status"]')!.classList.add('is-open');
        } else {
          place.querySelector('[sy-element="status"]')!.innerHTML = 'Fermé';
          place.querySelector('[sy-element="status"]')!.classList.add('is-close');
        }
      })
      .catch((error) => console.error(error));*/
