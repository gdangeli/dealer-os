"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dealer } from "@/types/database";

export type OnboardingStep = 
  | 'welcome' 
  | 'company' 
  | 'location' 
  | 'vehicle' 
  | 'notifications' 
  | 'tour' 
  | 'complete';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'company',
  'location',
  'vehicle',
  'notifications',
  'tour',
  'complete',
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Willkommen',
  company: 'Garage',
  location: 'Standort',
  vehicle: 'Fahrzeug',
  notifications: 'Benachrichtigungen',
  tour: 'Tour',
  complete: 'Geschafft',
};

export interface CompanyData {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string | null;
}

export interface LocationData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  opening_hours: OpeningHours;
}

export interface OpeningHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface VehicleData {
  make: string;
  model: string;
  first_registration: string;
  mileage: string;
  asking_price: string;
  fuel_type: string;
  transmission: string;
  images: File[];
}

export interface NotificationSettings {
  notification_new_lead: boolean;
  notification_daily_summary: boolean;
  notification_longstanding_days: number;
}

export interface TourProgress {
  dashboard: boolean;
  vehicles: boolean;
  leads: boolean;
  settings: boolean;
}

export interface OnboardingData {
  company: CompanyData;
  location: LocationData;
  vehicle: VehicleData | null;
  notifications: NotificationSettings;
  tour: TourProgress;
  completedSteps: OnboardingStep[];
}

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '16:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  company: {
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    logo_url: null,
  },
  location: {
    name: '',
    address: '',
    postal_code: '',
    city: '',
    phone: '',
    email: '',
    opening_hours: DEFAULT_OPENING_HOURS,
  },
  vehicle: null,
  notifications: {
    notification_new_lead: true,
    notification_daily_summary: false,
    notification_longstanding_days: 30,
  },
  tour: {
    dashboard: false,
    vehicles: false,
    leads: false,
    settings: false,
  },
  completedSteps: [],
};

