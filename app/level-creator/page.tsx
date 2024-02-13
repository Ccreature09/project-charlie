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
  updateDoc,
  deleteField
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
import { User as UserData, Level } from "@/interfaces";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(3);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [levelCount, setLevelCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>();
  const levelsCollectionRef = collection(db, "levels");
  const [signInPopup, setsignInPopup] = useState(false);
  const [seed, setSeed] = useState("");
  const [requestFullscreen, setRequestFullscreen] = useState(false);
  const [requestDraftSeed, setRequestDraftSeed] = useState("");
  const [requestScreenshot, setRequestScreenshot] = useState(false);
  const [requestHideUI, setRequestHideUI] = useState(false);
  const [error, setError] = useState("");

  const [thumbnail, setThumbnail] = useState<string>();

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
          username: user.displayName || "",
          dateOfRegistration: serverTimestamp(),
          badges: [],
          levels: [],
        };

        // Add the new user document to the "users" collection
        await setDoc(userDocRef, userData);
      } else {
      }

      // Set the user state
      setUser(user);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(levelsCollectionRef);
      setLevelCount(snapshot.size);
  
      if (user?.uid) {
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", user?.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        console.log("SNAPSHOT: "+!userSnapshot.empty);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as UserData;
          setUserData(userData);
          console.log("SNAPSHOT USERDATA: "+userData)
          if (userData.draftLevel) {
            console.log("SETTING NEWLEVEL TO DRAFTLEVEL")
            setNewLevel(userData.draftLevel);
            console.log("REQUESTING: "+ userData.draftLevel.seed)
            setRequestDraftSeed(userData.draftLevel.seed)
          }
        }
      }
    };
  
    const unsubscribeSnapshot = updateLevelCountOnSnapshot();
    fetchData();
  
    return () => {
      unsubscribeSnapshot();
    };
  }, [user?.uid]);
  

  const updateLevelCountOnSnapshot = () => {
    const unsubscribe = onSnapshot(levelsCollectionRef, (snapshot) => {
      setLevelCount(snapshot.size);
    });

    return unsubscribe;
  };
    useEffect(() => {
      if (seed) {
        setNewLevel({...newLevel, seed: seed})
        if (newLevel.seed == seed) {
       saveDraftLevelToFirestore("seed update");
        }
      }
     
      
    }, [newLevel.seed, seed])

    useEffect(() => {
      thumbnail && setNewLevel({...newLevel, imgURL: thumbnail})
     saveDraftLevelToFirestore("thumbnail");
    }, [thumbnail, newLevel.imgURL])
    

    const handleSubmit = async () => {
      try {
        if (newLevel.name && newLevel.seed && newLevel.imgURL && newLevel.difficulty) {
          console.log("Adding level...");
    
          await addDoc(levelsCollectionRef, {
            ...newLevel,
            seed: seed,
            likes: 0,
            grid: `${width}x${height}`,
            id: levelCount,
            author: user?.displayName,
            authorUID: user?.uid,
            pfp: user?.photoURL,
            publishDate: serverTimestamp(),
          });
    
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", user?.uid)
          );
    
          const userQuerySnapshot = await getDocs(userQuery);
    
          if (!userQuerySnapshot.empty) {
            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
    
            // Ensure userData.levels is always an array
            const updatedLevels = Array.isArray(userData.levels) ? [...userData.levels, levelCount] : [levelCount];

            setError("");
            setThumbnail("");
            setWidth(3);
            setHeight(3);
            setSeed("");
            setNewLevel(initialLevelState);


            console.log("Deleting draft...");
            await setDoc(userDoc.ref, { 
              levels: updatedLevels, 
            }, { merge: true });

            await updateDoc(userDoc.ref, {
              draftLevel: deleteField()
          }, );
          }
          
        } else {
          console.log("Invalid Data");
          setError("Invalid Data");
        }
      } catch (error) {
        console.error("Error creating level:", error);
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

  
  const saveDraftLevelToFirestore = async (from: string) => {
    console.log("SAVING DATE TO FB from " + from)
    console.log(newLevel);
    try {
      if (user?.uid) {
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(userQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userDocRef = doc(db, "users", userDoc.id);
          console.log("SUBMITING "+ newLevel.seed)
          await setDoc(userDocRef, { draftLevel: newLevel }, { merge: true });

        }
      }
    } catch (error) {
      console.error("Error saving draft level:", error);
    }
  };

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row bg-cover">
        <Navbar></Navbar>
        <div
          style={backgroundImageStyle}
          className=" flex flex-col mt-5 lg:flex-row"
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
                <h2 className="text-2xl text-center font-bold mb-4">
                  Създай ниво
                </h2>
                <Tabs defaultValue="details">
                  <TabsList className="flex mx-auto w-full">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <div>
                      <p className=" text-lg mb-2">Name:</p>
                      <Input
                      onBlur={()=> saveDraftLevelToFirestore("blur name")}

                        type="text"
                        value={newLevel.name}
                        onChange={(e) =>
                          setNewLevel({ ...newLevel, name: e.target.value })
                        }
                        className="p-2 rounded mb-4 w-full text-black"
                      />
                    </div>
                    <div>
                      <p className=" text-lg mb-2">
                        Thumbnail: {!newLevel.imgURL && "none..."}
                      </p>

                      <img src={newLevel.imgURL} alt="" />
                    </div>
                    <div>
                      <div className="mt-10">
                        <div className="flex gap-3">
                          <div className="w-1/2">
                            <p className=" mt-5">Difficulty:</p>
                            <Select
                              onValueChange={(e) =>
                                setNewLevel({ ...newLevel, difficulty: e })
                              }
                              value={newLevel.difficulty}
                            >
                              <SelectTrigger
                      onBlur={()=> saveDraftLevelToFirestore("blur difficulty")}
                      >
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
                            <p className=" mt-5">Blocks:</p>

                            <Select
                            
                              onValueChange={(e) =>
                                setNewLevel({
                                  ...newLevel,
                                  unlimited: e == "unlimited" ? true : false,
                                })
                              }
                              value={
                                newLevel.unlimited ? "unlimited" : "limited"
                              }
                            >
                              <SelectTrigger
                      onBlur={()=> saveDraftLevelToFirestore("blur unlim")}

                              >
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
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="description">
                    <p className=" text-lg mb-2">Description:</p>
                    <ReactQuill
                      onBlur={()=> saveDraftLevelToFirestore("blur desc")}

                      theme="snow"
                      modules={{ toolbar: toolbarOptions }}
                      value={newLevel.description}
                      onChange={(value) =>
                        setNewLevel({ ...newLevel, description: value })
                      }
                      className="overflow-y-auto max-h-[500px] "
                    />
                  </TabsContent>
                  <TabsContent value="grid">
                    <p className="text-black text-center text-5xl my-5 font-semibold">
                      Grid size
                    </p>
                    <div className="flex justify-center my-20 gap-3">
                      <div className="w-1/2 flex flex-col items-center my-auto bg-gray-300 py-16 px-4 rounded-2xl">
                        <p className="text-2xl sm:text-5xl font-bold mb-5">Width</p>
                        <Input

                          type="number"
                          className="w-full text-center text-3xl border border-gray-300 rounded-md"
                          placeholder="3"
                          value={width}
                          onChange={(e) =>
                            setWidth(
                              Math.min(Math.max(Number(e.target.value), 1), 20)
                            )
                          }
                          min={1}
                          max={20}
                        />
                      </div>
                      <p className="flex my-auto text-3xl font-black">x</p>
                      <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-16 px-4 rounded-2xl">
                        <p className="text-2xl sm:text-5xl font-bold mb-5">Height</p>

                        <Input

                          type="number"
                          className="w-full text-center text-3xl border border-gray-300 rounded-md"
                          placeholder="3"
                          value={height}
                          onChange={(e) =>
                            setHeight(
                              Math.min(Math.max(Number(e.target.value), 1), 20)
                            )
                          }
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <p className="text-red-500">{error}</p>

                <Button
                  onClick={handleSubmit}
                  className="absolute bottom-5 mx-auto flex  w-[90%] mt-10"
                >
                  Submit
                </Button>
                    
                 
                </div>
              </div>
              <div className=" mx-5 mb-5">
                <div className="w-full lg:w-[67%]  flex flex-col mr-10">
                  <div>
                    <UnityLevelEmbed
                      onFetchSeed={(status) => {
                        setSeed(status);
                      }}
                      onFullscreen={requestFullscreen}
                      onDraftSeed={requestDraftSeed}
                      onScreenshot={requestScreenshot}
                      onHideUI={requestHideUI}
                      onFetchScreenshot={(image) => {
                        setThumbnail(image);
                      }}
                      onGridSize={`Instantiate:${width},${height}`}
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
                        setRequestHideUI((prevState) => !prevState);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="mr-3"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      Hide UI
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
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="mr-3"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      Screenshot
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/4 h-[89vh] mx-5 p-5 relative bg-white text-black rounded-lg">
                <h2 className="text-2xl text-center font-bold mb-4">
                  Създай ниво
                </h2>
                <Button onClick={()=>{console.log(newLevel)}}>TEST</Button>
                <Tabs defaultValue="details">
                  <TabsList className="flex mx-auto w-full">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <div>
                      <p className=" text-lg mb-2">Name:</p>
                      <Input
                      onBlur={()=> saveDraftLevelToFirestore("blur name2")}

                        type="text"
                        value={newLevel.name}
                        onChange={(e) =>
                          setNewLevel({ ...newLevel, name: e.target.value })
                        }
                        className="p-2 rounded mb-4 w-full text-black"
                      />
                    </div>
                    <div>
                      <p className=" text-lg mb-2">
                        Thumbnail: {!newLevel.imgURL && "none..."}
                      </p>

                      <img src={newLevel.imgURL} alt="" />
                    </div>
                    <div>
                      <div className="mt-10">
                        <div className="flex gap-3">
                          <div className="w-1/2">
                            <p className=" mt-5">Difficulty:</p>
                            <Select
                              onValueChange={(e) =>
                                setNewLevel({ ...newLevel, difficulty: e })
                              }
                              value={newLevel.difficulty}
                            >
                              <SelectTrigger
                      onBlur={()=> saveDraftLevelToFirestore("blur diff 2")}
                      >
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
                            <p className=" mt-5">Blocks:</p>

                            <Select
                            
                              onValueChange={(e) =>
                                setNewLevel({
                                  ...newLevel,
                                  unlimited: e == "unlimited" ? true : false,
                                })
                              }
                              value={
                                newLevel.unlimited ? "unlimited" : "limited"
                              }
                            >
                              <SelectTrigger
                      onBlur={()=> saveDraftLevelToFirestore("blurr unl 2")}

                              >
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
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="description">
                    <p className=" text-lg mb-2">Description:</p>
                    <ReactQuill
                      onBlur={()=> saveDraftLevelToFirestore("blur desc 2")}

                      theme="snow"
                      modules={{ toolbar: toolbarOptions }}
                      value={newLevel.description}
                      onChange={(value) =>
                        setNewLevel({ ...newLevel, description: value })
                      }
                      className="overflow-y-auto max-h-[500px] "
                    />
                  </TabsContent>
                  <TabsContent value="grid">
                    <p className="text-black text-center text-5xl my-5 font-semibold">
                      Grid size
                    </p>
                    <div className="flex justify-center my-20 gap-3">
                      <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-16 px-4 rounded-2xl">
                        <p className="text-2xl 2xl:text-5xl font-bold mb-5">Width</p>
                        <Input

                          type="number"
                          className="w-full text-center text-3xl border border-gray-300 rounded-md"
                          placeholder="3"
                          value={width}
                          onChange={(e) =>
                            setWidth(
                              Math.min(Math.max(Number(e.target.value), 1), 20)
                            )
                          }
                          min={1}
                          max={20}
                        />
                      </div>
                      <p className="flex my-auto text-3xl font-black">x</p>
                      <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-16 px-4 rounded-2xl">
                        <p className="text-2xl 2xl:text-5xl font-bold mb-5">Height</p>

                        <Input

                          type="number"
                          className="w-full text-center text-3xl border border-gray-300 rounded-md"
                          placeholder="3"
                          value={height}
                          onChange={(e) =>
                            setHeight(
                              Math.min(Math.max(Number(e.target.value), 1), 20)
                            )
                          }
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="absolute bottom-5 mx-auto  w-[90%] mt-10 ">
                <p className="text-red-500 text-center mb-3">{error}</p>

<Button
  onClick={handleSubmit}
  className="w-full  "
>
  Submit
</Button>
                </div>
               
              </div>
              <div className="w-full lg:w-[67%]  flex flex-col mr-10">
                <div>
                  <UnityLevelEmbed
                    onFetchSeed={(status) => {
                      setSeed(status);
                    }}
                    onFetchScreenshot={(image) => {
                      setThumbnail(image);
                    }}
                    onFullscreen={requestFullscreen}
                    onDraftSeed={requestDraftSeed}
                    onScreenshot={requestScreenshot}
                    onHideUI={requestHideUI}
                    onGridSize={`Instantiate:${width},${height}`}
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
                      setRequestHideUI((prevState) => !prevState);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="mr-3"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Hide UI
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="mr-3"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
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
