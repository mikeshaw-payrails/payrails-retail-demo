import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

import "@payrails/web-sdk/payrails-styles.css";
import {
  DropinOptions,
  Payrails,
  PayrailsEnvironment,
} from "@payrails/web-sdk";

import { CustomerOrderData } from "@/types/checkout";
import { CART_ITEMS } from "@/lib/cart";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface DropInIntegrationProps {
  amount: number;
  currency: string;
  customerOrderData?: CustomerOrderData;
}

const DropInIntegration = ({ amount, currency, customerOrderData }: DropInIntegrationProps) => {
  const navigate = useNavigate();
  const { selectedLocation } = useLocationContext();
  const { convertPrice } = useLocationDetection();
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [cardData, setCardData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log("Payment details for Drop-in:", { amount, currency, customerOrderData });

    const initializeDropInElement = async () => {
      try {
        const apiURL = import.meta.env.VITE_API_URL;
        const orderId = `o_${uuidv4()}`;

        // Build line items in selected currency
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
            reference: orderId,
            ...customerOrderData?.order,
            lines: lineItems,
          },
          customer: {
            ...customerOrderData?.customer,
            country: { code: selectedLocation?.countryCode || customerOrderData?.order.billingAddress.country.code || 'US' }
          },
          clientContext: {
            ipAddress: "127.0.0.1",
            userAgent: "Chrome",
            language: "en-EN",
            deviceFingerprint: "123"
          },
          risk: {
            sessionId: "111111111",
          }
        };
        console.debug('[DropIn] Meta payload sent to backend', metaPayload);

        const body = JSON.stringify({
          workSpaceId: "7f9f1882-a103-408d-ac96-46a7021e537a",
          amount: {
            value: amount.toString(),
            currency: currency,
          },
          meta: metaPayload,
          type: "dropIn",
          holderReference: "customer_123456789", // Fake the Customer ID as this is a demo
          workflowCode: "payment-acceptance",
          merchantReference: orderId,
        })

        console.log("Request body for Drop-in:", body);

        const response = await fetch(`${apiURL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-key": "lWQVRFIEtFWS0tLS0tCk1JSUpRZ0lCQURBTkJna3",
          },
          body: body,
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

        const dropInConfiguration: DropinOptions = {
          paymentMethodsConfiguration: {
            cards: {
              showCardHolderName: false,
              showStoreInstrumentCheckbox: false,
              showStoredInstruments: false,
              showExistingCards: false,
            },
          },
          events: {
            onAuthorizeSuccess: (event) => {
              console.log("Payment authorized successfully:", event);
              navigate("/order-confirmation");
              return Promise.resolve(true);
            },
          },
          translations: {
            klarna: {
              label: "Klarna"
            }
          },
          styles: {
            authFailed: {
              top: "0px",
              right: "0px",
              bottom: "0px",
              left: "0px",
            },
            container: {
              styles: {
                backgroundColor: "#fff",
                border: "none",
                padding: "0",
              },
            },
            googlePayButton: {
              storeInstrumentCheckbox: {
                display: "inline-block",
                marginTop: "8px",
              },
            },
            element: {
              active: {
                border: "none",
                borderRadius: "8px",
                transition: "border-color 0.2s ease-in-out",
                padding: "0",
              },
              base: {
                borderWidth: "2px",
                borderColor: "#eae8ee",
                borderRadius: "8px",
                fontSize: "1rem",
              },
            },
            cardForm: {
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
                }
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
            cardPaymentButton: {
              base: {
                backgroundColor: "#1f1f1f",
                color: "#FFFFFF",
                maxWidth: "100%",
                margin: "20px auto",
                transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDuration: "150ms"
              },
              disabled: {
                backgroundColor: "#f0f0f0",
                color: "#8d8d8d",
              },
              hover: {
                backgroundColor: "#1f1f1fe6",
              },
              loading: {
                position: "relative",
              },
            },
          },
        };

        if (Payrails) {
          const payrailsClient = Payrails.init(clientConfiguration.data, {
            environment: PayrailsEnvironment.TEST,
          });
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
  }, [amount, currency, customerOrderData, navigate, selectedLocation, convertPrice]);

  const handleCardInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMockPayment = () => {
    if (
      selectedMethod === "card" &&
      (!cardData.cardHolder ||
        !cardData.cardNumber ||
        !cardData.expiry ||
        !cardData.cvv)
    ) {
      toast({
        title: "Validation Required",
        description: "Please complete all card details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing Payment",
      description: `Completing your ${selectedMethod} transaction...`,
    });

    setTimeout(() => {
      navigate("/order-confirmation");
    }, 2000);
  };

  return (
    <div className="bg-fashion-surface rounded-sm p-6 border border-fashion-border">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-2 font-serif">
          Drop In Payment
        </h3>
        <p className="text-sm text-muted-foreground font-light">
          Complete pre-built checkout widget with sophisticated design
        </p>
      </div>

      <div
        id="dropin-container"
        className="mb-6"
        data-testid="dropin-container"
      >
        {/* Payrails Drop In widget will be mounted here */}
      </div>
    </div>
  );
};

export default DropInIntegration;
