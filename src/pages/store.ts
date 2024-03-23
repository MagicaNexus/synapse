import { defaultIcon, geolocationIcon, placeIcon } from '$assets/mapIcons';
import { getUserLocation } from '$utils/geolocation';
import {
  addClickEventListener,
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
  const places = document.querySelectorAll<HTMLElement>('[sy-element="store-locator-item"]');
  const infoWindows: google.maps.InfoWindow[] = [];
  let marker: google.maps.Marker;

  geolocationButton?.addEventListener('click', async () => {
    const location = await getUserLocation();
    updateMap(map, marker, location, geolocationIcon);
    updatePlaces(location, places);
  });

  autocomplete.addListener('place_changed', () => {
    const { location } = autocomplete.getPlace().geometry!;
    updateMap(map, marker, location, defaultIcon);
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
    bounds.extend(position);
    map.fitBounds(bounds);

    addClickEventListener(marker, map, position, infoWindows, infoWindowContent);

    place.addEventListener('click', () => {
      infoWindows.forEach((infoWindow) => infoWindow.close());
      const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });
      infoWindow.open(map, marker);
      infoWindows.push(infoWindow);
      zoomToLocation(map as google.maps.Map<Element>, position);
    });
  }
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
