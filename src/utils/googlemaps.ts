import { geolocationIcon } from '$assets/mapIcons';
import type { ShopWithDistance } from '$interfaces/ShopWithDistance';

import gmapStyle from '../styles/googlemaps.json';
import { getUserLocation } from './geolocation';

type Map = google.maps.Map;
type LatLng = google.maps.LatLng;
type Marker = google.maps.Marker;
type InfoWindow = google.maps.InfoWindow;

export function initMap(element: HTMLElement) {
  return new google.maps.Map(element, {
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: gmapStyle as google.maps.MapTypeStyle[],
  });
}

export function createAutocomplete(input: HTMLInputElement) {
  return new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'fr' },
  });
}

export async function updateUserLocation(map: Map, places: NodeListOf<HTMLElement>) {
  try {
    const userLocation = await getUserLocation();
    createMarker(map, userLocation, geolocationIcon);
    updatePlaces(userLocation, places);
  } catch (error) {
    console.error(error);
  }
}

// Définir un type d'union pour l'icône
type MarkerIcon = string | google.maps.Icon | google.maps.Symbol | null | undefined;

export function createMarker(map: Map, location: LatLng, icon: MarkerIcon) {
  const markerOptions: google.maps.MarkerOptions = {
    position: location,
    map: map,
    icon: icon,
  };
  return new google.maps.Marker(markerOptions);
}

export function zoomToLocation(map: Map, location: LatLng, zoom = 12) {
  map.setZoom(zoom);
  map.panTo(location);
}

export function checkBusinessStatus(placeId: string, map: google.maps.Map) {
  return new Promise((resolve, reject) => {
    const request = {
      placeId: placeId,
    };

    const service = new google.maps.places.PlacesService(map); // Assuming you have a map object defined
    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const openingHours = place.opening_hours;
        if (openingHours) {
          const now = new Date();
          const isOpenNow = openingHours.isOpen(now);
          resolve(isOpenNow ? 'Open' : 'Closed');
        } else {
          resolve('No opening hours available');
        }
      } else {
        reject('Place details not found');
      }
    });
  });
}

export async function updateMap(map: Map, marker: Marker, location: LatLng, icon: MarkerIcon) {
  if (marker) marker.setMap(null);
  marker = createMarker(map, location, icon);
  zoomToLocation(map, location);
}

export function createInfoWindowContent(
  city: string,
  enseigne: string,
  imageUrl: string,
  direction: string,
  url: string
): string {
  return `
        <div class="infowindow-wrapper">
            <div class="infowindow-text-wrapper">
                <div class="infowindow-adress">${city}</div>
                <div class="infowindow-title">Centre ${enseigne}</div>
            </div>
            <img class="infowindow-image-wrapper" src="${imageUrl}">
        </div>
        <div class="button-group is-right infowindow">
            <a href="${direction}" class="button is-secondary is-small is-icon is-info-window icon-only w-inline-block">
                <div class="icon-embed-xsmall w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                        <path fill="currentColor" d="m21.41 10.59l-7.99-8c-.78-.78-2.05-.78-2.83 0l-8.01 8c-.78.78-.78 2.05 0 2.83l8.01 8c.78.78 2.05.78 2.83 0l7.99-8c.79-.79.79-2.05 0-2.83M13.5 14.5V12H10v3H8v-4c0-.55.45-1 1-1h4.5V7.5L17 11z"></path>
                    </svg>
                </div>
            </a>
            <a href="${url}" class="button is-secondary is-small is-icon is-info-window w-inline-block">
                <div class="text-block-2">Voir le centre</div>
                <div class="icon-embed-xxsmall w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z"></path>
                    </svg>
                </div>
            </a>
        </div>`;
}

export function updatePlaces(userLocation: LatLng, places: NodeListOf<HTMLElement>) {
  const shopsWithDistance: ShopWithDistance[] = [];
  for (const place of places) {
    const lat = parseFloat(place.querySelector('[sy-element="latitude"]')?.innerHTML || '0');
    const lon = parseFloat(place.querySelector('[sy-element="longitude"]')?.innerHTML || '0');

    const shopLocation = new google.maps.LatLng(lat, lon);
    const distance = (
      google.maps.geometry.spherical.computeDistanceBetween(userLocation, shopLocation) / 1000
    ).toFixed(1);
    shopsWithDistance.push({ element: place, distance });
  }

  shopsWithDistance.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  shopsWithDistance.forEach((shop, index) => {
    const distanceElement = shop.element.querySelector('[sy-element="distance"]');
    if (distanceElement) {
      distanceElement.innerHTML = shop.distance;
    } else {
      console.error('Distance element not found for a shop:', shop.element);
    }

    const delay = index * 50; // Adjust the delay time as needed
    setTimeout(() => {
      shop.element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      shop.element.style.opacity = '1';
      shop.element.style.transform = 'translateY(0)';
    }, delay);
  });

  const storeLocator = document.getElementById('location-list') as HTMLElement;
  storeLocator.innerHTML = ''; // Clear existing cards before reordering
  shopsWithDistance.forEach((shop) => {
    shop.element.style.transition = 'none'; // Remove transition temporarily for reordering
    shop.element.style.opacity = '0';
    shop.element.style.transform = 'translateY(-20px)'; // Move cards off-screen initially
    storeLocator?.appendChild(shop.element);
  });

  // Trigger reflow to apply initial styles before re-enabling transitions
  void storeLocator?.offsetWidth;
  shopsWithDistance.forEach((shop, index) => {
    const delay = index * 100; // Adjust the delay time as needed
    setTimeout(() => {
      shop.element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      shop.element.style.opacity = '1';
      shop.element.style.transform = 'translateY(0)';
    }, delay);
  });
}

export function addClickEventListener(
  marker: Marker,
  map: Map,
  position: LatLng,
  infoWindows: InfoWindow[],
  infoWindowContent: string
) {
  const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });

  marker.addListener('click', () => {
    infoWindows.forEach((infoWindow) => infoWindow.close());
    infoWindow.open(map, marker);
    infoWindows.push(infoWindow);
    zoomToLocation(map, position);
  });
}
