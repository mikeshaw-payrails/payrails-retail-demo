import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { v4 as uuidv4 } from "uuid";

import "@payrails/web-sdk/payrails-styles.css";
import {
  CardFormOptions,
  ElementType,
  Payrails,
  PayrailsEnvironment,
} from "@payrails/web-sdk";
import { CustomerOrderData } from "@/types/checkout";
import { CART_ITEMS } from "@/lib/cart";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface SecureFieldsIntegrationProps {
  amount: number;
  currency: string;
  customerOrderData?: CustomerOrderData;
}

const SecureFieldsIntegration = ({ amount, currency, customerOrderData }: SecureFieldsIntegrationProps) => {
  const [customerData, setCustomerData] = useState({
    nameOnCard: "",
    billingAddress: ""
  });
  const { toast } = useToast();
  const { selectedLocation } = useLocationContext();
  const { convertPrice } = useLocationDetection();

  useEffect(() => {
    // Mock Payrails Secure Fields SDK initialization
    const initializeSecureFields = async () => {
      try {
        const apiURL = import.meta.env.VITE_API_URL;

        const lineItems = CART_ITEMS.map(item => {
          const unit = convertPrice(item.price, 'USD', currency);
          const total = unit * item.quantity;
          return {
            name: item.name,
            quantity: item.quantity,
            unitPrice: { value: unit.toString() },
            total: { value: total.toString() }
          };
        });

        const metaPayload = {
          order: {
            ...customerOrderData?.order,
            lines: lineItems,
          },
          customer: {
            ...customerOrderData?.customer,
            country: { code: selectedLocation?.countryCode || customerOrderData?.order.billingAddress.country.code || 'US' }
          },
        };
        console.debug('[SecureFields] Meta payload sent to backend', metaPayload);

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
              currency: currency,
            },
            meta: metaPayload,
            type: "dropIn",
            holderReference: "customer_123456789", // Fake the Customer ID as this is a demo
            workflowCode: "payment-acceptance",
            merchantReference: `o_${uuidv4()}`
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
            `API request failed: ${response.status} ${response.statusText
            }\nDetails: ${JSON.stringify(errorDetails)}`
          );
        }

        const clientConfiguration = await response.json();
        console.log("Client configuration:", clientConfiguration);

        const cardFormOptions: CardFormOptions = {
          showCardHolderName: true,
          showStoreInstrumentCheckbox: true,
          showSingleExpiryDateField: false,

          events: {},
          styles: {
            wrapper: {
              height: "min-content",
            },
            base: {
              fontSize: "1em",
              outline: "none",
              boxSizing: "border-box",
              display: "block",
              height: "min-content",
            },
            storeCardCheckbox: {
              marginTop: "16px",
            },
            inputFields: {
              all: {
                base: {
                  borderTop: "1px solid #D3D3D3",
                  borderLeft: "1px solid #D3D3D3",
                  borderRight: "1px solid #D3D3D3",
                  borderBottom: "1px solid #D3D3D3",
                  borderRadius: "8px",
                  padding: "0.8rem",
                  boxSizing: "border-box",
                  marginTop: "8px",
                },
              },
              CARDHOLDER_NAME: {
                base: {
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                },
              },
              CVV: {
                base: {
                  borderRadius: "8px",
                  borderBottomRightRadius: "8px",
                  marginLeft: "0.7rem",
                  maxWidth: "calc(66% - 0.5rem)",
                },
              },
              EXPIRATION_DATE: {
                base: {
                  borderRadius: "8px",
                  borderBottomRightRadius: "8px",
                  maxWidth: "calc(80% - 0.5rem)",
                },
              },
              EXPIRATION_YEAR: {
                base: {
                  marginLeft: "0.3rem",
                  maxWidth: "calc(90% - 0.3rem)",
                },
              },
            },
            labels: {
              all: {
                fontKerning: "normal",
                fontFamily: "Inter, system-ui, sans-serif",
                border: "0",
                fontStyle: "normal",
                margin: "0",
                padding: "0",
                verticalAlign: "baseline",
                fontSize: "1rem",
                fontWeight: "400",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color .1s ease-out",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
                color: "#3e3e3e",
                marginTop: "8px",
              },
              CVV: {
                marginLeft: "0.5rem",
              },
            },

            addressSelector: {
              wrapper: {
                display: "flex",
                flexDirection: "row",
                gap: "8px",
              },
              countrySelector: {
                wrapper: {
                  flexDirection: "column",
                },
                element: {
                  border: "1px solid #D3D3D3",
                  borderRadius: "8px",
                  padding: "0.8rem",
                  boxShadow: "none",
                  height: "fit-content",
                  margin: "0px",
                },
              },
              postalCodeInput: {
                wrapper: {
                  flexDirection: "column",
                },
                element: {
                  maxWidth: "40%",
                  padding: "8px",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  border: "1px solid #D3D3D3",
                },
              },
            },
          },
        };

        if (Payrails) {
          const payrailsClient = Payrails.init(clientConfiguration.data, {
            environment: PayrailsEnvironment.TEST,
          });

          const container = payrailsClient.collectContainer({
            containerType: 'COLLECT'
          });

          // Card holder name field
          const cardHolderName = container.createCollectElement({
            inputStyles: {
              base: {
                borderTop: "1px solid #D3D3D3",
                borderLeft: "1px solid #D3D3D3",
                borderRight: "1px solid #D3D3D3",
                borderBottom: "1px solid #D3D3D3",
                borderRadius: "8px",
                padding: "0.8rem",
                boxSizing: "border-box",
                marginTop: "8px",
              },
              cardIcon: {
                display: "none"
              },
            },
            labelStyles: {
              base: {
                fontSize: "12px",
                fontWeight: "bold",
              },
            },
            errorTextStyles: {
              base: {
                color: "#f44336",
              },
            },
            placeholder: "",

            type: ElementType.CARD_NUMBER,
          });
          cardHolderName.mount("#cardHolderName");

          // Card number field
          const cardNumber = container.createCollectElement({
            inputStyles: {
              base: {
                border: "none",
                textIndent: "0px",
              },
              cardIcon: {
                display: "none"
              },
            },
            labelStyles: {
              base: {
                fontSize: "12px",
                fontWeight: "bold",
              },
            },
            errorTextStyles: {
              base: {
                color: "#f44336",
              },
            },
            placeholder: "1234 1234 1234 1234",

            type: ElementType.CARD_NUMBER,
          });
          cardNumber.mount("#cardNumber");

          // Expiration month field
          const expirationMonth = container.createCollectElement({
            inputStyles: {
              base: {
                border: "none",
              },
              cardIcon: {
                display: "none"
              },
            },
            labelStyles: {
              base: {
                fontSize: "12px",
                fontWeight: "bold",
              },
            },
            errorTextStyles: {
              base: {
                color: "#f44336",
              },
            },
            placeholder: "MM",

            type: ElementType.EXPIRATION_MONTH,
          });
          expirationMonth.mount("#expirationMonth");

          // Expiration year field
          const expirationYear = container.createCollectElement({
            inputStyles: {
              base: {
                border: "none",
              },
              cardIcon: {
                display: "none"
              },
            },
            labelStyles: {
              base: {
                fontSize: "12px",
                fontWeight: "bold",
              },
            },
            errorTextStyles: {
              base: {
                color: "#f44336",
              },
            },
            placeholder: "YY",

            type: ElementType.EXPIRATION_YEAR,
          });
          expirationYear.mount("#expirationYear");

          // Expiration year field
          const cvv = container.createCollectElement({
            inputStyles: {
              base: {
                border: "none",
              },
              cardIcon: {
                display: "none"
              },
            },
            labelStyles: {
              base: {
                fontSize: "12px",
                fontWeight: "bold",
              },
            },
            errorTextStyles: {
              base: {
                color: "#f44336",
              },
            },
            placeholder: "123",

            type: ElementType.CVV,
          });
          cvv.mount("#cvv");

        }

        console.log("🔧 Secure Fields SDK would be initialized here");
      } catch (error) {
        console.error("Failed to initialize Secure Fields:", error);
      }
    };

    initializeSecureFields();
  }, [amount, currency, customerOrderData, selectedLocation, convertPrice]);

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
          {/* <Input
            id="nameOnCard"
            value={customerData.nameOnCard}
            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
          /> */}
          <div id="cardHolderName"></div>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Card Number
          </Label>
          <div
            id="secure-card-number"
            className="min-h-[48px] p-3 border border-fashion-border rounded-sm bg-fashion-subtle flex items-center"
          >
            {/* <div className="flex items-center justify-between w-full">
              <span className="text-muted-foreground text-sm font-light">Secure Tokenized Field</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success font-medium">Protected</span>
              </div>
            </div> */}
            <div id="cardNumber" className="w-full"></div>
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
              {/* <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground text-sm font-light">MM/YY</span>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div> */}
              <div className="flex space-x-2 w-full">
                <div id="expirationMonth" className="w-1/2"></div>
                <div id="expirationYear" className="w-1/2"></div>
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
              {/* <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground text-sm font-light">•••</span>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div> */}
              <div id="cvv" className="w-full"></div>
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