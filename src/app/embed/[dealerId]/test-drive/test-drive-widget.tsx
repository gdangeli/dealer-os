"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Car, User, Phone, Mail, Check, Loader2 } from "lucide-react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant?: string;
  asking_price?: number;
}

interface WidgetConfig {
  primaryColor: string;
  darkMode: boolean;
  preselectedVehicle?: string;
  locale: string;
}

interface TestDriveWidgetProps {
  dealerId: string;
  dealerName: string;
  vehicles: Vehicle[];
  config: WidgetConfig;
}

const translations = {
  de: {
    title: "Probefahrt buchen",
    selectVehicle: "Fahrzeug wählen (optional)",
    noVehicle: "Kein bestimmtes Fahrzeug",
    name: "Name",
    namePlaceholder: "Ihr vollständiger Name",
    email: "E-Mail",
    emailPlaceholder: "ihre@email.ch",
    phone: "Telefon",
    phonePlaceholder: "+41 79 123 45 67",
    date: "Wunschdatum",
    time: "Uhrzeit",
    notes: "Nachricht (optional)",
    notesPlaceholder: "Besondere Wünsche oder Fragen...",
    submit: "Probefahrt anfragen",
    submitting: "Wird gesendet...",
    success: "Vielen Dank!",
    successMessage: "Ihre Probefahrt-Anfrage wurde gesendet. Wir melden uns in Kürze bei Ihnen.",
    error: "Fehler beim Senden. Bitte versuchen Sie es erneut.",
    required: "Pflichtfeld",
    emailOrPhone: "E-Mail oder Telefon erforderlich",
    poweredBy: "Powered by Dealer OS",
  },
  en: {
    title: "Book a Test Drive",
    selectVehicle: "Select vehicle (optional)",
    noVehicle: "No specific vehicle",
    name: "Name",
    namePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "your@email.com",
    phone: "Phone",
    phonePlaceholder: "+41 79 123 45 67",
    date: "Preferred date",
    time: "Time",
    notes: "Message (optional)",
    notesPlaceholder: "Special requests or questions...",
    submit: "Request Test Drive",
    submitting: "Sending...",
    success: "Thank you!",
    successMessage: "Your test drive request has been sent. We will contact you shortly.",
    error: "Error sending. Please try again.",
    required: "Required",
    emailOrPhone: "Email or phone required",
    poweredBy: "Powered by Dealer OS",
  },
  fr: {
    title: "Réserver un essai",
    selectVehicle: "Choisir un véhicule (optionnel)",
    noVehicle: "Pas de véhicule spécifique",
    name: "Nom",
    namePlaceholder: "Votre nom complet",
    email: "E-mail",
    emailPlaceholder: "votre@email.ch",
    phone: "Téléphone",
    phonePlaceholder: "+41 79 123 45 67",
    date: "Date souhaitée",
    time: "Heure",
    notes: "Message (optionnel)",
    notesPlaceholder: "Demandes spéciales ou questions...",
    submit: "Demander un essai",
    submitting: "Envoi en cours...",
    success: "Merci!",
    successMessage: "Votre demande d'essai a été envoyée. Nous vous contacterons bientôt.",
    error: "Erreur lors de l'envoi. Veuillez réessayer.",
    required: "Obligatoire",
    emailOrPhone: "E-mail ou téléphone requis",
    poweredBy: "Powered by Dealer OS",
  },
  it: {
    title: "Prenota un test drive",
    selectVehicle: "Seleziona veicolo (opzionale)",
    noVehicle: "Nessun veicolo specifico",
    name: "Nome",
    namePlaceholder: "Il tuo nome completo",
    email: "E-mail",
    emailPlaceholder: "tua@email.ch",
    phone: "Telefono",
    phonePlaceholder: "+41 79 123 45 67",
    date: "Data desiderata",
    time: "Ora",
    notes: "Messaggio (opzionale)",
    notesPlaceholder: "Richieste speciali o domande...",
    submit: "Richiedi test drive",
    submitting: "Invio in corso...",
    success: "Grazie!",
    successMessage: "La tua richiesta di test drive è stata inviata. Ti contatteremo a breve.",
    error: "Errore durante l'invio. Riprova.",
    required: "Obbligatorio",
    emailOrPhone: "E-mail o telefono richiesto",
    poweredBy: "Powered by Dealer OS",
  },
};

