import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const eventTypes = [
  { value: 'garage_sale', label: 'Garage Sale' },
  { value: 'estate_sale', label: 'Estate Sale' },
  { value: 'yard_sale', label: 'Yard Sale' },
  { value: 'pop_up', label: 'Pop-Up Event' },
  { value: 'special_event', label: 'Special Event' },
];

export default function AddEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_type: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    start_date: '',
    end_date: '',
    image: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image: file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_type || !formData.address || !formData.start_date || !formData.end_date) return;
    
    setIsSubmitting(true);
    
    const event = await base44.entities.Event.create({
      ...formData,
      is_approved: false
    });
    
    // Create feed activity
    await base44.entities.FeedActivity.create({
      activity_type: 'new_event',
      title: formData.title,
      description: formData.description,
      image: formData.image,
      event_id: event.id,
      user_name: user.display_name || user.full_name || 'Anonymous',
      user_email: user.email
    });
    
    navigate(createPageUrl('Events'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link to={createPageUrl("Events")} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              Post a New Event
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Big Garage Sale this Weekend!"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="event_type">Event Type *</Label>
                  <Select value={formData.event_type} onValueChange={(v) => handleInputChange('event_type', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="What will be available? Any special items?"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4">Event Image</h3>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-stone-400 transition-colors">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-stone-400 mb-2" />
                      <span className="text-sm text-stone-500">Click to upload an image</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-full bg-amber-600 hover:bg-amber-700">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit Event
                </Button>
              </div>
              
              <p className="text-xs text-stone-500 text-center">
                Events will be reviewed before being published to ensure quality.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}