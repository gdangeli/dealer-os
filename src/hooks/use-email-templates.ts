"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  EmailTemplate, 
  EmailTemplateCreate, 
  EmailTemplateUpdate,
  EmailTemplateCategory 
} from "@/types/email-templates";

export function useEmailTemplates(dealerId?: string) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    if (!dealerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("dealer_id", dealerId)
        .eq("is_active", true)
        .order("category")
        .order("name");

      if (fetchError) throw fetchError;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Fehler beim Laden der Vorlagen");
    } finally {
      setLoading(false);
    }
  }, [dealerId, supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (template: EmailTemplateCreate): Promise<EmailTemplate | null> => {
    if (!dealerId) return null;

    try {
      const { data, error: createError } = await supabase
        .from("email_templates")
        .insert({
          ...template,
          dealer_id: dealerId,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      await fetchTemplates();
      return data;
    } catch (err) {
      console.error("Error creating template:", err);
      setError("Fehler beim Erstellen der Vorlage");
      return null;
    }
  };

  const updateTemplate = async (
    id: string, 
    updates: EmailTemplateUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from("email_templates")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error("Error updating template:", err);
      setError("Fehler beim Aktualisieren der Vorlage");
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error("Error deleting template:", err);
      setError("Fehler beim Löschen der Vorlage");
      return false;
    }
  };

  const setDefaultTemplate = async (
    id: string, 
    category: EmailTemplateCategory
  ): Promise<boolean> => {
    if (!dealerId) return false;

    try {
      // Erst alle anderen Defaults in dieser Kategorie entfernen
      await supabase
        .from("email_templates")
        .update({ is_default: false })
        .eq("dealer_id", dealerId)
        .eq("category", category);

      // Dann das neue Default setzen
      const { error: updateError } = await supabase
        .from("email_templates")
        .update({ is_default: true })
        .eq("id", id);

      if (updateError) throw updateError;
      
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error("Error setting default template:", err);
      setError("Fehler beim Setzen der Standard-Vorlage");
      return false;
    }
  };

  const getTemplatesByCategory = (category: EmailTemplateCategory): EmailTemplate[] => {
    return templates.filter(t => t.category === category);
  };

  const getDefaultTemplate = (category: EmailTemplateCategory): EmailTemplate | undefined => {
    return templates.find(t => t.category === category && t.is_default);
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getTemplatesByCategory,
    getDefaultTemplate,
  };
}

// Hook für einen einzelnen Template
export function useEmailTemplate(templateId: string | null) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      return;
    }

    async function fetchTemplate() {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (!error && data) {
        setTemplate(data);
      }
      setLoading(false);
    }

    fetchTemplate();
  }, [templateId, supabase]);

  return { template, loading };
}
