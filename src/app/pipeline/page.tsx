'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Calendar, Eye, Edit, Loader2, AlertCircle, RefreshCw } from "lucide-react";
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

interface PipelineData {
  New: Lead[];
  Contacted: Lead[];
  Interested: Lead[];
  Converted: Lead[];
  Lost: Lead[];
}

const statusColors = {
  'New': 'bg-purple-100 text-purple-800 border-purple-200',
  'Contacted': 'bg-amber-100 text-amber-800 border-amber-200',
  'Interested': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Lost': 'bg-red-100 text-red-800 border-red-200',
};

function LeadCard({ lead }: { lead: Lead }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-3 hover-scale cursor-pointer group transition-all duration-500 shadow-premium border-purple-200/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-500 text-white text-sm">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{lead.name}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Badge variant="secondary" className="text-xs">
                {lead.visaType}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {formatDate(lead.createdAt)}
              </div>
            </div>
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/leads/${lead._id}`}>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={`/leads/${lead._id}/edit`}>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineColumn({ title, leads, status }: { title: string; leads: Lead[]; status: string }) {
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 glass-card shadow-premium border-purple-200/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gradient-secondary">{title}</CardTitle>
            <Badge 
              variant="outline" 
              className={`${statusColors[status as keyof typeof statusColors]} border font-semibold`}
            >
              {leads.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {leads.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No leads in this stage</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PipelinePage() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPipelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads');
      const result = await response.json();
      
      if (result.success) {
        const leads = result.data as Lead[];
        
        // Group leads by status
        const grouped: PipelineData = {
          New: leads.filter(lead => lead.status === 'New'),
          Contacted: leads.filter(lead => lead.status === 'Contacted'),
          Interested: leads.filter(lead => lead.status === 'Interested'),
          Converted: leads.filter(lead => lead.status === 'Converted'),
          Lost: leads.filter(lead => lead.status === 'Lost'),
        };
        
        setPipelineData(grouped);
      } else {
        setError(result.error || 'Failed to fetch pipeline data');
        toast({
          title: "Error",
          description: result.error || "Failed to fetch pipeline data",
          variant: "destructive",
        });
      }
    } catch {
      setError('Failed to fetch pipeline data');
      toast({
        title: "Error",
        description: "Failed to fetch pipeline data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-gradient">Sales Pipeline</h1>
            <p className="text-slate-600">Track leads through your sales process</p>
          </div>
          <Button disabled className="self-start sm:self-auto">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sales Pipeline</h1>
            <p className="text-gray-600 mt-1">Track leads through your sales process</p>
          </div>
          <Button onClick={fetchPipelineData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Pipeline</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchPipelineData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pipelineData) {
    return null;
  }

  const totalLeads = Object.values(pipelineData).reduce((sum, leads) => sum + leads.length, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-gradient">Sales Pipeline</h1>
          <p className="text-slate-600">
            Track {totalLeads} leads through your sales process
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={fetchPipelineData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/add">
            <Button>
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 h-auto lg:h-[calc(100vh-12rem)]">
        <PipelineColumn title="New Leads" leads={pipelineData.New} status="New" />
        <PipelineColumn title="Contacted" leads={pipelineData.Contacted} status="Contacted" />
        <PipelineColumn title="Interested" leads={pipelineData.Interested} status="Interested" />
        <PipelineColumn title="Converted" leads={pipelineData.Converted} status="Converted" />
        <PipelineColumn title="Lost" leads={pipelineData.Lost} status="Lost" />
      </div>
    </div>
  );
}
