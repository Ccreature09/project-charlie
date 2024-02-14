"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/functional/navbar";
import { User as UserData, Level } from "@/interfaces";
import { User } from "firebase/auth";
import { getDocs, where, query, collection } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
};

export default function Page({ params }: { params: { pack: string } }) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [userData, setUserData] = useState<UserData>();
  const [user, setUser] = useState<User | null>();
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState("");

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
    const FetchLevelPack = async () => {
      try {
        const levelsQuery = query(
          collection(db, "packs"),
          where("name", "==", decodeURIComponent(params.pack))
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

        const levelsSnapshot = await getDocs(levelsQuery);

        if (!levelsSnapshot.empty) {
          const levelData = levelsSnapshot.docs[0].data();
          setDescription(levelData.description);
          const levelsArray: number[] = levelData.levelIds;

          const levelsPromises: Level[] = [];
          if (levelsArray.length > 0) {
            const levelsQuery = query(
              collection(db, "levels"),
              where("id", "in", levelsArray)
            );
            const levelsSnapshot = await getDocs(levelsQuery);

            levelsSnapshot.forEach((doc) => {
              const levelData = doc.data() as Level;
              levelsPromises.push(levelData);
            });
          }

          setLevels(levelsPromises);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    FetchLevelPack();
  }, [params.pack, user?.uid]);
  useEffect(() => {
    const completedLevels = userData?.completedLevels || [];
    const matchingCompletedLevels = completedLevels.filter((levelId) =>
      levels.some((level) => level.id === levelId)
    );
    const calculatedProgress =
      levels.length > 0
        ? (matchingCompletedLevels.length / levels.length) * 100
        : 0;

    setProgress(calculatedProgress);
  }, [userData, levels]);
  return (
    <div className="h-screen flex-row bg-cover min-h-screen bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
      <Navbar></Navbar>

      <div className=" bg-white bg-opacity-5 hover:bg-opacity-10 mx-10 mt-10 shadow-xl text-white p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <SettingsIcon className="text-white h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">
                {decodeURIComponent(params.pack)}
              </h1>
              <p className="text-gray-400">{description}</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="mt-6 mx-10 flex mb-10">
            <h2 className="text-xl font-semibold ">Прогрес</h2>

            <Progress
              className="w-5/6 flex m-auto bg-white rounded-full h-2.5"
              value={progress}
            />
            <p className="text-xl font-semibold">{progress}% </p>
          </div>
          {levels.length > 1 ? (
            <div className="space-y-4 max-h-[400px] overflow-auto">
              {levels &&
                levels.map((level) => (
                  <Link href={`/level/${level.id}`} key={level.id}>
                    <div className="flex items-center hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-xl justify-between mr-5">
                      <div className="flex items-center space-x-3">
                        <div>
                          {userData?.completedLevels.includes(level.id) ? (
                            <CheckCircleIcon className="text-green-500 h-6 w-6" />
                          ) : (
                            <CircleIcon className="text-green-500 h-6 w-6" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold">{level.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {stripHtmlTags(level.description)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mx-2">
                        {level.difficulty}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-auto">
              {[...Array(6)].map((_, index) => (
                <div className="flex" key={index}>
                  <CircleIcon className="text-green-500 h-6 w-6" />
                  <div>
                    <Skeleton className="w-[150px] my-3 h-[10px] mx-10" />
                    <Skeleton className="w-[650px] h-[25px] mx-10" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
