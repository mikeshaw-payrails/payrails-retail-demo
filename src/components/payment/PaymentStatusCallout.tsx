import React from 'react';

export type PaymentStatus = 'idle' | 'success' | 'error';

interface PaymentStatusCalloutProps {
    status: PaymentStatus;
    title?: string;
    message?: string;
    onDismiss?: () => void;
    errorDetails?: string;
}

/**
 * Reusable payment status callout styled to match the `#callout` block
 * used in `SecureFieldsIntegration`. Shows success or error state.
 */
const PaymentStatusCallout: React.FC<PaymentStatusCalloutProps> = ({
    status,
    title,
    message,
    onDismiss,
    errorDetails
}) => {
    if (status === 'idle') return null;

    const success = status === 'success';
    const baseTitle = success ? 'Payment Confirmed' : 'Payment Failed';
    const baseMessage = success
        ? 'Your order has been successfully authorized.'
        : 'We were unable to authorize your payment. Please review your details or try another method.';

    return (
        <div className="p-5 bg-fashion-accent rounded-sm" role="status" aria-live="polite">
            <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${success ? 'bg-success' : 'bg-red-600'}`}>
                    {success ? (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-2">{title || baseTitle}</h4>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed mb-2">
                        {message || baseMessage}
                    </p>
                    {(!success && errorDetails) && (
                        <pre className="text-[10px] text-muted-foreground bg-fashion-subtle rounded-sm p-2 overflow-auto max-h-32 mb-2 whitespace-pre-wrap">{errorDetails}</pre>
                    )}
                    {onDismiss && (
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="mt-1 inline-flex items-center text-xs font-medium text-primary hover:text-primary-hover focus:outline-none focus:underline"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusCallout;
