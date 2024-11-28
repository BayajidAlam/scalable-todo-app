import { useState } from "react";
import { RiInboxArchiveLine } from "react-icons/ri";

const CreateNoteCard = () => {
  const [isClick, setIsClick] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <div className="w-[700px] shadow-2xl p-4 rounded-xl mx-auto">
      {isClick && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-xl font-semibold mb-2 w-full   rounded-md outline-none border-none"
          autoFocus
        />
      )}
      <textarea
        onClick={() => setIsClick(true)}
        name=""
        placeholder="Take a note..."
        id=""
        className={`w-full outline-none border-none
        } rounded-md active:border-none`}
      ></textarea>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isClick
            ? "opacity-100 max-h-full"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {isClick && (
          <div>
            <div className="flex justify-between items-center mt-2">
              <RiInboxArchiveLine />
              <button onClick={() => setIsClick(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNoteCard;