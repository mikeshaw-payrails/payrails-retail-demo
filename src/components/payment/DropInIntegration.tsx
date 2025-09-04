import { useEffect } from "react";

interface DropInIntegrationProps {
  total: number;
  currency: string;
  onSuccess?: (payload: { orderNumber: string }) => void;
}

// Payrails Drop In SDK
import '@payrails/web-sdk/payrails-styles.css'
import { DropinOptions, Payrails, PayrailsEnvironment } from '@payrails/web-sdk';
import { getPayrailsClientConfig } from "@/lib/utils";

const DropInIntegration = ({ total, currency, onSuccess }: DropInIntegrationProps) => {

  useEffect(() => {
    // Mock Payrails Drop In SDK initialization
    const initializeDropIn = async () => {
      try {
        const clientConfiguration = await getPayrailsClientConfig(total, currency);

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
              const mockOrderNumber = `ATR-${Math.floor(Math.random() * 900000 + 100000)}`;
              onSuccess?.({ orderNumber: mockOrderNumber });
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
          const payrailsClient = Payrails.init(clientConfiguration, { environment: PayrailsEnvironment.TEST });
          const dropIn = payrailsClient.dropin(dropInConfiguration);
          dropIn.mount("#dropin-container");
        }
      } catch (error) {
        console.error("Failed to initialize Drop In:", error);
      }
    };
    initializeDropIn();
  }, []);

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


