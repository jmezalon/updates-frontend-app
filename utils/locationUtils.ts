// Location utilities for manual location input and coordinate lookup

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Simple city coordinates lookup for major cities worldwide
export const getCityCoordinates = (city: string, state: string): LocationCoordinates | null => {
  const cityKey = `${city.toLowerCase()}, ${state.toLowerCase()}`;
  
  // US Cities
  const usCoordinates: Record<string, LocationCoordinates> = {
    'atlanta, ga': { latitude: 33.7490, longitude: -84.3880 },
    'atlanta, georgia': { latitude: 33.7490, longitude: -84.3880 },
    'new york, ny': { latitude: 40.7128, longitude: -74.0060 },
    'new york, new york': { latitude: 40.7128, longitude: -74.0060 },
    'los angeles, ca': { latitude: 34.0522, longitude: -118.2437 },
    'los angeles, california': { latitude: 34.0522, longitude: -118.2437 },
    'chicago, il': { latitude: 41.8781, longitude: -87.6298 },
    'chicago, illinois': { latitude: 41.8781, longitude: -87.6298 },
    'houston, tx': { latitude: 29.7604, longitude: -95.3698 },
    'houston, texas': { latitude: 29.7604, longitude: -95.3698 },
    'phoenix, az': { latitude: 33.4484, longitude: -112.0740 },
    'phoenix, arizona': { latitude: 33.4484, longitude: -112.0740 },
    'philadelphia, pa': { latitude: 39.9526, longitude: -75.1652 },
    'philadelphia, pennsylvania': { latitude: 39.9526, longitude: -75.1652 },
    'san antonio, tx': { latitude: 29.4241, longitude: -98.4936 },
    'san antonio, texas': { latitude: 29.4241, longitude: -98.4936 },
    'san diego, ca': { latitude: 32.7157, longitude: -117.1611 },
    'san diego, california': { latitude: 32.7157, longitude: -117.1611 },
    'dallas, tx': { latitude: 32.7767, longitude: -96.7970 },
    'dallas, texas': { latitude: 32.7767, longitude: -96.7970 },
    'san jose, ca': { latitude: 37.3382, longitude: -121.8863 },
    'san jose, california': { latitude: 37.3382, longitude: -121.8863 },
    'austin, tx': { latitude: 30.2672, longitude: -97.7431 },
    'austin, texas': { latitude: 30.2672, longitude: -97.7431 },
    'jacksonville, fl': { latitude: 30.3322, longitude: -81.6557 },
    'jacksonville, florida': { latitude: 30.3322, longitude: -81.6557 },
    'san francisco, ca': { latitude: 37.7749, longitude: -122.4194 },
    'san francisco, california': { latitude: 37.7749, longitude: -122.4194 },
    'columbus, oh': { latitude: 39.9612, longitude: -82.9988 },
    'columbus, ohio': { latitude: 39.9612, longitude: -82.9988 },
    'charlotte, nc': { latitude: 35.2271, longitude: -80.8431 },
    'charlotte, north carolina': { latitude: 35.2271, longitude: -80.8431 },
    'fort worth, tx': { latitude: 32.7555, longitude: -97.3308 },
    'fort worth, texas': { latitude: 32.7555, longitude: -97.3308 },
    'detroit, mi': { latitude: 42.3314, longitude: -83.0458 },
    'detroit, michigan': { latitude: 42.3314, longitude: -83.0458 },
    'el paso, tx': { latitude: 31.7619, longitude: -106.4850 },
    'el paso, texas': { latitude: 31.7619, longitude: -106.4850 },
    'memphis, tn': { latitude: 35.1495, longitude: -90.0490 },
    'memphis, tennessee': { latitude: 35.1495, longitude: -90.0490 },
    'seattle, wa': { latitude: 47.6062, longitude: -122.3321 },
    'seattle, washington': { latitude: 47.6062, longitude: -122.3321 },
    'denver, co': { latitude: 39.7392, longitude: -104.9903 },
    'denver, colorado': { latitude: 39.7392, longitude: -104.9903 },
    'washington, dc': { latitude: 38.9072, longitude: -77.0369 },
    'boston, ma': { latitude: 42.3601, longitude: -71.0589 },
    'boston, massachusetts': { latitude: 42.3601, longitude: -71.0589 },
    'nashville, tn': { latitude: 36.1627, longitude: -86.7816 },
    'nashville, tennessee': { latitude: 36.1627, longitude: -86.7816 },
    'baltimore, md': { latitude: 39.2904, longitude: -76.6122 },
    'baltimore, maryland': { latitude: 39.2904, longitude: -76.6122 },
    'oklahoma city, ok': { latitude: 35.4676, longitude: -97.5164 },
    'oklahoma city, oklahoma': { latitude: 35.4676, longitude: -97.5164 },
    'portland, or': { latitude: 45.5152, longitude: -122.6784 },
    'portland, oregon': { latitude: 45.5152, longitude: -122.6784 },
    'las vegas, nv': { latitude: 36.1699, longitude: -115.1398 },
    'las vegas, nevada': { latitude: 36.1699, longitude: -115.1398 },
    'milwaukee, wi': { latitude: 43.0389, longitude: -87.9065 },
    'milwaukee, wisconsin': { latitude: 43.0389, longitude: -87.9065 },
    'albuquerque, nm': { latitude: 35.0844, longitude: -106.6504 },
    'albuquerque, new mexico': { latitude: 35.0844, longitude: -106.6504 },
    'tucson, az': { latitude: 32.2226, longitude: -110.9747 },
    'tucson, arizona': { latitude: 32.2226, longitude: -110.9747 },
    'fresno, ca': { latitude: 36.7378, longitude: -119.7871 },
    'fresno, california': { latitude: 36.7378, longitude: -119.7871 },
    'sacramento, ca': { latitude: 38.5816, longitude: -121.4944 },
    'sacramento, california': { latitude: 38.5816, longitude: -121.4944 },
    'mesa, az': { latitude: 33.4152, longitude: -111.8315 },
    'mesa, arizona': { latitude: 33.4152, longitude: -111.8315 },
    'kansas city, mo': { latitude: 39.0997, longitude: -94.5786 },
    'kansas city, missouri': { latitude: 39.0997, longitude: -94.5786 },
    'virginia beach, va': { latitude: 36.8529, longitude: -75.9780 },
    'virginia beach, virginia': { latitude: 36.8529, longitude: -75.9780 },
    'omaha, ne': { latitude: 41.2565, longitude: -95.9345 },
    'omaha, nebraska': { latitude: 41.2565, longitude: -95.9345 },
    'colorado springs, co': { latitude: 38.8339, longitude: -104.8214 },
    'colorado springs, colorado': { latitude: 38.8339, longitude: -104.8214 },
    'raleigh, nc': { latitude: 35.7796, longitude: -78.6382 },
    'raleigh, north carolina': { latitude: 35.7796, longitude: -78.6382 },
    'miami, fl': { latitude: 25.7617, longitude: -80.1918 },
    'miami, florida': { latitude: 25.7617, longitude: -80.1918 },
    'oakland, ca': { latitude: 37.8044, longitude: -122.2711 },
    'oakland, california': { latitude: 37.8044, longitude: -122.2711 },
    'minneapolis, mn': { latitude: 44.9778, longitude: -93.2650 },
    'minneapolis, minnesota': { latitude: 44.9778, longitude: -93.2650 },
    'tulsa, ok': { latitude: 36.1540, longitude: -95.9928 },
    'tulsa, oklahoma': { latitude: 36.1540, longitude: -95.9928 },
    'cleveland, oh': { latitude: 41.4993, longitude: -81.6944 },
    'cleveland, ohio': { latitude: 41.4993, longitude: -81.6944 },
    'wichita, ks': { latitude: 37.6872, longitude: -97.3301 },
    'wichita, kansas': { latitude: 37.6872, longitude: -97.3301 },
    'arlington, tx': { latitude: 32.7357, longitude: -97.1081 },
    'arlington, texas': { latitude: 32.7357, longitude: -97.1081 },
  };

  // International Cities (Major global cities)
  const internationalCoordinates: Record<string, LocationCoordinates> = {
    // Canada
    'toronto, on': { latitude: 43.6532, longitude: -79.3832 },
    'toronto, ontario': { latitude: 43.6532, longitude: -79.3832 },
    'vancouver, bc': { latitude: 49.2827, longitude: -123.1207 },
    'vancouver, british columbia': { latitude: 49.2827, longitude: -123.1207 },
    'montreal, qc': { latitude: 45.5017, longitude: -73.5673 },
    'montreal, quebec': { latitude: 45.5017, longitude: -73.5673 },
    'calgary, ab': { latitude: 51.0447, longitude: -114.0719 },
    'calgary, alberta': { latitude: 51.0447, longitude: -114.0719 },
    'ottawa, on': { latitude: 45.4215, longitude: -75.6972 },
    'ottawa, ontario': { latitude: 45.4215, longitude: -75.6972 },
    
    // United Kingdom
    'london, uk': { latitude: 51.5074, longitude: -0.1278 },
    'london, england': { latitude: 51.5074, longitude: -0.1278 },
    'manchester, uk': { latitude: 53.4808, longitude: -2.2426 },
    'manchester, england': { latitude: 53.4808, longitude: -2.2426 },
    'birmingham, uk': { latitude: 52.4862, longitude: -1.8904 },
    'birmingham, england': { latitude: 52.4862, longitude: -1.8904 },
    'glasgow, scotland': { latitude: 55.8642, longitude: -4.2518 },
    'edinburgh, scotland': { latitude: 55.9533, longitude: -3.1883 },
    
    // Australia
    'sydney, australia': { latitude: -33.8688, longitude: 151.2093 },
    'melbourne, australia': { latitude: -37.8136, longitude: 144.9631 },
    'brisbane, australia': { latitude: -27.4698, longitude: 153.0251 },
    'perth, australia': { latitude: -31.9505, longitude: 115.8605 },
    'adelaide, australia': { latitude: -34.9285, longitude: 138.6007 },
    
    // Europe
    'paris, france': { latitude: 48.8566, longitude: 2.3522 },
    'berlin, germany': { latitude: 52.5200, longitude: 13.4050 },
    'madrid, spain': { latitude: 40.4168, longitude: -3.7038 },
    'rome, italy': { latitude: 41.9028, longitude: 12.4964 },
    'amsterdam, netherlands': { latitude: 52.3676, longitude: 4.9041 },
    'stockholm, sweden': { latitude: 59.3293, longitude: 18.0686 },
    'copenhagen, denmark': { latitude: 55.6761, longitude: 12.5683 },
    'oslo, norway': { latitude: 59.9139, longitude: 10.7522 },
    'helsinki, finland': { latitude: 60.1699, longitude: 24.9384 },
    'vienna, austria': { latitude: 48.2082, longitude: 16.3738 },
    'zurich, switzerland': { latitude: 47.3769, longitude: 8.5417 },
    'brussels, belgium': { latitude: 50.8503, longitude: 4.3517 },
    'dublin, ireland': { latitude: 53.3498, longitude: -6.2603 },
    'lisbon, portugal': { latitude: 38.7223, longitude: -9.1393 },
    'prague, czech republic': { latitude: 50.0755, longitude: 14.4378 },
    'warsaw, poland': { latitude: 52.2297, longitude: 21.0122 },
    'budapest, hungary': { latitude: 47.4979, longitude: 19.0402 },
    'athens, greece': { latitude: 37.9838, longitude: 23.7275 },
    
    // Asia
    'tokyo, japan': { latitude: 35.6762, longitude: 139.6503 },
    'seoul, south korea': { latitude: 37.5665, longitude: 126.9780 },
    'beijing, china': { latitude: 39.9042, longitude: 116.4074 },
    'shanghai, china': { latitude: 31.2304, longitude: 121.4737 },
    'hong kong, china': { latitude: 22.3193, longitude: 114.1694 },
    'singapore, singapore': { latitude: 1.3521, longitude: 103.8198 },
    'mumbai, india': { latitude: 19.0760, longitude: 72.8777 },
    'delhi, india': { latitude: 28.7041, longitude: 77.1025 },
    'bangalore, india': { latitude: 12.9716, longitude: 77.5946 },
    'bangkok, thailand': { latitude: 13.7563, longitude: 100.5018 },
    'kuala lumpur, malaysia': { latitude: 3.1390, longitude: 101.6869 },
    'jakarta, indonesia': { latitude: -6.2088, longitude: 106.8456 },
    'manila, philippines': { latitude: 14.5995, longitude: 120.9842 },
    
    // Middle East & Africa
    'dubai, uae': { latitude: 25.2048, longitude: 55.2708 },
    'tel aviv, israel': { latitude: 32.0853, longitude: 34.7818 },
    'cairo, egypt': { latitude: 30.0444, longitude: 31.2357 },
    'johannesburg, south africa': { latitude: -26.2041, longitude: 28.0473 },
    'cape town, south africa': { latitude: -33.9249, longitude: 18.4241 },
    'lagos, nigeria': { latitude: 6.5244, longitude: 3.3792 },
    
    // South America
    'sao paulo, brazil': { latitude: -23.5505, longitude: -46.6333 },
    'rio de janeiro, brazil': { latitude: -22.9068, longitude: -43.1729 },
    'buenos aires, argentina': { latitude: -34.6118, longitude: -58.3960 },
    'santiago, chile': { latitude: -33.4489, longitude: -70.6693 },
    'bogota, colombia': { latitude: 4.7110, longitude: -74.0721 },
    'lima, peru': { latitude: -12.0464, longitude: -77.0428 },
    'mexico city, mexico': { latitude: 19.4326, longitude: -99.1332 },
  };

  // Combine all coordinates
  const allCoordinates = { ...usCoordinates, ...internationalCoordinates };
  
  return allCoordinates[cityKey] || null;
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get supported location examples for user guidance
export const getLocationExamples = (): string[] => {
  return [
    // US Examples
    'Atlanta, GA',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    // International Examples
    'Toronto, Ontario',
    'London, UK',
    'Paris, France',
    'Tokyo, Japan',
    'Sydney, Australia',
    'Berlin, Germany',
    'Dubai, UAE',
    'Mexico City, Mexico'
  ];
};

// Check if a location string format is valid
export const isValidLocationFormat = (locationString: string): boolean => {
  const trimmed = locationString.trim();
  
  // Check if it's a zip code (5 digits or 5+4 format)
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return true;
  }
  
  // Check if it's city, state format
  const parts = trimmed.split(',').map(part => part.trim());
  return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
};

