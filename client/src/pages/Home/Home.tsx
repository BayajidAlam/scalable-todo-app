import { useState } from "react";
import { RiInboxArchiveLine } from "react-icons/ri";
import CreateNoteCard from "../../components/HomePage/CreateNote/CreateNote";
import { GoTrash } from "react-icons/go";
import { useAppContext } from "../../providers/AppProvider";
import ViewNotesModal from "../../components/Modal/Modal";

const notes = [
  {
    id: 1,
    title: "First Note",
    content: "This is the first note content",
    isArchived: true,
    isPinned: false,
  },
  {
    id: 2,
    title: "Second Note",
    content: "This is the second note content",
    isArchived: true,
    isPinned: false,
  },
];

const Home = () => {
  const { isListView } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const openModal = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  return (
    <div className="w-full">
      <CreateNoteCard />

      <div
        className={`grid gap-3 transition-all duration-500 ease-in-out ${
          isListView ? "grid-cols-1 pt-16" : "lg:grid-cols-4 md:grid-cols-1 pt-16"
        }`}
      >
        {notes.map((note, index) => (
          <div
            className={`border rounded-md p-2 transition-all duration-500 ease-in-out ${
              isListView ? "w-[600px] mx-auto" : "w-96"
            }`}
            key={index}
            onClick={() => openModal(note)}
          >
            <h1 className="text-md font-bold">{note.title}</h1>
            <div>{note.content}</div>
            <div className="flex justify-end items-center gap-3">
              <RiInboxArchiveLine />
              <GoTrash />
            </div>
          </div>
        ))}
      </div>

      <ViewNotesModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedNote={selectedNote}
      />
    </div>
  );
};

export default Home;