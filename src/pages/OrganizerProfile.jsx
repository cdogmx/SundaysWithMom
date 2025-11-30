import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Calendar, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EventCard from "@/components/events/EventCard";
import FollowButton from "@/components/organizers/FollowButton";
import MessageButton from "@/components/messaging/MessageButton";

export default function OrganizerProfile() {
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const organizerEmail = urlParams.get('email');

  useEffect(() => {
    loadData();
  }, [organizerEmail]);

  const loadData = async () => {
    if (!organizerEmail) return;

    setIsLoading(true);

    // Get organizer info from User entity
    const users = await base44.entities.User.filter({ email: organizerEmail });
    const organizerData = users[0];
    
    // Get events by this organizer
    const eventsData = await base44.entities.Event.filter({ 
      created_by: organizerEmail,
      is_approved: true 
    }, '-created_date');

    // Get follower count
    const followers = await base44.entities.OrganizerFollow.filter({ organizer_email: organizerEmail });

    setOrganizer(organizerData || { email: organizerEmail });
    setEvents(eventsData);
    setFollowerCount(followers.length);

    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
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

  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto text-stone-300 mb-4" />
          <h2 className="text-xl font-medium text-stone-900 mb-2">Organizer not found</h2>
          <Link to={createPageUrl("Events")}>
            <Button className="rounded-full">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.end_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.end_date) < new Date());

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Events')} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Organizer Header */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-stone-100">
                <AvatarImage src={organizer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-amber-200 to-orange-200 text-amber-800 text-2xl">
                  {(organizer.display_name || organizer.full_name || organizer.email || 'O')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-semibold text-stone-900">
                  {organizer.display_name || organizer.full_name || 'Event Organizer'}
                </h1>
                {organizer.bio && (
                  <p className="text-stone-600 mt-2">{organizer.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{events.length} events</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{followerCount} followers</span>
                  </div>
                </div>
              </div>
              {currentUser && currentUser.email !== organizerEmail && (
                <div className="flex items-center gap-2">
                  <FollowButton organizerEmail={organizerEmail} currentUser={currentUser} onFollowChange={loadData} />
                  <MessageButton 
                    recipientEmail={organizerEmail} 
                    recipientName={organizer.display_name || organizer.full_name}
                    currentUser={currentUser} 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">
            Upcoming Events ({upcomingEvents.length})
          </h2>
          {upcomingEvents.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-stone-500">
                No upcoming events from this organizer.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">
              Past Events ({pastEvents.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} currentUser={currentUser} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}