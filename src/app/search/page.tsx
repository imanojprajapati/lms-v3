'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Loader2, AlertCircle, RefreshCw, Filter } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { countries } from "@/lib/countries";

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

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Interested': 'bg-orange-100 text-orange-800',
  'Converted': 'bg-green-100 text-green-800',
  'Lost': 'bg-red-100 text-red-800',
};

const leadStatuses = ['New', 'Contacted', 'Interested', 'Converted', 'Lost'];

export default function SearchPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads');
      const result = await response.json();
      
      if (result.success) {
        setLeads(result.data);
      } else {
        setError(result.error || 'Failed to fetch leads');
        toast({
          title: "Error",
          description: result.error || "Failed to fetch leads",
          variant: "destructive",
        });
      }
    } catch {
      setError('Failed to fetch leads');
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesVisaType = visaTypeFilter === 'all' || lead.visaType === visaTypeFilter;
    const matchesCountry = countryFilter === 'all' || lead.destinationCountry === countryFilter;
    
    return matchesSearch && matchesStatus && matchesVisaType && matchesCountry;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVisaTypeFilter('all');
    setCountryFilter('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique values for filters
  const uniqueVisaTypes = [...new Set(leads.map(lead => lead.visaType))];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Search Leads</h1>
            <p className="text-gray-600 mt-1">Find and filter your leads</p>
          </div>
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
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Search Leads</h1>
            <p className="text-gray-600 mt-1">Find and filter your leads</p>
          </div>
          <Button onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
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
        <div>
          <h1 className="text-gradient">Search Leads</h1>
          <p className="text-slate-600">
            Find and filter from {leads.length} total leads
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={fetchLeads} variant="outline" className="hover-scale">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card shadow-premium border-purple-200/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-secondary">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search by name, email, phone, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                {leadStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
              <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="All Visa Types" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Visa Types</SelectItem>
                {uniqueVisaTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.name}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || statusFilter !== 'all' || visaTypeFilter !== 'all' || countryFilter !== 'all') && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="glass-card shadow-premium border-purple-200/30">
        <CardContent className="p-0">
          <div className="rounded-xl border border-purple-200/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50 hover:bg-purple-100 border-b border-purple-200/30">
                    <TableHead className="font-bold text-slate-700 h-14 whitespace-nowrap">Name</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Email</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Phone</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Visa Type</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Country</TableHead>
                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Created</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        {leads.length === 0 ? (
                          <div>
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-lg font-medium mb-2">No leads found</p>
                            <p className="mb-4">No leads available to display</p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-lg font-medium mb-2">No results found</p>
                            <p className="mb-4">Try adjusting your search criteria</p>
                            <Button variant="outline" onClick={clearFilters}>
                              Clear Filters
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.visaType}</TableCell>
                        <TableCell>{lead.destinationCountry}</TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/leads/${lead._id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600 transition-colors duration-300">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
