import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocationDetection, SUPPORTED_COUNTRIES } from "@/hooks/useLocationDetection";
import { useLocationContext } from "@/contexts/LocationContext";

const CustomerForm = () => {
  const { location } = useLocationDetection();
  const { selectedLocation } = useLocationContext();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });

  // Auto-populate form based on selected or detected location
  useEffect(() => {
    const currentLocation = selectedLocation || location;
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        country: currentLocation.countryCode,
        city: currentLocation.city,
        state: currentLocation.region
      }));
    }
  }, [location, selectedLocation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === formData.country);
  const availableRegions = selectedCountry?.regions || [];

  // Country-specific field configurations
  const getFieldLabels = (countryCode: string) => {
    switch (countryCode) {
      case 'US':
        return { state: 'State', zipCode: 'ZIP Code', address2: 'Apartment, suite, etc. (optional)' };
      case 'AE':
      case 'SA':
        return { state: 'Emirate/Province', zipCode: 'Postal Code', address2: 'Building, apartment, etc. (optional)' };
      case 'GB':
        return { state: 'County', zipCode: 'Postcode', address2: 'Flat, apartment, etc. (optional)' };
      case 'DE':
      case 'FR':
      case 'IT':
      case 'ES':
        return { state: 'State/Region', zipCode: 'Postal Code', address2: 'Apartment, floor, etc. (optional)' };
      default:
        return { state: 'State/Province', zipCode: 'Postal Code', address2: 'Apartment, suite, etc. (optional)' };
    }
  };

  const fieldLabels = getFieldLabels(formData.country);

  return (
    <div className="bg-fashion-surface rounded-sm p-8 border border-fashion-border">
      <h2 className="text-lg font-medium text-foreground mb-6 font-serif">Contact & Delivery</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            placeholder="your@email.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-2 block">
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-2 block">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium text-foreground mb-2 block">
            Street Address
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
          />
        </div>

        <div>
          <Label htmlFor="address2" className="text-sm font-medium text-foreground mb-2 block">
            {fieldLabels.address2}
          </Label>
          <Input
            id="address2"
            value={formData.address2}
            onChange={(e) => handleInputChange("address2", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
          />
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-medium text-foreground mb-2 block">
            Country
          </Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
            <SelectTrigger className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="bg-fashion-surface border-fashion-border">
              {SUPPORTED_COUNTRIES.map((country) => (
                <SelectItem 
                  key={country.code} 
                  value={country.code}
                  className="hover:bg-fashion-subtle focus:bg-fashion-subtle"
                >
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-foreground mb-2 block">
              City
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-medium text-foreground mb-2 block">
              {fieldLabels.state}
            </Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
              <SelectTrigger className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-fashion-surface border-fashion-border">
                {availableRegions.map((region) => (
                  <SelectItem 
                    key={region.code} 
                    value={region.code}
                    className="hover:bg-fashion-subtle focus:bg-fashion-subtle"
                  >
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium text-foreground mb-2 block">
              {fieldLabels.zipCode}
            </Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;