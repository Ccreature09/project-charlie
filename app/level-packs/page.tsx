import { Navbar } from "@/components/functional/navbar";
import React from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import Link from "next/link";


const cardData = [
  {
    title: "Tutorial",
    imageSrc: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
  },
  {
    title: "Basics",
    imageSrc: "url-to-your-image-2.jpg",
  },
  {
    title: "Intermediate",
    imageSrc: "url-to-your-image-2.jpg",
  },
  {
    title: "Advanced",
    imageSrc: "url-to-your-image-2.jpg",
  },
  {
    title: "Expert",
    imageSrc: "url-to-your-image-2.jpg",
  },
  {
    title: "Master",
    imageSrc: "url-to-your-image-2.jpg",
  },
  // Add more card data as needed
];

export default function Page() {
  return (
    <>
      <div  className="h-screen flex-row bg-cover min-h-[300vh] md:min-h-[150vh] lg:min-h-screen bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar></Navbar>

        <div className="flex flex-wrap justify-center items-center gap-6 p-8">
          {cardData.map((card, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <Link href={`/level-packs/${encodeURIComponent(card.title)}`}>
                <Card className="bg-opacity-10 hover:bg-opacity-40 transition-all duration-200 bg-white">
                  <CardContent>
                    <img
                      src={card.imageSrc}
                      alt={`Project ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <CardTitle className="text-white">{card.title}</CardTitle>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
    </>
  );
}
