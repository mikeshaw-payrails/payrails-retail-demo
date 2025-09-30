import { Button } from "@/components/ui/button";

type IntegrationType = "dropin" | "elements" | "secure-fields";

interface PaymentIntegrationToggleProps {
  activeType: IntegrationType;
  onTypeChange: (type: IntegrationType) => void;
}

const PaymentIntegrationToggle = ({ activeType, onTypeChange }: PaymentIntegrationToggleProps) => {
  const integrationTypes = [
    {
      type: "dropin" as IntegrationType,
      label: "Drop In",
      description: "Complete widget solution"
    },
    {
      type: "elements" as IntegrationType,
      label: "Elements",
      description: "Individual components"
    },
    {
      type: "secure-fields" as IntegrationType,
      label: "Secure Fields",
      description: "Tokenized input fields"
    }
  ];

  return (
    <div className="bg-fashion-surface rounded-sm p-8 border border-fashion-border">
      <h2 className="text-lg font-medium text-foreground mb-2 font-serif">Payment Method</h2>
      <p className="text-sm text-muted-foreground mb-6 font-light">
        Choose your preferred integration approach
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {integrationTypes.map((integration) => (
          <Button
            key={integration.type}
            variant={activeType === integration.type ? "default" : "outline"}
            onClick={() => onTypeChange(integration.type)}
            className={`flex flex-col h-auto min-h-[80px] p-4 text-left border-fashion-border justify-start ${
              activeType === integration.type 
                ? "bg-primary text-primary-foreground hover:bg-primary-hover" 
                : "bg-fashion-surface hover:bg-fashion-subtle text-foreground"
            }`}
          >
            <span className="font-medium text-sm leading-tight">{integration.label}</span>
            <span className="text-xs opacity-75 mt-1 font-light break-words leading-relaxed">{integration.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PaymentIntegrationToggle;