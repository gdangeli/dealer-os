"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  EmailTemplate,
  EmailTemplateCategory,
  templateCategoryLabels,
  templateCategoryIcons,
  templateCategoryColors,
  availablePlaceholders,
} from "@/types/email-templates";

// Template Card Component
function TemplateCard({ 
  template, 
  onEdit, 
  onDelete, 
  onToggleDefault 
}: { 
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onToggleDefault: (id: string, isDefault: boolean) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Card className={`relative ${!template.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{templateCategoryIcons[template.category]}</span>
              <h3 className="font-semibold truncate">{template.name}</h3>
              {template.is_default && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ Standard
                </Badge>
              )}
            </div>
            <Badge className={templateCategoryColors[template.category]}>
              {templateCategoryLabels[template.category]}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              👁️
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(template)}
            >
              ✏️
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(template.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="text-sm">
            <span className="text-slate-500">Betreff:</span>
            <span className="ml-2 font-medium">{template.subject}</span>
          </div>
          
          {showPreview && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap">
              {template.body}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={template.is_default}
              onChange={(e) => onToggleDefault(template.id, e.target.checked)}
              className="rounded"
            />
            Als Standard setzen
          </label>
          <span className="text-xs text-slate-400">
            Aktualisiert: {new Date(template.updated_at).toLocaleDateString('de-CH')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Editor Component
function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template?: EmailTemplate | null;
  onSave: (data: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState<EmailTemplateCategory>(template?.category || 'custom');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [showPlaceholders, setShowPlaceholders] = useState(false);

  const insertPlaceholder = (placeholder: string) => {
    setBody(body + placeholder);
  };

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      alert('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    onSave({
      id: template?.id,
      name: name.trim(),
      category,
      subject: subject.trim(),
      body: body.trim(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Freundliche Begrüssung"
          />
        </div>
        <div>
          <Label htmlFor="category">Kategorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as EmailTemplateCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templateCategoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {templateCategoryIcons[key as EmailTemplateCategory]} {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Betreff *</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="z.B. Ihre Anfrage bei {{haendler_name}}"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="body">Nachricht *</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowPlaceholders(!showPlaceholders)}
          >
            {showPlaceholders ? '🔽 Platzhalter ausblenden' : '➕ Platzhalter einfügen'}
          </Button>
        </div>
        
        {showPlaceholders && (
          <div className="mb-2 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">Klicken Sie auf einen Platzhalter, um ihn einzufügen:</p>
            <div className="flex flex-wrap gap-1">
              {availablePlaceholders.map((p) => (
                <Button
                  key={p.key}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => insertPlaceholder(p.key)}
                  title={`Beispiel: ${p.example}`}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Guten Tag {{kunde_vorname}} {{kunde_nachname}}

Vielen Dank für Ihr Interesse an unserem {{fahrzeug}}.

Mit freundlichen Grüssen
{{haendler_name}}"
          rows={10}
          className="font-mono text-sm"
        />
      </div>

      {/* Preview */}
      {body && (
        <div>
          <Label>Vorschau</Label>
          <div className="mt-1 p-4 bg-slate-50 rounded-lg border">
            <div className="text-sm font-medium mb-2 text-slate-600">
              Betreff: {subject.replace(/\{\{.*?\}\}/g, (m) => {
                const p = availablePlaceholders.find(pl => pl.key === m);
                return p ? `[${p.example}]` : m;
              })}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {body.replace(/\{\{.*?\}\}/g, (m) => {
                const p = availablePlaceholders.find(pl => pl.key === m);
                return p ? `[${p.example}]` : m;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>
          {template?.id ? 'Speichern' : 'Erstellen'}
        </Button>
      </div>
    </div>
  );
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<EmailTemplateCategory | 'all'>('all');

  const supabase = createClient();

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('category')
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  }

  async function saveTemplate(data: Partial<EmailTemplate>) {
    if (data.id) {
      // Update
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: data.name,
          category: data.category,
          subject: data.subject,
          body: data.body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (error) {
        console.error('Error updating template:', error);
        alert('Fehler beim Speichern');
        return;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: data.name,
          category: data.category,
          subject: data.subject,
          body: data.body,
        });

      if (error) {
        console.error('Error creating template:', error);
        alert('Fehler beim Erstellen');
        return;
      }
    }

    setIsDialogOpen(false);
    setEditingTemplate(null);
    fetchTemplates();
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Template wirklich löschen?')) return;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      alert('Fehler beim Löschen');
    } else {
      fetchTemplates();
    }
  }

  async function toggleDefault(id: string, isDefault: boolean) {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    // Wenn als Standard gesetzt, andere in gleicher Kategorie zurücksetzen
    if (isDefault) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('category', template.category)
        .neq('id', id);
    }

    const { error } = await supabase
      .from('email_templates')
      .update({ is_default: isDefault })
      .eq('id', id);

    if (error) {
      console.error('Error toggling default:', error);
    } else {
      fetchTemplates();
    }
  }

  const filteredTemplates = categoryFilter === 'all' 
    ? templates 
    : templates.filter(t => t.category === categoryFilter);

  // Group by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<EmailTemplateCategory, EmailTemplate[]>);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">E-Mail-Vorlagen</h1>
          <p className="text-slate-600">Vorlagen für schnelle Kundenantworten mit Platzhaltern</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              + Neue Vorlage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
              </DialogTitle>
            </DialogHeader>
            <TemplateEditor
              template={editingTemplate}
              onSave={saveTemplate}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as EmailTemplateCategory | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Kategorie filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {Object.entries(templateCategoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {templateCategoryIcons[key as EmailTemplateCategory]} {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-500">
          {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Vorlage' : 'Vorlagen'}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          Wird geladen...
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-4xl mb-4">📧</p>
            <p className="text-slate-500 mb-4">
              Noch keine E-Mail-Vorlagen erstellt
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Erstellen Sie Vorlagen mit Platzhaltern für schnelle, personalisierte Kundenantworten
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Erste Vorlage erstellen
            </Button>
          </CardContent>
        </Card>
      ) : categoryFilter === 'all' ? (
        // Grouped View
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{templateCategoryIcons[category as EmailTemplateCategory]}</span>
                {templateCategoryLabels[category as EmailTemplateCategory]}
                <Badge variant="secondary">{categoryTemplates.length}</Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={(t) => {
                      setEditingTemplate(t);
                      setIsDialogOpen(true);
                    }}
                    onDelete={deleteTemplate}
                    onToggleDefault={toggleDefault}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat View (filtered)
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={(t) => {
                setEditingTemplate(t);
                setIsDialogOpen(true);
              }}
              onDelete={deleteTemplate}
              onToggleDefault={toggleDefault}
            />
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tipp: Platzhalter verwenden</h3>
          <p className="text-sm text-blue-700 mb-3">
            Nutzen Sie Platzhalter wie <code className="bg-blue-100 px-1 rounded">{'{{kunde_vorname}}'}</code> für 
            personalisierte E-Mails. Diese werden beim Versand automatisch ersetzt.
          </p>
          <div className="flex flex-wrap gap-2">
            {availablePlaceholders.slice(0, 6).map((p) => (
              <code key={p.key} className="text-xs bg-blue-100 px-2 py-1 rounded">
                {p.key}
              </code>
            ))}
            <span className="text-xs text-blue-600">...und mehr</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
