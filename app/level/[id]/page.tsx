"use client";
import { db } from "@/firebase/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
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

  return (
    <>
      <Navbar></Navbar>
      <div className="m-5">
        <div className="bg-slate-300 w-1/4 h-screen">
          <p className="text-4xl font-bold text-center pt-10">{level?.name}</p>
          <p className="p-5 font-medium">{level?.description}</p>
        </div>
        <div></div>
      </div>
    </>
  );
}
