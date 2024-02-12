"use client";
import { Navbar } from "@/components/functional/navbar";
import React, { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Level } from "@/interfaces";
import { db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  minHeight: "100vh",
  width: "100%",
};

export default function Page() {
  const [newLevels, setNewLevels] = useState<Level[]>([]);
  const [likedLevels, setLikedLevels] = useState<Level[]>([]);

  useEffect(() => {
    const fetchNewLevels = async () => {
      try {
        const q = query(
          collection(db, "levels"),
          orderBy("publishDate", "desc"),
          limit(9)
        );

        const querySnapshot = await getDocs(q);

        const levelsData: Level[] = [];
        querySnapshot.forEach((doc) => {
          levelsData.push(doc.data() as Level);
        });

        setNewLevels(levelsData);
      } catch (error) {
        console.error("Error fetching new levels:", error);
      }
    };

    const fetchLikedLevels = async () => {
      try {
        const q = query(
          collection(db, "levels"),
          orderBy("likes", "desc"),
          limit(9)
        );

        const querySnapshot = await getDocs(q);

        const levelsData: Level[] = [];
        querySnapshot.forEach((doc) => {
          levelsData.push(doc.data() as Level);
        });

        setLikedLevels(levelsData);
      } catch (error) {
        console.error("Error fetching liked levels:", error);
      }
    };

    fetchNewLevels();
    fetchLikedLevels();
  }, []);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen ">
        <Navbar></Navbar>

        <p className="text-5xl text-white mt-10 font-bold text-center">
          Открий Нива!
        </p>

        <div>
          {/* First Carousel */}
          <div className="my-10">
            <p className="ml-24 my-5 text-white text-3xl font-semibold">
              Най-нови нива
            </p>
            <Carousel className=" mx-20">
              <CarouselContent>
                {newLevels.map((level, index) => (
                  <CarouselItem
                    key={index}
                    className=" md:basis-1/2 lg:basis-1/3"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img src={level.imgURL} className="" alt="" />
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
          </div>

          {/* Second Carousel */}
          <div className="my-10 ">
            <p className="ml-24 my-5 text-white text-3xl font-semibold">
              Най-харесвани нива
            </p>
            <Carousel className="mx-20">
              <CarouselContent>
                {likedLevels.map((level, index) => (
                  <CarouselItem
                    key={index}
                    className=" md:basis-1/2 lg:basis-1/3"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img src={level.imgURL} alt="" />
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
          </div>
        </div>
      </div>
    </>
  );
}
