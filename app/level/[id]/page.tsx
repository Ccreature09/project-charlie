"use client";
import { db } from "@/firebase/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
import UnityLevelEmbed from "@/components/functional/unity-level";

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: "cover",
  width: "100%",
};

export default function Page({ params }: { params: { id: string } }) {
  const [slug, setSlug] = useState(params.id);
  const [level, setlevel] = useState<Level>();

  useEffect(() => {
    const fetchProductData = async () => {
      if (slug) {
        console.log(slug);
        const searchQuery = Number(decodeURIComponent(slug));
        const q = query(
          collection(db, "levels"),
          where("id", "==", searchQuery)
        );

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const levelDoc = querySnapshot.docs[0];

            const levelData = levelDoc.data() as Level;
            setlevel(levelData);
          } else {
            console.error("Product not found");
          }
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      }
    };

    fetchProductData();
  }, [slug]);

  useEffect(() => {
    level && console.log(level);
  }, [level]);

  return (
    <>
      <div style={backgroundImageStyle} className="h-full flex-row">
        <Navbar></Navbar>
        <div className="m-5 gap-3 flex">
          <div className="bg-slate-300 w-1/4 h-screen">
            <p className="text-4xl font-bold text-center pt-10">
              {level?.name}
            </p>
            <p className="p-5 font-medium">{level?.description}</p>
          </div>
          {level && (
            <div className="w-3/4">
              <UnityLevelEmbed level={level}></UnityLevelEmbed>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
