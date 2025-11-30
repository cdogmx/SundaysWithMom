import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MapPin, Clock, Flag } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import CommentSection from "./CommentSection";
import ReportDialog from "@/components/ReportDialog";

const activityTypeLabels = {
  new_location: "added a new place",
  new_event: "posted an event",
  new_review: "left a review",
  photo_upload: "shared photos",
  deal_posted: "posted a deal"
};

const activityTypeColors = {
  new_location: "bg-emerald-50 text-emerald-700",
  new_event: "bg-amber-50 text-amber-700",
  new_review: "bg-rose-50 text-rose-700",
  photo_upload: "bg-violet-50 text-violet-700",
  deal_posted: "bg-blue-50 text-blue-700"
};

export default function ActivityCard({ activity, currentUser, onUpdate, onHide }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  const isLiked = activity.liked_by?.includes(currentUser?.email);
  
  const handleLike = async () => {
    if (!currentUser) return;
    setIsLiking(true);
    
    const likedBy = activity.liked_by || [];
    const newLikedBy = isLiked 
      ? likedBy.filter(email => email !== currentUser.email)
      : [...likedBy, currentUser.email];
    
    await base44.entities.FeedActivity.update(activity.id, {
      liked_by: newLikedBy,
      likes_count: newLikedBy.length
    });
    
    if (onUpdate) onUpdate();
    setIsLiking(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: window.location.href
      });
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-stone-100">
              <AvatarFallback className="bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 font-medium">
                {activity.user_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-stone-900">{activity.user_name || 'Community Member'}</span>
                <span className="text-stone-400 text-sm">{activityTypeLabels[activity.activity_type]}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="h-3 w-3 text-stone-400" />
                <span className="text-xs text-stone-400">
                  {format(new Date(activity.created_date), "MMM d 'at' h:mm a")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activityTypeColors[activity.activity_type]}`}>
                  {activity.activity_type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h3 className="font-semibold text-lg text-stone-800 mb-1">{activity.title}</h3>
          {activity.description && (
            <p className="text-stone-600 text-sm leading-relaxed">{activity.description}</p>
          )}
        </div>

        {/* Image */}
        {activity.image && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <img 
              src={activity.image} 
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Location Link */}
        {activity.location_id && (
          <Link 
            to={createPageUrl(`LocationDetail?id=${activity.location_id}`)}
            className="mx-4 mt-3 flex items-center gap-2 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <MapPin className="h-4 w-4 text-stone-500" />
            <span className="text-sm font-medium text-stone-700">View Location Details</span>
          </Link>
        )}

        {/* Actions */}
        <div className="p-4 pt-3 flex items-center gap-1 border-t border-stone-100 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking || !currentUser}
            className={`flex items-center gap-2 rounded-full px-4 ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{activity.likes_count || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-stone-600 hover:bg-stone-100 rounded-full px-4"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-stone-600 hover:bg-stone-100 rounded-full px-4"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportDialog(true)}
              className="flex items-center gap-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full px-4 ml-auto"
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection 
            activityId={activity.id} 
            currentUser={currentUser}
          />
        )}
        
        {currentUser && (
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            contentType="activity"
            contentId={activity.id}
            contentTitle={activity.title}
            currentUser={currentUser}
            onHide={onHide}
          />
        )}
      </CardContent>
    </Card>
  );
}