import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useLocationContext } from "@/contexts/LocationContext";
import merinoSweater from "@/assets/merino-sweater.jpg";
import cottonTee from "@/assets/cotton-tee.jpg";
import linenShirt from "@/assets/linen-shirt.jpg";
import cashmereScarf from "@/assets/cashmere-scarf.jpg";
import woolCoat from "@/assets/wool-coat.jpg";
import cottonDress from "@/assets/cotton-dress.jpg";

const Index = () => {
  const { formatPrice, convertPrice } = useLocationDetection();
  const { selectedLocation } = useLocationContext();

  const formatPriceWithLocation = (price: number) => {
    if (selectedLocation) {
      const convertedPrice = convertPrice(price, 'USD', selectedLocation.currency);
      return `${selectedLocation.currencySymbol}${convertedPrice}`;
    }
    return formatPrice(price);
  };
  
  const products = [
    { id: 1, name: "Merino Wool Sweater", price: 185, image: merinoSweater, category: "Knitwear" },
    { id: 2, name: "Organic Cotton Tee", price: 45, image: cottonTee, category: "Basics" },
    { id: 3, name: "Linen Button Shirt", price: 125, image: linenShirt, category: "Shirts" },
    { id: 4, name: "Cashmere Scarf", price: 95, image: cashmereScarf, category: "Accessories" },
    { id: 5, name: "Wool Coat", price: 320, image: woolCoat, category: "Outerwear" },
    { id: 6, name: "Cotton Dress", price: 165, image: cottonDress, category: "Dresses" },
  ];

  return (
    <div className="min-h-screen bg-fashion-bg font-sans">
      {/* Header */}
      <header className="bg-fashion-surface border-b border-fashion-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-light tracking-wide text-foreground font-serif">ATELIER</h1>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-muted-foreground">New Collection</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Women</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Men</span>
              <span className="text-muted-foreground">•</span>
              <LocationSelector />
              <Link to="/checkout" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-4 h-4" />
                <span>Cart (2)</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-foreground mb-4 font-serif leading-tight">
            Essential
            <br />
            <span className="italic">Minimalism</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Timeless pieces crafted from the finest materials. 
            Clean lines, perfect fits, enduring quality.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-fashion-surface rounded-sm overflow-hidden border border-fashion-border mb-4">
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground font-serif">{product.name}</h3>
                    <p className="text-sm text-muted-foreground font-light">{product.category}</p>
                  </div>
                  <p className="font-medium text-foreground">{formatPriceWithLocation(product.price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-fashion-surface rounded-sm p-12 text-center border border-fashion-border">
          <h2 className="text-2xl font-light text-foreground mb-4 font-serif">Experience Our Checkout</h2>
          <p className="text-muted-foreground text-sm mb-8 font-light max-w-2xl mx-auto leading-relaxed">
            Discover our sophisticated payment integration demo featuring three distinct methods: 
            Drop In, Elements, and Secure Fields powered by Payrails Web SDK.
          </p>
          <Link to="/checkout">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-sm font-medium tracking-wide uppercase"
            >
              View Checkout Demo
              <ArrowRight className="w-4 h-4 ml-3" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
