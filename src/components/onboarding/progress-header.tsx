"use client";

import { Progress } from "@/components/ui/progress";
import { OnboardingStep, STEP_LABELS } from "@/hooks/use-onboarding";
import { Check } from "lucide-react";

interface ProgressHeaderProps {
  currentStep: OnboardingStep;
  progress: number;
  completedSteps: OnboardingStep[];
}

const VISIBLE_STEPS: OnboardingStep[] = ['company', 'location', 'vehicle', 'notifications', 'tour'];

export function ProgressHeader({ currentStep, progress, completedSteps }: ProgressHeaderProps) {
  // Don't show on welcome or complete
  if (currentStep === 'welcome' || currentStep === 'complete') {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      {/* Step indicators */}
      <div className="flex justify-between items-center mb-4">
        {VISIBLE_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const stepIndex = VISIBLE_STEPS.indexOf(currentStep);
          const isPast = index < stepIndex;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${isCompleted || isPast 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' 
                      : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {isCompleted || isPast ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`
                  mt-2 text-xs font-medium hidden sm:block
                  ${isCurrent ? 'text-white' : 'text-slate-400'}
                `}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <Progress value={progress} className="h-2 bg-slate-700" />
        <div className="absolute inset-0 flex items-center justify-between text-xs text-slate-400 mt-4">
          <span>Schritt {VISIBLE_STEPS.indexOf(currentStep) + 1} von {VISIBLE_STEPS.length}</span>
          <span>{progress}% geschafft</span>
        </div>
      </div>
    </div>
  );
}
