'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, PenSquare, Trash2, CalendarPlus, Plus, Search, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leads');
      const result = await response.json();
      
      if (result.success) {
        setLeads(result.data);
      } else {
        setError(result.error || 'Failed to fetch leads');
      }
    } catch {
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const deleteLead = async () => {
    if (!leadToDelete) return;

    try {
      setDeletingId(leadToDelete._id);
      const response = await fetch(`/api/leads/${leadToDelete._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setLeads(leads.filter(lead => lead._id !== leadToDelete._id));
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
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
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Leads</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading leads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Leads</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Leads</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchLeads}>
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
        <div className="space-y-2">
          <h1 className="text-gradient">Leads</h1>
          <p className="text-slate-600">Manage your leads and track their progress</p>
        </div>
        <Link href="/add">
          <Button className="hover-scale shadow-premium self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="glass-card shadow-premium border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search leads by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 text-slate-700 placeholder:text-slate-400 rounded-xl transition-all duration-300"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
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

      {/* Leads Table */}
      <Card className="glass-card shadow-premium border-0">
        <CardContent className="p-0">
          <div className="rounded-xl border border-purple-200/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-50 via-indigo-50 to-teal-50 hover:from-purple-100 hover:via-indigo-100 hover:to-teal-100 border-b border-purple-200/30">
                    <TableHead className="font-bold text-slate-700 h-14 whitespace-nowrap">Name</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Email</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Phone</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Visa Type</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Destination</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <Search className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="text-slate-500 text-lg font-medium">
                          {searchTerm || statusFilter !== 'all' ? 'No leads match your filters' : 'No leads found'}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first lead'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <TableRow key={lead._id} className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-indigo-50/30 hover:to-teal-50/30 transition-all duration-500 animate-slide-in-right border-b border-purple-100/30" style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell className="font-semibold text-slate-800 py-4 whitespace-nowrap">{lead.name}</TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">{lead.email}</TableCell>
                      <TableCell className="text-slate-600 font-mono whitespace-nowrap">{lead.phone}</TableCell>
                      <TableCell className="text-slate-600 font-medium whitespace-nowrap">{lead.visaType}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className="status-badge status-new">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium whitespace-nowrap">{lead.destinationCountry}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/leads/${lead._id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600 transition-colors duration-300">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/leads/${lead._id}/edit`}>
                            <Button variant="ghost" size="icon" className="hover:bg-emerald-100 hover:text-emerald-600 transition-colors duration-300">
                              <PenSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog(lead)}
                            disabled={deletingId === lead._id}
                            className="hover:bg-red-100 hover:text-red-600 transition-colors duration-300"
                          >
                            {deletingId === lead._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Link href={`/followup/new?leadId=${lead._id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-amber-100 hover:text-amber-600 transition-colors duration-300">
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                          </Link>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-red-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Delete Lead
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{leadToDelete?.name}</span>? 
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
              onClick={() => {
                setDeleteDialogOpen(false);
                setLeadToDelete(null);
              }}
              disabled={deletingId !== null}
              className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteLead}
              disabled={deletingId !== null}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingId !== null ? (
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
  );
}
