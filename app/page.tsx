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

export default function Home() {
  const backgroundImageStyle = {
    backgroundImage:
      "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
    backgroundSize: "cover",
    width: "100%",
  };

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row">
        <Navbar></Navbar>
        <div className="md:flex flex-row">
          {/* Image on smaller screens */}
          <div className="md:hidden flex">
            <img
              src="https://img.itch.zone/aW1nLzQ5NDI5NjkuZ2lm/original/z2%2Bcie.gif"
              alt=""
              className="flex m-auto w-1/2"
            />
          </div>

          <div className="mx-24  md:mt-64 md:w-1/2">
            <div>
              <p className="text-xl font-semibold text-white">Добре дошли в</p>
              <p className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-white">
                PROJECT: Charlie
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mt-10">
                {" "}
                Мисли, учи и се развивай в широката земя на програмирането!
              </p>
            </div>
          </div>

          {/* Image on larger screens */}
          <div className="hidden md:flex md:w-1/2">
            <img
              src="https://img.itch.zone/aW1nLzQ5NDI5NjkuZ2lm/original/z2%2Bcie.gif"
              alt=""
              className="flex m-auto"
            />
          </div>
        </div>
      </div>
      <div className="w-full h-16 bg-slate-900"></div>
      <div style={backgroundImageStyle} className="h-screen flex-row">
        <p className="text-white text-center text-5xl font-bold p-16">
          Какво преставлява PROJECT: Charlie?
        </p>

        <div className="flex flex-col container gap-5">
          <div className="flex gap-5">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Level Creator</CardTitle>
                <CardDescription>
                  Създай всякакви нива с нашия Level Creator!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Level Packs</CardTitle>
                <CardDescription>
                  Стани виртуоз в програмирането като решиш нашите подбрани
                  обучителни нива!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </div>
          <div className="flex gap-5">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Съзтезания</CardTitle>
                <CardDescription>
                  Съзтезавай се с други програмисти, за откриването на най
                  ефикасното и бързо решение за нивото!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Значки</CardTitle>
                <CardDescription>
                  Кой не обича значки! Събери всички значки за твоя профил, като
                  изпълняваш мисии!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
