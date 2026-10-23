// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Keep stores whose own delivery radius (from the API) covers the user
export const filterStoresWithinRadius = (
  stores: any[],
  userLat: number,
  userLon: number
): any[] => {
  return stores.filter((store) => {
    if (store.latitude == null || store.longitude == null || store.deliveryRadiusKm == null) {
      return true;
    }
    const distance = calculateDistance(userLat, userLon, store.latitude, store.longitude);
    return distance <= store.deliveryRadiusKm;
  });
};

// Get distance display format
export const getDistanceDisplay = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distanceKm: number): string => {
  const minutesPerKm = 3;
  const baseMins = 5;
  const totalMins = Math.ceil(baseMins + distanceKm * minutesPerKm);
  return `${totalMins} min`;
};
