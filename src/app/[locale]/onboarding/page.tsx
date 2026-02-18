"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  ProgressHeader,
  WelcomeStep,
  CompanyStep,
  LocationStep,
  VehicleStep,
  NotificationsStep,
  TourStep,
  CompleteStep,
} from "@/components/onboarding";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const {
    currentStep,
    data,
    dealer,
    loading,
    saving,
    error,
    progress,
    
    // Navigation
    nextStep,
    prevStep,
    markStepCompleted,
    
    // Data updates
    updateCompanyData,
    updateLocationData,
    updateVehicleData,
    updateNotificationSettings,
    updateTourProgress,
    
    // Save actions
    saveCompanyData,
    saveLocationData,
    saveVehicleData,
    saveNotificationSettings,
    completeOnboarding,
  } = useOnboarding();

  // Redirect if already completed
  useEffect(() => {
    if (!loading && dealer?.onboarding_completed) {
      router.push(`/${locale}/dashboard`);
    }
  }, [loading, dealer, router, locale]);

  // Redirect to login if no dealer
  useEffect(() => {
    if (!loading && !dealer) {
      router.push(`/${locale}/login`);
    }
  }, [loading, dealer, router, locale]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white text-lg">Wird geladen...</p>
        </div>
      </div>
    );
  }

  // Handle step transitions with save
  const handleCompanyNext = async () => {
    const success = await saveCompanyData();
    if (success) {
      nextStep();
    }
  };

  const handleLocationNext = async () => {
    const success = await saveLocationData();
    if (success) {
      nextStep();
    }
  };

  const handleVehicleNext = async () => {
    if (data.vehicle && data.vehicle.make && data.vehicle.model) {
      await saveVehicleData();
    }
    markStepCompleted('vehicle');
    nextStep();
  };

  const handleVehicleSkip = () => {
    markStepCompleted('vehicle');
    nextStep();
  };

  const handleNotificationsNext = async () => {
    const success = await saveNotificationSettings();
    if (success) {
      nextStep();
    }
  };

  const handleTourNext = () => {
    markStepCompleted('tour');
    nextStep();
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <div className="min-h-screen">
      {/* Progress Header */}
      <div className="pt-8">
        <ProgressHeader 
          currentStep={currentStep} 
          progress={progress}
          completedSteps={data.completedSteps}
        />
      </div>

      {/* Step Content */}
      {currentStep === 'welcome' && (
        <WelcomeStep
          dealerName={dealer?.contact_name?.split(' ')[0]}
          onNext={nextStep}
        />
      )}

      {currentStep === 'company' && (
        <CompanyStep
          data={data.company}
          onChange={updateCompanyData}
          onNext={handleCompanyNext}
          onBack={prevStep}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 'location' && (
        <LocationStep
          data={data.location}
          companyName={data.company.company_name}
          onChange={updateLocationData}
          onNext={handleLocationNext}
          onBack={prevStep}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 'vehicle' && (
        <VehicleStep
          data={data.vehicle}
          onChange={updateVehicleData}
          onNext={handleVehicleNext}
          onBack={prevStep}
          onSkip={handleVehicleSkip}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 'notifications' && (
        <NotificationsStep
          data={data.notifications}
          onChange={updateNotificationSettings}
          onNext={handleNotificationsNext}
          onBack={prevStep}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 'tour' && (
        <TourStep
          data={data.tour}
          onChange={updateTourProgress}
          onNext={handleTourNext}
          onBack={prevStep}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep
          companyName={data.company.company_name || dealer?.company_name || 'Deine Garage'}
          hasVehicle={data.completedSteps.includes('vehicle') && !!data.vehicle?.make}
          hasLocation={data.completedSteps.includes('location')}
          onComplete={handleComplete}
          saving={saving}
        />
      )}
    </div>
  );
}
