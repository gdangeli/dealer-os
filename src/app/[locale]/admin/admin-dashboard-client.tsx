'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Dealer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  subscription_plan: string;
  subscription_status: string | null;
  status: string;
  created_at: string;
  onboarding_completed: boolean;
  teamCount: number;
  vehicleCount: number;
}

interface Stats {
  totalDealers: number;
  activeDealers: number;
  totalVehicles: number;
  planBreakdown: {
    beta: number;
    starter: number;
    pro: number;
    business: number;
    enterprise: number;
  };
}

interface AdminDashboardClientProps {
  dealers: Dealer[];
  stats: Stats;
  currentUserId: string;
}

const planColors: Record<string, string> = {
  beta: 'bg-gray-100 text-gray-800',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  business: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

export function AdminDashboardClient({ dealers: initialDealers, stats: initialStats, currentUserId }: AdminDashboardClientProps) {
  const [dealers, setDealers] = useState(initialDealers);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add Dealer Modal State
  const [addDealerOpen, setAddDealerOpen] = useState(false);
  const [addDealerForm, setAddDealerForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    plan: 'beta',
  });
  const [addDealerLoading, setAddDealerLoading] = useState(false);
  const [addDealerError, setAddDealerError] = useState<string | null>(null);

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      dealer.email?.toLowerCase().includes(search.toLowerCase()) ||
      dealer.contact_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || dealer.subscription_plan === planFilter;
    const matchesStatus = statusFilter === 'all' || dealer.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const [impersonating, setImpersonating] = useState<string | null>(null);
  const router = useRouter();

  const handleImpersonate = async (dealerId: string) => {
    setImpersonating(dealerId);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId }),
      });
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Impersonate error:', error);
      alert('Fehler beim Impersonieren');
    } finally {
      setImpersonating(null);
    }
  };

  const handleAddDealer = async () => {
    setAddDealerLoading(true);
    setAddDealerError(null);

    try {
      const response = await fetch('/api/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addDealerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setAddDealerError(data.error || 'Failed to create dealer');
        return;
      }

      // Add new dealer to the list
      const newDealer: Dealer = {
        ...data.dealer,
        teamCount: 0,
        vehicleCount: 0,
      };
      setDealers([newDealer, ...dealers]);

      // Update stats
      setStats({
        ...stats,
        totalDealers: stats.totalDealers + 1,
        planBreakdown: {
          ...stats.planBreakdown,
          [addDealerForm.plan]: (stats.planBreakdown[addDealerForm.plan as keyof typeof stats.planBreakdown] || 0) + 1,
        },
      });

      // Reset form and close modal
      setAddDealerForm({
        company_name: '',
        contact_name: '',
        email: '',
        plan: 'beta',
      });
      setAddDealerOpen(false);
    } catch (error) {
      console.error('Add dealer error:', error);
      setAddDealerError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setAddDealerLoading(false);
    }
  };

  const handleExportCSV = () => {
    // CSV headers
    const headers = ['Firma', 'Kontakt', 'Email', 'Plan', 'Status', 'Team', 'Fahrzeuge', 'Erstellt'];
    
    // Build CSV rows from filtered dealers
    const rows = filteredDealers.map(dealer => [
      dealer.company_name || '',
      dealer.contact_name || '',
      dealer.email || '',
      dealer.subscription_plan || '',
      dealer.status || '',
      dealer.teamCount.toString(),
      dealer.vehicleCount.toString(),
      new Date(dealer.created_at).toLocaleDateString('de-CH'),
    ]);

    // Escape values for CSV
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `dealeros-dealers-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">👑 Admin Dashboard</h1>
          <p className="text-slate-600">Platform-Administration für DealerOS</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dealers gesamt</CardDescription>
              <CardTitle className="text-3xl">{stats.totalDealers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{stats.activeDealers} aktiv</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Fahrzeuge gesamt</CardDescription>
              <CardTitle className="text-3xl">{stats.totalVehicles}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Plan-Verteilung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Beta</span>
                <span className="font-medium">{stats.planBreakdown.beta}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Starter</span>
                <span className="font-medium">{stats.planBreakdown.starter}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pro</span>
                <span className="font-medium">{stats.planBreakdown.pro}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Business</span>
                <span className="font-medium">{stats.planBreakdown.business}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quick Actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setAddDealerOpen(true)}
              >
                + Dealer hinzufügen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Suche nach Firma, Name oder E-Mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Plans</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Gesperrt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dealers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dealers ({filteredDealers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Team</TableHead>
                  <TableHead className="text-center">Fahrzeuge</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealers.map((dealer) => (
                  <TableRow key={dealer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dealer.company_name || '—'}</div>
                        <div className="text-sm text-slate-500">{dealer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{dealer.contact_name || '—'}</TableCell>
                    <TableCell>
                      <Badge className={planColors[dealer.subscription_plan] || ''}>
                        {dealer.subscription_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[dealer.status] || ''}>
                        {dealer.status}
                      </Badge>
                      {!dealer.onboarding_completed && (
                        <Badge variant="outline" className="ml-1">
                          Onboarding
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{dealer.teamCount}</TableCell>
                    <TableCell className="text-center">{dealer.vehicleCount}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(dealer.created_at).toLocaleDateString('de-CH')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImpersonate(dealer.id)}
                        disabled={impersonating === dealer.id}
                      >
                        {impersonating === dealer.id ? '...' : '👤 Impersonate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDealers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                      Keine Dealers gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dealer Modal */}
      <Dialog open={addDealerOpen} onOpenChange={setAddDealerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Dealer hinzufügen</DialogTitle>
            <DialogDescription>
              Erstelle einen neuen Dealer manuell. Der Dealer kann sich danach mit der angegebenen E-Mail registrieren.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {addDealerError && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                {addDealerError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname *</Label>
              <Input
                id="company_name"
                value={addDealerForm.company_name}
                onChange={(e) => setAddDealerForm({ ...addDealerForm, company_name: e.target.value })}
                placeholder="Autohaus Müller AG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Kontaktperson</Label>
              <Input
                id="contact_name"
                value={addDealerForm.contact_name}
                onChange={(e) => setAddDealerForm({ ...addDealerForm, contact_name: e.target.value })}
                placeholder="Max Müller"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={addDealerForm.email}
                onChange={(e) => setAddDealerForm({ ...addDealerForm, email: e.target.value })}
                placeholder="info@autohaus-mueller.ch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select 
                value={addDealerForm.plan} 
                onValueChange={(value) => setAddDealerForm({ ...addDealerForm, plan: value })}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Plan wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDealerOpen(false)}
              disabled={addDealerLoading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAddDealer}
              disabled={addDealerLoading || !addDealerForm.company_name || !addDealerForm.email}
            >
              {addDealerLoading ? 'Erstelle...' : 'Dealer erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
