import { Navbar } from "@/components/functional/navbar";
import React from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const cardData = [
  {
    title: "Обучение",
    imageSrc: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
  },
  {
    title: "Базовите неща",
    imageSrc: "",
  },
  {
    title: "За начинаещите",
    imageSrc: "",
  },
  {
    title: "За Напреднали",
    imageSrc: "",
  },
  {
    title: "За Експерти",
    imageSrc: "",
  },
  {
    title: "За Майстори",
    imageSrc: "",
  },
];

export default function Page() {
  return (
    <>
      <div className="h-screen flex-row bg-cover min-h-[300vh] md:min-h-[150vh] lg:min-h-screen bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar></Navbar>

        <div className="flex flex-wrap justify-center select-none items-center gap-6 p-8">
          {cardData.map((card, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              {card.imageSrc ? (
                <Link href={`/level-packs/${encodeURIComponent(card.title)}`}>
                  <Card className="bg-opacity-10 hover:bg-opacity-40 transition-all duration-200 bg-white">
                    <CardContent>
                      <img
                        src={card.imageSrc}
                        alt={`Oчаквайте скоро!`}
                        className="w-full h-48 object-cover"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <CardTitle className="text-white">{card.title}</CardTitle>
                    </CardFooter>
                  </Card>
                </Link>
              ) : (
                <Card className="bg-opacity-10 hover:bg-opacity-40 transition-all select-none duration-200 bg-white">
                  <CardContent>
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">Очаквайте скоро!</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <CardTitle className="text-white">{card.title}</CardTitle>
                  </CardFooter>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
