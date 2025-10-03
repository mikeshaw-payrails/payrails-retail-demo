export interface CustomerOrderData {
    customer: {
        email: string;
        lastName: string;
        name: string; // combined first + last
        phone: {
            number: string;
        };
        country?: { // Added to support passing customer.country.code
            code: string;
        };
    };
    order: {
        billingAddress: {
            // Name associated with the billing address (duplicated from customer.name for providers needing it)
            name?: string;
            city: string;
            country: { code: string };
            postalCode: string;
            state: string;
        };
        lines?: Array<{
            name: string;
            quantity: number;
            total: { value: number };
            unitPrice: { value: number };
        }>;
    };
}
