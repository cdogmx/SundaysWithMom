import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Navigation, Flag } from "lucide-react";
import ReportDialog from "@/components/ReportDialog";
import SaveEventButton from "@/components/events/SaveEventButton";
import FollowButton from "@/components/organizers/FollowButton";
import MessageButton from "@/components/messaging/MessageButton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isSameDay } from "date-fns";

const eventTypeLabels = {
  garage_sale: "Garage Sale",
  estate_sale: "Estate Sale",
  yard_sale: "Yard Sale",
  pop_up: "Pop-Up Event",
  special_event: "Special Event"
};

const eventTypeColors = {
  garage_sale: "bg-emerald-100 text-emerald-800",
  estate_sale: "bg-purple-100 text-purple-800",
  yard_sale: "bg-lime-100 text-lime-800",
  pop_up: "bg-rose-100 text-rose-800",
  special_event: "bg-blue-100 text-blue-800"
};

export default function EventCard({ event, currentUser, onHide }) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const sameDay = isSameDay(startDate, endDate);
  
  const getDirectionsUrl = () => {
    const address = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
      <div className="relative">
        {event.image ? (
          <div className="aspect-[16/9] overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-stone-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${eventTypeColors[event.event_type]} border-0 font-medium`}>
            {eventTypeLabels[event.event_type]}
          </Badge>
        </div>
        {currentUser && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <SaveEventButton event={event} currentUser={currentUser} />
            {event.created_by && event.created_by !== currentUser.email && (
              <FollowButton organizerEmail={event.created_by} currentUser={currentUser} variant="icon" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReportDialog(true)}
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm text-stone-400 hover:text-red-500"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute -bottom-6 left-4 bg-white rounded-xl shadow-lg p-3 text-center min-w-[60px]">
          <span className="block text-xs font-medium text-stone-500 uppercase">
            {format(startDate, "MMM")}
          </span>
          <span className="block text-2xl font-bold text-stone-900">
            {format(startDate, "d")}
          </span>
        </div>
      </div>
      
      <CardContent className="pt-10 pb-4 px-4">
        <h3 className="font-semibold text-lg text-stone-900 mb-2 line-clamp-1">
          {event.title}
        </h3>
        
        {event.description && (
          <p className="text-sm text-stone-600 line-clamp-2 mb-3">{event.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {sameDay ? (
                <>{format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}</>
              ) : (
                <>{format(startDate, "MMM d, h:mm a")} - {format(endDate, "MMM d, h:mm a")}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{event.address}, {event.city}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <a 
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
          {event.created_by && (
            <Link 
              to={createPageUrl(`OrganizerProfile?email=${event.created_by}`)}
              className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              Organizer
            </Link>
          )}
        </div>
      </CardContent>
      
      {currentUser && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          contentType="event"
          contentId={event.id}
          contentTitle={event.title}
          currentUser={currentUser}
          onHide={onHide}
        />
      )}
    </Card>
  );
}