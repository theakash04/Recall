"use client";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { Button } from "./ui/button";

// Define DataItem type
export type DataItem = {
  id: string;
  title: string;
  link: string;
  date: string;
};

// DataItem Component
export const DataItemComponent = ({
  item,
  onDelete,
}: {
  item: DataItem;
  onDelete: (id: string) => void;
}) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
      role="listitem"
    >
      <a href={item.link} className="flex-1">
        <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.date}</p>
      </a>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive/80 cursor-pointer"
        onClick={() => setShowDelete(true)}
        aria-label={`Delete ${item.title}`}
      >
        Delete
      </Button>

      <ConfirmModal
        message={`Are you sure you want to delete ${item.title}?`}
        open={showDelete}
        onConfirm={() => {
          onDelete(item.id);
          setShowDelete(false);
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};
