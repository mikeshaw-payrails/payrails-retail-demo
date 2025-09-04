import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Globe } from "lucide-react";
import { useLocationDetection, SUPPORTED_COUNTRIES } from "@/hooks/useLocationDetection";
import { useLocationContext } from "@/contexts/LocationContext";

export const LocationSelector = () => {
  const { location, loading, detectLocation, supportedCountries } = useLocationDetection();
  const { selectedLocation, setSelectedLocation } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleCountryChange = (countryCode: string) => {
    const country = supportedCountries.find(c => c.code === countryCode);
    if (country) {
      const newLocation = {
        country: country.name,
        countryCode: country.code,
        region: '',
        city: '',
        currency: country.currency,
        currencySymbol: country.currencySymbol
      };
      setSelectedLocation(newLocation);
      setIsOpen(false);
    }
  };

  const handleAutoDetect = async () => {
    await detectLocation();
    if (location && !selectedLocation) {
      setSelectedLocation(location);
    }
  };

  const currentLocation = selectedLocation || location;
  const currentCountry = supportedCountries.find(c => c.code === currentLocation?.countryCode);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-fashion-border hover:bg-fashion-subtle text-foreground"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {loading ? 'Detecting...' : (
            <>
              {currentCountry?.name || 'Select Location'}
              <span className="ml-2 text-muted-foreground">
                ({currentCountry?.currencySymbol}{currentCountry?.currency})
              </span>
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-fashion-surface border-fashion-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-serif">
            <Globe className="w-5 h-5" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Country / Region
            </label>
            <Select value={currentLocation?.countryCode || 'US'} onValueChange={handleCountryChange}>
              <SelectTrigger className="border-fashion-border focus:border-foreground bg-fashion-surface">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-fashion-surface border-fashion-border">
                {supportedCountries.map((country) => (
                  <SelectItem 
                    key={country.code} 
                    value={country.code}
                    className="hover:bg-fashion-subtle focus:bg-fashion-subtle"
                  >
                    {country.name} ({country.currencySymbol}{country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-fashion-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoDetect}
              disabled={loading}
              className="border-fashion-border hover:bg-fashion-subtle"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {loading ? 'Detecting...' : 'Auto-detect'}
            </Button>
            
            {location && (
              <div className="text-sm text-muted-foreground">
                Detected: {location.city}, {location.country}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};