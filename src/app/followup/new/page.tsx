"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function NewFollowupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  
  const leadId = searchParams.get('leadId');
  
  const [formData, setFormData] = useState({
    title: '',
    leadId: leadId || '',
    nextFollowupDate: '',
    nextFollowupTime: '',
    communicationMethod: '',
    priority: 'medium',
    notes: ''
  });

  // Fetch leads for dropdown
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads');
        const result = await response.json();
        if (result.success) {
          setLeads(result.data);
          // If leadId is provided, pre-select it and set title
          if (leadId) {
            const selectedLead = result.data.find((lead: Lead) => lead._id === leadId);
            if (selectedLead) {
              setFormData(prev => ({
                ...prev,
                leadId: leadId,
                title: `Follow-up with ${selectedLead.name}`
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, [leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.leadId || !formData.nextFollowupDate || 
        !formData.nextFollowupTime || !formData.communicationMethod || !formData.priority) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const nextFollowupDateTime = new Date(`${formData.nextFollowupDate}T${formData.nextFollowupTime}`);
      
      const followupData = {
        title: formData.title,
        leadId: formData.leadId,
        nextFollowupDate: nextFollowupDateTime.toISOString(),
        communicationMethod: formData.communicationMethod,
        priority: formData.priority,
        notes: formData.notes,
        status: 'New'
      };

      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followupData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Follow-up scheduled successfully",
        });
        router.push('/followup');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule follow-up",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLeadChange = (leadId: string) => {
    const selectedLead = leads.find(lead => lead._id === leadId);
    setFormData(prev => ({
      ...prev,
      leadId: leadId,
      title: selectedLead ? `Follow-up with ${selectedLead.name}` : ''
    }));
  };

  // Get current date and time for min values
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/followup">
          <Button variant="ghost" size="icon" className="hover-scale">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-gradient">Schedule Follow-up</h1>
          <p className="text-slate-600">Create a new follow-up activity</p>
        </div>
      </div>

      <Card className="max-w-2xl glass-card shadow-premium border-purple-200/30">
        <CardHeader>
          <CardTitle className="text-xl text-gradient-secondary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Follow-up Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="leadId">Select Lead *</Label>
              <Select 
                value={formData.leadId} 
                onValueChange={handleLeadChange}
                disabled={loadingLeads}
              >
                <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                  <SelectValue placeholder={loadingLeads ? "Loading leads..." : "Select a lead"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                  {leads.map((lead) => (
                    <SelectItem key={lead._id} value={lead._id}>
                      {lead.name} - {lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Follow-up Title *</Label>
              <Input
                id="title"
                placeholder="Enter follow-up title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nextFollowupDate">Follow-up Date *</Label>
                <Input
                  id="nextFollowupDate"
                  type="date"
                  min={currentDate}
                  value={formData.nextFollowupDate}
                  onChange={(e) => handleInputChange('nextFollowupDate', e.target.value)}
                  required
                  className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextFollowupTime">Follow-up Time *</Label>
                <Input
                  id="nextFollowupTime"
                  type="time"
                  value={formData.nextFollowupTime}
                  onChange={(e) => handleInputChange('nextFollowupTime', e.target.value)}
                  required
                  className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="communicationMethod">Communication Method *</Label>
                <Select value={formData.communicationMethod} onValueChange={(value) => handleInputChange('communicationMethod', value)}>
                  <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="In-Person Meeting">In-Person Meeting</SelectItem>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or context for this follow-up..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="hover-scale shadow-premium">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </>
                )}
              </Button>
              <Link href="/followup">
                <Button type="button" variant="outline" className="hover-scale w-full sm:w-auto">
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