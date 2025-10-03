import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

import "@payrails/web-sdk/payrails-styles.css";
import {
  CardFormOptions,
  Payrails,
  PayrailsEnvironment,
} from "@payrails/web-sdk";
import { CustomerOrderData } from "@/types/checkout";
import { CART_ITEMS } from "@/lib/cart";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface ElementsIntegrationProps {
  amount: number;
  currency: string;
  customerOrderData?: CustomerOrderData;
}

const ElementsIntegration = ({
  amount,
  currency,
  customerOrderData,
}: ElementsIntegrationProps) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  });
  const { toast } = useToast();
  const { selectedLocation } = useLocationContext();
  const { convertPrice } = useLocationDetection();

  useEffect(() => {
    // Mock Payrails Elements SDK initialization
    const initializeElements = async () => {
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
        console.debug('[Elements] Meta payload sent to backend', metaPayload);

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

          // card for,m
          const cardFormElement = payrailsClient.cardForm(cardFormOptions);
          cardFormElement.mount("#card-form-container");

          // payment button
          const paymentButton = payrailsClient.paymentButton({
            translations: {
              label: 'Complete Purchase',
            },
            disabledByDefault: false, // default is false
            events: {
              onAuthorizeSuccess: () => {
                console.log('yay!');
              },
              onAuthorizeFailed: (e) => {
                console.log('nah :(', e);
              },
              onPaymentButtonClicked: (e) => {
                console.log('clicked', e);
                // If resolved to false authorization will not be triggered
                return Promise.resolve(true);
              },
              onPaymentSessionExpired() {
                console.log('session expired');
                // dropin has to be initialized with new workflow execution, contact your backend
              },
              onThreeDSecureChallenge() {
                console.log('3ds initiated');
                // triggered when 3DS challenge starts
              },
              onStateChanged(state: 'enabled' | 'disabled') {
                console.log(state);
                //triggered when button change the state from enabled to disabled
              }
            },
            styles: {
              base: {
                width: '100%',
                border: '1px solid transparent',
                borderRadius: '8px',
                backgroundColor: '#1f1f1f',
                borderColor: 'transparent',
                color: '#fff',
                padding: '8px 24px',
                fontSize: '14px',
                minHeight: '44px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              disabled: {
                backgroundColor: '#d8dfe6',
                color: '#52667d',
              },
              hover: {
                backgroundColor: '#000',
              },
            },
          });
          paymentButton.mount('#payment-button-container');

          const googlePayButton = payrailsClient.googlePayButton({
            environment: 'TEST' as PayrailsEnvironment,
            showStoreInstrumentCheckbox: false,
            merchantInfo: {
              merchantId: `order_${uuidv4()}`,
              merchantName: `order_${uuidv4()}`,
            },
            styles: {
              buttonType: 'pay',
              buttonSizeMode: 'fill',
            },
            translations: {
            },
            events: {
              // Same as payment button
            }
          });

          googlePayButton.mount('#google-pay-button-container');

          // Apple pay button
          const applePayButton = payrailsClient.applePayButton({
            showStoreInstrumentCheckbox: false,
            events: {
              // same as payment button
            },
            styles: {
              type: 'buy',
              style: 'black',
            }

          });

          applePayButton.mount('#apple-pay-button-container');

          // paypal
          const paypalButton = payrailsClient.paypalButton({
            showStoreInstrumentCheckbox: false, // default false
            alwaysStoreInstrument: false, // default false
            styles: {
              color: "black",
              height: 30,
              label: "pay",
              shape: "rect",
              tagline: false,
            },
            events: {
              // same as payment button
            },
            translations: {
              labels: {
                saveInstrument: 'string'
              },
            }
          });

          paypalButton.mount('#paypal-button-container');
        }
      } catch (error) {
        console.error("Failed to initialize Elements:", error);
      }
    };

    initializeElements();
  }, [amount, currency, customerOrderData, selectedLocation, convertPrice]);

  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMockPayment = () => {
    if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
      toast({
        title: "Validation Required",
        description: "Please complete all payment fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing Payment",
      description: "Completing your transaction...",
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
        <h3 className="text-lg font-medium text-foreground mb-2 font-serif">
          Elements Payment
        </h3>
        <p className="text-sm text-muted-foreground font-light">
          Individual secure payment components for custom experiences
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Pay Button */}
        <div id="google-pay-button-container" className="mb-6"></div>
        <div id="apple-pay-button-container" className="mb-6"></div>
        <div id="paypal-button-container" className="mb-6"></div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-fashion-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-fashion-surface px-2 text-muted-foreground">
              or pay with card
            </span>
          </div>
        </div>

        {/* <div> */}
        <div id="card-form-container"></div>
        {/* <Label
            htmlFor="nameOnCard"
            className="text-sm font-medium text-foreground mb-2 block"
          >
            Cardholder Name
          </Label>
          <Input
            id="nameOnCard"
            value={paymentData.nameOnCard}
            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
            className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-surface"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Card Number
          </Label>
          <div className="relative">
            <Input
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              placeholder="1234 1234 1234 1234"
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-subtle"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground font-light">
              Secure Element
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Expiry Date
            </Label>
            <Input
              value={paymentData.expiry}
              onChange={(e) => handleInputChange("expiry", e.target.value)}
              placeholder="MM/YY"
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-subtle"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              CVV
            </Label>
            <Input
              value={paymentData.cvv}
              onChange={(e) => handleInputChange("cvv", e.target.value)}
              placeholder="123"
              className="border-fashion-border focus:border-foreground focus:ring-0 bg-fashion-subtle"
            />
          </div>
        </div> */}

        <div className="p-4 bg-fashion-accent rounded-sm">
          <p className="text-xs text-muted-foreground font-light">
            🔒 Demo: Secure elements would replace standard inputs with
            tokenized payment fields
          </p>
        </div>
        <div id="payment-button-container"></div>
      </div>
    </div>
  );
};

export default ElementsIntegration;
