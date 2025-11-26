
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type DeleteDialogProps = {
  /** Text shown on the trigger button (default: Delete with trash icon) */
  trigger?: React.ReactNode;

  /** Title of the dialog (default: "Delete item") */
  title?: string;

  /** Description/body text (default: "This action cannot be undone.") */
  description?: string;

  /** Text for confirm button (default: "Delete") */
  confirmText?: string;

  /** Text for cancel button (default: "Cancel") */
  cancelText?: string;

  /** The async function to run when user confirms deletion */
  onConfirm: () => void;

  /** Optional: disable the button while deleting */
  loading?: boolean;
};

export function DeleteDialog({
  trigger,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  loading: externalLoading = false,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // You can toast errors here if you want
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button variant="outline" size="icon" className="border-red-500/20 hover:bg-red-500/10 text-red-500">
            <Trash2 size={16} />
          </Button>

        )}
      </div>

      {/* Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading || externalLoading}>
              {cancelText}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading || externalLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}