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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import UnityLevelEmbed from "@/components/functional/unity-levelcreator";
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
import Link from "next/link";
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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [levelCount, setLevelCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [description, setDescription] = useState("");
  const levelsCollectionRef = collection(db, "levels");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [signInPopup, setsignInPopup] = useState(false);
  const [gameStatus, setGameStatus] = useState("");
  const [requestFullscreen, setRequestFullscreen] = useState(false);
  const [requestScreenshot, setRequestScreenshot] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row bg-cover">
        <Navbar></Navbar>
        <div
          style={backgroundImageStyle}
          className=" flex flex-col lg:flex-row"
        >
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
                <Link href={"/"}>
                  <Button>Back</Button>
                </Link>
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

          {isSmallScreen ? (
            <>
              <div className="mx-5 mb-5">
                <div className="w-full h-full flex flex-col text-black p-5  bg-white rounded-lg">
                  <h2 className="text-2xl text-center  font-bold mb-4">
                    Create New Level!
                  </h2>
                  <div>
                    <p className=" text-lg mb-2">Name:</p>
                    <Input
                      type="text"
                      value={newLevel.name}
                      onChange={(e) =>
                        setNewLevel({ ...newLevel, name: e.target.value })
                      }
                      className=" p-2 rounded mb-4 w-full"
                    />
                  </div>
                  <div>
                    <p className=" text-lg mb-2">Description:</p>
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
                              <SelectItem value="unlimited">
                                Unlimited
                              </SelectItem>
                              <SelectItem value="limited">Limited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        className="flex w-full mt-10"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" mx-5 mb-5">
                <div className="w-full lg:w-[67%]  flex flex-col mr-10">
                  <div>
                    <UnityLevelEmbed
                      onGameStatusChange={(status) => {
                        setGameStatus(status);
                      }}
                      onFullscreen={requestFullscreen}
                      onScreenshot={requestScreenshot}
                    />
                  </div>

                  <div className="flex flex-wrap h-[10%] w-full  justify-center md:justify-between md:mr-5 bg-white bg-opacity-15 p-5 gap-4">
                    <Button
                      onClick={() => {
                        setRequestFullscreen((prevState) => !prevState);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-3"
                      >
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                      Fullscreen
                    </Button>
                    <Button
                      onClick={() => {
                        setRequestScreenshot((prevState) => !prevState);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-3"
                      >
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                      Screenshot
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/4 h-[89vh] mx-5 p-5 bg-white text-black rounded-lg">
                <h2 className="text-2xl text-center  font-bold mb-4">
                  Create New Level!
                </h2>
                <div>
                  <p className=" text-lg mb-2">Name:</p>
                  <Input
                    type="text"
                    value={newLevel.name}
                    onChange={(e) =>
                      setNewLevel({ ...newLevel, name: e.target.value })
                    }
                    className="p-2 rounded mb-4 w-full text-black"
                  />
                </div>
                <div>
                  <p className=" text-lg mb-2">Description:</p>
                  <ReactQuill
                    theme="snow"
                    modules={{ toolbar: toolbarOptions }}
                    value={description}
                    onChange={(value) => setDescription(value)}
                    className="overflow-y-auto max-h-[600px] "
                  />
                  <div className="mt-10">
                    <p className="">Grid size (width x height):</p>
                    <div className="flex gap-3">
                      <div className="w-1/2">
                        <p className=" mt-5">Width:</p>
                        <Input
                          type="number"
                          placeholder="5"
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                        ></Input>
                      </div>
                      <div className="1/2">
                        <p className=" mt-5">Height:</p>
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

                    <Button
                      onClick={handleSubmit}
                      className="flex w-full mt-10"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[67%]  flex flex-col mr-10">
                <div>
                  <UnityLevelEmbed
                    onGameStatusChange={(status) => {
                      setGameStatus(status);
                    }}
                    onFullscreen={requestFullscreen}
                    onScreenshot={requestScreenshot}
                  />
                </div>

                <div className="flex flex-wrap h-[10%] w-full  justify-center md:justify-between md:mr-5 bg-white bg-opacity-15 p-5 gap-4">
                  <Button
                    onClick={() => {
                      setRequestFullscreen((prevState) => !prevState);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    Fullscreen
                  </Button>
                  <Button
                    onClick={() => {
                      setRequestScreenshot((prevState) => !prevState);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    Screenshot
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
