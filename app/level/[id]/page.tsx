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
  const [nextLevelId, setNextLevelId] = useState<number>();
  const [requestFullscreen, setRequestFullscreen] = useState(false);
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

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row">
        <Navbar></Navbar>
        <div className="mt-5 flex">
          <div className="w-1/4 h-[89vh] mx-5   bg-white rounded-lg">
            <p className="text-4xl font-bold text-center mt-5 ">
              {level?.name}
            </p>
            <p className="text-2xl font-semibold text-center  ">
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
          <div className="flex flex-col">
            <div className=" h-5/6 flex m-auto max-h-[850px]  ">
              {level && (
                <UnityLevelEmbed
                  level={level}
                  onGameStatusChange={(status) => {
                    setGameStatus(status);
                  }}
                  onFullscreen={requestFullscreen}
                ></UnityLevelEmbed>
              )}
            </div>

            <div className="flex m-4 gap-4">
              <Button
                onClick={() => {
                  // Toggle the fullscreen state
                  setRequestFullscreen((prevState) => !prevState);
                }}
              >
                Fullscreen
              </Button>
              <Link
                href={`/${previousLevelId == -1 ? "level-packs" : "level"}/${
                  previousLevelId == -1 ? packName : previousLevelId
                }`}
              >
                <Button>Previous level</Button>
              </Link>
              <Link
                href={`/${nextLevelId == -1 ? "level-packs" : "level"}/${
                  nextLevelId == -1 ? packName : nextLevelId
                }`}
              >
                <Button>Next level</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
