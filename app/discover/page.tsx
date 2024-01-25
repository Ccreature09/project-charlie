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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Level } from "@/interfaces";
import { db } from "@/firebase/firebase";

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};

export default function Page() {
  const [newLevels, setNewLevels] = useState<Level[]>([]);
  const [likedLevels, setLikedLevels] = useState<Level[]>([]);

  useEffect(() => {
    // Fetch new levels from Firestore
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

    // Fetch liked levels from Firestore
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
  }, []); // Run once on component mount

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
                  <CarouselItem key={index} className="basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                        <CardDescription>{level.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Card Content</p>
                      </CardContent>
                      <CardFooter>
                        <p>Card Footer</p>
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
              Най харесвани нива
            </p>
            <Carousel className="mx-20">
              <CarouselContent>
                {likedLevels.map((level, index) => (
                  <CarouselItem key={index} className="basis-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                        <CardDescription>{level.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Card Content</p>
                      </CardContent>
                      <CardFooter>
                        <p>Card Footer</p>
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
