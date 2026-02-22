"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface DeleteListButtonProps {
  listId: string;
}

export default function DeleteListButton({ listId }: DeleteListButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete word list");
        setIsDeleting(false);
        setShowConfirm(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
          className="flex-1 sm:flex-none"
        >
          Confirm
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="danger"
      onClick={() => setShowConfirm(true)}
      className="w-full sm:w-auto"
    >
      Delete
    </Button>
  );
}