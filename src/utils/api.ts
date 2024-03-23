export async function getAddressData(address: string, postcode: string) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodedAddress}&limit=1&postcode=${postcode}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching address data:', error);
    throw error; // You may handle the error differently based on your application's needs
  }
}
