import { useState, useEffect } from 'react';

export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  currencySymbol: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  regions: { code: string; name: string }[];
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    regions: [
      { code: 'NY', name: 'New York' },
      { code: 'CA', name: 'California' },
      { code: 'TX', name: 'Texas' },
      { code: 'FL', name: 'Florida' },
      { code: 'IL', name: 'Illinois' },
      { code: 'WA', name: 'Washington' }
    ]
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'د.إ',
    regions: [
      { code: 'DU', name: 'Dubai' },
      { code: 'AZ', name: 'Abu Dhabi' },
      { code: 'SH', name: 'Sharjah' },
      { code: 'AJ', name: 'Ajman' }
    ]
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    regions: [
      { code: 'RI', name: 'Riyadh' },
      { code: 'JE', name: 'Jeddah' },
      { code: 'DA', name: 'Dammam' },
      { code: 'ME', name: 'Medina' }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    regions: [
      { code: 'ENG', name: 'England' },
      { code: 'SCT', name: 'Scotland' },
      { code: 'WLS', name: 'Wales' },
      { code: 'NIR', name: 'Northern Ireland' }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    regions: [
      { code: 'BE', name: 'Berlin' },
      { code: 'BY', name: 'Bavaria' },
      { code: 'NW', name: 'North Rhine-Westphalia' },
      { code: 'HE', name: 'Hesse' }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    regions: [
      { code: 'IDF', name: 'Île-de-France' },
      { code: 'PAC', name: 'Provence-Alpes-Côte d\'Azur' },
      { code: 'ARA', name: 'Auvergne-Rhône-Alpes' },
      { code: 'OCC', name: 'Occitanie' }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    currencySymbol: '€',
    regions: [
      { code: 'LAZ', name: 'Lazio' },
      { code: 'LOM', name: 'Lombardy' },
      { code: 'CAM', name: 'Campania' },
      { code: 'SIC', name: 'Sicily' }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    regions: [
      { code: 'MD', name: 'Madrid' },
      { code: 'CT', name: 'Catalonia' },
      { code: 'AN', name: 'Andalusia' },
      { code: 'VC', name: 'Valencia' }
    ]
  }
];

// Currency conversion rates (in a real app, these would come from an API)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  AED: 3.67,
  SAR: 3.75,
  GBP: 0.79,
  EUR: 0.92
};

export const useLocationDetection = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use ipapi.co for IP geolocation (free tier allows 1000 requests/month)
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to detect location');
      }
      
      const data = await response.json();
      
      // Find supported country or default to US
      const countryConfig = SUPPORTED_COUNTRIES.find(
        country => country.code === data.country_code
      ) || SUPPORTED_COUNTRIES[0]; // Default to US
      
      const locationData: LocationData = {
        country: countryConfig.name,
        countryCode: countryConfig.code,
        region: data.region || '',
        city: data.city || '',
        currency: countryConfig.currency,
        currencySymbol: countryConfig.currencySymbol
      };
      
      setLocation(locationData);
    } catch (err) {
      console.error('Location detection failed:', err);
      setError('Failed to detect location');
      
      // Default to US if detection fails
      const defaultCountry = SUPPORTED_COUNTRIES[0];
      setLocation({
        country: defaultCountry.name,
        countryCode: defaultCountry.code,
        region: '',
        city: '',
        currency: defaultCountry.currency,
        currencySymbol: defaultCountry.currencySymbol
      });
    } finally {
      setLoading(false);
    }
  };

  const convertPrice = (price: number, fromCurrency = 'USD', toCurrency?: string): number => {
    if (!location && !toCurrency) return price;
    
    const targetCurrency = toCurrency || location?.currency || 'USD';
    
    if (fromCurrency === targetCurrency) return price;
    
    const fromRate = CURRENCY_RATES[fromCurrency] || 1;
    const toRate = CURRENCY_RATES[targetCurrency] || 1;
    
    return Math.round((price / fromRate) * toRate);
  };

  const formatPrice = (price: number, currency?: string): string => {
    const targetCurrency = currency || location?.currency || 'USD';
    const symbol = location?.currencySymbol || '$';
    const convertedPrice = convertPrice(price, 'USD', targetCurrency);
    
    return `${symbol}${convertedPrice}`;
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return {
    location,
    loading,
    error,
    detectLocation,
    convertPrice,
    formatPrice,
    supportedCountries: SUPPORTED_COUNTRIES
  };
};