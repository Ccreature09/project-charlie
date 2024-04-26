"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { User as UserData, Level } from "@/interfaces";
import Link from "next/link";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { db, auth } from "@/firebase/firebase";
import { User, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { onAuthStateChanged } from "firebase/auth";
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
  DocumentReference,
  getDoc,
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
import "react-quill/dist/quill.snow.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UnityLevelEmbed from "@/components/functional/unity-levelcreator";
import { Navbar } from "@/components/functional/navbar";
import UserForm from "@/components/functional/signIn";
import Image from "next/image";

const provider = new GoogleAuthProvider();
const toolbarOptions = [
  ["bold", "italic", "underline"],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],

  [{ size: ["small", false, "large", "huge"] }],

  [{ color: [] }, { background: [] }],
  [{ align: [] }],

  ["clean"],
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
    lowercaseName: "",
    description: "",
    difficulty: "",
  };

  const [newLevel, setNewLevel] = useState(initialLevelState);
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(3);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [levelCount, setLevelCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const levelsCollectionRef = collection(db, "levels");
  const [signInPopup, setsignInPopup] = useState(false);
  const [banPopup, setBanPopup] = useState(false);

  const [seed, setSeed] = useState("");
  const [finalSeed, setFinalSeed] = useState("");
  const [requestFullscreen, setRequestFullscreen] = useState(false);
  const [requestDraftSeed, setRequestDraftSeed] = useState("");
  const [requestScreenshot, setRequestScreenshot] = useState(false);
  const [requestHideUI, setRequestHideUI] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [thumbnail, setThumbnail] = useState<string>();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        const userData = {
          uid: user.uid,
          pfp: user.photoURL,
          username: user.displayName || "",
          dateOfRegistration: serverTimestamp(),
          badges: [],
          levels: [],
        };

        await setDoc(userDocRef, userData);
      } else {
      }

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
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as UserData;
          if (userData.draftLevel) {
            setNewLevel(userData.draftLevel);

            if (userData.draftLevel.grid != "") {
              const [width, height] = userData.draftLevel.grid.split("x");
              setWidth(Number(width));
              setHeight(Number(height));
            } else {
              setWidth(3);
              setHeight(3);
            }

            setRequestDraftSeed(userData.draftLevel.seed);
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
      const [finalSeed, draftSeed] = seed.split("~");
      setFinalSeed(finalSeed);
      console.log("final seed: " + finalSeed)
      console.log("draft seed: " + draftSeed)

      setNewLevel((prevNewLevel) => ({
        ...prevNewLevel,
        seed: draftSeed,
        grid: `${width}x${height}`,
      }));
      if (newLevel.seed == draftSeed) {
        saveDraftLevelToFirestore();
      }
    }
  }, [seed, newLevel.seed]);

  useEffect(() => {
    thumbnail && setNewLevel({ ...newLevel, imgURL: thumbnail });
    saveDraftLevelToFirestore();
  }, [thumbnail, newLevel.imgURL]);

  const handleSubmit = async () => {
    try {
      if (
        newLevel.name &&
        newLevel.seed &&
        newLevel.imgURL &&
        newLevel.difficulty
      ) {
        setNewLevel({ ...newLevel, seed: finalSeed });
        console.log("submitting final seed: " + finalSeed)
        console.log("submitting final seed (new level.seed): " + newLevel.seed)

        const newLevelData = {
          ...newLevel,
          lowercaseName: newLevel.name.toLowerCase(),
          seed: finalSeed,
          grid: `${width}x${height}`,
          id: levelCount,
          publishDate: serverTimestamp(),
        };

        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            newLevelData.author = userData.username || user?.displayName || "";
            newLevelData.authorUID = userData.uid || user?.uid || "";
            newLevelData.pfp = userData.pfp || user?.photoURL || "";
          }
          await addDoc(levelsCollectionRef, newLevelData);
        }

        setError("");
        setThumbnail("");
        setWidth(4);
        setWidth(3);
        setHeight(3);
        setSeed("");
        setNewLevel(initialLevelState);
      } else {
        !newLevel.name
          ? setError("Моля въведете име на нивото.")
          : !newLevel.seed
          ? setError("Моля верифицирайте нивото (минете го).")
          : !newLevel.imgURL
          ? setError("Моля направете снимка на нивото.")
          : !newLevel.difficulty &&
            setError("Моля въведете трудност на нивото");
      }
    } catch (error) {
      console.error("Error creating level:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setsignInPopup(false);
        setBanPopup(await checkUserBannedStatus(user.uid));
      } else {
        setUser(null);
        setsignInPopup(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserBannedStatus = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData.isBanned || false;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking user banned status:", error);
      return false; // Return false in case of any error
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const saveDraftLevelToFirestore = async () => {
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
          await setDoc(userDocRef, { draftLevel: newLevel }, { merge: true });
        }
        () => {
          toast({
            title: "Level Saved...",
            description: "",
          });
        };
      }
    } catch (error) {
      console.error("Error saving draft level:", error);
    }
  };

  const resetDraftLevel = async () => {
    try {
      const userQuerySnapshot = await getDocs(collection(db, "users"));

      let currentUserDocumentRef: DocumentReference | undefined;
      let userData: UserData | undefined;

      userQuerySnapshot.forEach((doc) => {
        const userDataFromDoc = doc.data() as UserData;
        if (userDataFromDoc.uid === user?.uid) {
          currentUserDocumentRef = doc.ref;
          userData = userDataFromDoc;
        }
      });

      if (currentUserDocumentRef && userData) {
        const updatedLevels = [...(userData.levels || []), levelCount];

        await updateDoc(currentUserDocumentRef, {
          draftLevel: null,
          levels: updatedLevels,
        });
      }

      setError("");
      setThumbnail("");
      setWidth(3);
      setHeight(3);
      setSeed("");
      setNewLevel(initialLevelState);
    } catch (error) {
      console.error("Error resetting draft level:", error);
    }
  };

  return (
    <>
      <div className="h-screen flex-row bg-cover min-h-[150vh] lg:min-h-screen xl:min-h-screen 2xl:min-h-[110vh] bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar></Navbar>
        <div className=" flex flex-col mt-5 lg:flex-row">
          <AlertDialog open={signInPopup}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Регистрирайте се!</AlertDialogTitle>
                <AlertDialogDescription>
                  Моля регистрирайте се за да създавате нива.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Link href={"/"}>
                  <Button>Назад</Button>
                </Link>
                <Popover>
                  <PopoverTrigger>
                    <Button>Регистриране</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button
                      className="w-full mb-5 bg-green-500 flex text-white "
                      onClick={handleGoogleSignIn}
                    >
                      Вход с Google
                    </Button>
                    <UserForm login mobile={true} />
                    <Separator className="mb-5" />
                    <UserForm login={false} mobile={true} />
                  </PopoverContent>
                </Popover>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={banPopup}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Забранено ви е да създавате нива!
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Изчакайте администратор да ви върне достъпа
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Link href={"/"}>
                  <Button>Назад</Button>
                </Link>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {isSmallScreen ? (
            <>
              <div className="mx-5 mb-5">
                <div className="w-full h-full flex flex-col text-black p-5  bg-white rounded-lg">
                  <h2 className="text-3xl text-center font-bold mb-4">
                    Създай ниво
                  </h2>
                  <Tabs defaultValue="details">
                    <TabsList className="flex mx-auto w-full">
                      <TabsTrigger value="details">Детайли</TabsTrigger>
                      <TabsTrigger value="description">Описание</TabsTrigger>
                      <TabsTrigger value="grid">Грид</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                      <div>
                        <p className=" text-2xl mb-2">Име:</p>
                        <Input
                          onBlur={() => {
                            saveDraftLevelToFirestore();

                            toast({
                              title: "Level Saved...",
                              description: "",
                            });
                          }}
                          placeholder="Моето първо ниво!"
                          type="text"
                          value={newLevel.name}
                          onChange={(e) =>
                            setNewLevel({ ...newLevel, name: e.target.value })
                          }
                          className="p-2 rounded mb-4 w-full text-xl text-black"
                        />
                      </div>
                      <div>
                        <p className=" text-lg mb-2">
                          Снимка: {!newLevel.imgURL && "няма..."}
                        </p>

                        <Image
                          src={newLevel.imgURL}
                          width={500}
                          height={500}
                          alt="Снимка на ниво"
                        />
                      </div>
                      <div>
                        <div className="mt-10">
                          <div className="flex gap-3">
                            <div className="w-full">
                              <p className=" mt-5 mb-2 text-2xl">Трудност:</p>
                              <Select
                                onValueChange={(e) =>
                                  setNewLevel({ ...newLevel, difficulty: e })
                                }
                                value={newLevel.difficulty}
                              >
                                <SelectTrigger
                                  className="text-xl"
                                  onBlur={() => {
                                    saveDraftLevelToFirestore();

                                    toast({
                                      title: "Нивото е запазено!",
                                      description: "",
                                    });
                                  }}
                                >
                                  <SelectValue placeholder="Избери трудност" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Лесно">Лесно</SelectItem>
                                  <SelectItem value="medium">
                                    Нормално
                                  </SelectItem>
                                  <SelectItem value="Трудно">Трудно</SelectItem>
                                  <SelectItem value="Много Трудно">
                                    Много Трудно
                                  </SelectItem>
                                  <SelectItem value="Най-трудно">
                                    Най-трудно
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-red-500 text-center mt-5">{error}</p>

                      <Button
                        onClick={() => {
                          if (
                            newLevel.name &&
                            newLevel.seed &&
                            newLevel.imgURL &&
                            newLevel.difficulty
                          ) {
                            handleSubmit();
                            resetDraftLevel();
                          } else {
                            !newLevel.name
                              ? setError("Моля въведете име на нивото.")
                              : !newLevel.seed
                              ? setError(
                                  "Моля верифицирайте нивото (минете го)."
                                )
                              : !newLevel.imgURL
                              ? setError("Моля направете снимка на нивото.")
                              : !newLevel.difficulty &&
                                setError("Моля въведете трудност на нивото");
                          }
                        }}
                        className=" mx-auto flex w-full mt-2"
                      >
                        Публикувай
                      </Button>
                    </TabsContent>
                    <TabsContent value="description">
                      <p className=" text-2xl mb-2">Описание:</p>
                      <ReactQuill
                        onBlur={() => {
                          saveDraftLevelToFirestore();

                          toast({
                            title: "Нивото е запазено!",
                            description: "",
                          });
                        }}
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
                      <p className="text-black text-center text-3xl my-5 font-semibold">
                        Грид Размер
                      </p>
                      <div className="flex justify-center my-20 gap-3">
                        <div className="w-1/2 flex flex-col items-center my-auto bg-gray-300 py-16 px-4 rounded-2xl">
                          <p className="text-2xl sm:text-5xl font-bold mb-5">
                            Ширичина
                          </p>
                          <Input
                            type="number"
                            className="w-full text-center text-3xl border border-gray-300 rounded-md"
                            placeholder="3"
                            value={width}
                            onChange={(e) =>
                              setWidth(
                                Math.min(
                                  Math.max(Number(e.target.value), 1),
                                  20
                                )
                              )
                            }
                            min={1}
                            max={20}
                          />
                        </div>
                        <p className="flex my-auto text-3xl font-black">x</p>
                        <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-16 px-4 rounded-2xl">
                          <p className="text-2xl sm:text-5xl font-bold mb-5">
                            Височина
                          </p>

                          <Input
                            type="number"
                            className="w-full text-center text-3xl border border-gray-300 rounded-md"
                            placeholder="3"
                            value={height}
                            onChange={(e) =>
                              setHeight(
                                Math.min(
                                  Math.max(Number(e.target.value), 1),
                                  20
                                )
                              )
                            }
                            min={1}
                            max={20}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
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
                      Цял екран
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                      Скрий UI
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
                      Снимай
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

                <Tabs defaultValue="details">
                  <TabsList className="flex mx-auto w-full">
                    <TabsTrigger value="details">Детайли</TabsTrigger>
                    <TabsTrigger value="description">Описание</TabsTrigger>
                    <TabsTrigger value="grid">Грид</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <div>
                      <p className=" text-2xl mb-2">Име:</p>
                      <Input
                        onBlur={() => {
                          saveDraftLevelToFirestore();

                          toast({
                            title: "Нивото е запазено!",
                            description: "",
                          });
                        }}
                        placeholder="Моето първо ниво!"
                        type="text"
                        value={newLevel.name}
                        onChange={(e) =>
                          setNewLevel({ ...newLevel, name: e.target.value })
                        }
                        className="p-2 rounded mb-4 w-full text-black"
                      />
                    </div>
                    <div>
                      <p className=" text-2xl mb-2">
                        Снимка: {!newLevel.imgURL && "няма..."}
                      </p>
                      {newLevel.imgURL ? (
                        <Image
                          src={newLevel.imgURL}
                          width={500}
                          height={500}
                          alt="Снимка на ниво"
                        />
                      ) : (
                        <Skeleton className="w-full h-[225px] " />
                      )}
                    </div>
                    <div>
                      <div className="mt-10">
                        <div className="flex gap-3">
                          <div className="w-full">
                            <p className=" mt-5 mb-2 text-2xl">Трудност:</p>
                            <Select
                              onValueChange={(e) =>
                                setNewLevel({ ...newLevel, difficulty: e })
                              }
                              value={newLevel.difficulty}
                            >
                              <SelectTrigger
                                className="text-xl"
                                onBlur={() => {
                                  saveDraftLevelToFirestore();

                                  toast({
                                    title: "Нивото е запазено!",
                                    description: "",
                                  });
                                }}
                              >
                                <SelectValue placeholder="Избери трудност" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Лесно">Лесно</SelectItem>
                                <SelectItem value="Нормално">
                                  Нормално
                                </SelectItem>
                                <SelectItem value="Трудно">Трудно</SelectItem>
                                <SelectItem value="Много трудно">
                                  Много трудно
                                </SelectItem>
                                <SelectItem value="Най-трудно">
                                  Най-трудно
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-red-500 text-center mt-5">{error}</p>

                    <Button
                      onClick={() => {
                        if (
                          newLevel.name &&
                          newLevel.seed &&
                          newLevel.imgURL &&
                          newLevel.difficulty
                        ) {
                          handleSubmit();
                          resetDraftLevel();
                        } else {
                          !newLevel.name
                            ? setError("Моля въведете име на нивото.")
                            : !newLevel.seed
                            ? setError("Моля верифицирайте нивото (минете го).")
                            : !newLevel.imgURL
                            ? setError("Моля направете снимка на нивото.")
                            : !newLevel.difficulty &&
                              setError("Моля въведете трудност на нивото");
                        }
                      }}
                      className=" mx-auto flex w-full mt-2"
                    >
                      Публикувай
                    </Button>
                  </TabsContent>
                  <TabsContent value="description">
                    <p className=" text-2xl mb-2">Описание:</p>
                    <ReactQuill
                      onBlur={() => {
                        saveDraftLevelToFirestore();

                        toast({
                          title: "Нивото е запазено!",
                          description: "",
                        });
                      }}
                      theme="snow"
                      modules={{ toolbar: toolbarOptions }}
                      value={newLevel.description}
                      onChange={(value) =>
                        setNewLevel({ ...newLevel, description: value })
                      }
                      className="overflow-y-auto max-h-[500px]"
                    />
                  </TabsContent>
                  <TabsContent value="grid">
                    <p className="text-black text-center text-3xl my-5 font-semibold">
                      Грид Размер
                    </p>
                    <div className="flex justify-center my-20 gap-3">
                      <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-8 xl:py-16 xl:px-4 px-2 rounded-2xl">
                        <p className="text-xl 2xl:text-3xl font-bold mb-5">
                          Ширина
                        </p>
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
                      <div className="w-1/2 flex flex-col items-center bg-gray-300 my-auto py-8 xl:py-16 xl:px-4 px-2 rounded-2xl">
                        <p className="text-xl 2xl:text-3xl font-bold mb-5">
                          Височина
                        </p>

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
                    Цял екран
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    Скрий UI
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
                    Снимай
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
