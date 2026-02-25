"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="py-8 text-center text-gray-500">
          Vorlagen werden geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">E-Mail-Vorlagen</h2>
          </div>
          <p className="text-sm text-gray-500">Erstellen Sie Vorlagen für häufige Kundenantworten</p>
        </div>
        <button onClick={() => openEditor()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + Neue Vorlage
        </button>
      </div>
      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">Noch keine E-Mail-Vorlagen erstellt.</p>
            <button onClick={() => openEditor()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Erste Vorlage erstellen
            </button>
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
                  <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    id="template-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="z.B. Probefahrt-Bestätigung"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
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
                <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <input
                  id="template-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Kurze Beschreibung wann diese Vorlage verwendet wird..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-1">Betreff *</label>
                <input
                  id="template-subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="z.B. Probefahrt-Termin bestätigt - {{fahrzeug}}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="template-body" className="block text-sm font-medium text-gray-700 mb-1">Nachricht *</label>
                <textarea
                  id="template-body"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Guten Tag {{kunde_vorname}} {{kunde_nachname}}..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Platzhalter-Übersicht */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm text-gray-900">Verfügbare Platzhalter</h4>
                <div className="flex flex-wrap gap-2">
                  {availablePlaceholders.map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertPlaceholder(p.key)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono hover:bg-blue-50 hover:border-blue-300"
                      title={`${p.label} (z.B. ${p.example})`}
                    >
                      {p.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                {saving ? "Wird gespeichert..." : "Speichern"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
