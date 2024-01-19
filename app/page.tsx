import { Navbar } from "@/components/functional/navbar";
import { Button } from "@/components/ui/button";
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
      <div style={backgroundImageStyle} className="h-full flex-row">
        <Navbar></Navbar>
        <div className="flex flex-row">
          <div className="mx-24 mt-96 ">
            <p className="text-xl font-semibold text-white">Welcome to</p>
            <p className="text-9xl font-black text-white">PRJ Charlie</p>
            <Button className="mt-4 bg-opacity-10 bg-white hover:opacity-90">
              <p className="font-semibold"> Start your journey!</p>
            </Button>
          </div>
          <div className="flex">
            <img
              src="https://img.itch.zone/aW1nLzQ5NDI5NjkuZ2lm/original/z2%2Bcie.gif"
              alt=""
              className="flex m-auto"
            />
          </div>
        </div>
      </div>
    </>
  );
}
