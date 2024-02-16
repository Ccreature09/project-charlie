"use client";
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
import { Navbar } from "@/components/functional/navbar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User, Level } from "@/interfaces";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  getDocs,
  where,
  query,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebase/firebase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", params.id)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as User;
          setUser(userData);

          const levelIds = userData.levels;
          const levelsQuery = query(
            collection(db, "levels"),
            where("id", "in", levelIds)
          );
          const levelsSnapshot = await getDocs(levelsQuery);

          const levelsData: Level[] = levelsSnapshot.docs.map(
            (doc) => doc.data() as Level
          );
          setLevels(levelsData);
        } else {
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && params.id === currentUser.uid) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, onAuthStateChanged]);

  const deleteLevel = async (levelId: number) => {
    try {
      const levelsQuery = query(
        collection(db, "levels"),
        where("id", "==", levelId)
      );
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user?.uid)
      );
      const usersQuery = query(collection(db, "users"));

      const usersQuerySnapshot = await getDocs(usersQuery);

      const levelsQuerySnapshot = await getDocs(levelsQuery);
      const userQuerySnapshot = await getDocs(userQuery);

      if (!levelsQuerySnapshot.empty) {
        const levelDocRef = doc(db, "levels", levelsQuerySnapshot.docs[0].id);
        await deleteDoc(levelDocRef);
      }
      if (!userQuerySnapshot.empty) {
        const userDocRef = doc(db, "users", userQuerySnapshot.docs[0].id);

        const userData = userQuerySnapshot.docs[0].data();
        const currentLevels = userData.levels;

        const updatedLevels = currentLevels.filter(
          (id: number) => id !== levelId
        );

        await updateDoc(userDocRef, { levels: updatedLevels });
      } else {
      }
      if (!usersQuerySnapshot.empty) {
        usersQuerySnapshot.forEach(async (userDoc) => {
          const userDocRef = doc(db, "users", userDoc.id);
          const userData = userDoc.data() as User;

          if (userData.likedLevels.includes(levelId)) {
            const updatedLikedLevels = userData.likedLevels.filter(
              (id: number) => id !== levelId
            );
            await updateDoc(userDocRef, { likedLevels: updatedLikedLevels });
          } else {
          }
          if (userData.completedLevels.includes(levelId)) {
            const updatedCompletedLevels = userData.completedLevels.filter(
              (id: number) => id !== levelId
            );
            await updateDoc(userDocRef, {
              completedLevels: updatedCompletedLevels,
            });
          } else {
          }
        });
      } else {
      }
      setLevels((prevLevels) =>
        prevLevels.filter((level) => level.id !== levelId)
      );
    } catch (error) {
      console.error("Error deleting level:", error);
    }
  };

  return (
    <>
      <div className="h-screen flex-row bg-cover min-h-[150vh] bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar></Navbar>

        {user && (
          <div className="bg-gray-500 bg-opacity-50 relative h-[50vh] mt-5 mx-10 select-none pointer-events-none rounded-xl g-cover c">
            <div className="absolute bottom-5 left-5">
              <div className="flex flex-col md:flex-row">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.pfp}></AvatarImage>
                </Avatar>
                <p className=" text-3xl sm:text-6xl text-white mt-8 md:mt-16 font-black md:ml-10">
                  {user.username}
                </p>
                <div className="md:hidden ">
                  <p className="text-white">
                    Badges: {user.badges.join(", ") || "No Badges yet"}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block md:absolute md:bottom-5 md:right-5">
              <p className="text-white">
                Badges: {user.badges.join(", ") || "No Badges yet"}
              </p>
            </div>
          </div>
        )}
        <div className="mx-10 text-4xl text-white font-bold">
          <p className="mt-10 ml-5 select-none pointer-events-none">
            My Levels
          </p>
          {levels.length > 0 ? (
            <Carousel className="mx-5 text-black mt-5">
              <CarouselContent>
                {levels.map((level) => (
                  <CarouselItem
                    key={level.id}
                    className="basis md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl flex flex-col sm:flex-row font-bold">
                          {level.name}
                          <div className="flex  mx-6 gap-2">
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
                              className="my-auto "
                            >
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>

                            <p className="text-xl flex my-auto">
                              {level.likes}
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img src={level.imgURL} alt="" />
                      </CardContent>
                      <CardFooter>
                        <div className="flex flex-col  lg:flex-row items-center lg:items-start">
                          <Link
                            className="flex  lg:my-auto w-full  lg:mx-0"
                            href={`/level/${level.id}`}
                          >
                            <Button className="w-full lg: mr-6 lg:w-auto">
                              Play
                            </Button>
                          </Link>
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button className="bg-red-500 w-full flex my-3 lg:my-auto">
                                  Изтрий ниво
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Сигурен ли сте, че искате да изтриете това
                                    ниво?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    След изтриването на нивото, то не може да се
                                    възтанови!
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Назад</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500"
                                    onClick={() => {
                                      deleteLevel(level.id);
                                    }}
                                  >
                                    Изтрий ниво
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <p className="text-xl m-10 select-none pointer-events-none">
              No levels yet...
            </p>
          )}

          <div className="gap-2 flex"></div>
        </div>
      </div>
    </>
  );
}
