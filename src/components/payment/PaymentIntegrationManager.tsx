import { useState, useRef } from "react";
import DropInIntegration from "./DropInIntegration";
import ElementsIntegration from "./ElementsIntegration";
import SecureFieldsIntegration from "./SecureFieldsIntegration";

const PaymentIntegrationManager = () => {
  const [activeIntegration, setActiveIntegration] = useState<"dropin" | "elements" | "securefields">("dropin");
  const integrationsRef = useRef({
    dropin: null as JSX.Element | null,
    elements: null as JSX.Element | null,
    securefields: null as JSX.Element | null,
  });

  const renderIntegration = () => {
    switch (activeIntegration) {
      case "dropin":
        if (!integrationsRef.current.dropin) {
          integrationsRef.current.dropin = <DropInIntegration />;
        }
        return integrationsRef.current.dropin;
      case "elements":
        if (!integrationsRef.current.elements) {
          integrationsRef.current.elements = <ElementsIntegration />;
        }
        return integrationsRef.current.elements;
      case "securefields":
        if (!integrationsRef.current.securefields) {
          integrationsRef.current.securefields = <SecureFieldsIntegration />;
        }
        return integrationsRef.current.securefields;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveIntegration("dropin")} className={activeIntegration === "dropin" ? "bg-primary text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}>DropIn</button>
        <button onClick={() => setActiveIntegration("elements")} className={activeIntegration === "elements" ? "bg-primary text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}>Elements</button>
        <button onClick={() => setActiveIntegration("securefields")} className={activeIntegration === "securefields" ? "bg-primary text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}>Secure Fields</button>
      </div>
      {renderIntegration()}
    </div>
  );
};

export default PaymentIntegrationManager;
