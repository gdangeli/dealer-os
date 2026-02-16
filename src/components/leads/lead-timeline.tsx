"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Phone, Mail, RefreshCw, Bell, Plus } from "lucide-react";

type ActivityType = "note" | "call" | "email" | "status_change" | "system_event";

interface Activity {
  id: string;
  lead_id: string;
  dealer_id: string;
  type: ActivityType;
  content: string;
  created_at: string;
  created_by: string | null;
  reminder_at: string | null;
  metadata: Record<string, any>;
}

interface LeadTimelineProps {
  leadId: string;
  dealerId: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  note: <MessageSquare className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  status_change: <RefreshCw className="w-4 h-4" />,
  system_event: <Bell className="w-4 h-4" />,
};

const activityLabels: Record<ActivityType, string> = {
  note: "Notiz",
  call: "Anruf",
  email: "E-Mail",
  status_change: "Statusänderung",
  system_event: "System",
};

const activityColors: Record<ActivityType, string> = {
  note: "bg-blue-100 text-blue-700 border-blue-200",
  call: "bg-green-100 text-green-700 border-green-200",
  email: "bg-purple-100 text-purple-700 border-purple-200",
  status_change: "bg-orange-100 text-orange-700 border-orange-200",
  system_event: "bg-slate-100 text-slate-700 border-slate-200",
};

export function LeadTimeline({ leadId, dealerId }: LeadTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<ActivityType>("note");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchActivities();
  }, [leadId]);

  async function fetchActivities() {
    setLoading(true);
    const { data, error } = await supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  }

  async function handleAddActivity() {
    if (!newContent.trim()) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        dealer_id: dealerId,
        type: newType,
        content: newContent.trim(),
      });

    if (error) {
      console.error("Error adding activity:", error);
      alert("Fehler beim Speichern. Bitte erneut versuchen.");
    } else {
      setNewContent("");
      setShowForm(false);
      await fetchActivities();
    }
    setSaving(false);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Gerade eben";
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    
    return date.toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Card data-testid="lead-timeline">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Aktivitäten
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          data-testid="add-activity-button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Hinzufügen
        </Button>
      </CardHeader>
      <CardContent>
        {/* Add Activity Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3" data-testid="activity-form">
            <Select value={newType} onValueChange={(v) => setNewType(v as ActivityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">📝 Notiz</SelectItem>
                <SelectItem value="call">📞 Anruf</SelectItem>
                <SelectItem value="email">✉️ E-Mail</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Was ist passiert?"
              rows={3}
              data-testid="activity-content-input"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Abbrechen
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddActivity}
                disabled={saving || !newContent.trim()}
                data-testid="save-activity-button"
              >
                {saving ? "Speichert..." : "Speichern"}
              </Button>
            </div>
          </div>
        )}

        {/* Activities List */}
        {loading ? (
          <div className="text-center py-8 text-slate-500">Wird geladen...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500" data-testid="empty-timeline">
            Noch keine Aktivitäten. Fügen Sie die erste hinzu!
          </div>
        ) : (
          <div className="space-y-4" data-testid="activity-list">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 pb-4 border-b border-slate-100 last:border-0"
                data-testid="activity-item"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}>
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {activityLabels[activity.type]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {activity.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
