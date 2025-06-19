'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import UserManagement from "@/components/UserManagement";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, hasPermission } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    contactEmail: "",
    phone: "",
    notificationPreferences: {
      emailNotifications: true,
      notificationEmail: "",
    },
    appearance: {
      darkMode: false,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        
        // Ensure nested objects exist with defaults
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data,
          notificationPreferences: {
            emailNotifications: true,
            notificationEmail: "",
            ...data.notificationPreferences
          },
          appearance: {
            darkMode: false,
            ...data.appearance
          }
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <div>
        <h1 className="text-gradient">Settings</h1>
        <p className="text-slate-600">Manage your application preferences and configuration</p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="glass-card shadow-premium border-blue-200/30 bg-white/90 p-1 h-12">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2">General</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2">Appearance</TabsTrigger>
          {hasPermission(['user-management']) && (
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2">Users</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card className="glass-card shadow-premium border-blue-200/30">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gradient-secondary">General Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Enter your company name"
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="contact@company.com"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass-card shadow-premium border-blue-200/30">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gradient-secondary">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-xl border border-blue-200/50">
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-slate-500 mt-1">Receive notifications about new leads and updates</p>
                  </div>
                  <Switch 
                    checked={settings.notificationPreferences.emailNotifications} 
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        emailNotifications: checked
                      }
                    })} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="notifications@company.com"
                    value={settings.notificationPreferences.notificationEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        notificationEmail: e.target.value
                      }
                    })}
                    className="h-12 bg-white/90 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="glass-card shadow-premium border-blue-200/30">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gradient-secondary">Appearance Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-xl border border-blue-200/50">
                  <div>
                    <Label className="text-base font-medium">Dark Mode</Label>
                    <p className="text-sm text-slate-500 mt-1">Toggle dark mode theme</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.darkMode} 
                    onCheckedChange={(checked: boolean) => setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        darkMode: checked
                      }
                    })} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          {hasPermission(['user-management']) ? (
            <UserManagement />
          ) : (
            <Card className="glass-card shadow-premium border-blue-200/30">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-gradient-secondary">Access Denied</h2>
                <p className="text-slate-600">You don't have permission to access user management.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="hover-scale shadow-premium"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
