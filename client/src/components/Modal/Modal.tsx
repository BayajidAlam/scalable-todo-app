// src/components/Modal/Modal.tsx
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { GoTrash } from "react-icons/go";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { updateNoteStatus } from "../../utils/noteAction";
import { INoteTypes, ITodoTypes } from "../../Types";
import useAuth from "../../hooks/useAuth";

interface IViewNotesProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNote: INoteTypes;
  refetch: () => void;
}

interface IFormData {
  title: string;
  content: string;
}

const ViewNotesModal: React.FC<IViewNotesProps> = ({
  refetch,
  isOpen,
  setIsOpen,
  selectedNote,
}) => {
  const { user } = useAuth();
  const userEmail = user?.email as string;

  const [todos, setTodos] = useState<ITodoTypes[]>(selectedNote?.todos || []);

  const form = useForm<IFormData>({
    defaultValues: {
      title: selectedNote?.title || "",
      content: selectedNote?.content || "",
    },
  });

  const { register, handleSubmit, reset, setValue } = form;

  useEffect(() => {
    if (selectedNote) {
      setValue("title", selectedNote.title);
      setValue("content", selectedNote.content);
      setTodos(selectedNote.todos || []);
    }
  }, [selectedNote, setValue]);

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

  const onSubmit = async (data: IFormData) => {
    try {
      const payload = {
        ...data,
        todos: selectedNote.isTodo ? todos : [],
      };

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes/${
          selectedNote._id
        }?email=${userEmail}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result.success) {
        refetch();
        reset();
        showSuccessToast("Note updated successfully!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
      showErrorToast((error as Error).message);
    }
  };

  const handleAddToArchive = async () => {
    const success = await updateNoteStatus({
      noteId: selectedNote._id,
      email: userEmail,
      action: "archive",
      currentStatus: selectedNote.isArchived,
    });
    if (success) {
      refetch();
      setIsOpen(false);
    }
  };

  const handleAddToTrash = async () => {
    const success = await updateNoteStatus({
      noteId: selectedNote._id,
      email: userEmail,
      action: "trash",
      currentStatus: selectedNote.isTrashed,
    });
    if (success) {
      refetch();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[360px] md:w-[425px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <input
                  {...register("title", { required: true })}
                  className="w-full outline-none rounded-md"
                  placeholder="Title"
                />
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 pt-2">
              <div className="flex flex-col items-start">
                <div className="w-full">
                  {selectedNote?.isTodo ? (
                    <div>
                      {todos.map((todo) => (
                        <div key={todo.id} className="flex items-center ">
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
                            onChange={(e) =>
                              handleTodoChange(todo.id, e.target.value)
                            }
                            className="w-full p-2 outline-none rounded-md"
                            placeholder="List item..."
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
                  ) : (
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <textarea
                            {...field}
                            className="w-full p-2 outline-none rounded-md"
                            placeholder="Content"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-between items-center gap-1">
                <button
                  onClick={() => handleAddToArchive()}
                  type="button"
                  className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <HiOutlineArchiveBoxArrowDown />
                </button>
                <button
                  onClick={() => handleAddToTrash()}
                  type="button"
                  className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <GoTrash />
                </button>
              </div>
              <Button className="mt-4" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNotesModal;
