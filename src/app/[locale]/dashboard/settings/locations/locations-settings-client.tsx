'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Location, LocationFormData, emptyLocationFormData } from '@/types/locations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Dealer {
  id: string;
  company_name: string;
  street?: string;
  zip?: string;
  city?: string;
  phone?: string;
  email?: string;
}

interface LocationsSettingsClientProps {
  dealerId: string;
  dealer: Dealer;
  initialLocations: Location[];
}

export function LocationsSettingsClient({
  dealerId,
  dealer,
  initialLocations,
}: LocationsSettingsClientProps) {
  const supabase = createClient();
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(emptyLocationFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Open dialog for new location
  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData(emptyLocationFormData);
    setIsDialogOpen(true);
  };

  // Open dialog for editing
  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      postal_code: location.postal_code || '',
      city: location.city || '',
      phone: location.phone || '',
      email: location.email || '',
      is_main: location.is_main,
    });
    setIsDialogOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (location: Location) => {
    setDeletingLocation(location);
    setIsDeleteDialogOpen(true);
  };

  // Create main location from dealer data
  const handleCreateFromDealer = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          dealer_id: dealerId,
          name: dealer.company_name + ' - Hauptstandort',
          address: dealer.street || null,
          postal_code: dealer.zip || null,
          city: dealer.city || null,
          phone: dealer.phone || null,
          email: dealer.email || null,
          is_main: true,
        })
        .select()
        .single();

      if (error) throw error;

      setLocations([data, ...locations]);
      toast.success('Hauptstandort erstellt');
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error('Fehler beim Erstellen des Standorts');
    } finally {
      setIsLoading(false);
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    setIsLoading(true);
    try {
      if (editingLocation) {
        // Update
        const { data, error } = await supabase
          .from('locations')
          .update({
            name: formData.name.trim(),
            address: formData.address.trim() || null,
            postal_code: formData.postal_code.trim() || null,
            city: formData.city.trim() || null,
            phone: formData.phone.trim() || null,
            email: formData.email.trim() || null,
            is_main: formData.is_main,
          })
          .eq('id', editingLocation.id)
          .select()
          .single();

        if (error) throw error;

        // If this was set as main, update other locations in state
        if (formData.is_main && !editingLocation.is_main) {
          setLocations(
            locations.map((loc) =>
              loc.id === data.id ? data : { ...loc, is_main: false }
            )
          );
        } else {
          setLocations(locations.map((loc) => (loc.id === data.id ? data : loc)));
        }

        toast.success('Standort gespeichert');
      } else {
        // Create
        const { data, error } = await supabase
          .from('locations')
          .insert({
            dealer_id: dealerId,
            name: formData.name.trim(),
            address: formData.address.trim() || null,
            postal_code: formData.postal_code.trim() || null,
            city: formData.city.trim() || null,
            phone: formData.phone.trim() || null,
            email: formData.email.trim() || null,
            is_main: formData.is_main,
          })
          .select()
          .single();

        if (error) throw error;

        // If this was set as main, update other locations in state
        if (formData.is_main) {
          setLocations([data, ...locations.map((loc) => ({ ...loc, is_main: false }))]);
        } else {
          setLocations([data, ...locations]);
        }

        toast.success('Standort erstellt');
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete location
  const handleDelete = async () => {
    if (!deletingLocation) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', deletingLocation.id);

      if (error) throw error;

      setLocations(locations.filter((loc) => loc.id !== deletingLocation.id));
      toast.success('Standort gelöscht');
      setIsDeleteDialogOpen(false);
      setDeletingLocation(null);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle main status
  const handleSetMain = async (location: Location) => {
    if (location.is_main) return; // Already main

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({ is_main: true })
        .eq('id', location.id)
        .select()
        .single();

      if (error) throw error;

      // Update state: set this as main, others as not main
      setLocations(
        locations.map((loc) =>
          loc.id === data.id ? data : { ...loc, is_main: false }
        )
      );

      toast.success(`"${location.name}" ist jetzt der Hauptstandort`);
    } catch (error) {
      console.error('Error setting main location:', error);
      toast.error('Fehler beim Setzen des Hauptstandorts');
    } finally {
      setIsLoading(false);
    }
  };

  const hasLocations = locations.length > 0;

  return (
    <div className="space-y-6">
      {/* Empty State / Quick Setup */}
      {!hasLocations && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🏢 Noch keine Standorte</CardTitle>
            <CardDescription className="text-blue-700">
              Erstellen Sie Standorte, um Fahrzeuge, Leads und Kunden verschiedenen Filialen
              zuzuordnen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateFromDealer} disabled={isLoading}>
                🏠 Hauptstandort aus Firmendaten erstellen
              </Button>
              <Button variant="outline" onClick={handleAddLocation}>
                ➕ Neuen Standort hinzufügen
              </Button>
            </div>
            {dealer.street && (
              <p className="text-sm text-blue-600">
                Aus Firmenprofil: {dealer.street}, {dealer.zip} {dealer.city}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Locations List */}
      {hasLocations && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ihre Standorte</CardTitle>
              <CardDescription>
                {locations.length} Standort{locations.length !== 1 ? 'e' : ''} konfiguriert
              </CardDescription>
            </div>
            <Button onClick={handleAddLocation}>
              ➕ Neuer Standort
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`flex items-start justify-between p-4 border rounded-lg ${
                    location.is_main ? 'border-blue-200 bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-lg">{location.name}</span>
                      {location.is_main && (
                        <Badge className="bg-blue-600">Hauptstandort</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {(location.address || location.city) && (
                        <p>
                          📍 {[location.address, [location.postal_code, location.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {location.phone && <p>📞 {location.phone}</p>}
                      {location.email && <p>✉️ {location.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!location.is_main && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetMain(location)}
                        disabled={isLoading}
                        title="Als Hauptstandort setzen"
                      >
                        ⭐
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLocation(location)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(location)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">💡 So funktioniert Multi-Standort</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Ordnen Sie Fahrzeuge, Leads und Kunden Standorten zu</li>
            <li>• Filtern Sie im Dashboard nach Standort</li>
            <li>• Der Hauptstandort wird bei neuen Einträgen vorgeschlagen</li>
            <li>• Standorte ohne Zuordnungen können jederzeit gelöscht werden</li>
          </ul>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Standort bearbeiten' : 'Neuer Standort'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Ändern Sie die Daten dieses Standorts.'
                : 'Erstellen Sie einen neuen Standort für Ihre Garage.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Filiale Zürich Nord"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="address">Strasse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Hauptstrasse 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="8000"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Zürich"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+41 44 123 45 67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="filiale@garage.ch"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_main">Hauptstandort</Label>
                <p className="text-sm text-slate-500">
                  Der Hauptstandort wird bei neuen Einträgen vorgeschlagen.
                </p>
              </div>
              <Switch
                id="is_main"
                checked={formData.is_main}
                onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Standort löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie &quot;{deletingLocation?.name}&quot; wirklich löschen?
              <br />
              <br />
              Fahrzeuge, Leads und Kunden, die diesem Standort zugeordnet sind, werden nicht
              gelöscht – ihre Standort-Zuordnung wird entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Löschen...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
