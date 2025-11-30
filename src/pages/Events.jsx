import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EventCard from "@/components/events/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const data = await base44.entities.Event.filter({ is_approved: true }, 'start_date');
    const now = new Date();
    
    setEvents(data.filter(e => new Date(e.end_date) >= now));
    setPastEvents(data.filter(e => new Date(e.end_date) < now));
    
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-stone-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-amber-500" />
                Local Events
              </h1>
              <p className="text-stone-600 mt-2">Garage sales, estate sales, and community events near you</p>
            </div>
            {user && (
              <Link to={createPageUrl("AddEvent")}>
                <Button className="bg-amber-600 hover:bg-amber-700 rounded-full">
                  <Plus className="h-4 w-4 mr-2" /> Post an Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500" />
                Upcoming Events ({events.length})
              </h2>
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-stone-300 mb-4" />
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No upcoming events</h3>
                  <p className="text-stone-500 mb-4">Be the first to post a sale or event!</p>
                  {user && (
                    <Link to={createPageUrl("AddEvent")}>
                      <Button className="rounded-full">Post an Event</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(event => (
                    <EventCard key={event.id} event={event} currentUser={user} />
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPast(!showPast)}
                  className="text-stone-600 mb-4"
                >
                  {showPast ? 'Hide' : 'Show'} Past Events ({pastEvents.length})
                </Button>
                {showPast && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                    {pastEvents.map(event => (
                      <EventCard key={event.id} event={event} currentUser={user} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}