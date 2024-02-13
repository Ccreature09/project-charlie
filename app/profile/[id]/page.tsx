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
} from "@/components/ui/alert-dialog"
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
  deleteDoc, doc, updateDoc,
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
const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  minHeight: "120vh"
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
          console.log("FETCH USER DATA")
              console.log(levelsData)
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
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, onAuthStateChanged]);


  const deleteLevel = async (levelId: number) => {
    try {
      // Query the levels collection for the document with the specified level ID
      const levelsQuery = query(
        collection(db, "levels"),
        where("id", "==", levelId)
      );
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user?.uid)
    );
    const usersQuery = query(
      collection(db, "users"),
  );

  const usersQuerySnapshot = await getDocs(usersQuery);

      const levelsQuerySnapshot = await getDocs(levelsQuery);
      const userQuerySnapshot = await getDocs(userQuery);
      
      if (!levelsQuerySnapshot.empty) {
        // Get the reference to the document and delete it
        const levelDocRef = doc(db, "levels", levelsQuerySnapshot.docs[0].id);
        await deleteDoc(levelDocRef);
        console.log(`Level document ${levelId} deleted successfully.`);
      } else {
        console.log(`Level document ${levelId} not found.`);
      }
      if (!userQuerySnapshot.empty) {
        // Get the reference to the user document
        const userDocRef = doc(db, "users", userQuerySnapshot.docs[0].id);

        // Get the current levels array from the user document data
        const userData = userQuerySnapshot.docs[0].data();
        const currentLevels = userData.levels;

        // Filter out the levelId from the currentLevels array
        const updatedLevels = currentLevels.filter((id: number) => id !== levelId);

        // Update the user document with the updated levels array
        await updateDoc(userDocRef, { levels: updatedLevels });

        console.log(`Level ${levelId} deleted successfully from user document.`);
    } else {
        console.log(`User document with ID ${userQuerySnapshot.docs[0].id} not found.`);
    }
    if (!usersQuerySnapshot.empty) {
      usersQuerySnapshot.forEach(async (userDoc) => {
          const userDocRef = doc(db, "users", userDoc.id);
          const userData = userDoc.data() as User;
          
          if (userData.likedLevels.includes(levelId)) {
              const updatedLikedLevels = userData.likedLevels.filter((id: number) => id !== levelId);
              await updateDoc(userDocRef, { likedLevels: updatedLikedLevels });
              console.log(`Level ${levelId} deleted successfully from user document ${userDoc.id}.`);
          } else {
              console.log(`Level ${levelId} not found in user document ${userDoc.id}.`);
          }
          if (userData.completedLevels.includes(levelId)) {
            const updatedCompletedLevels = userData.completedLevels.filter((id: number) => id !== levelId);
            await updateDoc(userDocRef, { completedLevels: updatedCompletedLevels });
            console.log(`Level ${levelId} deleted successfully from user document ${userDoc.id}.`);
        } else {
            console.log(`Level ${levelId} not found in user document ${userDoc.id}.`);
        }
      });
  } else {
      console.log(`No user documents found.`);
  }
  setLevels(prevLevels => prevLevels.filter(level => level.id !== levelId));
    } catch (error) {
      console.error("Error deleting level:", error);
    }
  };
    
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
  <button onClick={()=>{console.log(levels)}}>TEST</button>
        <div className="mx-10 text-4xl text-white font-bold">
          <p className="mt-10 ml-5">My Levels</p>
          {levels.length > 0 ? (
            <Carousel className="mx-20 mt-5">
              <CarouselContent>
                {levels.map((level) => (
                  <CarouselItem key={level.id} className="basis-1/4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold">{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img src={level.imgURL} alt="" />
                      </CardContent>
                      <CardFooter>
                        <div className="flex">
                        <Link className="flex my-auto mx-3" href={`/level/${level.id}`}>
                          <Button>Play</Button>
                        </Link>
                        {isAdmin && 
                          <AlertDialog>
                            <AlertDialogTrigger><Button className="bg-red-500 flex my-auto">Изтрий ниво</Button></AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   This action cannot be undone. This will permanently delete your account
                                   and remove your data from our servers.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction className="bg-red-500" onClick={()=>{deleteLevel(level.id)}}>Изтрий ниво</AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                          </AlertDialog>
                        }
                        
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

                          <p className="text-xl flex my-auto">{level.likes}</p>
                        </div>
                        </div>
                        <div>
                        
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
