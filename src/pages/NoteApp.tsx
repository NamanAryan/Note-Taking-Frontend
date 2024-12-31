import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Note {
  _id: string;
  title: string;
  content: string;
  user: string;
  createdAt: string;
  updatedAt?: string;
}

const NoteApp: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/notes/notes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNewNote = async () => {
    const emptyNote = {
      _id: Date.now().toString(),
      title: "",
      content: "",
      user: "",
      createdAt: new Date().toISOString(),
    };
    setNotes([emptyNote, ...notes]);
    setSelectedNote(emptyNote);
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (
      !selectedNote?.title.trim() ||
      !selectedNote?.content.trim() ||
      !isEditing
    )
      return;
    setIsEditing(false);

    try {
      const isNewNote = !selectedNote._id.includes("-");
      const url = isNewNote
        ? "http://localhost:8000/api/notes/note"
        : `http://localhost:8000/api/notes/notes/${selectedNote._id}`;

      const response = await fetch(url, {
        method: isNewNote ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
        }),
      });

      if (response.ok) {
        await fetchNotes();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setIsEditing(true);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      // Check if this is a temporary note (using Date.now() as ID)
      if (noteId.length >= 13 && !isNaN(Number(noteId))) {
        // This is an unsaved note with a timestamp ID
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteId)
        );
        setSelectedNote(null);
        setIsEditing(false);
        return;
      }

      // For saved notes, attempt to delete from the backend
      const response = await fetch(
        `http://localhost:8000/api/notes/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Update the UI state
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteId)
        );
        setSelectedNote(null);
        setIsEditing(false);
      } else {
        console.error("Failed to delete note:", response.statusText);
      }
    } catch (error) {
      // If there's any error (including network errors), still remove from UI
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      setSelectedNote(null);
      setIsEditing(false);
      console.error("Error deleting note:", error);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-indigo-100 flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Notes
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>

          <button
            onClick={handleNewNote}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                selectedNote?._id === note._id
                  ? "bg-indigo-50 border-l-indigo-600"
                  : "hover:bg-gray-50 border-l-transparent"
              }`}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
            >
              <h3 className="font-medium text-gray-900 truncate">
                {note.title || "Untitled"}
              </h3>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {note.content || "No content"}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 flex flex-col bg-white rounded-l-2xl shadow-xl">
        {selectedNote ? (
          <>
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) =>
                    setSelectedNote({
                      ...selectedNote,
                      title: e.target.value,
                    })
                  }
                  className="text-2xl font-medium focus:outline-none focus:border-b-2 focus:border-indigo-600 placeholder-gray-400 w-full"
                  placeholder="Note title"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-medium text-gray-900">
                  {selectedNote.title || "Untitled"}
                </h2>
              )}
              <div className="flex gap-3">
                {isEditing ? (
                  <button
                    onClick={handleSaveNote}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNote(selectedNote._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6">
              {isEditing ? (
                <textarea
                  value={selectedNote.content}
                  onChange={(e) =>
                    setSelectedNote({
                      ...selectedNote,
                      content: e.target.value,
                    })
                  }
                  className="w-full h-full p-4 text-gray-800 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                  placeholder="Write your note here..."
                />
              ) : (
                <div className="prose max-w-none">
                  {selectedNote.content || (
                    <p className="text-gray-400">No content</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Note Selected
              </h3>
              <p className="text-gray-500 mb-6">
                Select a note from the sidebar or create a new one to get
                started
              </p>
              <button
                onClick={handleNewNote}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteApp;
