import { useForm } from "react-hook-form";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import Swal from "sweetalert2";
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

interface ViewNotesProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNote: any;
}

const ViewNotesModal = ({
  isOpen,
  setIsOpen,
  selectedNote,
}: ViewNotesProps) => {
  const { user } = useContext(AuthContext);
  const form = useForm({
    defaultValues: {
      title: selectedNote?.title || "",
      content: selectedNote?.content || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  useEffect(() => {
    if (selectedNote) {
      setValue("title", selectedNote.title);
      setValue("content", selectedNote.content);
    }
  }, [selectedNote, setValue]);

  async function onSubmit(data) {
    try {
      fetch(`${import.meta.env.VITE_API_URL}/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.updatedId) {
            reset();
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Note updated successfully",
              showConfirmButton: false,
              timer: 1500,
              width: "350px",
            });
            setIsOpen(false);
          }
        });
    } catch (error) {
      // console.log(error, "error");
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[360px] md:w-[425px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <input
                  {...register("title", { required: true })}
                  className="w-full p-2 outline-none rounded-md"
                  placeholder="Title"
                />
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-start gap-4">
                <div className="w-full">
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
                </div>
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-between items-center gap-1">
                <button className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  <HiOutlineArchiveBoxArrowDown />
                </button>
                <button className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
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
