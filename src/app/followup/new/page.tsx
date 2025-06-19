"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    nextFollowupDate: undefined as Date | undefined,
    nextFollowupTime: '',
    communicationMethod: '',
    priority: 'medium',
    status: 'New',
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
          // If leadId is provided, pre-select it and set title and status
          if (leadId) {
            const selectedLead = result.data.find((lead: Lead) => lead._id === leadId);
            if (selectedLead) {
              setFormData(prev => ({
                ...prev,
                leadId: leadId,
                title: `Follow-up with ${selectedLead.name}`,
                status: selectedLead.status || 'New'
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
        !formData.nextFollowupTime || !formData.communicationMethod || !formData.priority || 
        !formData.status) {
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
      const dateStr = format(formData.nextFollowupDate, 'yyyy-MM-dd');
      const nextFollowupDateTime = new Date(`${dateStr}T${formData.nextFollowupTime}`);
      
      const followupData = {
        title: formData.title,
        leadId: formData.leadId,
        nextFollowupDate: nextFollowupDateTime.toISOString(),
        communicationMethod: formData.communicationMethod,
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes
      };

      // Create the followup
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followupData),
      });

      const result = await response.json();

      if (result.success) {
        // Update the lead's status with the same status value
        const leadUpdateResponse = await fetch(`/api/leads/${formData.leadId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: formData.status }),
        });

        const leadUpdateResult = await leadUpdateResponse.json();
        
        if (leadUpdateResult.success) {
          toast({
            title: "Success",
            description: "Follow-up scheduled and lead status updated successfully",
          });
        } else {
          toast({
            title: "Partial Success",
            description: "Follow-up scheduled but failed to update lead status",
            variant: "destructive",
          });
        }
        
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

  const handleInputChange = (field: string, value: string | Date) => {
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
      title: selectedLead ? `Follow-up with ${selectedLead.name}` : '',
      status: selectedLead ? selectedLead.status : 'New'
    }));
  };

  // Get current date for min date validation
  const today = new Date();

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
            <CalendarIcon className="h-5 w-5" />
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
                <SelectContent className="bg-white border-purple-200/50 rounded-xl max-h-60">
                  {leads.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-slate-500">
                      No leads available
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <SelectItem key={lead._id} value={lead._id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{lead.name}</span>
                          <span className="text-xs text-slate-500">{lead.email} • {lead.phone}</span>
                          <span className="text-xs text-purple-600 font-medium">Status: {lead.status}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-300",
                        !formData.nextFollowupDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextFollowupDate ? (
                        format(formData.nextFollowupDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-purple-200/50 shadow-xl rounded-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.nextFollowupDate}
                      onSelect={(date) => handleInputChange('nextFollowupDate', date || new Date())}
                      disabled={(date) => date < today}
                      initialFocus
                      className="bg-white/90 rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextFollowupTime">Follow-up Time *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={formData.nextFollowupTime.split(':')[0] || ''} 
                    onValueChange={(hour) => {
                      const currentMinute = formData.nextFollowupTime.split(':')[1] || '00';
                      handleInputChange('nextFollowupTime', `${hour}:${currentMinute}`);
                    }}
                  >
                    <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-purple-200/50 rounded-xl max-h-60">
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={formData.nextFollowupTime.split(':')[1] || ''} 
                    onValueChange={(minute) => {
                      const currentHour = formData.nextFollowupTime.split(':')[0] || '09';
                      handleInputChange('nextFollowupTime', `${currentHour}:${minute}`);
                    }}
                  >
                    <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-purple-200/50 rounded-xl max-h-60">
                      {['00', '15', '30', '45'].map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          :{minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="h-12 bg-white/90 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-purple-200/50 rounded-xl">
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                This status will be applied to both the followup and the lead
              </p>
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