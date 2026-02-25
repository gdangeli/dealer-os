'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
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
      toast.success(t('settings.locations.mainCreated'));
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error(t('settings.locations.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('settings.locations.nameError'));
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

        toast.success(t('settings.locations.saved'));
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

        toast.success(t('settings.locations.created'));
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(t('settings.locations.saveError'));
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
      toast.success(t('settings.locations.deleted'));
      setIsDeleteDialogOpen(false);
      setDeletingLocation(null);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(t('settings.locations.deleteError'));
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

      toast.success(t('settings.locations.nowMain', { name: location.name }));
    } catch (error) {
      console.error('Error setting main location:', error);
      toast.error(t('settings.locations.mainError'));
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
            <CardTitle className="text-blue-900">{t('settings.locations.noLocations')}</CardTitle>
            <CardDescription className="text-blue-700">
              {t('settings.locations.noLocationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateFromDealer} disabled={isLoading}>
                {t('settings.locations.createFromDealer')}
              </Button>
              <Button variant="outline" onClick={handleAddLocation}>
                {t('settings.locations.addNew')}
              </Button>
            </div>
            {dealer.street && (
              <p className="text-sm text-blue-600">
                {t('settings.locations.fromProfile')} {dealer.street}, {dealer.zip} {dealer.city}
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
              <CardTitle>{t('settings.locations.yourLocations')}</CardTitle>
              <CardDescription>
                {t('settings.locations.locationsCount', { count: locations.length })}
              </CardDescription>
            </div>
            <Button onClick={handleAddLocation}>
              {t('settings.locations.newLocation')}
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
                        <Badge className="bg-blue-600">{t('settings.locations.mainLocation')}</Badge>
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
                        title={t('settings.locations.setAsMain')}
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
          <h3 className="font-medium mb-2">{t('settings.locations.howItWorks')}</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• {t('settings.locations.howItWorksList.assign')}</li>
            <li>• {t('settings.locations.howItWorksList.filter')}</li>
            <li>• {t('settings.locations.howItWorksList.default')}</li>
            <li>• {t('settings.locations.howItWorksList.delete')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? t('settings.locations.edit') : t('settings.locations.new')}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? t('settings.locations.editDescription')
                : t('settings.locations.newDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('settings.locations.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('settings.locations.namePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="address">{t('settings.locations.street')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('settings.locations.streetPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">{t('settings.locations.postalCode')}</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder={t('settings.locations.postalCodePlaceholder')}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">{t('settings.locations.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('settings.locations.cityPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('settings.locations.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('settings.locations.phonePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.locations.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('settings.locations.emailPlaceholder')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_main">{t('settings.locations.isMain')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.locations.isMainDescription')}
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
              {t('settings.locations.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t('settings.locations.saving') : t('settings.locations.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.locations.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.locations.deleteDescription', { name: deletingLocation?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('settings.locations.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? t('settings.locations.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
