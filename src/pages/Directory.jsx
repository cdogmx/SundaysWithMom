import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryTabs from "@/components/ui/CategoryTabs";
import LocationCard from "@/components/locations/LocationCard";



export default function Directory() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [selectedMiles, setSelectedMiles] = useState('all');
  const [userZip, setUserZip] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, activeCategory, searchQuery, showOpenNow, selectedMiles, userZip]);

  const isOpenNow = (hours) => {
    if (!hours) return false;
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = hours[today];
    
    if (!todayHours || todayHours.toLowerCase() === 'closed') return false;
    
    // Parse hours like "9:00 AM - 5:00 PM"
    const match = todayHours.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (!match) return false;
    
    const parseTime = (h, m, period) => {
      let hour = parseInt(h);
      const min = parseInt(m || '0');
      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    
    const openTime = parseTime(match[1], match[2], match[3]);
    const closeTime = parseTime(match[4], match[5], match[6]);
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const loadLocations = async () => {
    setIsLoading(true);
    const data = await base44.entities.Location.filter({ is_approved: true }, '-created_date');
    setLocations(data);
    
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
    setIsLoading(false);
  };

  const filterLocations = () => {
    let filtered = locations;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(loc => loc.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(query) ||
        loc.city?.toLowerCase().includes(query) ||
        loc.bio?.toLowerCase().includes(query)
      );
    }
    
    if (showOpenNow) {
      filtered = filtered.filter(loc => isOpenNow(loc.hours));
    }
    
    setFilteredLocations(filtered);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-stone-900">Directory</h1>
              <p className="text-stone-500 mt-1">Discover local shops, cafes, and hidden gems</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by name, city, or zip..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Check if user entered a zip code
                  const zipMatch = e.target.value.match(/\b\d{5}\b/);
                  if (zipMatch) {
                    setUserZip(zipMatch[0]);
                  }
                }}
                className="pl-10 rounded-full border-stone-200 focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Switch
                id="open-now"
                checked={showOpenNow}
                onCheckedChange={setShowOpenNow}
              />
              <Label htmlFor="open-now" className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Clock className="h-4 w-4 text-emerald-600" />
                Open Now
              </Label>
            </div>
            {userZip && (
              <div className="flex items-center gap-2 text-sm text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                <MapPin className="h-3.5 w-3.5" />
                {userZip}
              </div>
            )}
            <Select value={selectedMiles} onValueChange={setSelectedMiles}>
              <SelectTrigger className="w-36 rounded-full">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
                <SelectItem value="50">Within 50 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 mx-auto text-stone-300 mb-4" />
            <h3 className="text-xl font-medium text-stone-900 mb-2">No places found</h3>
            <p className="text-stone-500">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map(location => (
              <LocationCard key={location.id} location={location} currentUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}