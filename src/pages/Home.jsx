import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ActivityCard from "@/components/feed/ActivityCard";
import LocationCard from "@/components/locations/LocationCard";
import EventCard from "@/components/events/EventCard";

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const [activitiesData, locationsData, eventsData] = await Promise.all([
      base44.entities.FeedActivity.list('-created_date', 20),
      base44.entities.Location.filter({ is_approved: true }, '-created_date', 6),
      base44.entities.Event.filter({ is_approved: true }, 'start_date', 4)
    ]);
    
    setActivities(activitiesData);
    setFeaturedLocations(locationsData);
    setUpcomingEvents(eventsData.filter(e => new Date(e.end_date) >= new Date()));
    
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1920')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
              Sundays with <span className="font-semibold">Mom</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-8 leading-relaxed">
              Your guide to the perfect morning. Discover vintage treasures, cozy coffee spots, 
              and local sales — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={createPageUrl("Directory")}>
                <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-8">
                  Explore Directory
                </Button>
              </Link>
              <Link to={createPageUrl("Events")}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                  View Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link to={createPageUrl("AddLocation")}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full">
                <Plus className="h-4 w-4 mr-2" /> Add a Place
              </Button>
            </Link>
            <Link to={createPageUrl("AddEvent")}>
              <Button variant="outline" className="rounded-full">
                <Calendar className="h-4 w-4 mr-2" /> Post an Event
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-stone-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-amber-500" />
                Community Feed
              </h2>
            </div>
            
            {activities.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No activity yet</h3>
                <p className="text-stone-500 mb-4">Be the first to add a place or event!</p>
                {user && (
                  <Link to={createPageUrl("AddLocation")}>
                    <Button className="rounded-full">Get Started</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    currentUser={user}
                    onUpdate={loadData}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Featured Locations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">Featured Places</h3>
                <Link to={createPageUrl("Directory")} className="text-sm text-stone-500 hover:text-stone-700">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {featuredLocations.slice(0, 3).map(location => (
                  <LocationCard key={location.id} location={location} currentUser={user} />
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-stone-900">Upcoming Events</h3>
                  <Link to={createPageUrl("Events")} className="text-sm text-stone-500 hover:text-stone-700">
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 2).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}