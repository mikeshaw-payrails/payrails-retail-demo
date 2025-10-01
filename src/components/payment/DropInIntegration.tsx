import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

import '@payrails/web-sdk/payrails-styles.css'
import { DropinOptions, Payrails, PayrailsEnvironment } from '@payrails/web-sdk';


interface DropInIntegrationProps {
  amount: number;
  currency: string;
}

const DropInIntegration = ({ amount, currency }: DropInIntegrationProps) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [cardData, setCardData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('Payment details for Drop-in:', { amount, currency });

    const initializeDropInElement = async () => {
      try {
        const apiURL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiURL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-key": "lWQVRFIEtFWS0tLS0tCk1JSUpRZ0lCQURBTkJna3",
          },
          body: JSON.stringify({
            workSpaceId: "7f9f1882-a103-408d-ac96-46a7021e537a",
            amount: {
              value: amount.toString(),
              currency: currency
            },
            type: "dropIn",
            holderReference: "customer_123456789", // Fake the Customer ID as this is a demo
            workflowCode: "payment-acceptance",
            merchantReference: `order_${uuidv4()}`,
          }),
        });

        // ✅ Check if response is not ok
        if (!response.ok) {
          // Try to parse error details if available
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch {
            errorDetails = await response.text();
          }

          throw new Error(
            `API request failed: ${response.status} ${response.statusText}\nDetails: ${JSON.stringify(
              errorDetails
            )}`
          );
        }

        const clientConfiguration = await response.json();
        console.log("Client configuration:", clientConfiguration);

        const dropInConfiguration: DropinOptions = {
          paymentMethodsConfiguration: {
            cards: {
              showCardHolderName: true,
              showStoreInstrumentCheckbox: true,
              showStoredInstruments: true,
              showExistingCards: true,
            }
          },
          events: {
            onAuthorizeSuccess: (event) => {
              console.log("Payment authorized successfully:", event);
              navigate('/order-confirmation');
              return Promise.resolve(true);
            },
          },
          styles: {
            container: {
              styles: {
                background: '#f8f6f3', // matches bg-fashion-surface
                borderRadius: '0.375rem', // rounded-sm
                padding: '1.5rem', // p-6
                border: '1px solid #e5e3df', // border-fashion-border
              },
            },
            element: {
              base: {
                color: '#222', // text-foreground
                fontFamily: 'serif', // font-serif
                fontSize: '1rem', // text-lg
                fontWeight: '500', // font-medium
              },
              active: {
                color: '#c09e6b', // accent color for active
              },
            },
            cardForm: {
              wrapper: {
                background: '#fff',
                borderRadius: '0.375rem',
                border: '1px solid #e5e3df',
                padding: '1rem',
              },
              base: {
                color: '#222',
                fontFamily: 'serif',
              },
              errorTextStyles: {
                base: {
                  color: '#c0392b', // error color
                  fontSize: '0.875rem',
                },
              },
              inputFields: {
                all: {
                  complete: {
                    background: '#f8f6f3',
                  },
                  focus: {
                    borderColor: '#c09e6b',
                  },
                  invalid: {
                    borderColor: '#c0392b',
                  },
                },
              },
              labels: {
                all: {
                  color: '#222',
                  fontWeight: '500',
                },
              },
            },
            cardPaymentButton: {
              base: {
                background: '#c09e6b', // matches bg-primary
                color: '#fff', // text-primary-foreground
                fontWeight: '500',
                padding: '0.75rem 0', // py-3
                borderRadius: '0.375rem',
                fontSize: '1rem',
                letterSpacing: '0.05em', // tracking-wide
              },
              hover: {
                background: '#b08a5a', // matches bg-primary-hover
              },
              disabled: {
                background: '#e5e3df',
                color: '#aaa',
              },
            },
          }
        }

        if (Payrails) {
          const payrailsClient = Payrails.init(clientConfiguration.data, { environment: PayrailsEnvironment.TEST });
          const dropIn = payrailsClient.dropin(dropInConfiguration);
          dropIn.mount("#dropin-container");
        }

        // Do something with clientConfiguration...
      } catch (error) {
        console.error("Error initializing Drop-in:", error);
        // Optionally bubble up or show UI feedback
      }
    };

    initializeDropInElement();
  }, [amount, currency]);

  const handleCardInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleMockPayment = () => {
    if (selectedMethod === "card" && (!cardData.cardHolder || !cardData.cardNumber || !cardData.expiry || !cardData.cvv)) {
      toast({
        title: "Validation Required",
        description: "Please complete all card details",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Processing Payment",
      description: `Completing your ${selectedMethod} transaction...`,
    });

    setTimeout(() => {
      navigate('/order-confirmation');
    }, 2000);
  };

  return (

    <div className="bg-fashion-surface rounded-sm p-6 border border-fashion-border">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-2 font-serif">Drop In Payment</h3>
        <p className="text-sm text-muted-foreground font-light">
          Complete pre-built checkout widget with sophisticated design
        </p>
      </div>

      <div id="dropin-container" className="mb-6" data-testid="dropin-container">
        {/* Payrails Drop In widget will be mounted here */}
      </div>
    </div>
  );
};

export default DropInIntegration;