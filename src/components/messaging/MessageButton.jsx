import React, { useState } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function MessageButton({ recipientEmail, recipientName, eventId, currentUser, variant = "default" }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startConversation = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please sign in to send messages');
      return;
    }
    if (recipientEmail === currentUser.email) {
      toast.error("You can't message yourself");
      return;
    }

    setIsLoading(true);

    // Check for existing conversation
    const existingConvos = await base44.entities.Conversation.list();
    const existing = existingConvos.find(c => 
      c.participant_emails.includes(currentUser.email) && 
      c.participant_emails.includes(recipientEmail)
    );

    if (existing) {
      navigate(createPageUrl(`Messages?conversation=${existing.id}`));
    } else {
      const newConvo = await base44.entities.Conversation.create({
        participant_emails: [currentUser.email, recipientEmail],
        participant_names: [currentUser.display_name || currentUser.full_name || currentUser.email, recipientName || recipientEmail],
        event_id: eventId || null,
        unread_count: {}
      });
      navigate(createPageUrl(`Messages?conversation=${newConvo.id}`));
    }
    setIsLoading(false);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startConversation}
        disabled={isLoading}
        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm text-stone-600"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={startConversation}
      disabled={isLoading}
      className="rounded-full"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Message
    </Button>
  );
}