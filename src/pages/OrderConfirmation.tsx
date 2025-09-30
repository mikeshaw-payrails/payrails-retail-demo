import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import merinoSweater from "@/assets/merino-sweater.jpg";
import cottonTee from "@/assets/cotton-tee.jpg";

const OrderConfirmation = () => {
  const { formatPrice, convertPrice } = useLocationDetection();
  const { selectedLocation } = useLocationContext();

  const formatPriceWithLocation = (price: number) => {
    if (selectedLocation) {
      const convertedPrice = convertPrice(price, 'USD', selectedLocation.currency);
      return `${selectedLocation.currencySymbol}${convertedPrice}`;
    }
    return formatPrice(price);
  };

  // Same order data as checkout for consistency
  const items = [
    { id: 1, name: "Merino Wool Sweater", color: "Natural", size: "M", price: 185.00, quantity: 1, image: merinoSweater },
    { id: 2, name: "Organic Cotton Tee", color: "Stone", size: "S", price: 45.00, quantity: 2, image: cottonTee },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  const orderNumber = `AT-${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-fashion-bg font-sans">
      {/* Header */}
      <header className="bg-fashion-surface border-b border-fashion-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-fashion-subtle" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <h1 className="text-xl font-light text-foreground font-serif">Order Complete</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-light text-foreground font-serif">ATELIER</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-light text-foreground mb-4 font-serif">Thank you for your order</h1>
          <p className="text-muted-foreground font-light">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-fashion-surface rounded-sm p-8 border border-fashion-border">
            <h2 className="text-lg font-medium text-foreground mb-6 font-serif">Order Details</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="text-foreground font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground">{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-foreground">Card ending in ••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="text-foreground">{selectedLocation?.currency || 'USD'}</span>
              </div>
            </div>

            <Separator className="my-6 bg-fashion-border" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPriceWithLocation(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{formatPriceWithLocation(tax)}</span>
              </div>
              
              <Separator className="my-4 bg-fashion-border" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-foreground font-serif">Amount Paid</span>
                <span className="text-xl font-medium text-foreground">{formatPriceWithLocation(total)}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-fashion-surface rounded-sm p-8 border border-fashion-border">
            <h2 className="text-lg font-medium text-foreground mb-6 font-serif">Items Ordered</h2>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-20 h-24 bg-fashion-subtle rounded-sm overflow-hidden border border-fashion-border flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-2">{item.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{item.color}</div>
                        <div>Size {item.size}</div>
                        <div>Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    <p className="font-medium text-foreground text-right ml-4">
                      {formatPriceWithLocation(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6 bg-fashion-border" />

            <div className="text-center">
              <Button 
                asChild 
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium tracking-wide"
              >
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mt-8 bg-fashion-surface rounded-sm p-6 border border-fashion-border">
          <h3 className="text-lg font-medium text-foreground mb-4 font-serif">What happens next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-8 h-8 bg-fashion-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-medium text-foreground">1</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Order Processing</h4>
              <p className="text-sm text-muted-foreground font-light">
                We'll prepare your items with care within 1-2 business days
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-fashion-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-medium text-foreground">2</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Shipping</h4>
              <p className="text-sm text-muted-foreground font-light">
                Your order will be shipped with tracking information
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-fashion-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-medium text-foreground">3</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Delivery</h4>
              <p className="text-sm text-muted-foreground font-light">
                Expect delivery in 3-5 business days
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;