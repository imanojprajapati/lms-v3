'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  Trash2, 
  CalendarPlus, 
  Search, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Clock,
  AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Followup {
  _id: string;
  title: string;
  leadId: Lead;
  nextFollowupDate: string;
  communicationMethod: string;
  priority: 'low' | 'medium' | 'high';
  status: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Lost';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColors = {
  New: 'bg-gray-100 text-gray-800',
  Contacted: 'bg-yellow-100 text-yellow-800',
  Interested: 'bg-blue-100 text-blue-800',
  Converted: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800',
};

export default function FollowupPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/followups');
      const result = await response.json();
      
      if (result.success) {
        setFollowups(result.data);
      } else {
        setError(result.error || 'Failed to fetch followups');
        toast({
          title: "Error",
          description: result.error || "Failed to fetch followups",
          variant: "destructive",
        });
      }
    } catch {
      setError('Failed to fetch followups');
      toast({
        title: "Error",
        description: "Failed to fetch followups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFollowup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this followup?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/followups/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setFollowups(followups.filter(followup => followup._id !== id));
        toast({
          title: "Success",
          description: "Followup deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete followup",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete followup",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [toast]);

  const filteredFollowups = followups.filter(followup => {
    const matchesSearch = 
      followup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.leadId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.leadId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.leadId?.phone.includes(searchTerm);
    
    const matchesPriority = priorityFilter === 'all' || followup.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || followup.status === statusFilter;
    
    // Only show followups that are scheduled for today or future dates
    const followupDate = new Date(followup.nextFollowupDate);
    const today = new Date();
    
    // Set time to start of day for accurate date comparison
    const followupDateOnly = new Date(followupDate.getFullYear(), followupDate.getMonth(), followupDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const isCurrentOrFuture = followupDateOnly >= todayDateOnly;
    
    return matchesSearch && matchesPriority && matchesStatus && isCurrentOrFuture;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isUpcoming = (dateString: string) => {
    const followupDate = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.ceil((followupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3 && daysDiff >= 0;
  };

  const isCurrentOrFuture = (dateString: string) => {
    const followupDate = new Date(dateString);
    const today = new Date();
    
    // Set time to start of day for accurate date comparison
    const followupDateOnly = new Date(followupDate.getFullYear(), followupDate.getMonth(), followupDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return followupDateOnly >= todayDateOnly;
  };

  // Filter followups to only include current and future dates
  const currentAndFutureFollowups = followups.filter(f => isCurrentOrFuture(f.nextFollowupDate));

  // Calculate stats based on current and future followups only
  const overdueCount = currentAndFutureFollowups.filter(f => isOverdue(f.nextFollowupDate)).length;
  const upcomingCount = currentAndFutureFollowups.filter(f => isUpcoming(f.nextFollowupDate)).length;
  const totalCount = currentAndFutureFollowups.length;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-gradient">Follow-ups</h1>
            <p className="text-slate-600">Manage your follow-up activities</p>
          </div>
          <Button disabled className="self-start sm:self-auto">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading follow-ups...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Follow-ups</h1>
            <p className="text-gray-600 mt-1">Manage your follow-up activities</p>
          </div>
          <Button onClick={fetchFollowups}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Follow-ups</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchFollowups}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-gradient">Follow-ups</h1>
          <p className="text-slate-600">Manage your follow-up activities</p>
          <p className="text-xs text-slate-500 mt-1">
            📅 Only showing current and upcoming followups
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={fetchFollowups} variant="outline" className="hover-scale">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/followup/new">
            <Button className="hover-scale shadow-premium">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="glass-card hover-scale shadow-premium border-purple-200/30 overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Follow-ups</CardTitle>
            <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg ring-2 ring-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-gradient">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-scale shadow-premium border-purple-200/30 overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Overdue</CardTitle>
            <div className="p-2.5 bg-red-500 rounded-xl shadow-lg ring-2 ring-white/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-scale shadow-premium border-purple-200/30 overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Upcoming (3 days)</CardTitle>
            <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg ring-2 ring-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{upcomingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card shadow-premium border-purple-200/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search by title, lead name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card shadow-premium border-purple-200/30">
        <CardContent className="p-0">
          <div className="rounded-xl border border-purple-200/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50 hover:bg-purple-100 border-b border-purple-200/30">
                    <TableHead className="font-bold text-slate-700 h-14 whitespace-nowrap">Title</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Lead</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Contact</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Next Follow-up</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Method</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Priority</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFollowups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {followups.length === 0 ? (
                          <div>
                            <div className="text-4xl mb-2">📅</div>
                            <p>No follow-ups scheduled yet</p>
                            <Link href="/leads">
                              <Button className="mt-4" size="sm">
                                Schedule Your First Follow-up
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">🔍</div>
                            <p>No follow-ups match your filters</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFollowups.map((followup) => (
                      <TableRow key={followup._id} className={isOverdue(followup.nextFollowupDate) ? 'bg-red-50' : isUpcoming(followup.nextFollowupDate) ? 'bg-orange-50' : ''}>
                        <TableCell className="font-medium">{followup.title}</TableCell>
                        <TableCell>{followup.leadId?.name || 'Unknown Lead'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{followup.leadId?.email}</div>
                            <div className="text-gray-500">{followup.leadId?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${isOverdue(followup.nextFollowupDate) ? 'text-red-600 font-medium' : isUpcoming(followup.nextFollowupDate) ? 'text-orange-600 font-medium' : ''}`}>
                            {formatDate(followup.nextFollowupDate)}
                            {isOverdue(followup.nextFollowupDate) && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Overdue
                              </Badge>
                            )}
                            {isUpcoming(followup.nextFollowupDate) && (
                              <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-800">
                                Due Soon
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{followup.communicationMethod}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[followup.priority]} variant="outline">
                            {followup.priority.charAt(0).toUpperCase() + followup.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[followup.status]} variant="outline">
                            {followup.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/leads/${followup.leadId?._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteFollowup(followup._id)}
                              disabled={deletingId === followup._id}
                            >
                              {deletingId === followup._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
