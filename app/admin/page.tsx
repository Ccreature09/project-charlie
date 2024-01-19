"use client";
import { Navbar } from "@/components/functional/navbar";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LevelList from "@/components/functional/level-list";

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};
export default function Page() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  undefined;
  const adminArray = ["qAYbbta2AgRfev9NTEbMUqL1r212"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminArray.includes(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen ">
        <Navbar />
        <div className="container mx-auto p-4 flex flex-col">
          <Tabs defaultValue="levels" className="w-full mx-auto">
            <TabsList className="w-full mb-5 flex flex-row">
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="level-packs">Level Packs</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <div className="w-full flex flex-row">
              <div className="flex flex-row w-full">
                <TabsContent value="levels">
                  <div className="flex flex-row">
                    <LevelList></LevelList>
                  </div>
                </TabsContent>
                <TabsContent value="level-packs"></TabsContent>
                <TabsContent value="users"></TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
