import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

// Default fallback location: Indiranagar, Bengaluru
const DEFAULT_LOCATION = {
  addressLine: '100 Feet Road, Indiranagar',
  area: 'Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  lat: 12.9784,
  lng: 77.6408,
  type: 'Home'
};

export function LocationProvider({ children }) {
  const [currentLocation, setCurrentLocation] = useState(() => {
    const saved = localStorage.getItem('kiranago_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [savedAddresses, setSavedAddresses] = useState([
    DEFAULT_LOCATION,
    {
      addressLine: '45, 5th Block, Koramangala',
      area: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      lat: 12.9352,
      lng: 77.6245,
      type: 'Work'
    }
  ]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    localStorage.setItem('kiranago_location', JSON.stringify(currentLocation));
  }, [currentLocation]);

  // Use Current Location via Browser GPS & Reverse Geocoding
  const useCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode coordinates using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const address = data.address || {};
          const area = address.suburb || address.neighbourhood || address.residential || address.subdistrict || 'Current Area';
          const city = address.city || address.town || address.state_district || 'Bengaluru';
          const state = address.state || 'Karnataka';
          const pincode = address.postcode || '560001';
          const addressLine = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${area}, ${city}`;

          const newLoc = {
            addressLine,
            area,
            city,
            state,
            pincode,
            lat: latitude,
            lng: longitude,
            type: 'GPS'
          };

          setCurrentLocation(newLoc);
          setIsLocating(false);
        } catch (err) {
          // Fallback reverse geocode if network fails
          const fallbackLoc = {
            addressLine: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            area: 'Detected Location',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            lat: latitude,
            lng: longitude,
            type: 'GPS'
          };
          setCurrentLocation(fallbackLoc);
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access or select manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('GPS signal unavailable. Please select your location manually.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Could not retrieve location. Please search manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const selectAddress = (addr) => {
    setCurrentLocation(addr);
  };

  const addSavedAddress = (newAddr) => {
    setSavedAddresses(prev => [...prev, newAddr]);
    setCurrentLocation(newAddr);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        savedAddresses,
        isLocating,
        locationError,
        useCurrentLocation,
        selectAddress,
        addSavedAddress
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
