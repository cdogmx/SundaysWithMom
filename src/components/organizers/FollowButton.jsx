import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FollowButton({ organizerEmail, currentUser, onFollowChange, variant = "default" }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) checkFollowStatus();
  }, [currentUser, organizerEmail]);

  const checkFollowStatus = async () => {
    const follows = await base44.entities.OrganizerFollow.filter({
      follower_email: currentUser.email,
      organizer_email: organizerEmail
    });
    setIsFollowing(follows.length > 0);
  };

  const toggleFollow = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please sign in to follow organizers');
      return;
    }
    if (organizerEmail === currentUser.email) {
      toast.error("You can't follow yourself");
      return;
    }

    setIsLoading(true);

    if (isFollowing) {
      const follows = await base44.entities.OrganizerFollow.filter({
        follower_email: currentUser.email,
        organizer_email: organizerEmail
      });
      if (follows[0]) {
        await base44.entities.OrganizerFollow.delete(follows[0].id);
      }
      // Remove subscription
      const subs = await base44.entities.EventSubscription.filter({
        user_email: currentUser.email,
        subscription_type: 'organizer',
        organizer_email: organizerEmail
      });
      if (subs[0]) {
        await base44.entities.EventSubscription.delete(subs[0].id);
      }
      toast.success('Unfollowed organizer');
      setIsFollowing(false);
    } else {
      await base44.entities.OrganizerFollow.create({
        follower_email: currentUser.email,
        organizer_email: organizerEmail
      });
      // Add subscription for notifications
      await base44.entities.EventSubscription.create({
        user_email: currentUser.email,
        subscription_type: 'organizer',
        organizer_email: organizerEmail
      });
      toast.success("Following! You'll be notified of their new events.");
      setIsFollowing(true);
    }

    setIsLoading(false);
    if (onFollowChange) onFollowChange();
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFollow}
        disabled={isLoading}
        className={`h-8 w-8 rounded-full shadow-sm ${isFollowing ? 'bg-emerald-100 text-emerald-600' : 'bg-white/90 hover:bg-white text-stone-600'}`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      onClick={toggleFollow}
      disabled={isLoading}
      className={`rounded-full ${isFollowing ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}