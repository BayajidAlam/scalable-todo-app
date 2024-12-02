import { useState } from "react";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import { Button } from "../../ui/button";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";

interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface CreateNoteCardProps {
  refetch: () => void;
}

interface CreateNoteResponse {
  insertedId?: string;
  error?: boolean;
  message?: string;
}

const CreateNoteCard: React.FC<CreateNoteCardProps> = ({ refetch }) => {
  const { user } = useAuth();

  const [isClick, setIsClick] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTodo, setIsTodo] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const handleAddTodo = () => {
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: "", isCompleted: false },
    ]);
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleTodoChange = (id: string, text: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  };

  const handleTodoToggle = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleCreateNote = async () => {
    if (!title.trim() || (!content.trim() && todos.length === 0)) {
      toast.error("Title and content/todos are required!");
      return;
    }

    if (isTodo && todos.some((todo) => !todo.text.trim())) {
      toast.error("All todo items must have content!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes?email=${
          user?.email
        }&isTodo=${isTodo}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content: isTodo ? "" : content,
            isArchived: false,
            isTrashed: false,
            isTodo,
            todos: isTodo ? todos : [],
          }),
        }
      );

      const data: CreateNoteResponse = await response.json();
      if (response.ok && data.insertedId) {
        refetch();
        toast.success("Note created successfully!");
        setTitle("");
        setContent("");
        setIsClick(false);
        setIsTodo(false);
        setTodos([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:w-[600px] shadow-2xl p-4 rounded-xl mx-auto">
      {isClick && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-xl font-semibold mb-2 w-full rounded-md outline-none border-none"
          autoFocus
        />
      )}
      {!isTodo ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={() => setIsClick(true)}
          placeholder="Take a note..."
          className="w-full outline-none border-none rounded-md active:border-none"
        />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTodoToggle(todo.id)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                {todo.isCompleted ? (
                  <MdOutlineCheckBox />
                ) : (
                  <MdOutlineCheckBoxOutlineBlank />
                )}
              </button>
              <input
                type="text"
                value={todo.text}
                onChange={(e) => handleTodoChange(todo.id, e.target.value)}
                placeholder="List item..."
                className="w-full outline-none border-none rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveTodo(todo.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <RiCloseLine size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTodo}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <RiAddLine /> Add item
          </button>
        </div>
      )}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isClick
            ? "opacity-100 max-h-full"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {isClick && (
          <div>
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setIsTodo(!isTodo)}
                className={`p-2 rounded-md ${
                  isTodo ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                }`}
              >
                Todo list
              </button>
              <div className="flex justify-end items-center gap-2">
                <Button
                  onClick={() => {
                    setIsClick(false);
                    setIsTodo(false);
                    setTodos([]);
                  }}
                  className="mt-4"
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={handleCreateNote}
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNoteCard;
