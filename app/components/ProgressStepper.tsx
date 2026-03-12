"use client";

import { CheckoutStep } from "@/lib/types";

interface ProgressStepperProps {
  currentStep: CheckoutStep;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const steps = [
    { id: "shipping", label: "Information", step: 1 },
    { id: "payment", label: "Payment", step: 2 },
    { id: "review", label: "Review", step: 3 },
    { id: "complete", label: "Complete", step: 4 },
  ];

  const getStepStatus = (stepId: string, stepIndex: number) => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentStep === "success" || currentStep === "tracking") {
        return "completed";
    }
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  return (
    <div className="mb-8">
      {/* Header with Secure Checkout */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-xs font-semibold uppercase tracking-wider">Secure Checkout</span>
        </div>
      </div>

      <div className="flex items-center justify-between relative px-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm ${
                  status === "completed"
                    ? "bg-green-500 text-white"
                    : status === "active"
                    ? "bg-pink-500 text-white scale-110 shadow-pink-200"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {status === "completed" ? "✓" : step.step}
              </div>
              <p
                className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${
                  status === "completed"
                    ? "text-green-600"
                    : status === "active"
                    ? "text-pink-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}

        {/* Progress Line Background */}
        <div
          className="absolute top-[20px] left-8 right-8 h-0.5 bg-gray-200"
          style={{ zIndex: 0 }}
        >
          {/* Active Progress Line */}
          <div
            className="h-full bg-gradient-to-r from-green-500 via-pink-500 to-pink-500 transition-all duration-500"
            style={{ 
                width: currentStep === "shipping" ? "0%" : 
                       currentStep === "payment" ? "33%" : 
                       currentStep === "review" ? "66%" : "100%" 
            }}
          />
        </div>
      </div>
    </div>
  );
}
