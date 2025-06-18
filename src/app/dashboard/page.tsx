'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadChart } from "@/components/LeadChart";
import { Users, TrendingUp, Calendar, Target, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  visaType: string;
  status: string;
  destinationCountry: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalLeads: number;
  totalFollowups: number;
  recentLeads: number;
  conversionRate: number;
  chartData: Array<{ name: string; leads: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leads data
      const leadsResponse = await fetch('/api/leads');
      const leadsResult = await leadsResponse.json();
      
      if (!leadsResult.success) {
        throw new Error(leadsResult.error || 'Failed to fetch leads');
      }

      const leads = leadsResult.data as Lead[];
      
      // Calculate stats
      const totalLeads = leads.length;
      const recentLeads = leads.filter((lead: Lead) => {
        const createdAt = new Date(lead.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length;
      
      const convertedLeads = leads.filter((lead: Lead) => lead.status === 'Converted').length;
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      // Calculate status distribution
      const statusCounts = leads.reduce((acc: Record<string, number>, lead: Lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number
      }));

      // Generate chart data (last 6 months)
      const chartData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      for (let i = 0; i < 6; i++) {
        const monthLeads = leads.filter((lead: Lead) => {
          const createdAt = new Date(lead.createdAt);
          const currentMonth = new Date();
          currentMonth.setMonth(currentMonth.getMonth() - (5 - i));
          return createdAt.getMonth() === currentMonth.getMonth() && 
                 createdAt.getFullYear() === currentMonth.getFullYear();
        }).length;
        
        chartData.push({
          name: months[i],
          leads: monthLeads
        });
      }

      // Mock followups count for now (you can implement followups API later)
      const totalFollowups = Math.floor(totalLeads * 0.6);

      setStats({
        totalLeads,
        totalFollowups,
        recentLeads,
        conversionRate,
        chartData,
        statusDistribution
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your lead management system</p>
          </div>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your lead management system</p>
          </div>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchStats}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Interested': 'bg-orange-100 text-orange-800',
    'Converted': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-gradient">Dashboard</h1>
          <p className="text-slate-600">Overview of your lead management system</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="hover-scale self-start sm:self-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover-scale shadow-premium border-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Leads</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg ring-2 ring-white/20">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stats.totalLeads}</div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              All time leads
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale shadow-premium border-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Followups</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-xl shadow-lg ring-2 ring-white/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stats.totalFollowups}</div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Scheduled followups
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale shadow-premium border-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Recent Leads</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 rounded-xl shadow-lg ring-2 ring-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stats.recentLeads}</div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale shadow-premium border-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Conversion Rate</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-white/20">
              <Target className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stats.conversionRate}%</div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Chart */}
        <Card className="glass-card shadow-premium border-0 hover-scale">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gradient flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Lead Growth</span>
            </CardTitle>
            <p className="text-sm text-slate-500">Monthly lead acquisition trends</p>
          </CardHeader>
          <CardContent>
            <LeadChart data={stats.chartData} />
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card shadow-premium border-0 hover-scale">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gradient flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Lead Status Distribution</span>
            </CardTitle>
            <p className="text-sm text-slate-500">Current status breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {stats.statusDistribution.map((item, index) => (
                <div key={item.status} className="animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-teal-50 transition-all duration-500 border border-slate-200/50 hover:border-purple-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500"></div>
                      <Badge className="status-badge status-new">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-gradient">{item.count}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
