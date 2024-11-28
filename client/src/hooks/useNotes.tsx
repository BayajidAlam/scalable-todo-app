import { useQuery } from "@tanstack/react-query";

const useFetchNotes = () => {
  const {
    data: notes = [],
    isLoading: notesLoading,
    refetch,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notes`);
      return res.json();
    },
  });
  return [notes, notesLoading, refetch];
};

export default useFetchNotes;
