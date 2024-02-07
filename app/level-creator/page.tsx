"use client";
import dynamic from "next/dynamic";
import { db, auth } from "@/firebase/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  onSnapshot,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { User, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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
import UserForm from "@/components/functional/signIn";
import { Separator } from "@/components/ui/separator";
const provider = new GoogleAuthProvider();
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
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [levelCount, setLevelCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [description, setDescription] = useState("");
  const levelsCollectionRef = collection(db, "levels");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [signInPopup, setsignInPopup] = useState(false);
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already exists in the "users" collection
      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = await query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        // User does not exist, create a new user document
        const userData = {
          uid: user.uid,
          pfp: user.photoURL,
          username: user.displayName || "", // You can adjust this as needed
          dateOfRegistration: serverTimestamp(),
          badges: [], // Initialize with an empty array
          levels: [], // Initialize with an empty array
        };

        // Add the new user document to the "users" collection
        await setDoc(userDocRef, userData);
        console.log("New user created:", userData);
      } else {
        console.log("User already exists:");
      }

      // Set the user state
      setUser(user);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };
  const handleLogin = () => {
    // You can implement your own authentication flow here.
    // Redirect the user to the login page or use Firebase authentication methods.
    // For simplicity, I'm just toggling the dialog state.
    setIsLoginDialogOpen(!isLoginDialogOpen);
  };

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
      // Add the new level document to the "levels" collection
      await addDoc(levelsCollectionRef, {
        ...newLevel,
        grid: `${width}x${height}`,
        id: levelCount,
        description: description,
        author: user?.displayName,
        authorUID: user?.uid,
        pfp: user?.photoURL,
        publishDate: serverTimestamp(),
      });

      // Query the users collection for the level's author UID
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user?.uid)
      );

      const userQuerySnapshot = await getDocs(userQuery);

      if (!userQuerySnapshot.empty) {
        const userDoc = userQuerySnapshot.docs[0];

        // Update the levels array in the user document
        const userData = userDoc.data();
        const updatedLevels = [...userData.levels, levelCount];

        await setDoc(userDoc.ref, { levels: updatedLevels }, { merge: true });
      }
    } catch (error) {
      console.error("Error creating level:", error);
    } finally {
      setDescription("");
      setWidth(0);
      setHeight(0);
      setNewLevel(initialLevelState);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setsignInPopup(false);
      } else {
        setUser(null);
        setsignInPopup(true);
      }
    });
  }, []);

  return (
    <>
      <div style={backgroundImageStyle} className="h-full flex-row">
        <Navbar />

        <div className="flex bg-[#121212] relative min-h-screen">
          <AlertDialog open={signInPopup}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Регистрирайте се за да създавате нива!
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Popover>
                  <PopoverTrigger>
                    <Button>Continue</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button
                      className="w-full mb-5"
                      onClick={handleGoogleSignIn}
                    >
                      Вход с Google
                    </Button>
                    <UserForm login />
                    <Separator className="mb-5" />
                    <UserForm login={false} />
                  </PopoverContent>
                </Popover>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <p className="text-white mt-5">Width:</p>
                    <Input
                      type="number"
                      placeholder="5"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="text-black"
                    ></Input>
                  </div>
                  <div className="1/2">
                    <p className="text-white mt-5">Height:</p>
                    <Input
                      type="number"
                      placeholder="5"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="text-black"
                    ></Input>
                  </div>
                </div>
                <p className="text-white mt-3">
                  Grid Size: {width} x {height}
                </p>
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <p className="text-white mt-5">Difficulty:</p>
                    <Select
                      onValueChange={(e) =>
                        setNewLevel({ ...newLevel, difficulty: e })
                      }
                      value={newLevel.difficulty}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="w-1/2">
                    <p className="text-white mt-5">Blocks:</p>

                    <Select
                      onValueChange={(e) =>
                        setNewLevel({
                          ...newLevel,
                          unlimited: e == "unlimited" ? true : false,
                        })
                      }
                      value={newLevel.unlimited ? "unlimited" : "limited"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Blocks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
