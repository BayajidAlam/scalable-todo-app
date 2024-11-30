import { useState } from "react";
import { RiInboxArchiveLine } from "react-icons/ri";
import CreateNoteCard from "../../components/HomePage/CreateNote/CreateNote";
import { useAppContext } from "../../providers/AppProvider";
import ViewNotesModal from "../../components/Modal/Modal";
import useFetchNotes from "../../hooks/useNotes";
import useAuth from "../../hooks/useAuth";
import { updateNoteStatus } from "../../utils/noteAction";
import { Button } from "../../components/ui/button";
import useDeleteNote from "../../hooks/useDeleteNote";
import { AiFillDelete } from "react-icons/ai";
import { INoteTypes } from "../../Types";

const TrashPage = () => {
  const { isListView } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INoteTypes | null>(null);

  const { user } = useAuth();
  const userEmail = user?.email as string;

  const { notes, refetch } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    isTrashed: true,
    isArchived: false,
  });

  const openModal = (note: INoteTypes): void => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleArchive = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();
    const success = await updateNoteStatus({
      noteId: note._id,
      email: userEmail,
      action: "archive",
      currentStatus: note.isArchived,
    });
    if (success) {
      refetch();
    }
  };

  const { deleteNote } = useDeleteNote({
    email: userEmail,
    onSuccess: refetch,
  });

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    await deleteNote(noteId);
  };

  return (
    <div className="w-full">
      <CreateNoteCard refetch={refetch} />

      <div
        className={`grid gap-3 transition-all duration-500 ease-in-out ${
          isListView
            ? "grid-cols-1 pt-16"
            : "lg:grid-cols-4 md:grid-cols-1 pt-16"
        }`}
      >
        {notes?.map((note: INoteTypes, index: number) => (
          <div
            className={`border rounded-md p-2 transition-all duration-500 ease-in-out ${
              isListView ? "w-[600px] mx-auto" : "w-96"
            }`}
            key={index}
            onClick={() => openModal(note)}
          >
            <h1 className="text-md font-bold">{note.title}</h1>
            {note.isTodo ? (
              <div>
                <h2 className="font-semibold text-lg mb-2">To-Do List:</h2>
                <ul className="space-y-2">
                  {note.todos?.map((todo) => (
                    <li key={todo.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        readOnly
                        className="form-checkbox h-4 w-4 text-blue-500"
                      />
                      <span
                        className={`${
                          todo.isCompleted
                            ? "line-through text-gray-500"
                            : "text-black"
                        }`}
                      >
                        {todo.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>{note.content}</p>
            )}
            <div className="flex justify-end items-center gap-3 mt-4">
              <Button
                variant={"outline"}
                onClick={(e) => handleArchive(e, note)}
                className=" hover:text-blue-500"
              >
                <RiInboxArchiveLine />
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => handleDelete(e, note._id)}
                className=" hover:text-red-500 text-red-500"
              >
                <AiFillDelete />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ViewNotesModal
        refetch={refetch}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedNote={selectedNote as INoteTypes}
      />
    </div>
  );
};

export default TrashPage;
