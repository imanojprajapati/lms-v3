"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { countries, popularDestinations } from "@/lib/countries";

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

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    visaType: '',
    destinationCountry: '',
    city: '',
    state: '',
    country: '',
    status: '',
    notes: ''
  });

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resolvedParams = await params;
      
      const response = await fetch(`/api/leads/${resolvedParams.id}`);
      const result = await response.json();
      
      if (result.success) {
        const leadData = result.data;
        setLead(leadData);
        setFormData({
          name: leadData.name || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          visaType: leadData.visaType || '',
          destinationCountry: leadData.destinationCountry || '',
          city: leadData.city || '',
          state: leadData.state || '',
          country: leadData.country || '',
          status: leadData.status || '',
          notes: leadData.notes || ''
        });
      } else {
        setError(result.error || 'Failed to fetch lead');
      }
    } catch (error) {
      setError('Failed to fetch lead');
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - only required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
        !formData.visaType || !formData.destinationCountry.trim() || !formData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const resolvedParams = await params;
      
      const response = await fetch(`/api/leads/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
        router.push(`/leads/${resolvedParams.id}`);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update lead",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <h1 className="text-3xl font-bold">Edit Lead</h1>
            <p className="text-gray-600 mt-1">Update lead information</p>
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
            <h1 className="text-3xl font-bold">Edit Lead</h1>
            <p className="text-gray-600 mt-1">Update lead information</p>
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href={`/leads/${lead._id}`}>
          <Button variant="ghost" size="icon" className="hover-scale">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-gradient">Edit Lead</h1>
          <p className="text-slate-600">Update {lead.name}&apos;s information</p>
        </div>
      </div>

      <Card className="max-w-4xl glass-card shadow-premium border-blue-200/30">
        <CardHeader>
          <CardTitle className="text-xl text-gradient-secondary">Lead Information</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Current Status:</span>
            <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
              {lead.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">Address Information</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="Enter state/province"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 rounded-xl max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visa Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">Visa Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type *</Label>
                  <Select value={formData.visaType} onValueChange={(value) => handleInputChange('visaType', value)}>
                    <SelectTrigger className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl">
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 rounded-xl">
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Tourist">Tourist</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry">Destination Country *</Label>
                  <Select value={formData.destinationCountry} onValueChange={(value) => handleInputChange('destinationCountry', value)}>
                    <SelectTrigger className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl">
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 rounded-xl max-h-60">
                      {/* Popular destinations first */}
                      <div className="px-2 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Popular Destinations
                      </div>
                      {popularDestinations.map((country) => (
                        <SelectItem key={`popular-${country}`} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                      <div className="border-t my-1"></div>
                      <div className="px-2 py-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        All Countries
                      </div>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status and Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">Status & Notes</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50 rounded-xl">
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this lead"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="hover-scale shadow-premium"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Lead
                  </>
                )}
              </Button>
              <Link href={`/leads/${lead._id}`}>
                <Button variant="outline" type="button" className="hover-scale">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 