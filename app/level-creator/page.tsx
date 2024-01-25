"use client";
import dynamic from "next/dynamic";
import { db, auth } from "@/firebase/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};
import { User } from "firebase/auth";

import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { onAuthStateChanged } from "firebase/auth";

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
    likes: 0,
    seed: "",
    author: "",
    authorUID: "",
    pfp: "",
    tags: [],
    imgURL: "",
    publishDate: serverTimestamp(),
    grid: "",
    name: "",
    description: "",
    difficulty: "",
    unlimited: false,
  };

  const [newLevel, setNewLevel] = useState(initialLevelState);
  const [levelCount, setLevelCount] = useState(0);
  const [user, setUser] = useState<User | null>();
  const [description, setDescription] = useState("");
  const levelsCollectionRef = collection(db, "levels");

  const fetchLevelCount = async () => {
    const snapshot = await getDocs(levelsCollectionRef);
    setLevelCount(snapshot.size);
  };

  const updateLevelCountOnSnapshot = () => {
    const unsubscribe = onSnapshot(levelsCollectionRef, (snapshot) => {
      setLevelCount(snapshot.size);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribeSnapshot = updateLevelCountOnSnapshot();
    fetchLevelCount();

    return () => {
      unsubscribeSnapshot();
    };
  }, []);

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(levelsCollectionRef, {
        ...newLevel,
        id: levelCount,
        description: description,
        author: user?.displayName,
        authorUID: user?.uid,
        pfp: user?.photoURL,
        publishDate: serverTimestamp(),
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error creating level:", error);
    } finally {
      setDescription("");
      setNewLevel(initialLevelState);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <>
      <div style={backgroundImageStyle} className="h-full flex-row">
        <Navbar />
        <div className="flex bg-[#121212] min-h-screen">
          {/* Left Sidebar */}
          <div className="bg-gray-800 w-1/4 p-6">
            <h2 className="text-2xl text-white font-semibold mb-4">
              Create New Level!
            </h2>
            <div>
              <p className="text-white text-lg mb-2">Name:</p>
              <Input
                type="text"
                value={newLevel.name}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, name: e.target.value })
                }
                className="bg-gray-700 text-white p-2 rounded mb-4 w-full"
              />
            </div>
            <div>
              <p className="text-white text-lg mb-2">Description:</p>
              <ReactQuill
                theme="snow"
                modules={{ toolbar: toolbarOptions }}
                value={description}
                onChange={(value) => setDescription(value)}
                className="overflow-y-auto max-h-[600px] text-white"
              />
              <div className="mt-10">
                <p className="text-white">Grid size (width x height):</p>
                <Input
                  placeholder="5x5"
                  value={newLevel.grid}
                  onChange={(e) =>
                    setNewLevel({ ...newLevel, grid: e.target.value })
                  }
                  className="text-black"
                ></Input>
                <p className="text-white mt-5">Difficulty:</p>

                <Select
                  onValueChange={(e) =>
                    setNewLevel({ ...newLevel, difficulty: e })
                  }
                  value={newLevel.difficulty}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="insane">Insane</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSubmit} className="flex w-full mt-10">
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-3/4 bg-[#121212] p-8">{/* Unity */}</div>
        </div>
      </div>
    </>
  );
}
