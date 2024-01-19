"use client";
import { db } from "@/firebase/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};

export default function Page({ params }: { params: { query: string } }) {
  const [slug, setSlug] = useState(params.query);
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    const fetchLevels = async () => {
      if (slug) {
        const searchQuery = decodeURIComponent(slug);
        console.log(slug);
        console.log(searchQuery);

        const q = query(
          collection(db, "levels"),
          where("name", ">=", searchQuery),
          where("name", "<=", searchQuery + "\uf8ff")
        );

        try {
          const querySnapshot = await getDocs(q);
          const matchingLevels: Level[] = [];

          querySnapshot.forEach((levelDoc) => {
            const levelData = levelDoc.data() as Level;
            matchingLevels.push(levelData);
          });

          setLevels(matchingLevels);
        } catch (error) {
          console.error("Error fetching levels:", error);
        }
      }
    };

    fetchLevels();
  }, [slug]);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen ">
        <Navbar></Navbar>

        <div className="m-20">
          <p className="text-3xl mb-16">
            Results for <span className="font-semibold">{slug}</span>:
          </p>

          <div className="m-10">
            {levels.map((level) => (
              <div key={level.id}>
                <Link
                  href={`/level/${encodeURIComponent(level.id)}`}
                  className="flex bg-blue-100 rounded-lg p-5 my-5"
                >
                  <img
                    src="https://etc.usf.edu/clipart/21900/21988/square_21988_md.gif"
                    alt={level.name + " image"}
                    className="w-48"
                  />
                  <div className="mx-10">
                    <div className="flex h-5 items-center space-x-4 ">
                      <Separator orientation="vertical" />
                      <p className="text-3xl font-semibold text-center ">
                        {level.name}
                      </p>
                      <Separator orientation="vertical" className="bg-black" />
                      <Badge className="bg-slate-400 rounded-lg">
                        <img
                          src="https://i.ibb.co/VJhxNJV/Icon-1.png"
                          className="w-3 mr-2"
                          alt=""
                        />
                        10x10
                      </Badge>

                      <Badge className="bg-slate-400 rounded-lg">
                        <img
                          src="https://i.ibb.co/KhG75bv/Rectangle-5.png"
                          className="w-4 mr-2"
                          alt=""
                        />
                        {level.difficulty}
                      </Badge>
                      <Badge className="bg-slate-400 rounded-lg">
                        {level.unlimited ? "Unlimited" : "Limited"}
                      </Badge>
                    </div>
                    <p className="p-5 ml-4 font-medium">{level.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}
