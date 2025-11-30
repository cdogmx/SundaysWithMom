import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bell, Mail, Clock, Tag, User, Plus, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const eventCategories = [
  { id: 'garage_sale', label: 'Garage Sales' },
  { id: 'estate_sale', label: 'Estate Sales' },
  { id: 'yard_sale', label: 'Yard Sales' },
  { id: 'pop_up', label: 'Pop-Up Events' },
  { id: 'special_event', label: 'Special Events' }
];

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const [prefsData, subsData, savedData, eventsData] = await Promise.all([
      base44.entities.NotificationPreference.filter({ user_email: userData.email }),
      base44.entities.EventSubscription.filter({ user_email: userData.email }),
      base44.entities.SavedEvent.filter({ user_email: userData.email }),
      base44.entities.Event.filter({ is_approved: true }, 'start_date')
    ]);

    setPreferences(prefsData[0] || {
      email_new_events: true,
      email_reminders: true,
      reminder_hours_before: 24
    });
    setSubscriptions(subsData);
    setSavedEvents(savedData);
    setEvents(eventsData.filter(e => new Date(e.end_date) >= new Date()));
    setIsLoading(false);
  };

  const savePreferences = async () => {
    setIsSaving(true);
    const existingPrefs = await base44.entities.NotificationPreference.filter({ user_email: user.email });
    
    if (existingPrefs[0]) {
      await base44.entities.NotificationPreference.update(existingPrefs[0].id, preferences);
    } else {
      await base44.entities.NotificationPreference.create({
        user_email: user.email,
        ...preferences
      });
    }
    toast.success('Preferences saved');
    setIsSaving(false);
  };

  const addCategorySubscription = async (category) => {
    const exists = subscriptions.find(s => s.subscription_type === 'category' && s.category === category);
    if (exists) return;

    await base44.entities.EventSubscription.create({
      user_email: user.email,
      subscription_type: 'category',
      category
    });
    toast.success('Subscribed to category');
    loadData();
  };

  const removeSubscription = async (subscriptionId) => {
    await base44.entities.EventSubscription.delete(subscriptionId);
    toast.success('Subscription removed');
    loadData();
  };

  const removeSavedEvent = async (savedEventId) => {
    await base44.entities.SavedEvent.delete(savedEventId);
    toast.success('Event removed');
    loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const subscribedCategories = subscriptions
    .filter(s => s.subscription_type === 'category')
    .map(s => s.category);

  const availableCategories = eventCategories.filter(c => !subscribedCategories.includes(c.id));

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Notification Settings</h1>
            <p className="text-stone-500">Manage how you receive event updates</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-stone-500" />
                Email Notifications
              </CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Events</Label>
                  <p className="text-sm text-stone-500">Get notified when new events match your subscriptions</p>
                </div>
                <Switch
                  checked={preferences?.email_new_events}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_new_events: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Event Reminders</Label>
                  <p className="text-sm text-stone-500">Get reminders before events you've saved</p>
                </div>
                <Switch
                  checked={preferences?.email_reminders}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, email_reminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Reminder Timing
                  </Label>
                  <p className="text-sm text-stone-500">How early to send event reminders</p>
                </div>
                <Select
                  value={String(preferences?.reminder_hours_before || 24)}
                  onValueChange={(val) => setPreferences(p => ({ ...p, reminder_hours_before: Number(val) }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour before</SelectItem>
                    <SelectItem value="3">3 hours before</SelectItem>
                    <SelectItem value="12">12 hours before</SelectItem>
                    <SelectItem value="24">1 day before</SelectItem>
                    <SelectItem value="48">2 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={savePreferences} disabled={isSaving} className="w-full rounded-full mt-4">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Category Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-stone-500" />
                Event Categories
              </CardTitle>
              <CardDescription>Subscribe to event types you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {subscriptions
                  .filter(s => s.subscription_type === 'category')
                  .map(sub => (
                    <Badge key={sub.id} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
                      {eventCategories.find(c => c.id === sub.category)?.label || sub.category}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-stone-300 rounded-full"
                        onClick={() => removeSubscription(sub.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
              </div>
              {availableCategories.length > 0 && (
                <Select onValueChange={addCategorySubscription}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Add category subscription</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {availableCategories.length === 0 && subscriptions.filter(s => s.subscription_type === 'category').length > 0 && (
                <p className="text-sm text-stone-500 text-center py-2">You're subscribed to all categories!</p>
              )}
            </CardContent>
          </Card>

          {/* Saved Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-stone-500" />
                Saved Events
              </CardTitle>
              <CardDescription>Events you'll receive reminders for</CardDescription>
            </CardHeader>
            <CardContent>
              {savedEvents.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">
                  No saved events. Browse events and click "Save & Remind Me" to get reminders.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedEvents.map(saved => {
                    const event = events.find(e => e.id === saved.event_id);
                    if (!event) return null;
                    return (
                      <div key={saved.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                        <div>
                          <p className="font-medium text-stone-900">{event.title}</p>
                          <p className="text-sm text-stone-500">
                            {new Date(event.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSavedEvent(saved.id)}
                          className="text-stone-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}