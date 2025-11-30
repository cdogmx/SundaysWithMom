import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { stubAPI as base44 } from "@/api/stubs";

export default function CommentSection({ activityId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [activityId]);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await base44.entities.Comment.filter({ activity_id: activityId }, '-created_date');
    setComments(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    await base44.entities.Comment.create({
      activity_id: activityId,
      content: newComment,
      user_name: currentUser.display_name || currentUser.full_name || 'Anonymous',
      user_email: currentUser.email
    });
    
    setNewComment('');
    await loadComments();
    setIsSubmitting(false);
  };

  return (
    <div className="border-t border-stone-100 bg-stone-50/50">
      <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-2">No comments yet. Be the first!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-stone-200 text-stone-600 text-xs">
                  {comment.user_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-stone-800">{comment.user_name}</span>
                  <span className="text-xs text-stone-400">
                    {format(new Date(comment.created_date), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-stone-600">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="p-4 pt-0">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-stone-200 text-stone-600 text-xs">
                {(currentUser.display_name || currentUser.full_name)?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-white border-stone-200 focus:ring-2 focus:ring-stone-200"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isSubmitting || !newComment.trim()}
                className="rounded-full bg-stone-800 hover:bg-stone-900 h-10 w-10"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}