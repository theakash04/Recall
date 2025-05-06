"use client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { useState } from "react";

export default function Page() {
  const [open, setOpen] = useState(false);

  const handleAccountDeletion = () => {
    setOpen(false);
    // Logic to delete the account goes here
    console.log("Account deleted");
  };

  return (
    <div className="relative flex flex-col w-full h-full md:px-10 px-0">
      <div
        className={cx(
          "flex flex-1 flex-col gap-4 px-4 my-4 items-center justify-center",
          "bg-secondary py-10 h-full mx-5 rounded-md hover:border-destructive/50 border ",
          "transition-all duration-200 ease-in-out"
        )}
      >
        <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
          <h1 className="text-2xl font-bold">Delete Account</h1>
          <p className="text-sm text-muted-foreground w-full text-center">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="flex flex-col gap-4 mt-5">
            <Button
              className="cursor-pointer py-6"
              variant={"destructive"}
              size={"lg"}
              onClick={() => setOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={open}
        message="Are you sure you want to delete your account? This action cannot be undone."
        onConfirm={handleAccountDeletion}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
  );
}