export function TestDriveWidget({ dealerId, dealerName, vehicles, config }: TestDriveWidgetProps) {
  const t = translations[config.locale as keyof typeof translations] || translations.de;
  
  const [formData, setFormData] = useState({
    vehicle_id: config.preselectedVehicle || "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    date: "",
    time: "10:00",
    notes: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send height to parent iframe
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "dealeros-height", height }, "*");
    };
    sendHeight();
    window.addEventListener("resize", sendHeight);
    return () => window.removeEventListener("resize", sendHeight);
  }, [success]);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.customer_name.trim()) {
      setError(t.required);
      return;
    }
    if (!formData.customer_email.trim() && !formData.customer_phone.trim()) {
      setError(t.emailOrPhone);
      return;
    }
    if (!formData.date) {
      setError(t.required);
      return;
    }

    setSubmitting(true);

    try {
      // Combine date and time
      const scheduled_at = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      const response = await fetch("/api/public/test-drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_id: dealerId,
          vehicle_id: formData.vehicle_id || null,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email || null,
          customer_phone: formData.customer_phone || null,
          scheduled_at,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
      
      // Notify parent
      window.parent.postMessage({ 
        type: "dealeros-test-drive-booked",
        dealerId,
        vehicleId: formData.vehicle_id,
      }, "*");

    } catch (err) {
      console.error("Error submitting:", err);
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const bgColor = config.darkMode ? "bg-gray-900" : "bg-white";
  const textColor = config.darkMode ? "text-white" : "text-gray-900";
  const textMuted = config.darkMode ? "text-gray-400" : "text-gray-500";
  const inputBg = config.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300";
  const borderColor = config.darkMode ? "border-gray-700" : "border-gray-200";

  if (success) {
    return (
      <div className={`p-6 ${bgColor} rounded-lg`}>
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: config.primaryColor + "20" }}
          >
            <Check className="w-8 h-8" style={{ color: config.primaryColor }} />
          </div>
          <h2 className={`text-2xl font-bold ${textColor} mb-2`}>{t.success}</h2>
          <p className={textMuted}>{t.successMessage}</p>
        </div>
        <div className={`mt-6 pt-4 border-t ${borderColor} text-center`}>
          <a 
            href="https://dealeros.ch"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs ${textMuted} hover:underline`}
          >
            {t.poweredBy}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${bgColor} rounded-lg`}>
      <div className="mb-6">
        <h2 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
          <Car className="w-5 h-5" style={{ color: config.primaryColor }} />
          {t.title}
        </h2>
        <p className={`text-sm ${textMuted}`}>{dealerName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Selection */}
        {vehicles.length > 0 && (
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>
              {t.selectVehicle}
            </label>
            <select
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
              style={{ focusRing: config.primaryColor } as React.CSSProperties}
            >
              <option value="">{t.noVehicle}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} {v.variant || ""}
                  {v.asking_price ? ` - CHF ${v.asking_price.toLocaleString("de-CH")}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Name */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-1`}>
            <User className="w-4 h-4 inline mr-1" />
            {t.name} *
          </label>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            placeholder={t.namePlaceholder}
            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>
              <Mail className="w-4 h-4 inline mr-1" />
              {t.email}
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              placeholder={t.emailPlaceholder}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>
              <Phone className="w-4 h-4 inline mr-1" />
              {t.phone}
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              placeholder={t.phonePlaceholder}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t.date} *
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t.time}
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2`}
            >
              {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
                "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"].map((time) => (
                <option key={time} value={time}>{time} Uhr</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-1`}>
            {t.notes}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder={t.notesPlaceholder}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textColor} focus:outline-none focus:ring-2 resize-none`}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: config.primaryColor }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.submitting}
            </>
          ) : (
            <>
              <Car className="w-4 h-4" />
              {t.submit}
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className={`mt-6 pt-4 border-t ${borderColor} text-center`}>
        <a 
          href="https://dealeros.ch"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs ${textMuted} hover:underline`}
        >
          {t.poweredBy}
        </a>
      </div>
    </div>
  );
}
