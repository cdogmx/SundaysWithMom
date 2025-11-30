import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, ArrowLeft, MapPin, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categories = [
  { value: 'vintage_store', label: 'Vintage Store' },
  { value: 'antique_store', label: 'Antique Store' },
  { value: 'thrift_store', label: 'Thrift Store' },
  { value: 'coffee_shop', label: 'Coffee Shop' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'breakfast_place', label: 'Breakfast Place' },
];

export default function AddLocation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    main_image: ''
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

  const handleHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: value }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, main_image: file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.address) return;
    
    setIsSubmitting(true);
    
    const location = await base44.entities.Location.create({
      ...formData,
      is_approved: false // Requires admin approval
    });
    
    // Create feed activity
    await base44.entities.FeedActivity.create({
      activity_type: 'new_location',
      title: `New place added: ${formData.name}`,
      description: formData.bio,
      image: formData.main_image,
      location_id: location.id,
      user_name: user.display_name || user.full_name || 'Anonymous',
      user_email: user.email
    });
    
    navigate(createPageUrl('Directory'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link to={createPageUrl("Directory")} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Store className="h-5 w-5 text-emerald-600" />
              </div>
              Add a New Place
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter business name"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bio">Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about this place..."
                    className="mt-1.5 min-h-[100px]"
                  />
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

              {/* Contact */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://..."
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4">Hours of Operation</h3>
                <div className="space-y-3">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="w-24 text-sm capitalize text-stone-600">{day}</span>
                      <Input
                        value={formData.hours[day]}
                        onChange={(e) => handleHoursChange(day, e.target.value)}
                        placeholder="9:00 AM - 5:00 PM"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-medium text-stone-900 mb-4">Main Image</h3>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-stone-400 transition-colors">
                  {formData.main_image ? (
                    <img src={formData.main_image} alt="Preview" className="h-full w-full object-cover rounded-xl" />
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
                <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-full">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit for Review
                </Button>
              </div>
              
              <p className="text-xs text-stone-500 text-center">
                Submissions will be reviewed by our team before being published.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}