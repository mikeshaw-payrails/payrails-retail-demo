import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SecureFieldsIntegrationProps {
  amount: number;
  currency: string;
}

const SecureFieldsIntegration = ({ amount, currency }: SecureFieldsIntegrationProps) => {
  const [customerData, setCustomerData] = useState({
    nameOnCard: "",
    billingAddress: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Mock Payrails Secure Fields SDK initialization
    const initializeSecureFields = async () => {
      try {
        console.log('Payment details for Secure Fields:', { amount, currency });

        // TODO: Replace with actual Payrails SDK
        /*
        const payrails = await PayrailsSDK.create({
          publishableKey: process.env.PAYRAILS_PUBLISHABLE_KEY,
          environment: 'sandbox'
        });

        const secureFields = payrails.secureFields({
          amount,
          currency,
          theme: {
            base: {
              fontSize: '16px',
              color: '#1f1f1f',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '400',
              backgroundColor: '#ffffff'
            },
            focus: {
              borderColor: '#1f1f1f',
              backgroundColor: '#fafafa'
            }
          }
        });

        // Create secure fields
        const cardNumberField = secureFields.create('cardNumber');
        const expiryField = secureFields.create('expiryDate');
        const cvvField = secureFields.create('cvv');

        // Mount to secure containers
        cardNumberField.mount('#secure-card-number');
        expiryField.mount('#secure-expiry');
        cvvField.mount('#secure-cvv');

        // Setup event listeners
        cardNumberField.on('change', (event) => {
          if (event.error) {
            console.error('Card number error:', event.error);
          }
        });
        */

        console.log("🔧 Secure Fields SDK would be initialized here");
      } catch (error) {
        console.error("Failed to initialize Secure Fields:", error);
      }
    };

    initializeSecureFields();
  }, [amount, currency]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleMockPayment = () => {
    if (!customerData.nameOnCard) {
      toast({
        title: "Validation Required",
        description: "Please complete required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Processing Payment",
      description: "Completing your secure transaction...",
    });

    setTimeout(() => {
      toast({
        title: "Payment Confirmed",
        description: "Your order has been successfully processed.",
      });
    }, 2000);
  };

  return (
    <div className="bg-fashion-surface rounded-sm p-6 border border-fashion-border">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-2 font-serif">Secure Fields Payment</h3>
        <p className="text-sm text-muted-foreground font-light">
          Maximum security with tokenized payment fields
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="nameOnCard" className="text-sm font-medium text-foreground mb-2 block">
            Cardholder Name
          </Label>
          <Input
            id="nameOnCard"
            value={customerData.nameOnCard}
            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Card Number
          </Label>
          <div
            id="secure-card-number"
            className="min-h-[48px] p-3 border border-fashion-border rounded-sm bg-fashion-subtle flex items-center"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-muted-foreground text-sm font-light">Secure Tokenized Field</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success font-medium">Protected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Expiry Date
            </Label>
            <div
              id="secure-expiry"
              className="min-h-[48px] p-3 border border-fashion-border rounded-sm bg-fashion-subtle flex items-center"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground text-sm font-light">MM/YY</span>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              CVV
            </Label>
            <div
              id="secure-cvv"
              className="min-h-[48px] p-3 border border-fashion-border rounded-sm bg-fashion-subtle flex items-center"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground text-sm font-light">•••</span>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-fashion-accent rounded-sm">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Enterprise Security</h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Payment data is tokenized at point of entry. Zero exposure to your infrastructure with full PCI DSS compliance managed by the payment platform.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleMockPayment}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground py-3 font-medium tracking-wide"
          size="lg"
        >
          Complete Purchase
        </Button>
      </div>
    </div>
  );
};

export default SecureFieldsIntegration;