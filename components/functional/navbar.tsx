"use client";
import React, { useState, useEffect } from "react";
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
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { auth } from "@/firebase/firebase";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";

const provider = new GoogleAuthProvider();
const adminArray = ["qAYbbta2AgRfev9NTEbMUqL1r212"];

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      setLoading(true);
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

      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = await query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        const userData = {
          uid: user.uid,
          pfp: user.photoURL,
          username: user.displayName || "",
          lowercaseUsername: user.displayName?.toLowerCase(),
          dateOfRegistration: serverTimestamp(),
          badges: [],
          levels: [],
          likedLevels: [],
          completedLevels: [],
        };

        await setDoc(userDocRef, userData);
      }

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
      <div className="w-full flex justify-between items-center bg-opacity-75 h-16 relative select-none z-20 backdrop-blur-md">
        <div className="flex w-full ">
          <div className="flex my-auto ml-5">
            <Link href={"/"}>
              <Image
                src="https://i.ibb.co/RCkLHNs/Logo-1-ai-brush-removebg-qztjehsw.png"
                width={100}
                height={100}
                alt="Logo"
              />
            </Link>
          </div>
          <div className="flex justify-start ml-5">
            <NavigationMenu className="hidden mx-4 md:flex my-auto">
              <NavigationMenuList className="gap-3">
                <NavigationMenuItem>
                  <Link
                    href="/level-creator"
                    target="_blank"
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      <p className="text-white">Създай ниво!</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/level-packs" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      <p className="text-white">Пакети</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/discover" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      <p className="text-white">Открий нива</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex justify-end w-full md:mr-10">
            <div className="flex lg:hidden">
              <Drawer>
                <DrawerTrigger className="mx-4">
                  <div className=" hover:bg-opacity-30 bg-gray-100 bg-opacity-0 transition-all duration-200 rounded-lg text-white p-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white flex my-auto"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="flex">
                      <Input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        placeholder="Потърси за ниво или потребител"
                      />
                      <Button className="mx-5" onClick={handleSearch}>
                        {loading ? (
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
                            className="spin-animation"
                          >
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line
                              x1="4.93"
                              y1="4.93"
                              x2="7.76"
                              y2="7.76"
                            ></line>
                            <line
                              x1="16.24"
                              y1="16.24"
                              x2="19.07"
                              y2="19.07"
                            ></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line
                              x1="4.93"
                              y1="19.07"
                              x2="7.76"
                              y2="16.24"
                            ></line>
                            <line
                              x1="16.24"
                              y1="7.76"
                              x2="19.07"
                              y2="4.93"
                            ></line>
                          </svg>
                        ) : (
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
                            className="flex my-auto mx-5"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        )}
                      </Button>
                    </DrawerTitle>
                  </DrawerHeader>
                  <DrawerFooter></DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
            <div className="my-auto hidden lg:flex">
              <Dialog>
                <DialogTrigger className="mx-4">
                  <div className="flex bg-gray-100 bg-opacity-20 w-64 py-1 px-4 hover:bg-opacity-50 rounded-xl">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white flex my-auto"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <p className="text-white my-auto flex mx-5">Потърси...</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex mt-5">
                      <Input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        placeholder="Потърси за ниво или потребител..."
                      />
                      <Button className="mx-5" onClick={handleSearch}>
                        {loading ? (
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
                            className="spin-animation"
                          >
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line
                              x1="4.93"
                              y1="4.93"
                              x2="7.76"
                              y2="7.76"
                            ></line>
                            <line
                              x1="16.24"
                              y1="16.24"
                              x2="19.07"
                              y2="19.07"
                            ></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line
                              x1="4.93"
                              y1="19.07"
                              x2="7.76"
                              y2="16.24"
                            ></line>
                            <line
                              x1="16.24"
                              y1="7.76"
                              x2="19.07"
                              y2="4.93"
                            ></line>
                          </svg>
                        ) : (
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
                            className="flex my-auto mx-5"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        )}
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>

            <Popover>
              <PopoverTrigger className="hidden items-center mx-4 md:flex">
                {!user ? (
                  <>
                    <div className=" hover:bg-opacity-30 bg-gray-100 bg-opacity-0 transition-all duration-200 rounded-lg text-white p-2 flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
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
                    <Button
                      className="w-full mb-5"
                      onClick={handleGoogleSignIn}
                    >
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
            <DropdownMenu>
              <DropdownMenuTrigger className="md:hidden flex items-center mx-12 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className=" flex">
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
                    className="mx-3"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  <p className="my-auto flex">Навигация</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/">
                  <DropdownMenuItem className="cursor-pointer">
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
                      className="mx-3"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Начална Страница
                  </DropdownMenuItem>
                </Link>
                <Link href={`/profile/${user?.uid}`}>
                  <DropdownMenuItem className="cursor-pointer">
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
                      className="mx-3"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Профил
                  </DropdownMenuItem>
                </Link>
                <Link href="/level-creator">
                  <DropdownMenuItem className="cursor-pointer">
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
                      className="mx-3"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    Създай ниво!
                  </DropdownMenuItem>
                </Link>
                <Link href="/level-packs">
                  <DropdownMenuItem className="cursor-pointer">
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
                      className="mx-3"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Пакети
                  </DropdownMenuItem>
                </Link>
                <Link href="/discover">
                  <DropdownMenuItem className="cursor-pointer">
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
                      className="mx-3"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Отркий нива
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                {!user ? (
                  <DropdownMenuItem
                    onClick={handleGoogleSignIn}
                    className="cursor-pointer text-green-500 "
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
                      className="mx-3"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Вход
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-500 "
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
                      className="mx-3"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Изход
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
