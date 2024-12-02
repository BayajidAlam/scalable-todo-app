import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../utils/toast";

interface UseDeleteNoteParams {
  email: string;
  onSuccess?: () => void;
}

const useDeleteNote = ({ email, onSuccess }: UseDeleteNoteParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteNote = async (noteId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_BACKEND_ROOT_URL
        }/notes/${noteId}?email=${email}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        showSuccessToast("Note deleted successfully");
        onSuccess?.();
        return true;
      } else {
        showErrorToast(data.message || "Failed to delete note");
        return false;
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      showErrorToast("Error deleting note");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteNote, isLoading };
};

export default useDeleteNote;
