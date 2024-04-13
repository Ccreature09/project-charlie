"use client";
import { Navbar } from "@/components/functional/navbar";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LevelList from "@/components/functional/level-list";
import UserList from "@/components/functional/user-list";

export default function Page() {
  const router = useRouter();
  const adminArray = [
    "qAYbbta2AgRfev9NTEbMUqL1r212",
    "XsbxDDcsqwdDtKfN2xXETX9lCID2",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminArray.includes(user.uid)) {
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="h-screen bg-cover min-h-screen 2xl:min-h-[130vh] bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')] ">
        <Navbar />
        <div className="container  p-4 flex flex-col">
          <Tabs defaultValue="levels" className="w-full mx-auto">
            <TabsList className="w-full mb-5 flex flex-row">
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <div className="w-full flex flex-row">
              <div className="flex flex-row w-full">
                <TabsContent value="levels">
                  <div className="flex justify-center">
                    <LevelList></LevelList>
                  </div>
                </TabsContent>
                <TabsContent value="users">
                  <div className="flex justify-center ">
                    <UserList></UserList>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