// Get coordinates from zip code (major US zip codes)
export const getZipCodeCoordinates = (zipCode: string): (LocationCoordinates & { city: string; state: string }) | null => {
  // Remove any extra formatting
  const cleanZip = zipCode.replace(/[^\d]/g, '').substring(0, 5);
  
  // Major US zip codes with approximate coordinates
  const zipCoordinates: Record<string, LocationCoordinates & { city: string; state: string }> = {
    // Atlanta, GA area
    '30301': { latitude: 33.7490, longitude: -84.3880, city: 'Atlanta', state: 'GA' },
    '30302': { latitude: 33.7490, longitude: -84.3880, city: 'Atlanta', state: 'GA' },
    '30303': { latitude: 33.7490, longitude: -84.3880, city: 'Atlanta', state: 'GA' },
    '30309': { latitude: 33.7490, longitude: -84.3880, city: 'Atlanta', state: 'GA' },
    '30318': { latitude: 33.7490, longitude: -84.3880, city: 'Atlanta', state: 'GA' },
    
    // New York, NY area
    '10001': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10002': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10003': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10004': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10005': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10010': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10011': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10012': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10013': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10014': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10016': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10017': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10018': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10019': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10020': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10021': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10022': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10023': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10024': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10025': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10026': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10027': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10028': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10029': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    '10030': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
    
    // Brooklyn, NY area
    '11201': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11202': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11203': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11204': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11205': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11206': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11207': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11208': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11209': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11210': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11211': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11212': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11213': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11214': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11215': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11216': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11217': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11218': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11219': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11220': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11221': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11222': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11223': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11224': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11225': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11226': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11228': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11229': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11230': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11231': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11232': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11233': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11234': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11235': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11236': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11237': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11238': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    '11239': { latitude: 40.6892, longitude: -73.9900, city: 'Brooklyn', state: 'NY' },
    
    // Queens, NY area
    '11101': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11102': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11103': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11104': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11105': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11106': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11354': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11355': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11356': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11357': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11358': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11360': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11361': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11362': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11363': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11364': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11365': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11366': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11367': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11368': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11369': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11370': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11372': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11373': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11374': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11375': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11377': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11378': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11379': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11385': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11411': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11412': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11413': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11414': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11415': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11416': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11417': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11418': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11419': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11420': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11421': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11422': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11423': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11426': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11427': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11428': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11429': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11432': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11433': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11434': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11435': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    '11436': { latitude: 40.7282, longitude: -73.9442, city: 'Queens', state: 'NY' },
    
    // Los Angeles, CA area
    '90001': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90002': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90003': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90004': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90005': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90006': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90007': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90008': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90010': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90011': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90012': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90013': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90014': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90015': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90016': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90017': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90018': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90019': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    '90020': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
    
    // Chicago, IL area
    '60601': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60602': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60603': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60604': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60605': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60606': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60607': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60608': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60609': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60610': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60611': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60612': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60613': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60614': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    '60615': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
    
    // Houston, TX area
    '77001': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77002': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77003': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77004': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77005': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77006': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77007': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77008': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77009': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    '77010': { latitude: 29.7604, longitude: -95.3698, city: 'Houston', state: 'TX' },
    
    // Miami, FL area
    '33101': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33102': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33109': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33111': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33112': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33114': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33116': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33119': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33122': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    '33124': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' },
    
    // Dallas, TX area
    '75201': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75202': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75203': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75204': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75205': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75206': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75207': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75208': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75209': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    '75210': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas', state: 'TX' },
    
    // San Francisco, CA area
    '94101': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94102': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94103': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94104': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94105': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94106': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94107': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94108': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94109': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    '94110': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
    
    // Boston, MA area
    '02101': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02102': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02103': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02104': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02105': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02106': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02107': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02108': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02109': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    '02110': { latitude: 42.3601, longitude: -71.0589, city: 'Boston', state: 'MA' },
    
    // Seattle, WA area
    '98101': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98102': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98103': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98104': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98105': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98106': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98107': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98108': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98109': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
    '98110': { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA' },
  };
  
  return zipCoordinates[cleanZip] || null;
};
