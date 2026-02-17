"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  EmailTemplate,
  EmailTemplateCategory,
  templateCategoryLabels,
  templateCategoryIcons,
  templateCategoryColors,
} from "@/types/email-templates";
import { useEmailTemplates } from "@/hooks/use-email-templates";

interface EmailTemplateSelectorProps {
  dealerId: string;
  onSelect: (template: EmailTemplate) => void;
  selectedCategory?: EmailTemplateCategory;
}

export function EmailTemplateSelector({
  dealerId,
  onSelect,
  selectedCategory,
}: EmailTemplateSelectorProps) {
  const { templates, loading } = useEmailTemplates(dealerId);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Gruppiere Templates nach Kategorie
  const categories: EmailTemplateCategory[] = [
    'greeting',
    'test_drive', 
    'price_inquiry',
    'followup',
    'rejection',
    'custom',
  ];

  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  const handleSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onSelect(template);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  if (loading) {
    return <div className="text-slate-500 text-sm">Vorlagen werden geladen...</div>;
  }

  if (templates.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        Keine E-Mail-Vorlagen vorhanden. 
        <br />
        <span className="text-xs">Erstellen Sie Vorlagen unter Einstellungen → E-Mail-Vorlagen</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <Select onValueChange={handleSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Vorlage wählen..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => {
              const categoryTemplates = filteredTemplates.filter(t => t.category === category);
              if (categoryTemplates.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">
                    {templateCategoryIcons[category]} {templateCategoryLabels[category]}
                  </div>
                  {categoryTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        {template.is_default && (
                          <Badge variant="outline" className="text-xs">Standard</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Quick-Select Buttons für häufige Templates */}
      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 5).map(category => {
          const defaultTemplate = templates.find(
            t => t.category === category && t.is_default
          );
          if (!defaultTemplate) return null;
          
          return (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => onSelect(defaultTemplate)}
              className="text-xs"
            >
              {templateCategoryIcons[category]} {templateCategoryLabels[category]}
            </Button>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {previewTemplate?.name}
              <Badge className={`ml-2 ${templateCategoryColors[previewTemplate?.category || 'custom']}`}>
                {templateCategoryLabels[previewTemplate?.category || 'custom']}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Vorschau der E-Mail-Vorlage
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Betreff:</label>
                <div className="mt-1 p-2 bg-slate-50 rounded border text-sm">
                  {previewTemplate.subject}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Nachricht:</label>
                <div className="mt-1 p-3 bg-slate-50 rounded border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {previewTemplate.body}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Schliessen
                </Button>
                <Button onClick={() => {
                  onSelect(previewTemplate);
                  setShowPreview(false);
                }}>
                  Verwenden
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
