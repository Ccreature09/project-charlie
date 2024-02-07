"use client";
import { Switch } from "@/components/ui/switch";
import { Navbar } from "@/components/functional/navbar";
import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { auth } from "@/firebase/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <>
      <div
        style={backgroundImageStyle}
        className="h-screen  items-center justify-center"
      >
        <Navbar></Navbar>
        <div className="w-4/5 h-4/5 bg-white rounded-md m-auto mt-10 flex">
          {/* Categories on the left */}

          {/* Category content on the right */}
          <div className="w-full p-4">
            <Tabs className="flex" defaultValue="account">
              <TabsList className="flex flex-col w-1/6 p-4 h-full">
                <TabsTrigger className="flex p-2" value="account">
                  Account
                </TabsTrigger>
                <TabsTrigger className="flex p-2" value="password">
                  Password
                </TabsTrigger>
                <TabsTrigger className="flex p-2" value="notifications">
                  Notifications
                </TabsTrigger>
                {/* Add more tabs as needed */}
              </TabsList>
              <TabsContent className="ml-10" value="account">
                <h2 className="text-3xl font-bold mb-4">Account Settings</h2>
                <div className="flex">
                  <Avatar className="mx-5">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback>PFP</AvatarFallback>
                  </Avatar>
                  <div className="">
                    <p>Username: {user?.displayName}</p>
                    <p>Email: {user?.email}</p>
                  </div>
                </div>

                {/* Add more account-related settings */}
              </TabsContent>
              <TabsContent className="ml-10" value="password">
                <h2 className="text-3xl font-bold mb-4">Change Password</h2>
                {/* Placeholder content, replace with actual password change form */}
                <form>
                  <label htmlFor="newPassword">New Password:</label>
                  <input type="password" id="newPassword" />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Change Password
                  </button>
                </form>
              </TabsContent>
              <TabsContent className="ml-10" value="notifications">
                <h2 className="text-3xl font-bold mb-4">Notifications</h2>

                <div className="flex gap-5">
                  <p>Send emails about levels</p>
                  <Switch></Switch>
                </div>
              </TabsContent>
              {/* Add more TabsContent for additional tabs */}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
