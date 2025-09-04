import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import merinoSweater from '@/assets/merino-sweater.jpg';
import cottonTee from '@/assets/cotton-tee.jpg';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useLocationContext } from '@/contexts/LocationContext';

interface OrderItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number; // base price in USD (mock)
  quantity: number;
  image?: string; // optional if coming from navigation state without images
}

interface OrderState {
  orderNumber?: string;
  items?: OrderItem[];
  currency?: string; // selected currency code
}

// Fallback mock items (same as checkout) in case of direct navigation / refresh
const FALLBACK_ITEMS: OrderItem[] = [
  { id: 1, name: 'Merino Wool Sweater', color: 'Natural', size: 'M', price: 185.0, quantity: 1, image: merinoSweater },
  { id: 2, name: 'Organic Cotton Tee', color: 'Stone', size: 'S', price: 45.0, quantity: 2, image: cottonTee }
];

const CheckoutComplete = () => {
  const location = useLocation();
  const state = (location.state || {}) as OrderState;
  const items = state.items && state.items.length ? state.items : FALLBACK_ITEMS;
  const orderNumber = state.orderNumber || 'ATR-DEMO';
  const { selectedLocation } = useLocationContext();
  const { convertPrice, formatPrice } = useLocationDetection();

  const formatPriceWithLocation = (price: number) => {
    if (selectedLocation) {
      const converted = convertPrice(price, 'USD', selectedLocation.currency);
      return `${selectedLocation.currencySymbol}${converted}`;
    }
    return formatPrice(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-fashion-bg font-sans py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-fashion-surface rounded-sm p-10 border border-fashion-border mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Thank you for your order</h1>
              <p className="text-sm text-muted-foreground font-light">Your payment was successful and your pieces are being prepared.</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Order Number</p>
              <p className="text-lg font-medium font-serif text-foreground">{orderNumber}</p>
            </div>
          </div>

          <Separator className="my-8 bg-fashion-border" />

            <h2 className="text-lg font-medium text-foreground mb-6 font-serif">Order Items</h2>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-20 h-24 bg-fashion-surface rounded-sm overflow-hidden border border-fashion-border flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-light tracking-wide">
                        NO IMAGE
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                      <div className="text-sm text-muted-foreground space-x-3">
                        <span>{item.color}</span>
                        <span>•</span>
                        <span>Size {item.size}</span>
                        <span>•</span>
                        <span>Qty {item.quantity}</span>
                      </div>
                    </div>
                    <p className="font-medium text-foreground text-right ml-4">{formatPriceWithLocation(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-8 bg-fashion-border" />

            <div className="space-y-3 max-w-md ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPriceWithLocation(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{shipping === 0 ? 'Complimentary' : formatPriceWithLocation(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{formatPriceWithLocation(tax)}</span>
              </div>
              <Separator className="my-4 bg-fashion-border" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-foreground font-serif">Total Paid</span>
                <span className="text-xl font-medium text-foreground">{formatPriceWithLocation(total)}</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              <Link to="/" className="text-primary underline hover:text-primary-hover font-medium">Continue Shopping</Link>
              <Link to="/checkout" className="text-muted-foreground underline hover:text-foreground text-sm">Start New Order</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComplete;
