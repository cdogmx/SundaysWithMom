import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Flag } from "lucide-react";
import { toast } from "sonner";

export default function ReportDialog({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId, 
  contentTitle, 
  currentUser,
  onHide 
}) {
  const [reason, setReason] = useState('');
  const [hideContent, setHideContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please explain the issue');
      return;
    }

    setIsSubmitting(true);

    await base44.entities.Report.create({
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      reason: reason,
      reporter_email: currentUser.email
    });

    if (hideContent) {
      await base44.entities.HiddenContent.create({
        user_email: currentUser.email,
        content_type: contentType,
        content_id: contentId
      });
      if (onHide) onHide(contentId);
    }

    toast.success('Report submitted. Thank you for your feedback.');
    setReason('');
    setHideContent(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Report an issue with "{contentTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason">What's the issue?</Label>
            <Textarea
              id="reason"
              placeholder="Please describe the problem..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hide-content"
              checked={hideContent}
              onCheckedChange={setHideContent}
            />
            <Label htmlFor="hide-content" className="text-sm text-stone-600 cursor-pointer">
              Hide this content from my feed
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}