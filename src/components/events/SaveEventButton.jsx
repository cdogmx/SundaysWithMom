import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { Bookmark, Bell } from "lucide-react";
import { toast } from "sonner";

export default function SaveEventButton({ event, currentUser, variant = "icon" }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) checkSavedStatus();
  }, [currentUser, event.id]);

  const checkSavedStatus = async () => {
    const saved = await base44.entities.SavedEvent.filter({
      user_email: currentUser.email,
      event_id: event.id
    });
    setIsSaved(saved.length > 0);
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    if (isSaved) {
      const saved = await base44.entities.SavedEvent.filter({
        user_email: currentUser.email,
        event_id: event.id
      });
      if (saved[0]) {
        await base44.entities.SavedEvent.delete(saved[0].id);
        toast.success('Event removed from saved');
      }
      setIsSaved(false);
    } else {
      await base44.entities.SavedEvent.create({
        user_email: currentUser.email,
        event_id: event.id
      });
      toast.success('Event saved! You\'ll get a reminder before it starts.');
      setIsSaved(true);
    }
    setIsLoading(false);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSave}
        disabled={isLoading}
        className={`h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm ${
          isSaved ? 'text-amber-500' : 'text-stone-400'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      onClick={toggleSave}
      disabled={isLoading}
      className={`rounded-full ${isSaved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}`}
    >
      {isSaved ? (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Reminder Set
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          Save & Remind Me
        </>
      )}
    </Button>
  );
}