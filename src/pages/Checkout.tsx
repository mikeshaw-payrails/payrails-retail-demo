import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckoutSummary from "@/components/CheckoutSummary";
import CustomerForm from "@/components/CustomerForm";
import PaymentIntegrationToggle from "@/components/PaymentIntegrationToggle";
import DropInIntegration from "@/components/payment/DropInIntegration";
import ElementsIntegration from "@/components/payment/ElementsIntegration";
import SecureFieldsIntegration from "@/components/payment/SecureFieldsIntegration";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";

type IntegrationType = "dropin" | "elements" | "secure-fields";

const Checkout = () => {
  const [activeIntegration, setActiveIntegration] = useState<IntegrationType>("dropin");
  const { selectedLocation } = useLocationContext();
  const { convertPrice } = useLocationDetection();

  // Calculate basket total
  const basketData = useMemo(() => {
    const items = [
      { id: 1, price: 185.00, quantity: 1 },
      { id: 2, price: 45.00, quantity: 2 },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const currency = selectedLocation?.currency || 'USD';
    const amount = selectedLocation
      ? convertPrice(total, 'USD', currency)
      : total;

    return { amount, currency };
  }, [selectedLocation, convertPrice]);

  const renderPaymentIntegration = () => {
    switch (activeIntegration) {
      case "dropin":
        return <DropInIntegration amount={basketData.amount} currency={basketData.currency} />;
      case "elements":
        return <ElementsIntegration amount={basketData.amount} currency={basketData.currency} />;
      case "secure-fields":
        return <SecureFieldsIntegration amount={basketData.amount} currency={basketData.currency} />;
      default:
        return <DropInIntegration amount={basketData.amount} currency={basketData.currency} />;
    }
  };

  return (
    <div className="min-h-screen bg-fashion-bg font-sans">
      {/* Header */}
      <header className="bg-fashion-surface border-b border-fashion-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-fashion-subtle" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <h1 className="text-xl font-light text-foreground font-serif">Checkout</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-light text-foreground font-serif">ATELIER</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            <CustomerForm />
            <PaymentIntegrationToggle
              activeType={activeIntegration}
              onTypeChange={setActiveIntegration}
            />
            {renderPaymentIntegration()}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-8">
            <CheckoutSummary />

            {/* Security Badge */}
            <div className="bg-fashion-surface rounded-sm p-6 border border-fashion-border">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-fashion-subtle rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Secure Transaction</h3>
                  <p className="text-xs text-muted-foreground font-light">
                    Protected by enterprise-grade encryption and PCI DSS compliance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;