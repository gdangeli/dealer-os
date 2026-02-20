"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface WidgetConfig {
  primary_color?: string;
  font_family?: string;
  button_style?: string;
  dark_mode?: boolean;
  layout?: string;
  show_price?: boolean;
  contact_url?: string;
  allowed_domains?: string[];
}

interface WidgetSettingsProps {
  dealerId: string;
  initialEnabled: boolean;
  initialConfig: WidgetConfig;
}

export function WidgetSettings({ dealerId, initialEnabled, initialConfig }: WidgetSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [config, setConfig] = useState<WidgetConfig>({
    primary_color: initialConfig.primary_color || "#2563eb",
    font_family: initialConfig.font_family || "system-ui",
    button_style: initialConfig.button_style || "rounded",
    dark_mode: initialConfig.dark_mode || false,
    layout: initialConfig.layout || "grid",
    show_price: initialConfig.show_price !== false,
    contact_url: initialConfig.contact_url || "",
    allowed_domains: initialConfig.allowed_domains || [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("dealers")
        .update({
          widget_enabled: enabled,
          widget_config: config,
        })
        .eq("id", dealerId);

      if (error) throw error;
      toast.success("Widget-Einstellungen gespeichert");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  const embedCode = `<iframe 
  src="https://dealeros.ch/embed/${dealerId}"
  style="width: 100%; border: none; min-height: 600px;"
  loading="lazy"
></iframe>

<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'dealeros-height') {
      document.querySelector('iframe[src*="dealeros.ch/embed"]').style.height = e.data.height + 'px';
    }
    if (e.data.type === 'dealeros-contact') {
      // Handle contact request
      console.log('Contact requested for:', e.data.vehicle);
    }
  });
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Code kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 Website-Widget</CardTitle>
          <CardDescription>
            Betten Sie Ihre Fahrzeuge auf Ihrer eigenen Website ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Widget aktivieren</Label>
              <p className="text-sm text-slate-500">
                Erlaubt das Einbetten Ihrer Fahrzeuge auf externen Websites.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </CardContent>
      </Card>

      {enabled && (
        <>
          {/* Styling */}
          <Card>
            <CardHeader>
              <CardTitle>🎨 Styling</CardTitle>
              <CardDescription>
                Passen Sie das Erscheinungsbild an Ihre Website an.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_family">Schriftart</Label>
                  <Select 
                    value={config.font_family} 
                    onValueChange={(v) => setConfig({ ...config, font_family: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-ui">System (Standard)</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_style">Button-Stil</Label>
                  <Select 
                    value={config.button_style} 
                    onValueChange={(v) => setConfig({ ...config, button_style: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Abgerundet</SelectItem>
                      <SelectItem value="square">Eckig</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select 
                    value={config.layout} 
                    onValueChange={(v) => setConfig({ ...config, layout: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Kacheln</SelectItem>
                      <SelectItem value="list">Liste</SelectItem>
                      <SelectItem value="slider">Slider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Dunkler Modus</Label>
                  <p className="text-sm text-slate-500">Für dunkle Website-Hintergründe</p>
                </div>
                <Switch 
                  checked={config.dark_mode} 
                  onCheckedChange={(v) => setConfig({ ...config, dark_mode: v })} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Preise anzeigen</Label>
                  <p className="text-sm text-slate-500">Fahrzeugpreise im Widget anzeigen</p>
                </div>
                <Switch 
                  checked={config.show_price} 
                  onCheckedChange={(v) => setConfig({ ...config, show_price: v })} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Erweitert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_url">Kontakt-URL (optional)</Label>
                <Input
                  id="contact_url"
                  type="url"
                  placeholder="https://ihre-website.ch/kontakt"
                  value={config.contact_url}
                  onChange={(e) => setConfig({ ...config, contact_url: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Wohin der "Anfragen"-Button führt. Leer = JavaScript-Event.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_domains">Erlaubte Domains (optional)</Label>
                <Input
                  id="allowed_domains"
                  placeholder="ihre-website.ch, www.ihre-website.ch"
                  value={(config.allowed_domains || []).join(", ")}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    allowed_domains: e.target.value
                      .split(",")
                      .map(d => d.trim())
                      .filter(Boolean)
                  })}
                />
                <p className="text-xs text-slate-500">
                  Kommagetrennt. Leer = alle Domains erlaubt.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Embed-Code</CardTitle>
              <CardDescription>
                Kopieren Sie diesen Code und fügen Sie ihn auf Ihrer Website ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  readOnly
                  value={embedCode}
                  className="font-mono text-xs h-48 resize-none"
                />
                <Button
                  onClick={copyEmbedCode}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  {copied ? "✓ Kopiert" : "Kopieren"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>👁️ Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={`/embed/${dealerId}?primary=${config.primary_color?.replace('#', '')}&font=${config.font_family}&style=${config.button_style}&dark=${config.dark_mode ? '1' : '0'}&layout=${config.layout}`}
                  className="w-full min-h-[400px] border-0"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? "Speichern..." : "💾 Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}
