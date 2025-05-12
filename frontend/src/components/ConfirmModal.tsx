import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";

interface ConfirmModalProps {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  message = "Are you sure?",
  onConfirm,
  onCancel,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center w-full mx-auto backdrop-blur-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="p-6 rounded-lg bg-secondary border-destructive/40 border shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onCancel}
              className="cursor-pointer"
              variant={"ghost"}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="cursor-pointer"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
