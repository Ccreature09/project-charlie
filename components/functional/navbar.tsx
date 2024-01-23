"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import UserForm from "./signIn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  signInWithPopup,
  User,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  setDoc,
  serverTimestamp,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

import { cn } from "@/lib/utils";
import { auth } from "@/firebase/firebase";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

const provider = new GoogleAuthProvider();
const adminArray = ["qAYbbta2AgRfev9NTEbMUqL1r212"];

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        setProfileImageUrl(user.photoURL);
      } else {
        setUser(null);
        setProfileImageUrl(null);
      }
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already exists in the "users" collection
      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = await query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        // User does not exist, create a new user document
        const userData = {
          uid: user.uid,
          pfp: user.photoURL,
          username: user.displayName || "", // You can adjust this as needed
          dateOfRegistration: serverTimestamp(),
          badges: [], // Initialize with an empty array
          levels: [], // Initialize with an empty array
        };

        // Add the new user document to the "users" collection
        await setDoc(userDocRef, userData);
        console.log("New user created:", userData);
      } else {
        console.log("User already exists:");
      }

      // Set the user state
      setUser(user);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return (
    <>
      <div className="w-full my-auto flex justify-between items-center  bg-opacity-75 h-16 relative z-20 backdrop-blur-md">
        <div className="flex md:space-x-24 mx-auto">
          <div className="flex items-center">
            <Link href={"/"}>
              <div className="bg-gray-300 w-10 h-10 my-auto"></div>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="xl:hidden flex items-center mx-12 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 my-auto  text-blue-500 bg-white rounded-lg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Навигация</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/">
                <DropdownMenuItem className="cursor-pointer">
                  Начална Страница
                </DropdownMenuItem>
              </Link>
              <Link href="/docs">
                <DropdownMenuItem className="cursor-pointer">
                  Документация
                </DropdownMenuItem>
              </Link>
              <Link href="/level-creator">
                <DropdownMenuItem className="cursor-pointer">
                  Създай ниво!
                </DropdownMenuItem>
              </Link>
              <Link href="/level-packs">
                <DropdownMenuItem className="cursor-pointer">
                  Нива
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavigationMenu className="hidden xl:flex my-auto">
            <NavigationMenuList className="gap-3">
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <p className="text-white">Документация</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/level-creator"
                  target="_blank"
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <p className="text-white">Създай ниво!</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/level-packs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <p className="text-white">Нива</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <form onSubmit={handleSearch} className="my-auto">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Popover>
            <PopoverTrigger className="flex items-center mx-8">
              {!user ? (
                <>
                  <div className=" rounded-lg text-white p-2 mx-10 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 rounded-lg p-1 text-white bg-white"
                      viewBox="0 0 512 512"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      id="login"
                    >
                      <path d="M255.988 32C160.473 32 78.934 91.804 46.727 176h34.639c9.396-20.484 22.457-39.35 38.868-55.762C156.497 83.973 204.709 64 255.988 64c51.286 0 99.504 19.973 135.771 56.239C428.027 156.505 448 204.719 448 256c0 51.285-19.973 99.501-56.239 135.765C355.494 428.029 307.275 448 255.988 448c-51.281 0-99.493-19.971-135.755-56.234-16.412-16.412-29.473-35.28-38.871-55.766H46.725c32.206 84.201 113.746 144 209.264 144C379.703 480 480 379.715 480 256c0-123.702-100.297-224-224.012-224z"></path>
                      <path d="M206.863 323.883l22.627 22.627L320 256l-90.51-90.51-22.628 22.628L258.745 240H32v32h226.745z"></path>
                    </svg>
                  </div>
                </>
              ) : user && profileImageUrl ? (
                profileImageUrl && (
                  <div className=" flex flex-col justify-between mx-5 md:mx-10">
                    <Avatar className="flex mx-auto">
                      <AvatarImage src={profileImageUrl} alt="User" />
                      <AvatarFallback>{user.displayName}</AvatarFallback>
                    </Avatar>
                    {adminArray.includes(user.uid) && (
                      <Badge className="flex">Admin</Badge>
                    )}
                  </div>
                )
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </PopoverTrigger>
            <PopoverContent>
              {user && adminArray.includes(user.uid) && (
                <Link href={"/admin"}>
                  <Button className="w-full">Администраторски Панел</Button>
                </Link>
              )}
              {!user ? (
                <>
                  <h1 className=" text-center mb-8 font-bold text-2xl">
                    Вход / Регистрация
                  </h1>
                  <Button className="w-full mb-5" onClick={handleGoogleSignIn}>
                    Вход с Google
                  </Button>
                  <UserForm login />
                  <Separator className="mb-5" />
                  <UserForm login={false} />
                </>
              ) : (
                <>
                  <Link href={`/profile/${user.uid}`}>
                    <Button className="w-full mt-4">Профил</Button>
                  </Link>

                  <Button className="w-full mt-4" onClick={handleSignOut}>
                    Изход
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
