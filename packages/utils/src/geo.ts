// Geographic utilities for ConnectGig platform

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  point1: GeoLocation,
  point2: GeoLocation
): number => {
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

// Convert degrees to radians
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Convert radians to degrees
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

// Calculate bounding box around a center point
export const calculateBoundingBox = (
  center: GeoLocation,
  radiusKm: number
): BoundingBox => {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const lonDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI) / Math.cos(toRadians(center.latitude));

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lonDelta,
    west: center.longitude - lonDelta,
  };
};

// Check if a point is within a bounding box
export const isPointInBoundingBox = (
  point: GeoLocation,
  box: BoundingBox
): boolean => {
  return (
    point.latitude >= box.south &&
    point.latitude <= box.north &&
    point.longitude >= box.west &&
    point.longitude <= box.east
  );
};

// Check if a point is within a certain radius of another point
export const isPointWithinRadius = (
  center: GeoLocation,
  point: GeoLocation,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
};

// Calculate the center point of multiple locations
export const calculateCenterPoint = (locations: GeoLocation[]): GeoLocation => {
  if (locations.length === 0) {
    throw new Error('Cannot calculate center of empty location array');
  }

  if (locations.length === 1) {
    return locations[0];
  }

  let sumLat = 0;
  let sumLon = 0;

  for (const location of locations) {
    sumLat += location.latitude;
    sumLon += location.longitude;
  }

  return {
    latitude: sumLat / locations.length,
    longitude: sumLon / locations.length,
  };
};

// Calculate ETA based on distance and average speed
export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 30
): number => {
  return (distanceKm / averageSpeedKmh) * 60; // Returns minutes
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};

// Format ETA for display
export const formatETA = (etaMinutes: number): string => {
  if (etaMinutes < 60) {
    return `${Math.round(etaMinutes)}min`;
  } else {
    const hours = Math.floor(etaMinutes / 60);
    const minutes = Math.round(etaMinutes % 60);
    return `${hours}h ${minutes}min`;
  }
};

// Calculate area of a polygon (simplified for basic shapes)
export const calculateArea = (coordinates: GeoLocation[]): number => {
  if (coordinates.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].longitude * coordinates[j].latitude;
    area -= coordinates[j].longitude * coordinates[i].latitude;
  }

  area = Math.abs(area) / 2;
  return area * (Math.PI / 180) ** 2 * EARTH_RADIUS_KM ** 2;
};

// Find nearest location from a list
export const findNearestLocation = (
  target: GeoLocation,
  locations: GeoLocation[]
): { location: GeoLocation; distance: number } | null => {
  if (locations.length === 0) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(target, nearest);

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(target, locations[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = locations[i];
    }
  }

  return { location: nearest, distance: minDistance };
};

// Sort locations by distance from a target point
export const sortLocationsByDistance = (
  target: GeoLocation,
  locations: GeoLocation[]
): Array<{ location: GeoLocation; distance: number }> => {
  return locations
    .map(location => ({
      location,
      distance: calculateDistance(target, location),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Validate geographic coordinates
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// Parse coordinates from string (e.g., "12.9716,77.5946")
export const parseCoordinates = (coordString: string): GeoLocation | null => {
  try {
    const [lat, lon] = coordString.split(',').map(Number);
    if (isValidCoordinates(lat, lon)) {
      return { latitude: lat, longitude: lon };
    }
  } catch {
    // Invalid format
  }
  return null;
};

// Convert coordinates to string format
export const coordinatesToString = (location: GeoLocation): string => {
  return `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
};
