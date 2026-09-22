"use client";

import { useState } from "react";
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
import { Star, Loader2 } from "lucide-react";
import { postTestimonial, TestimonialPayload, triggerApproveTestimonial } from "@/services/testimonialServices";
import { toast } from "sonner";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  care?: string;
  name?: string;
  sessionTitle: string;
}

export function ShareStoryModal({
  isOpen,
  onClose,
  care,
  name,
  sessionTitle
}: ShareStoryModalProps) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter a short review before submitting.");
      return;
    }

    const payload: TestimonialPayload = {
      name: name ?? "",
      care: care ?? "",
      message: `[${sessionTitle}] ${message}`,
      rating,
      isApproved: false,
      isFeatured: false
    };

    try {
      setSubmitting(true);
      await postTestimonial(payload);

      toast.success("Thank you for sharing your experience!");
      
      onClose();
    } catch (error) {
      console.error("Failed to submit story:", error);
      toast.error("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">How was your treatment section?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your treatment session <strong>&ldquo;{sessionTitle}&rdquo;</strong> was recently closed. Share your story to help others!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Rate your treatment experience</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? "text-primary fill-current" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Story Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Your Experience</label>
            <Textarea
              placeholder="Tell us how you feel after this treatment session..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Skip for now
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !message.trim()}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Story"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}