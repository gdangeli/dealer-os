'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function AdminDashboardClient({ dealers, stats, currentUserId }: AdminDashboardClientProps) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      dealer.email?.toLowerCase().includes(search.toLowerCase()) ||
      dealer.contact_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || dealer.subscription_plan === planFilter;
    const matchesStatus = statusFilter === 'all' || dealer.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleImpersonate = async (dealerId: string) => {
    // TODO: Implement impersonate functionality
    alert(`Impersonate für Dealer ${dealerId} kommt bald!`);
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
              <Button variant="outline" size="sm" className="w-full" disabled>
                + Dealer hinzufügen
              </Button>
              <Button variant="outline" size="sm" className="w-full" disabled>
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
                      >
                        👤 Impersonate
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
    </div>
  );
}
