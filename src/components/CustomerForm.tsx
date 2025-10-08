import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocationDetection, SUPPORTED_COUNTRIES } from "@/hooks/useLocationDetection";
import { useLocationContext } from "@/contexts/LocationContext";

interface CustomerOrderData {
  customer: {
    email: string;
    lastName: string;
    name: string; // combined first + last
    phone: {
      number: string;
    };
  };
  order: {
    billingAddress: {
      // Name associated with the billing address (duplicated from customer.name for payment provider)
      name?: string;
      city: string;
      country: { code: string };
      postalCode: string;
      state: string;
    };
  };
}

interface CustomerFormProps {
  onChange?: (data: CustomerOrderData) => void;
}

const CustomerForm = ({ onChange }: CustomerFormProps) => {
  const { location } = useLocationDetection();
  const { selectedLocation } = useLocationContext();
  const [formData, setFormData] = useState({
    email: "jane.doe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });

  // Fields that can be auto-filled with fake data
  type AutoFillField = 'phone' | 'address' | 'city' | 'state' | 'zipCode';
  const AUTO_FILL_FIELDS: readonly AutoFillField[] = useMemo(() => ['phone', 'address', 'city', 'state', 'zipCode'] as const, []);

  // Track which fields are still considered auto-filled (i.e. user hasn't overridden)
  const [autoFilled, setAutoFilled] = useState<Record<AutoFillField, boolean>>({
    phone: true,
    address: true,
    city: true,
    state: true,
    zipCode: true
  });

  // Fake data mapping per country for phone & address when user hasn't typed anything yet
  interface FakeDataEntry { phone: string; address: string; city: string; state: string; zipCode: string; }
  type CountryFakeDataMap = Record<string, FakeDataEntry>;
  const COUNTRY_FAKE_DATA: CountryFakeDataMap = useMemo(() => ({
    US: { phone: "+1 555 123 4567", address: "123 Market St", city: "San Francisco", state: "CA", zipCode: "94105" },
    GB: { phone: "+44 20 7946 0958", address: "221B Baker Street", city: "London", state: "London", zipCode: "NW1 6XE" },
    DE: { phone: "+49 30 123456", address: "Unter den Linden 5", city: "Berlin", state: "BE", zipCode: "10117" },
    FR: { phone: "+33 1 23 45 67 89", address: "10 Rue de Rivoli", city: "Paris", state: "Paris", zipCode: "75001" },
    AE: { phone: "+971 4 123 4567", address: "99 Sheikh Zayed Rd", city: "Dubai", state: "DXB", zipCode: "00000" },
    SA: { phone: "+966 11 123 4567", address: "King Fahd Rd 250", city: "Riyadh", state: "RIY", zipCode: "11564" },
    ES: { phone: "+34 91 123 4567", address: "Gran Via 18", city: "Madrid", state: "MD", zipCode: "28013" },
    IT: { phone: "+39 06 6992 1234", address: "Via del Corso 12", city: "Rome", state: "RM", zipCode: "00186" }
  }), []);

  // Auto-populate form based on selected or detected location
  useEffect(() => {
    const currentLocation = selectedLocation || location;
    if (currentLocation) {
      setFormData(prev => {
        const countryCode = currentLocation.countryCode || prev.country;
        const fake = COUNTRY_FAKE_DATA[countryCode];
        const next = {
          ...prev,
          country: countryCode,
          city: prev.city || currentLocation.city || fake?.city || prev.city,
          state: prev.state || currentLocation.region || fake?.state || prev.state,
          phone: prev.phone || fake?.phone || prev.phone,
          address: prev.address || fake?.address || prev.address,
          zipCode: prev.zipCode || fake?.zipCode || prev.zipCode
        };

        // Update autoFilled flags for any field we just populated from empty
        setAutoFilled(flags => {
          let changed = false;
          const updated = { ...flags };
          AUTO_FILL_FIELDS.forEach(f => {
            if (prev[f] === '' && next[f] !== '') {
              if (!updated[f]) changed = true;
              updated[f] = true; // we auto-filled it
            }
          });
          return changed ? updated : flags;
        });

        return next;
      });
    }
  }, [location, selectedLocation, COUNTRY_FAKE_DATA, AUTO_FILL_FIELDS]);

  // When country field changes (user manually selects), refresh fake defaults if fields empty
  useEffect(() => {
    const fake = COUNTRY_FAKE_DATA[formData.country];
    if (!fake) return;
    setFormData(prev => {
      const next = { ...prev };
      let anyChanged = false;
      AUTO_FILL_FIELDS.forEach(field => {
        if (autoFilled[field] || prev[field] === '') {
          const newVal = fake[field];
          if (next[field] !== newVal) {
            (next as typeof next)[field] = newVal;
            anyChanged = true;
          }
        }
      });
      if (anyChanged) {
        setAutoFilled(flags => {
          const updated = { ...flags };
          AUTO_FILL_FIELDS.forEach(f => { updated[f] = true; });
          return updated;
        });
      }
      return anyChanged ? next : prev;
    });
  }, [formData.country, COUNTRY_FAKE_DATA, autoFilled, AUTO_FILL_FIELDS]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (AUTO_FILL_FIELDS.includes(field as AutoFillField)) {
      setAutoFilled(prev => ({ ...prev, [field]: false }));
    }
  };

  // Emit structured data upwards whenever form changes
  useEffect(() => {
    if (!onChange) return;
    const payload: CustomerOrderData = {
      customer: {
        email: formData.email,
        lastName: formData.lastName,
        name: `${formData.firstName}`,
        phone: {
          number: formData.phone,
        },
      },
      order: {
        billingAddress: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          city: formData.city,
          country: { code: formData.country },
          postalCode: formData.zipCode,
          state: formData.state,
        },
      },
    };
    onChange(payload);
  }, [formData, onChange]);

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

        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
            placeholder="+1 555 123 4567"
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