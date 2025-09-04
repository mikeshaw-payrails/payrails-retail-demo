import { Separator } from "@/components/ui/separator";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useLocationContext } from "@/contexts/LocationContext";
import merinoSweater from "@/assets/merino-sweater.jpg";
import cottonTee from "@/assets/cotton-tee.jpg";

const CheckoutSummary = () => {
  const { formatPrice, convertPrice } = useLocationDetection();
  const { selectedLocation } = useLocationContext();

  const formatPriceWithLocation = (price: number) => {
    if (selectedLocation) {
      const convertedPrice = convertPrice(price, 'USD', selectedLocation.currency);
      return `${selectedLocation.currencySymbol}${convertedPrice}`;
    }
    return formatPrice(price);
  };
  
  const items = [
    { id: 1, name: "Merino Wool Sweater", color: "Natural", size: "M", price: 185.00, quantity: 1, image: merinoSweater },
    { id: 2, name: "Organic Cotton Tee", color: "Stone", size: "S", price: 45.00, quantity: 2, image: cottonTee },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping: number = 0; // Free shipping for fashion brand
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-fashion-surface rounded-sm p-8 border border-fashion-border">
      <h2 className="text-lg font-medium text-foreground mb-6 font-serif">Order Summary</h2>
      
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex space-x-4">
            <div className="w-16 h-20 bg-fashion-surface rounded-sm overflow-hidden border border-fashion-border flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
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
              <p className="font-medium text-foreground text-right ml-4">
                {formatPriceWithLocation(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6 bg-fashion-border" />

        <div className="space-y-3">
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
        </div>

        <Separator className="my-6 bg-fashion-border" />

        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-foreground font-serif">Total</span>
          <span className="text-xl font-medium text-foreground">{formatPriceWithLocation(total)}</span>
        </div>
    </div>
  );
};

export default CheckoutSummary;