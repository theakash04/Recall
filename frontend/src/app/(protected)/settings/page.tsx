"use client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { deleteUserAccount } from "@/lib/userApi";
import { useGlobalStore } from "@/store/globalStore";
import { useUserStore } from "@/store/useStore";
import { searchType } from "@/types/bookmarkTypes";
import { VerifiedIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { globalSetting, editGlobalSetting } = useGlobalStore();
  const { userData } = useUserStore();
  const currentSearchType = globalSetting.default_search_type;

  const searchTypeOptions: {
    value: searchType;
    label: string;
    description: string;
  }[] = [
    {
      value: "keyword",
      label: "Keyword",
      description: "Search by keywords",
    },
    {
      value: "semantic",
      label: "Semantic",
      description: "AI-powered contextual search",
    },
    {
      value: "hybrid",
      label: "hybrid",
      description: "Blends keyword and semantic search for relevant results",
    },
  ];

  const handleSearchTypeClick = (newSearchType: searchType) => {
    if (newSearchType === currentSearchType) return;
    const success = editGlobalSetting({
      default_search_type: newSearchType,
    });

    if (success) {
      toast.success(`Default search type updated to ${newSearchType}!`);
    } else {
      toast.error("Failed to update search type. Please try again.");
    }
  };

  const handleAccountDeletion = async () => {
    setOpen(false);
    const toastId = toast.loading("Deleting user account!");
    try {
      const res = await deleteUserAccount();
      if (res.success) {
        toast.success(res.message || "account deleted successfully!", {
          id: toastId,
        });
        router.replace("/bye");
      } else {
        toast.error(res.error.code, {
          description: res.error.message,
          id: toastId,
        });
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Something unexpected happened!";
      toast.error(errMsg, {
        id: toastId,
      });
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 px-4 py-8 flex flex-col items-center justify-center">
      {/* User Profile Section */}
      <div className="w-full flex flex-col gap-5 px-5 items-center">
        {/* Avatar */}
        <div className="relative h-32 w-32 rounded-full overflow-hidden">
          <Avatar className="h-full w-full rounded-lg">
            <AvatarImage src={userData?.avatar_url} alt={userData?.full_name} />
            <AvatarFallback className="rounded-lg">
              {userData?.full_name
                ? userData.full_name.charAt(0).toUpperCase()
                : "U"}
              <span className="sr-only">{userData?.full_name}</span>
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-2 items-center justify-center pb-5">
          <span className="text-xl font-semibold flex gap-2 items-center">
            {userData?.full_name}
            {userData?.email_verified ? <VerifiedIcon size={18} color="#01befe"/> : null}
          </span>
          <span className="text-sm text-muted-foreground">
            {userData?.email}
          </span>
        </div>
      </div>

      {/* default search type setting */}
      <div className="border border-border bg-card rounded-lg px-6 py-4 shadow-sm w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Default Search Type</span>
            <span className="text-sm text-muted-foreground">
              Choose how you want to search your bookmarks by default
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {searchTypeOptions.map((option) => {
              const isSelected = currentSearchType === option.value;

              return (
                <div
                  key={option.value}
                  onClick={() => handleSearchTypeClick(option.value)}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/50"
                    }
                  `}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
