"use client";
import { Navbar } from "@/components/functional/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
export default function Home() {
  const [isBouncing, setIsBouncing] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const handleScrollToSection = () => {
    const section = document.getElementById("Section");
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="h-screen flex-row bg-cover min-h-[400vh]  md:min-h-[250vh] lg:min-h-[300vh]  scroll-smooth bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar></Navbar>
        <div className="md:flex  flex-row select-none pointer-events-none">
          <div className="md:hidden flex">
            <Image
              src="https://img.itch.zone/aW1nLzQ5NDI5NjkuZ2lm/original/z2%2Bcie.gif"
              width={200}
              height={200}
              alt=""
              className="flex m-auto w-1/2"
            />
          </div>

          <div className="mx-5 md:mx-24 my-10  md:mt-64 md:w-1/2">
            <div>
              <p className="text-xl font-semibold text-white">
                Добре дошли в{" "}
                <span className="text-4xl block sm:text-5xl md:text-7xl lg:text-9xl font-black text-white">
                  PROJECT: Charlie
                </span>
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mt-10">
                {" "}
                Мисли, учи и се развивай в широката сфера на програмирането!
              </p>
            </div>
          </div>

          <div className="hidden md:flex md:w-1/2">
            <Image
              src="https://img.itch.zone/aW1nLzQ5NDI5NjkuZ2lm/original/z2%2Bcie.gif"
              alt=""
              width={1000}
              height={1000}
              className="flex m-auto"
            />
          </div>
        </div>
        <div className="w-full flex mx-auto p-10">
          <Button
            className={`rounded-full flex mx-auto  ${
              isBouncing ? "bounce border-white border-2 " : ""
            }`}
            onClick={handleScrollToSection}
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
            >
              <polyline points="7 13 12 18 17 13"></polyline>
              <polyline points="7 6 12 11 17 6"></polyline>
            </svg>
          </Button>
        </div>
        <p
          id="Section"
          className="text-white text-center bg-white bg-opacity-25 mb-10 text-5xl font-bold break-words p-16 select-none pointer-events-none"
        >
          Какво преставлява PROJECT: Charlie?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 container gap-5 ">
          <Card className="select-none">
            <CardHeader>
              <CardTitle>Пакети с нива</CardTitle>
              <CardDescription>
                Стани виртуоз в програмирането като решиш нашите подбрани
                обучителни нива!
              </CardDescription>
            </CardHeader>
            <CardContent className="pointer-events-none">
              <Image
                src="https://i.ibb.co/47qknKD/image.png"
                width={1000}
                height={500}
                className="rounded-lg"
                alt=""
              />
            </CardContent>
            <CardFooter className="mt-5">
              <Link href={"/level-packs"}>
                <Button>Научи се</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="select-none">
            <CardHeader>
              <CardTitle>Генератор на нива</CardTitle>
              <CardDescription>
                Създай всякакви нива с нашия генератор на нива!
              </CardDescription>
            </CardHeader>
            <CardContent className="pointer-events-none">
              <Image
                src="https://i.ibb.co/n0x3tfF/image.png"
                width={1000}
                height={500}
                className="rounded-lg"
                alt=""
              />
            </CardContent>
            <CardFooter>
              <Link href={"/level-creator"}>
                <Button>Създай Ниво</Button>
              </Link>
            </CardFooter>
          </Card>
          <div className="relative select-none pointer-events-none">
            <Card>
              <CardHeader>
                <CardTitle>Съзтезания</CardTitle>
                <CardDescription>
                  Съзтезавай се с други програмисти, за откриването на най
                  ефикасното и бързо решение за нивото!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>...</p>
              </CardContent>
              <CardFooter>
                <p>...</p>
              </CardFooter>
              <div className="absolute inset-0 flex items-center rounded-lg justify-center bg-black bg-opacity-50 text-white">
                <p>Очаквайте скоро</p>
              </div>
            </Card>
          </div>

          <div className="relative select-none pointer-events-none">
            <Card>
              <CardHeader>
                <CardTitle>Значки</CardTitle>
                <CardDescription>
                  Кой не обича значки! Събери всички значки за твоя профил, като
                  изпълняваш мисии!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>...</p>
              </CardContent>
              <CardFooter>
                <p>...</p>
              </CardFooter>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 text-white">
                <p>Очаквайте скоро</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
