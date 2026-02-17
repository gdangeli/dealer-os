"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmailTemplates } from "@/hooks/use-email-templates";
import {
  EmailTemplate,
  EmailTemplateCategory,
  EmailTemplateCreate,
  templateCategoryLabels,
  templateCategoryIcons,
  templateCategoryColors,
  availablePlaceholders,
} from "@/types/email-templates";

interface EmailTemplateManagerProps {
  dealerId: string;
}

const categories: EmailTemplateCategory[] = [
  'greeting',
  'test_drive',
  'price_inquiry',
  'followup',
  'rejection',
  'custom',
];

export function EmailTemplateManager({ dealerId }: EmailTemplateManagerProps) {
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useEmailTemplates(dealerId);

  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<EmailTemplateCategory>("custom");
  const [formDescription, setFormDescription] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormCategory("custom");
    setFormDescription("");
    setFormSubject("");
    setFormBody("");
    setEditingTemplate(null);
  };

  const openEditor = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormName(template.name);
      setFormCategory(template.category);
      setFormDescription(template.description || "");
      setFormSubject(template.subject);
      setFormBody(template.body);
    } else {
      resetForm();
    }
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formName || !formSubject || !formBody) {
      alert("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    setSaving(true);

    try {
      if (editingTemplate) {
        // Update
        await updateTemplate(editingTemplate.id, {
          name: formName,
          category: formCategory,
          description: formDescription || undefined,
          subject: formSubject,
          body: formBody,
        });
      } else {
        // Create
        const newTemplate: EmailTemplateCreate = {
          name: formName,
          category: formCategory,
          description: formDescription || undefined,
          subject: formSubject,
          body: formBody,
        };
        await createTemplate(newTemplate);
      }

      setShowEditor(false);
      resetForm();
    } catch (err) {
      console.error("Error saving template:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Vorlage "${template.name}" wirklich löschen?`)) return;
    await deleteTemplate(template.id);
  };

  const handleSetDefault = async (template: EmailTemplate) => {
    await setDefaultTemplate(template.id, template.category);
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormBody(prev => prev + placeholder);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Vorlagen werden geladen...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>✉️ E-Mail-Vorlagen</CardTitle>
            <CardDescription>
              Erstellen Sie Vorlagen für häufige Kundenantworten
            </CardDescription>
          </div>
          <Button onClick={() => openEditor()}>
            + Neue Vorlage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="mb-4">Noch keine E-Mail-Vorlagen erstellt.</p>
            <Button onClick={() => openEditor()}>
              Erste Vorlage erstellen
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {template.name}
                    {template.is_default && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Standard
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={templateCategoryColors[template.category]}>
                      {templateCategoryIcons[template.category]} {templateCategoryLabels[template.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">
                    {template.subject}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!template.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(template)}
                        title="Als Standard setzen"
                      >
                        ⭐
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditor(template)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Vorlage bearbeiten" : "Neue Vorlage erstellen"}
              </DialogTitle>
              <DialogDescription>
                Erstellen Sie eine E-Mail-Vorlage mit Platzhaltern
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Name *</Label>
                  <Input
                    id="template-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="z.B. Probefahrt-Bestätigung"
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Kategorie *</Label>
                  <Select 
                    value={formCategory} 
                    onValueChange={(v) => setFormCategory(v as EmailTemplateCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {templateCategoryIcons[cat]} {templateCategoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Beschreibung</Label>
                <Input
                  id="template-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Kurze Beschreibung wann diese Vorlage verwendet wird..."
                />
              </div>

              <div>
                <Label htmlFor="template-subject">Betreff *</Label>
                <Input
                  id="template-subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="z.B. Probefahrt-Termin bestätigt - {{fahrzeug}}"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="template-body">Nachricht *</Label>
                </div>
                <Textarea
                  id="template-body"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Guten Tag {{kunde_vorname}} {{kunde_nachname}}..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              {/* Platzhalter-Übersicht */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm">Verfügbare Platzhalter</h4>
                <div className="flex flex-wrap gap-2">
                  {availablePlaceholders.map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertPlaceholder(p.key)}
                      className="px-2 py-1 bg-white border rounded text-xs font-mono hover:bg-blue-50 hover:border-blue-300"
                      title={`${p.label} (z.B. ${p.example})`}
                    >
                      {p.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
