"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmailTemplateSelector } from "./email-template-selector";
import { 
  EmailTemplate,
  TemplateContext,
  replacePlaceholders,
  extractPlaceholders,
  availablePlaceholders,
} from "@/types/email-templates";

interface EmailComposerProps {
  dealerId: string;
  recipientEmail?: string;
  recipientName?: string;
  context?: TemplateContext;
  onSend?: (email: { to: string; subject: string; body: string }) => void;
  onClose?: () => void;
}

export function EmailComposer({
  dealerId,
  recipientEmail = "",
  recipientName = "",
  context = {},
  onSend,
  onClose,
}: EmailComposerProps) {
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [sending, setSending] = useState(false);
  const [showPlaceholders, setShowPlaceholders] = useState(false);

  // E-Mail-Adresse aktualisieren wenn sich der Empfänger ändert
  useEffect(() => {
    setTo(recipientEmail);
  }, [recipientEmail]);

  // Template anwenden
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Platzhalter mit Kontext ersetzen
    const processedSubject = replacePlaceholders(template.subject, context);
    const processedBody = replacePlaceholders(template.body, context);
    
    setSubject(processedSubject);
    setBody(processedBody);
  };

  // Platzhalter in Text einfügen
  const insertPlaceholder = (placeholder: string, field: 'subject' | 'body') => {
    if (field === 'subject') {
      setSubject(prev => prev + placeholder);
    } else {
      setBody(prev => prev + placeholder);
    }
  };

  // E-Mail senden
  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }

    setSending(true);
    
    try {
      // Hier würde die tatsächliche E-Mail-Versand-Logik kommen
      // Für jetzt simulieren wir es
      if (onSend) {
        onSend({ to, subject, body });
      }
      
      // Mailto-Link als Fallback öffnen
      const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
      
      // Formular zurücksetzen
      setSubject("");
      setBody("");
      setSelectedTemplate(null);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Fehler beim Senden der E-Mail");
    } finally {
      setSending(false);
    }
  };

  // Verbleibende Platzhalter im Text finden
  const remainingPlaceholders = extractPlaceholders(subject + body);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✉️ E-Mail schreiben
          {selectedTemplate && (
            <Badge variant="outline" className="text-xs font-normal">
              Vorlage: {selectedTemplate.name}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {recipientName ? `An ${recipientName}` : "E-Mail an den Kunden senden"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template-Auswahl */}
        <div>
          <Label className="text-sm text-slate-600 mb-2 block">
            📋 Vorlage wählen (optional)
          </Label>
          <EmailTemplateSelector 
            dealerId={dealerId} 
            onSelect={handleTemplateSelect}
          />
        </div>

        <hr className="my-4" />

        {/* Empfänger */}
        <div>
          <Label htmlFor="email-to">An</Label>
          <Input
            id="email-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="kunde@example.com"
          />
        </div>

        {/* Betreff */}
        <div>
          <Label htmlFor="email-subject">Betreff</Label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Betreff der E-Mail..."
          />
        </div>

        {/* Nachricht */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="email-body">Nachricht</Label>
            <Dialog open={showPlaceholders} onOpenChange={setShowPlaceholders}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6">
                  {'{}'} Platzhalter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verfügbare Platzhalter</DialogTitle>
                  <DialogDescription>
                    Klicken Sie auf einen Platzhalter um ihn einzufügen
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 max-h-80 overflow-y-auto">
                  {availablePlaceholders.map(p => (
                    <button
                      key={p.key}
                      onClick={() => {
                        insertPlaceholder(p.key, 'body');
                        setShowPlaceholders(false);
                      }}
                      className="flex items-center justify-between p-2 text-left hover:bg-slate-100 rounded border text-sm"
                    >
                      <div>
                        <code className="text-blue-600 font-mono text-xs">{p.key}</code>
                        <div className="text-slate-600 text-xs">{p.label}</div>
                      </div>
                      <span className="text-slate-400 text-xs">z.B. {p.example}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ihre Nachricht..."
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        {/* Warnung bei nicht-ersetzten Platzhaltern */}
        {remainingPlaceholders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <strong className="text-yellow-800">⚠️ Nicht ersetzte Platzhalter:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {remainingPlaceholders.map(p => (
                <code key={p} className="bg-yellow-100 px-1 rounded text-xs">{p}</code>
              ))}
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Bitte ersetzen Sie diese manuell oder fügen Sie fehlende Daten hinzu.
            </p>
          </div>
        )}

        {/* Aktionen */}
        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          )}
          <Button 
            onClick={handleSend} 
            disabled={sending || !to || !subject || !body}
          >
            {sending ? "Wird gesendet..." : "📧 E-Mail öffnen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
