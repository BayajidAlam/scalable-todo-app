import { useQuery } from "@tanstack/react-query";

interface NotesParams {
  email: string;
  searchTerm?: string;
  isTrashed?: boolean;
  isArchived?: boolean;
}

const useFetchNotes = ({
  email,
  searchTerm,
  isTrashed,
  isArchived,
}: NotesParams) => {
  const {
    data: notes = [],
    isLoading: notesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes", email, searchTerm, isTrashed, isArchived],
    queryFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }
      const params = new URLSearchParams();
      params.append("email", email);
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (isTrashed !== undefined)
        params.append("isTrashed", String(isTrashed));
      if (isArchived !== undefined)
        params.append("isArchived", String(isArchived));

      const url = `${
        import.meta.env.VITE_APP_BACKEND_ROOT_URL
      }/notes?${params.toString()}`;
      console.log("Fetching URL:", url);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched data:", data);
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    enabled: !!email,
    retry: 1,
    staleTime: 30000,
  });

  console.log("Query state:", {
    email,
    searchTerm,
    isTrashed,
    isArchived,
    isLoading: notesLoading,
    error,
    notes,
  });

  return { notes, notesLoading, error, refetch };
};

export default useFetchNotes;
