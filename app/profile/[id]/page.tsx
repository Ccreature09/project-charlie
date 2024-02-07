"use client";
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
  Timestamp,
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
import { Badge } from "@/components/ui/badge";
const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};

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
          console.log(levels);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && params.id === currentUser.uid) {
        //fix settings not instantly changing on authstatechange
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, onAuthStateChanged]);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row">
        <Navbar></Navbar>

        {user && (
          <div className="bg-gray-500 bg-opacity-50 relative h-[50vh] mt-5 mx-10 rounded-xl g-cover">
            <div className="absolute bottom-5 left-5">
              <div className="flex">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.pfp}></AvatarImage>
                </Avatar>
                <p className="text-6xl text-white mt-16 font-black ml-10">
                  {user.username}
                </p>
              </div>
            </div>
            <div className="absolute bottom-5 right-5">
              <p className="text-white">
                Badges: {user.badges.join(", ") || "No Badges yet"}
              </p>
            </div>
            <div className="absolute top-5 right-5">
              {isAdmin && (
                <Link href={"/profile/settings"}>
                  <Button className="bg-transparent py-8 hover:bg-white hover:bg-opacity-10 rounded-xl">
                    <img
                      src="https://static-00.iconduck.com/assets.00/settings-icon-2048x2046-cw28eevx.png"
                      alt="settings"
                      className="w-10"
                    />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mx-10 text-4xl text-white font-bold">
          <p className="mt-10 ml-5">My Levels</p>
          {levels.length > 0 ? (
            <Carousel className="mx-20 mt-5">
              <CarouselContent>
                {levels.map((level) => (
                  <CarouselItem key={level.id} className="basis-1/4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Card Content</p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/level/${level.id}`}>
                          <Button>Play</Button>
                        </Link>
                        <div className="flex mx-4 gap-2">
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
                            className="my-auto"
                          >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>

                          <p className="text-xl">{level.likes}</p>
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
            <p className="text-xl m-10">No levels yet...</p>
          )}

          <div className="gap-2 flex"></div>
        </div>
      </div>
    </>
  );
}
