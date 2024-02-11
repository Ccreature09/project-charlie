"use client";
import { db, auth } from "@/firebase/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { User as UserData, Level } from "@/interfaces";
import { User } from "firebase/auth";
import { Navbar } from "@/components/functional/navbar";
import UnityLevelEmbed from "@/components/functional/unity-level";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
};

export default function Page({ params }: { params: { id: string } }) {
  const [slug, setSlug] = useState(params.id);
  const [level, setLevel] = useState<Level>();
  const [user, setUser] = useState<User | null>();
  const [userData, setUserData] = useState<UserData>();
  const [packLevels, setPackLevels] = useState<number[]>([]);
  const [packName, setPackName] = useState("");
  const [gameStatus, setGameStatus] = useState("");
  const [previousLevelId, setPreviousLevelId] = useState<number>();
  const [likes, setLikes] = useState<number>();
  const [isLiked, setIsLiked] = useState<boolean>();
  const [nextLevelId, setNextLevelId] = useState<number>();
  const [requestFullscreen, setRequestFullscreen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    if (gameStatus === "Victory") {
      const updateCompletedLevels = async () => {
        try {
          if (user?.uid) {
            const userQuery = query(
              collection(db, "users"),
              where("uid", "==", user.uid)
            );
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data() as UserData;
              const completedLevels = userData.completedLevels || []; // Get the current completedLevels array
              const updatedCompletedLevels = [...completedLevels, Number(slug)]; // Update completedLevels array (example: add a new level)

              const userDocRef = doc(db, "users", userSnapshot.docs[0].id);

              await updateDoc(userDocRef, {
                completedLevels: updatedCompletedLevels,
              });
            }
          }
        } catch (error) {
          console.error("Error updating completedLevels:", error);
        }
      };
      updateCompletedLevels();
    }
  }, [gameStatus, user]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (slug) {
        const searchQuery = Number(decodeURIComponent(slug));
        const packQuery = collection(db, "packs");
        const q = query(
          collection(db, "levels"),
          where("id", "==", searchQuery)
        );
        if (user?.uid) {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", user?.uid)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data() as UserData;
            setUserData(userData);
          }
        }
        const packSnapshot = await getDocs(packQuery);
        const packLevelsArray: number[] = [];
        packSnapshot.forEach((doc) => {
          const packData = doc.data();
          if (packData.levelIds.includes(searchQuery)) {
            packLevelsArray.push(...packData.levelIds);
            setPackName(packData.name);
          }
        });

        setPackLevels(packLevelsArray);
        if (level) {
          const currentIndex = packLevelsArray.indexOf(level?.id);
          if (currentIndex !== -1 && currentIndex < packLevels.length - 1) {
            const nextIndex = currentIndex + 1;
            setNextLevelId(packLevels[nextIndex]);
          } else {
            setNextLevelId(-1);
          }
          if (currentIndex !== -1 && currentIndex > 0) {
            const previousIndex = currentIndex - 1;
            setPreviousLevelId(packLevels[previousIndex]);
          } else {
            setPreviousLevelId(-1);
          }
        }
        if (level == undefined) {
          try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const levelDoc = querySnapshot.docs[0];

              const levelData = levelDoc.data() as Level;
              setLevel(levelData);
            } else {
              console.error("Product not found");
            }
          } catch (error) {
            console.error("Error fetching product data:", error);
          }
        }
      }
    };

    fetchProductData();
  }, [slug, user?.uid, level]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        if (!level || !user) {
          console.error("Level or user is undefined.");
          return;
        }

        // Fetch the user document
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();

          // Check if the user has liked the current level
          const likedLevels = userData.likedLevels || [];
          const isLiked = likedLevels.includes(level.id);
          setIsLiked(isLiked);
        }
        if (level) {
          // Fetch the level document
          const levelQuery = query(
            collection(db, "levels"),
            where("id", "==", level.id)
          );
          const levelSnapshot = await getDocs(levelQuery);

          if (!levelSnapshot.empty) {
            const levelDoc = levelSnapshot.docs[0];
            const levelData = levelDoc.data();

            // Set the likes count
            const currentLikes = levelData.likes || 0;
            setLikes(currentLikes);
          } else {
            console.error("Level document not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [level]);

  const handleLikeClick = async () => {
    try {
      if (!level || !user) {
        console.error("Level or user is undefined.");
        return;
      }

      // Fetch the user document
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Check if the user has liked the current level
        const likedLevels = userData.likedLevels || [];
        const isLiked = likedLevels.includes(level.id);
        setIsLiked(isLiked);

        // Update the likes count
        const levelQuery = query(
          collection(db, "levels"),
          where("id", "==", level.id)
        );
        const levelSnapshot = await getDocs(levelQuery);
        if (!levelSnapshot.empty) {
          const levelDoc = levelSnapshot.docs[0];
          const levelData = levelDoc.data();
          const currentLikes = levelData.likes || 0;
          const updatedLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
          setLikes(updatedLikes);

          // Update the level document with the new likes count
          await updateDoc(levelDoc.ref, { likes: updatedLikes });

          // Update the likedLevels array in the user document
          const updatedLikedLevels = isLiked
            ? likedLevels.filter((id: number) => id !== level.id)
            : [...likedLevels, level.id];
          setIsLiked(!isLiked);

          await updateDoc(userDoc.ref, { likedLevels: updatedLikedLevels });

          console.log("Likes updated successfully!");
        } else {
          console.error("Level document not found.");
        }
      } else {
        console.error("User document not found.");
      }
    } catch (error) {
      console.error("Error handling like click:", error);
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

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row bg-cover">
        <Navbar></Navbar>
        <div style={backgroundImageStyle} className="flex flex-col lg:flex-row">
          {isSmallScreen ? (
            <>
              <div className="mx-5 mb-5">
                <div className="w-full h-full flex flex-col p-5  bg-white rounded-lg">
                  <p className="text-4xl font-bold text-center mt-5 ">
                    {level?.name}
                  </p>
                  <p className="text-2xl font-semibold text-center">
                    <span className="text-gray-700">От</span> {level?.author}
                  </p>
                  <div className="mx-10 my-3 flex">
                    {(level &&
                      userData &&
                      userData?.completedLevels.includes(level?.id)) ||
                    gameStatus == "Victory" ? (
                      <Badge className="text-center mx-auto px-10 hover:bg-green-700 bg-green-500">
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="text-center mx-auto px-10 hover:bg-red-700 bg-red-500">
                        Incomplete
                      </Badge>
                    )}
                  </div>

                  <p>{gameStatus}</p>
                  <div className="p-5 font-medium ">
                    <ReactQuill
                      readOnly
                      value={level?.description}
                      theme={"snow"}
                      className=" max-h-[775px] overflow-y-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="mx-5 mb-5">
                <div className="w-full lg:w-[67%]  flex flex-col mr-10">
                  <div>
                    {level && (
                      <UnityLevelEmbed
                        level={level}
                        onGameStatusChange={(status) => {
                          setGameStatus(status);
                        }}
                        onFullscreen={requestFullscreen}
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap h-[10%] w-full  justify-center md:justify-between md:mr-5 bg-white bg-opacity-15 p-5 gap-4">
                    <Link
                      href={`/${
                        previousLevelId == -1 ? "level-packs" : "level"
                      }/${previousLevelId == -1 ? packName : previousLevelId}`}
                    >
                      <Button>
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 8 8 12 12 16"></polyline>
                          <line x1="16" y1="12" x2="8" y2="12"></line>
                        </svg>
                        Previous level
                      </Button>
                    </Link>

                    <Button
                      className={`${
                        isLiked
                          ? "hover:bg-red-500 bg-green-500 "
                          : "hover:bg-green-500 "
                      }`}
                      onClick={() => {
                        handleLikeClick();
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
                        className="flex mr-3"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      <span
                        className={`flex my-auto mx-3${
                          isLiked ? "block" : "hidden"
                        }`}
                      >
                        {isLiked ? "Liked" : "Like"} ({likes})
                      </span>
                    </Button>
                    <Button
                      onClick={() => {
                        // Toggle the fullscreen state
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
                    <Link
                      href={`/${nextLevelId == -1 ? "level-packs" : "level"}/${
                        nextLevelId == -1 ? packName : nextLevelId
                      }`}
                    >
                      <Button>
                        Next level
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
                          className="ml-3"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 16 16 12 12 8"></polyline>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/4 h-[89vh] mx-5 bg-white rounded-lg">
                <p className="text-4xl font-bold text-center mt-5 ">
                  {level?.name}
                </p>
                <p className="text-2xl font-semibold text-center">
                  <span className="text-gray-700">От</span> {level?.author}
                </p>
                <div className="mx-10 my-3 flex">
                  {(level &&
                    userData &&
                    userData?.completedLevels.includes(level?.id)) ||
                  gameStatus == "Victory" ? (
                    <Badge className="text-center mx-auto px-10 hover:bg-green-700 bg-green-500">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="text-center mx-auto px-10 hover:bg-red-700 bg-red-500">
                      Incomplete
                    </Badge>
                  )}
                </div>

                <p>{gameStatus}</p>
                <div className="p-5 font-medium ">
                  <ReactQuill
                    readOnly
                    value={level?.description}
                    theme={"snow"}
                    className=" max-h-[775px] overflow-y-auto"
                  />
                </div>
              </div>
              <div className="w-full lg:w-[67%] max-h-[89vh] flex flex-col mr-10">
                <div>
                  {level && (
                    <UnityLevelEmbed
                      level={level}
                      onGameStatusChange={(status) => {
                        setGameStatus(status);
                      }}
                      onFullscreen={requestFullscreen}
                    />
                  )}
                </div>

                <div className="flex flex-wrap h-[10%] w-full  justify-center md:justify-between md:mr-5 bg-white bg-opacity-15 p-5 gap-4">
                  <Link
                    href={`/${
                      previousLevelId == -1 ? "level-packs" : "level"
                    }/${previousLevelId == -1 ? packName : previousLevelId}`}
                  >
                    <Button>
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 8 8 12 12 16"></polyline>
                        <line x1="16" y1="12" x2="8" y2="12"></line>
                      </svg>
                      Previous level
                    </Button>
                  </Link>

                  <Button
                    className={`${
                      isLiked
                        ? "hover:bg-red-500 bg-green-500 "
                        : "hover:bg-green-500 "
                    }`}
                    onClick={() => {
                      handleLikeClick();
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
                      className="flex mr-3"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span
                      className={`flex my-auto mx-3${
                        isLiked ? "block" : "hidden"
                      }`}
                    >
                      {isLiked ? "Liked" : "Like"} ({likes})
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      // Toggle the fullscreen state
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
                  <Link
                    href={`/${nextLevelId == -1 ? "level-packs" : "level"}/${
                      nextLevelId == -1 ? packName : nextLevelId
                    }`}
                  >
                    <Button>
                      Next level
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
                        className="ml-3"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 16 16 12 12 8"></polyline>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
