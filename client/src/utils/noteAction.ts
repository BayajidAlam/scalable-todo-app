import { showErrorToast, showSuccessToast } from "./toast";

interface UpdateNoteStatusParams {
  noteId: string;
  email: string;
  action: "archive" | "trash";
  currentStatus: boolean;
}

export const updateNoteStatus = async ({
  noteId,
  email,
  action,
  currentStatus,
}: UpdateNoteStatusParams) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_BACKEND_ROOT_URL
      }/notes/${noteId}?email=${email}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          [action === "archive" ? "isArchived" : "isTrashed"]: !currentStatus,
        }),
      }
    );

    const result = await response.json();
    if (result.success) {
      const messages = {
        archive: currentStatus ? "Note unarchived!" : "Note archived!",
        trash: currentStatus ? "Note restored!" : "Note moved to trash!",
      };
      showSuccessToast(messages[action]);
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    showErrorToast(`Failed to ${action} note`);
    return false;
  }
};
