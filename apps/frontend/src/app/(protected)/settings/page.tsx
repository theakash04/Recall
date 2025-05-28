"use client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [open, setOpen] = useState(false);

  const handleAccountDeletion = () => {
    setOpen(false);
    // Logic to delete the account goes here
  };

  return (
    <div className="w-full mx-auto space-y-4 px-4 py-8 flex flex-col items-center justify-center">
      {/* Delete Account */}
      <div className="flex items-center justify-between border border-destructive/30 bg-destructive/5 rounded-lg px-6 py-4 shadow-sm w-full">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-destructive">
            Delete Account
          </span>
          <span className="text-sm text-muted-foreground">
            Permanently delete your account and all data.
          </span>
        </div>
        <Button
          className="text-white"
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>
        {/* Confirm Modal */}
        <ConfirmModal
          open={open}
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={handleAccountDeletion}
          onCancel={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
