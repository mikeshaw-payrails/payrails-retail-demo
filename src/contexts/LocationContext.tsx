import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationData, SUPPORTED_COUNTRIES } from '@/hooks/useLocationDetection';

interface LocationContextType {
  selectedLocation: LocationData | null;
  setSelectedLocation: (location: LocationData) => void;
  getCountryConfig: (countryCode: string) => any;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const getCountryConfig = (countryCode: string) => {
    return SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  };

  useEffect(() => {
    // Try to get saved location from localStorage
    const saved = localStorage.getItem('selectedLocation');
    if (saved) {
      try {
        setSelectedLocation(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved location:', e);
      }
    }
  }, []);

  const handleSetLocation = (location: LocationData) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', JSON.stringify(location));
  };

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      setSelectedLocation: handleSetLocation,
      getCountryConfig
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};