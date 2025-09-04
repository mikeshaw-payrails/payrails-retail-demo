import { useEffect, useState } from "react";
import '@payrails/web-sdk/payrails-styles.css';
import { ApplePayButtonOptions, CardFormOptions, CardPaymentButtonOptions, GooglePayButtonOptions, Payrails, PayrailsEnvironment } from '@payrails/web-sdk';
import PaymentStatusCallout, { PaymentStatus } from './PaymentStatusCallout';
import { getPayrailsClientConfig } from '@/lib/utils';

interface ElementsIntegrationProps {
  total: number;
  currency: string;
  onSuccess?: (payload: { orderNumber: string }) => void;
}

const ElementsIntegration = ({ total, currency, onSuccess }: ElementsIntegrationProps) => {

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorDetails, setErrorDetails] = useState<string | undefined>();

  useEffect(() => {
    interface ElementLike { mount?: (sel: string) => void; unmount?: () => void }
    let cardFormElement: ElementLike | undefined;
    let cardPaymentButtonElement: ElementLike | undefined;
    let applePayElement: ElementLike | undefined;
    let googlePayElement: ElementLike | undefined;

    interface OnChange {
      isValid?: boolean;
      cardNetwork?: string;
      bin?: string;
    }

    const initialize = async () => {
      try {
        Payrails.preloadCardForm();
        const clientConfiguration = await getPayrailsClientConfig(total, currency);
        const payrailsClient = Payrails.init(clientConfiguration, { environment: PayrailsEnvironment.TEST });

        // Apple Pay
        const applePayOptions: ApplePayButtonOptions = {
          showStoreInstrumentCheckbox: false,
          styles: { type: 'buy', style: 'black' }
        };
        applePayElement = payrailsClient.applePayButton(applePayOptions) as ElementLike;
        applePayElement.mount('#apple-pay-container');

        // Google Pay
        const googlePayOptions: GooglePayButtonOptions = {
          environment: PayrailsEnvironment.TEST,
          showStoreInstrumentCheckbox: false,
          events: {
            onAuthorizeSuccess: () => {
              setPaymentStatus('success');
              const mockOrderNumber = `ATR-${Math.floor(Math.random() * 900000 + 100000)}`;
              onSuccess?.({ orderNumber: mockOrderNumber });
            },
            onAuthorizeFailed: (e) => { setPaymentStatus('error'); setErrorDetails(typeof e === 'string' ? e : JSON.stringify(e, null, 2)); },
            onPaymentButtonClicked: async () => true,
            onPaymentSessionExpired() { /* session expired */ }
          }
        };
        googlePayElement = payrailsClient.googlePayButton(googlePayOptions) as ElementLike;
        googlePayElement.mount('#google-pay-container');

        // Card Form – per docs nested syntax inputFields.all.{base,focus,invalid,complete,empty}
        const cardFormOptions: CardFormOptions = {
          showCardHolderName: true,
          showSingleExpiryDateField: true,
          styles: {
            inputFields: {
              all: {
                base: {
                  backgroundColor: '#f5f5f4',
                  border: '1px solid #d4d4d8',
                  borderRadius: '0.375rem',
                  padding: '0.625rem 0.75rem',
                  // Added vertical spacing between fields
                  marginBottom: '0.75rem',
                  transition: 'border-color .18s ease, box-shadow .18s ease, background-color .18s ease',
                  fontSize: '0.875rem',
                  lineHeight: '1.5rem',
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                  color: '#141414',
                  letterSpacing: '0.015em',
                  boxShadow: '0 0 0 0 rgba(0,0,0,0)'
                },
                focus: {
                  border: '1px solid #141414',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 0 3px rgba(20,20,20,0.08)'
                },
                invalid: {
                  border: '1px solid #dc2626',
                  boxShadow: '0 0 0 3px rgba(220,38,38,0.10)'
                },
                complete: {
                  border: '1px solid #16a34a'
                },
                empty: {
                  color: '#9ca3af'
                }
              }
            },
            labels: {
              // Match SecureFieldsIntegration label style: text-sm font-medium text-foreground mb-2 block
              // Using `all` so every field label (cardholder, number, expiry, cvv) gets same styling.
              // Cast to any to satisfy SDK typing if labels expects field-specific keys.
              all: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',      // text-sm (14px)
                fontWeight: '500',         // font-medium
                color: '#141414',          // foreground (adjust if theme variable available)
                lineHeight: '1.25rem',     // Tailwind leading-5
                marginBottom: '0.5rem',    // mb-2 (8px)
                display: 'block',
                textTransform: 'none',
                letterSpacing: '0'         // default tracking
              }
            },
          },
          translations: {
            labels: {
              CARDHOLDER_NAME: 'Cardholder Name',
              CARD_NUMBER: 'Card Number',
              EXPIRATION_DATE: 'Expiration Date',
              CVV: 'CVV'
            },

            placeholders: {
              CARDHOLDER_NAME: 'Cardholder Name',
              CARD_NUMBER: '1234 1234 1234 1234',
              EXPIRATION_DATE: 'MM/YY',
              CVV: 'CVV'
            }
          },
          events: {
            onChange(e: OnChange) { console.log('card form change', e); },
            onFocus() { /* focus */ },
            onReady() { /* ready */ }
          }
        };
        cardFormElement = payrailsClient.cardForm(cardFormOptions) as ElementLike;
        cardFormElement.mount('#card-form-container');

        // Payment Button
        const cardPaymentButtonOptions: CardPaymentButtonOptions = {
          disabledByDefault: true,
          translations: { label: 'Complete Purchase' },
          events: {
            onAuthorizeSuccess: () => {
              setPaymentStatus('success');
              const mockOrderNumber = `ATR-${Math.floor(Math.random() * 900000 + 100000)}`;
              onSuccess?.({ orderNumber: mockOrderNumber });
            },
            onAuthorizeFailed: (e) => { setPaymentStatus('error'); setErrorDetails(typeof e === 'string' ? e : JSON.stringify(e, null, 2)); },
            onPaymentButtonClicked: () => Promise.resolve(true),
            onPaymentSessionExpired() { },
            onThreeDSecureChallenge() { },
            onStateChanged() { }
          },
          styles: {
            base: {
              width: '100%',
              backgroundColor: '#141414',
              color: '#fafafa',
              border: '1px solid transparent',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              fontWeight: '500',
              letterSpacing: '0.025em',
              fontSize: '0.875rem',
              lineHeight: '1.5rem',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              cursor: 'pointer',
              transition: 'background-color .18s ease, box-shadow .18s ease, transform .18s ease'
            },
            hover: { backgroundColor: '#141414' },
            disabled: {
              backgroundColor: '#e5e3df',
              color: '#9ca3af',
              cursor: 'not-allowed',
              opacity: '0.7'
            }
          }
        };
        cardPaymentButtonElement = payrailsClient.paymentButton(cardPaymentButtonOptions) as ElementLike;
        cardPaymentButtonElement.mount('#payment-button-container');
      } catch (err) {
        console.error('Failed to initialize Elements:', err);
      }
    };
    initialize();

    return () => {
      cardFormElement?.unmount?.();
      cardPaymentButtonElement?.unmount?.();
      applePayElement?.unmount?.();
      googlePayElement?.unmount?.();
    };
  }, [total, currency, onSuccess]);

  return (
    <div className="bg-fashion-surface rounded-sm p-6 border border-fashion-border">

      <div className="space-y-6">

        <div id="apple-pay-container" />

        <div id="google-pay-container" />

        <div id="paypal-container" />

        <div id="card-form-container" />

        <PaymentStatusCallout
          status={paymentStatus}
          errorDetails={errorDetails}
          onDismiss={() => { setPaymentStatus('idle'); setErrorDetails(undefined); }}
        />

        <div id="payment-button-container" />

      </div>
    </div>
  );
};

export default ElementsIntegration;