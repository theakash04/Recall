"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addUserFeedback } from "@/utils/userApi";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Sending feedback!");
    try {
      const res = await addUserFeedback({ rating, feedback });
      setIsSubmitted(true);
      toast.success("Feedback sent!", {
        id: toastId,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      toast.error("Failed to send feedback!", {
        description: err instanceof Error ? err.message : undefined,
        id: toastId,
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Thank You!
          </h1>
          <p className="text-muted-foreground mb-4">
            Your feedback has been submitted successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full items-start justify-center">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="bg-card/40 rounded-lg shadow-lg p-8 border-foreground/10 border-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Share Your Feedback
          </h1>
          <p className="text-muted-foreground mb-8">
            We'd love to hear your thoughts and suggestions to improve our
            service.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                How would you rate your experience?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    size={"icon"}
                    className={`w-10 h-10 rounded-full border-2 transition-colors ${
                      star <= rating
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                    }`}
                  >
                    ★
                  </Button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  You rated: {rating} star{rating !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-foreground mb-3"
              >
                Additional Comments (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                  feedback.length > 500 ||
                  (feedback.length > 0 && feedback.length < 12)
                    ? "border-destructive focus:ring-destructive/60"
                    : "border-border focus:ring-primary/60"
                }`}
                placeholder="Share your thoughts and suggestions..."
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs">
                  {feedback.length > 0 && feedback.length < 12 && (
                    <span className="text-destructive">
                      Minimum 12 characters required
                    </span>
                  )}
                  {feedback.length > 500 && (
                    <span className="text-destructive">
                      Maximum 500 characters allowed
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    feedback.length > 500
                      ? "text-destructive"
                      : feedback.length > 450
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {feedback.length}/500
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-center sm:flex-row flex-col gap-4">
              <Button
                type="submit"
                disabled={
                  rating === 0 ||
                  (feedback.length > 0 &&
                    (feedback.length < 12 || feedback.length > 500))
                }
                aria-disabled={
                  rating === 0 ||
                  (feedback.length > 0 &&
                    (feedback.length < 12 || feedback.length > 500))
                }
                size={"lg"}
                variant={"default"}
                className="cursor-pointer sm:flex-2 "
              >
                Submit Feedback
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/")}
                variant={"secondary"}
                size={"lg"}
                className="cursor-pointer sm:flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