export function useOnboarding() {
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING_DATA);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress
  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const totalSteps = ONBOARDING_STEPS.length - 1; // Exclude 'complete'
  const progress = currentStep === 'welcome' ? 0 : 
    currentStep === 'complete' ? 100 : 
    Math.round((currentStepIndex / totalSteps) * 100);

  // Load dealer data
  const loadDealer = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: dealerData } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dealerData) {
        setDealer(dealerData);
        
        // Restore saved onboarding step if exists
        if (dealerData.onboarding_step && ONBOARDING_STEPS.includes(dealerData.onboarding_step as OnboardingStep)) {
          setCurrentStep(dealerData.onboarding_step as OnboardingStep);
        }
        
        // Pre-fill company data from existing dealer info
        setData(prev => ({
          ...prev,
          company: {
            company_name: dealerData.company_name || '',
            contact_name: dealerData.contact_name || '',
            phone: dealerData.phone || '',
            email: dealerData.email || '',
            website: '',
            logo_url: null,
          },
          location: {
            ...prev.location,
            address: dealerData.street || '',
            postal_code: dealerData.zip || '',
            city: dealerData.city || '',
          },
          notifications: {
            notification_new_lead: dealerData.notification_new_lead ?? true,
            notification_daily_summary: dealerData.notification_daily_summary ?? false,
            notification_longstanding_days: dealerData.notification_longstanding_days ?? 30,
          },
        }));
      }

      return dealerData;
    } catch (err) {
      console.error('Error loading dealer:', err);
      setError('Daten konnten nicht geladen werden.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadDealer();
  }, [loadDealer]);

  // Save current step to database
  const saveCurrentStep = useCallback(async (step: OnboardingStep) => {
    if (!dealer?.id) return;
    
    try {
      await supabase
        .from('dealers')
        .update({ onboarding_step: step })
        .eq('id', dealer.id);
    } catch (err) {
      console.error('Error saving onboarding step:', err);
    }
  }, [dealer?.id, supabase]);

  // Navigation
  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    setError(null);
    saveCurrentStep(step);
  }, [saveCurrentStep]);

  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      const newStep = ONBOARDING_STEPS[nextIndex];
      setCurrentStep(newStep);
      setError(null);
      saveCurrentStep(newStep);
    }
  }, [currentStepIndex, saveCurrentStep]);

  const prevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const newStep = ONBOARDING_STEPS[prevIndex];
      setCurrentStep(newStep);
      setError(null);
      saveCurrentStep(newStep);
    }
  }, [currentStepIndex, saveCurrentStep]);

  // Mark step as completed
  const markStepCompleted = useCallback((step: OnboardingStep) => {
    setData(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step) 
        ? prev.completedSteps 
        : [...prev.completedSteps, step],
    }));
  }, []);

  // Update data helpers
  const updateCompanyData = useCallback((companyData: Partial<CompanyData>) => {
    setData(prev => ({
      ...prev,
      company: { ...prev.company, ...companyData },
    }));
  }, []);

  const updateLocationData = useCallback((locationData: Partial<LocationData>) => {
    setData(prev => ({
      ...prev,
      location: { ...prev.location, ...locationData },
    }));
  }, []);

  const updateVehicleData = useCallback((vehicleData: Partial<VehicleData>) => {
    setData(prev => ({
      ...prev,
      vehicle: prev.vehicle 
        ? { ...prev.vehicle, ...vehicleData }
        : {
            make: '',
            model: '',
            first_registration: '',
            mileage: '',
            asking_price: '',
            fuel_type: 'petrol',
            transmission: 'manual',
            images: [],
            ...vehicleData,
          },
    }));
  }, []);

  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...settings },
    }));
  }, []);

  const updateTourProgress = useCallback((progress: Partial<TourProgress>) => {
    setData(prev => ({
      ...prev,
      tour: { ...prev.tour, ...progress },
    }));
  }, []);

  // Save company data to Supabase
  const saveCompanyData = useCallback(async (): Promise<boolean> => {
    if (!dealer) return false;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('dealers')
        .update({
          company_name: data.company.company_name,
          contact_name: data.company.contact_name,
          phone: data.company.phone,
          email: data.company.email,
        })
        .eq('id', dealer.id);

      if (updateError) throw updateError;

      markStepCompleted('company');
      return true;
    } catch (err) {
      console.error('Error saving company data:', err);
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dealer, data.company, supabase, markStepCompleted]);

  // Save location data to Supabase
  const saveLocationData = useCallback(async (): Promise<boolean> => {
    if (!dealer) return false;
    setSaving(true);
    setError(null);

    try {
      // Update dealer's main address
      await supabase
        .from('dealers')
        .update({
          street: data.location.address,
          zip: data.location.postal_code,
          city: data.location.city,
        })
        .eq('id', dealer.id);

      // Check if a main location already exists
      const { data: existingLocations } = await supabase
        .from('locations')
        .select('id')
        .eq('dealer_id', dealer.id)
        .eq('is_main', true)
        .limit(1);

      if (existingLocations && existingLocations.length > 0) {
        // Update existing main location
        const { error: updateError } = await supabase
          .from('locations')
          .update({
            name: data.location.name || data.company.company_name + ' - Hauptstandort',
            address: data.location.address,
            postal_code: data.location.postal_code,
            city: data.location.city,
            phone: data.location.phone || data.company.phone,
            email: data.location.email || data.company.email,
          })
          .eq('id', existingLocations[0].id);

        if (updateError) throw updateError;
      } else {
        // Create new main location
        const { error: insertError } = await supabase
          .from('locations')
          .insert({
            dealer_id: dealer.id,
            name: data.location.name || data.company.company_name + ' - Hauptstandort',
            address: data.location.address,
            postal_code: data.location.postal_code,
            city: data.location.city,
            phone: data.location.phone || data.company.phone,
            email: data.location.email || data.company.email,
            is_main: true,
          });

        if (insertError) throw insertError;
      }

      markStepCompleted('location');
      return true;
    } catch (err) {
      console.error('Error saving location data:', err);
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dealer, data.location, data.company, supabase, markStepCompleted]);

  // Save vehicle data to Supabase
  const saveVehicleData = useCallback(async (): Promise<string | null> => {
    if (!dealer || !data.vehicle) return null;
    setSaving(true);
    setError(null);

    try {
      // Get the main location
      const { data: locations } = await supabase
        .from('locations')
        .select('id')
        .eq('dealer_id', dealer.id)
        .eq('is_main', true)
        .limit(1);

      const locationId = locations?.[0]?.id || null;

      const { data: vehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          dealer_id: dealer.id,
          location_id: locationId,
          make: data.vehicle.make,
          model: data.vehicle.model,
          first_registration: data.vehicle.first_registration || null,
          mileage: parseInt(data.vehicle.mileage) || 0,
          asking_price: parseInt(data.vehicle.asking_price) || 0,
          fuel_type: data.vehicle.fuel_type,
          transmission: data.vehicle.transmission,
          status: 'in_stock',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      markStepCompleted('vehicle');
      return vehicle?.id || null;
    } catch (err) {
      console.error('Error saving vehicle data:', err);
      setError('Fahrzeug konnte nicht gespeichert werden.');
      return null;
    } finally {
      setSaving(false);
    }
  }, [dealer, data.vehicle, supabase, markStepCompleted]);

  // Save notification settings to Supabase
  const saveNotificationSettings = useCallback(async (): Promise<boolean> => {
    if (!dealer) return false;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('dealers')
        .update({
          notification_new_lead: data.notifications.notification_new_lead,
          notification_daily_summary: data.notifications.notification_daily_summary,
          notification_longstanding_days: data.notifications.notification_longstanding_days,
        })
        .eq('id', dealer.id);

      if (updateError) throw updateError;

      markStepCompleted('notifications');
      return true;
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dealer, data.notifications, supabase, markStepCompleted]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!dealer) return false;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('dealers')
        .update({ onboarding_completed: true })
        .eq('id', dealer.id);

      if (updateError) throw updateError;

      markStepCompleted('complete');
      return true;
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Onboarding konnte nicht abgeschlossen werden.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dealer, supabase, markStepCompleted]);

  // Reset onboarding (for "Onboarding wiederholen")
  const resetOnboarding = useCallback(async (): Promise<boolean> => {
    if (!dealer) return false;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('dealers')
        .update({ onboarding_completed: false })
        .eq('id', dealer.id);

      if (updateError) throw updateError;

      setData(DEFAULT_ONBOARDING_DATA);
      setCurrentStep('welcome');
      return true;
    } catch (err) {
      console.error('Error resetting onboarding:', err);
      setError('Onboarding konnte nicht zurückgesetzt werden.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dealer, supabase]);

  return {
    // State
    currentStep,
    data,
    dealer,
    loading,
    saving,
    error,
    progress,
    currentStepIndex,
    totalSteps,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Data updates
    updateCompanyData,
    updateLocationData,
    updateVehicleData,
    updateNotificationSettings,
    updateTourProgress,
    markStepCompleted,
    
    // Save actions
    saveCompanyData,
    saveLocationData,
    saveVehicleData,
    saveNotificationSettings,
    completeOnboarding,
    resetOnboarding,
    
    // Helpers
    setError,
    loadDealer,
  };
}
