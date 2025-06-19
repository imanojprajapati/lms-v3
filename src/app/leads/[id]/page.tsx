'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, CalendarPlus, Loader2, AlertCircle, Mail, Phone, MapPin, Calendar, User, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  visaType: string;
  status: string;
  destinationCountry: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Followup {
  _id: string;
  title: string;
  nextFollowupDate: string;
  communicationMethod: string;
  priority: 'low' | 'medium' | 'high';
  status: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Lost';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resolvedParams = await params;
      
      const response = await fetch(`/api/leads/${resolvedParams.id}`);
      const result = await response.json();
      
      if (result.success) {
        setLead(result.data);
      } else {
        setError(result.error || 'Failed to fetch lead');
      }
    } catch {
      setError('Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchFollowups = useCallback(async () => {
    try {
      setLoadingFollowups(true);
      const resolvedParams = await params;
      
      const response = await fetch(`/api/followups?leadId=${resolvedParams.id}`);
      const result = await response.json();
      
      if (result.success) {
        // Sort followups by creation date (newest first)
        const sortedFollowups = result.data.sort((a: Followup, b: Followup) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFollowups(sortedFollowups);
      }
    } catch (error) {
      console.error('Failed to fetch followups:', error);
    } finally {
      setLoadingFollowups(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLead();
    fetchFollowups();
  }, [fetchLead, fetchFollowups]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const resolvedParams = await params;
      
      const response = await fetch(`/api/leads/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
        setDeleteDialogOpen(false);
        router.push('/leads');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete lead",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lead Details</h1>
            <p className="text-gray-600 mt-1">View lead information</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading lead...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lead Details</h1>
            <p className="text-gray-600 mt-1">View lead information</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Lead</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchLead}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Interested': 'bg-orange-100 text-orange-800',
    'Converted': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon" className="hover-scale">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-gradient">{lead.name}</h1>
            <p className="text-slate-600">Lead Details</p>
          </div>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Link href={`/leads/${lead._id}/edit`}>
            <Button variant="outline" className="hover-scale">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="hover-scale">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-2 border-red-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600 text-lg font-semibold">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Lead
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Are you sure you want to delete <span className="font-semibold text-slate-900">{lead?.name}</span>? 
                  This action cannot be undone and will permanently remove:
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 my-4">
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Lead information and contact details</li>
                  <li>• All associated followup records</li>
                  <li>• Lead history and notes</li>
                </ul>
              </div>

              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Lead
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="glass-card shadow-premium border-blue-200/30 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-secondary">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-lg ring-2 ring-white/20">
                <User className="h-4 w-4 text-white" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                {lead.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Visa Type</span>
              <span className="text-sm">{lead.visaType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Destination</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{lead.destinationCountry}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="glass-card shadow-premium border-blue-200/30 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-secondary">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-lg ring-2 ring-white/20">
                <Mail className="h-4 w-4 text-white" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Email</span>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <a 
                  href={`mailto:${lead.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Phone</span>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-500" />
                <a 
                  href={`tel:${lead.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        {(lead.city || lead.state || lead.country) && (
          <Card className="glass-card shadow-premium border-blue-200/30 hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient-secondary">
                <div className="p-2 bg-orange-500 rounded-lg shadow-lg ring-2 ring-white/20">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.city && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">City</span>
                  <span className="text-sm">{lead.city}</span>
                </div>
              )}
              {lead.state && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">State/Province</span>
                  <span className="text-sm">{lead.state}</span>
                </div>
              )}
              {lead.country && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Country</span>
                  <span className="text-sm">{lead.country}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="glass-card shadow-premium border-blue-200/30 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-secondary">
              <div className="p-2 bg-purple-500 rounded-lg shadow-lg ring-2 ring-white/20">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Created</span>
              <span className="text-sm">{formatDate(lead.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Last Updated</span>
              <span className="text-sm">{formatDate(lead.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {lead.notes && (
        <Card className="glass-card shadow-premium border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-gradient-secondary">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Followup History - Moved before Quick Actions */}
      <Card className="glass-card shadow-premium border-purple-200/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gradient-secondary">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-lg shadow-lg ring-2 ring-white/20">
                <Clock className="h-4 w-4 text-white" />
              </div>
              Followup History
            </div>
            <Link href={`/followup/new?leadId=${lead._id}`}>
              <Button size="sm" className="hover-scale">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add Followup
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFollowups ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-slate-600">Loading followups...</span>
            </div>
          ) : followups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-sm text-slate-500 mb-4">No followups scheduled yet</p>
              <Link href={`/followup/new?leadId=${lead._id}`}>
                <Button variant="outline" size="sm" className="hover-scale">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Schedule First Followup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {followups.map((followup) => (
                <div key={followup._id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">{followup.title}</h4>
                        <Badge 
                          variant={followup.priority === 'high' ? 'destructive' : followup.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {followup.priority}
                        </Badge>
                        {followup.status && (
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              followup.status === 'Converted' ? 'border-green-500 text-green-700 bg-green-50' :
                              followup.status === 'Interested' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                              followup.status === 'Contacted' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                              followup.status === 'Lost' ? 'border-red-500 text-red-700 bg-red-50' :
                              'border-gray-500 text-gray-700 bg-gray-50'
                            }`}
                          >
                            {followup.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(followup.nextFollowupDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{followup.communicationMethod}</span>
                        </div>
                      </div>
                      {followup.notes && (
                        <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded">
                          {followup.notes}
                        </p>
                      )}
                      <div className="text-xs text-slate-400 mt-2">
                        Created: {formatDate(followup.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions - Moved after Followup History */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="glass-card shadow-premium border-blue-200/30 hover-scale">
          <CardHeader>
            <CardTitle className="text-gradient-secondary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/followup/new?leadId=${lead._id}`} className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Followup
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start hover-scale">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" className="w-full justify-start hover-scale">
              <Phone className="h-4 w-4 mr-2" />
              Call Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 