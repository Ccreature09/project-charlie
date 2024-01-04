"use client";
import { db } from "@/firebase/firebase";
import { addDoc, collection } from "firebase/firestore";
import React, { useState, ChangeEvent } from "react";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

const toolbarOptions = [
  ["bold", "italic", "underline"], // toggled buttons
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ align: [] }],

  ["clean"], // remove formatting button
];

export default function Page() {
  const initialLevelState: Level = {
    id: 0,
    grid: "",
    name: "",
    description: "",
    difficulty: "",
    unlimited: false,
  };

  const [newLevel, setNewLevel] = useState(initialLevelState);
  const [content, setContent] = useState("");

  const handleCreateClick = async () => {
    // Create level data in Firestore or use your logic
    const levelsCollectionRef = collection(db, "levels");

    try {
      const docRef = await addDoc(levelsCollectionRef, {
        grid: newLevel.grid,
        name: newLevel.name,
        description: newLevel.description,
        difficulty: newLevel.difficulty,
        unlimited: newLevel.unlimited,
        // Add more fields as needed
      });

      setNewLevel(initialLevelState);

      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error creating level:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-[#121212] text-white min-h-screen">
        {/* Left Sidebar */}
        <div className="bg-gray-800 w-1/4 p-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Level!</h2>
          <div>
            <p className="text-white text-lg mb-2">Name:</p>
            <input
              type="text"
              value={newLevel.name}
              onChange={(e) =>
                setNewLevel({ ...newLevel, name: e.target.value })
              }
              className="bg-gray-700 p-2 rounded mb-4 w-full"
            />
          </div>
          <div>
            <p className="text-white text-lg mb-2">Description:</p>
            <ReactQuill
              theme="snow" // You can choose different themes like 'bubble' or 'snow'
              modules={{ toolbar: toolbarOptions }}
              value={content}
              onChange={setContent}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4 bg-[#121212] p-8">{/* Unity */}</div>
      </div>
    </>
  );
}
