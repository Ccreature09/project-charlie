"use client";
import { Navbar } from "@/components/functional/navbar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User, Level } from "@/interfaces";
import React, { useState, useEffect } from "react";
import {
  getDocs,
  where,
  query,
  collection,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebase/firebase";
import {
  Card,
  CardContent,
  CardDescription,
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
          <div className="bg-gray-500 bg-opacity-50 relative h-[50vh] mt-12 mx-10 rounded-xl g-cover">
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
                <Button className="bg-transparent py-8 hover:bg-white hover:bg-opacity-10 rounded-xl">
                  <img
                    src="https://static-00.iconduck.com/assets.00/settings-icon-2048x2046-cw28eevx.png"
                    alt="settings"
                    className="w-10"
                  />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mx-10 text-4xl text-white font-bold">
          <p className="mt-10 ml-5">My Levels</p>
          {/* Add logic to display user's levels here */}
          <div className="gap-3">
            {levels.map((level) => (
              <Link href={`/level/${level.id}`} key={level.id}>
                <Card className="w-1/6 m-8">
                  <CardHeader>
                    <CardTitle className="text-5xl font-bold">
                      {level.name}
                    </CardTitle>
                    <div className="gap-2 flex">
                      <Badge className="bg-slate-400 mt-2 rounded-lg">
                        <img
                          src="https://i.ibb.co/VJhxNJV/Icon-1.png"
                          className="w-3 mr-2"
                          alt=""
                        />
                        10x10
                      </Badge>
                      <Badge className="bg-slate-400 mt-2 rounded-lg">
                        <img
                          src="https://i.ibb.co/KhG75bv/Rectangle-5.png"
                          className="w-4 mr-2"
                          alt=""
                        />
                        {level.difficulty}
                      </Badge>
                      <Badge className="bg-slate-400 mt-2 rounded-lg">
                        {level.unlimited ? "Unlimited" : "Limited"}
                      </Badge>
                    </div>
                    <img src="" alt="" />
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>

                  <CardFooter className="text-xl">
                    {level.publishDate instanceof Timestamp
                      ? level.publishDate.toDate().toLocaleDateString()
                      : ""}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
