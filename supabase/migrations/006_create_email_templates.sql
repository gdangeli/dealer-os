-- Email Templates für Kundenantworten
-- Migration: 006_create_email_templates.sql

-- Enum für Template-Kategorien
CREATE TYPE email_template_category AS ENUM (
  'greeting',           -- Begrüssung / Erstkontakt
  'test_drive',         -- Probefahrt-Bestätigung
  'price_inquiry',      -- Preisanfrage-Antwort
  'followup',           -- Nachfass-E-Mail
  'rejection',          -- Absage (höflich)
  'custom'              -- Benutzerdefiniert
);

-- Haupttabelle für E-Mail-Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- Template-Metadaten
  name VARCHAR(100) NOT NULL,
  category email_template_category NOT NULL DEFAULT 'custom',
  description TEXT,
  
  -- Template-Inhalt
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  
  -- Verfügbare Platzhalter (zur Dokumentation)
  -- {{kunde_name}}, {{kunde_vorname}}, {{kunde_nachname}}
  -- {{fahrzeug}}, {{fahrzeug_marke}}, {{fahrzeug_modell}}, {{fahrzeug_jahrgang}}
  -- {{preis}}, {{haendler_name}}, {{haendler_telefon}}, {{haendler_email}}
  -- {{datum}}, {{uhrzeit}}
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_email_templates_dealer ON email_templates(dealer_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(dealer_id, is_active);

-- Nur ein Default-Template pro Kategorie pro Händler
CREATE UNIQUE INDEX idx_email_templates_default 
  ON email_templates(dealer_id, category) 
  WHERE is_default = true;

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Händler können nur ihre eigenen Templates sehen
CREATE POLICY "Dealers can view own templates" ON email_templates
  FOR SELECT USING (dealer_id = auth.uid());

-- Händler können ihre eigenen Templates erstellen
CREATE POLICY "Dealers can create own templates" ON email_templates
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

-- Händler können ihre eigenen Templates bearbeiten
CREATE POLICY "Dealers can update own templates" ON email_templates
  FOR UPDATE USING (dealer_id = auth.uid());

-- Händler können ihre eigenen Templates löschen
CREATE POLICY "Dealers can delete own templates" ON email_templates
  FOR DELETE USING (dealer_id = auth.uid());

-- Updated_at Trigger
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Standard-Templates einfügen (werden bei Dealer-Erstellung kopiert)
-- Diese Funktion erstellt Standard-Templates für neue Händler
CREATE OR REPLACE FUNCTION create_default_email_templates(p_dealer_id UUID)
RETURNS void AS $$
BEGIN
  -- Begrüssung / Erstkontakt
  INSERT INTO email_templates (dealer_id, name, category, subject, body, is_default)
  VALUES (
    p_dealer_id,
    'Erstkontakt',
    'greeting',
    'Ihre Anfrage bei {{haendler_name}}',
    E'Guten Tag {{kunde_vorname}} {{kunde_nachname}}\n\nVielen Dank für Ihr Interesse an unserem {{fahrzeug}}.\n\nWir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.\n\nMit freundlichen Grüssen\n{{haendler_name}}\n{{haendler_telefon}}',
    true
  );

  -- Probefahrt-Bestätigung
  INSERT INTO email_templates (dealer_id, name, category, subject, body, is_default)
  VALUES (
    p_dealer_id,
    'Probefahrt-Bestätigung',
    'test_drive',
    'Probefahrt-Termin bestätigt - {{fahrzeug}}',
    E'Guten Tag {{kunde_vorname}} {{kunde_nachname}}\n\nWir freuen uns, Ihren Probefahrt-Termin für den {{fahrzeug}} zu bestätigen.\n\n📅 Datum: {{datum}}\n⏰ Uhrzeit: {{uhrzeit}}\n\nBitte bringen Sie einen gültigen Führerschein mit.\n\nBei Fragen erreichen Sie uns unter {{haendler_telefon}}.\n\nWir freuen uns auf Sie!\n\nMit freundlichen Grüssen\n{{haendler_name}}',
    true
  );

  -- Preisanfrage-Antwort
  INSERT INTO email_templates (dealer_id, name, category, subject, body, is_default)
  VALUES (
    p_dealer_id,
    'Preisanfrage',
    'price_inquiry',
    'Preisinfo: {{fahrzeug}} - {{preis}}',
    E'Guten Tag {{kunde_vorname}} {{kunde_nachname}}\n\nVielen Dank für Ihre Preisanfrage zum {{fahrzeug}}.\n\n💰 Unser Angebot: {{preis}}\n\nDas Fahrzeug ist sofort verfügbar. Gerne können Sie es bei einer Probefahrt kennenlernen.\n\nBei Interesse oder weiteren Fragen stehe ich Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüssen\n{{haendler_name}}\n{{haendler_telefon}}\n{{haendler_email}}',
    true
  );

  -- Nachfass-E-Mail
  INSERT INTO email_templates (dealer_id, name, category, subject, body, is_default)
  VALUES (
    p_dealer_id,
    'Nachfassen',
    'followup',
    'Noch Interesse am {{fahrzeug}}?',
    E'Guten Tag {{kunde_vorname}} {{kunde_nachname}}\n\nVor einiger Zeit haben Sie sich für unseren {{fahrzeug}} interessiert.\n\nDas Fahrzeug ist immer noch verfügbar! Gerne möchte ich mich erkundigen, ob Sie noch Interesse haben.\n\nFür Fragen oder einen Besichtigungstermin stehe ich Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüssen\n{{haendler_name}}\n{{haendler_telefon}}',
    true
  );

  -- Absage (höflich)
  INSERT INTO email_templates (dealer_id, name, category, subject, body, is_default)
  VALUES (
    p_dealer_id,
    'Absage',
    'rejection',
    'Vielen Dank für Ihr Interesse',
    E'Guten Tag {{kunde_vorname}} {{kunde_nachname}}\n\nVielen Dank für Ihr Interesse an unserem {{fahrzeug}}.\n\nLeider müssen wir Ihnen mitteilen, dass das Fahrzeug bereits verkauft wurde / nicht mehr verfügbar ist.\n\nGerne informieren wir Sie, wenn ein ähnliches Fahrzeug verfügbar wird. Schauen Sie auch regelmässig auf unserer Website vorbei.\n\nMit freundlichen Grüssen\n{{haendler_name}}',
    true
  );
END;
$$ LANGUAGE plpgsql;

-- Kommentar zur Tabelle
COMMENT ON TABLE email_templates IS 'E-Mail-Vorlagen für Kundenantworten mit Platzhaltern';
COMMENT ON COLUMN email_templates.body IS 'Template-Text mit Platzhaltern: {{kunde_name}}, {{fahrzeug}}, {{preis}}, etc.';
