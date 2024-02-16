"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";
import { Level } from "@/interfaces";
import { Navbar } from "@/components/functional/navbar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User } from "@/interfaces";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";

const ITEMS_PER_PAGE = 4;

const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
};

export default function Page({ params }: { params: { query: string } }) {
  const [slug, setSlug] = useState(decodeURIComponent(params.query));
  const [levels, setLevels] = useState<Level[]>([]);
  const [userProfiles, setUserProfiles] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      if (slug) {
        const searchQuery = decodeURIComponent(slug).toLowerCase(); // Convert query to lowercase

        const levelQuery = query(
          collection(db, "levels"),
          where("lowercaseName", ">=", searchQuery), // Assuming "nameLowerCase" is the lowercase version of "name"
          where("lowercaseName", "<=", searchQuery + "\uf8ff")
        );

        const userQuery = query(
          collection(db, "users"),
          where("lowercaseUsername", ">=", searchQuery), // Assuming "usernameLowerCase" is the lowercase version of "username"
          where("lowercaseUsername", "<=", searchQuery + "\uf8ff")
        );

        try {
          const levelQuerySnapshot = await getDocs(levelQuery);
          const matchingLevels: Level[] = [];

          levelQuerySnapshot.forEach((levelDoc) => {
            const levelData = levelDoc.data() as Level;
            matchingLevels.push(levelData);
          });

          setLevels(matchingLevels);

          const userQuerySnapshot = await getDocs(userQuery);
          const matchingUserProfiles: User[] = [];

          userQuerySnapshot.forEach((userDoc) => {
            const userData = userDoc.data() as User;
            matchingUserProfiles.push(userData);
          });

          setUserProfiles(matchingUserProfiles);
        } catch (error) {
          console.error("Error fetching results:", error);
        }
      }
    };

    fetchResults();
  }, [slug]);

  const totalPages = Math.ceil(
    (levels.length + userProfiles.length) / ITEMS_PER_PAGE
  );

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentLevels = levels.slice(indexOfFirstItem, indexOfLastItem);
  const currentUserProfiles = userProfiles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <>
      <div className="h-screen flex-row bg-cover min-h-[300vh] md:min-h-[150vh] lg:min-h-[200vh] bg-[url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')]">
        <Navbar />

        <div className="m-10 lg:m-20">
          <p className="text-3xl text-white mb-16">
            Results for <span className="font-semibold underline">{slug}</span>:
          </p>

          <div className="mb-5 lg:m-10">
            {currentUserProfiles.map((user) => (
              <Link href={`/profile/${user.uid}`} className="" key={user.uid}>
                <div className="bg-blue-100 flex rounded-lg  flex-col md:flex-row p-5 my-5">
                  <Image
                    src={user.pfp || "default_profile_image_url"}
                    width={200}
                    height={200}
                    alt={user.username + " image"}
                  />
                  <div>
                    <p className="text-2xl mt-5 md:text-4xl font-bold ml-4">
                      {user.username}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {currentLevels.map((level) => (
              <div key={level.id}>
                <Link
                  href={`/level/${encodeURIComponent(level.id)}`}
                  className="flex flex-col lg:flex-row bg-blue-100 rounded-lg my-0  lg:my-5"
                >
                  <Image
                    src={
                      level.imgURL ||
                      "https://etc.usf.edu/clipart/21900/21988/square_21988_md.gif"
                    }
                    width={500}
                    height={250}
                    alt={level.name + " image"}
                    className="w-full mb-10 lg:mb-0 flex lg:w-1/4"
                  />
                  <div className="flex flex-col mx-5 lg:mx-10 lg:mt-10">
                    <div className="flex h-5 items-center space-x-4 ">
                      <p className="sm:text-lg md:text-xl lg:text-3xl font-semibold text-center ">
                        {level.name}
                      </p>
                      <Separator orientation="vertical" className="bg-black" />
                      <div>
                        <Badge className="bg-slate-400 rounded-lg mx-3">
                          <Image
                            src="https://i.ibb.co/VJhxNJV/Icon-1.png"
                            className="mr-2"
                            width={15}
                            height={15}
                            alt="Grid Icon"
                          />
                          {level.grid}
                        </Badge>

                        <Badge className="bg-slate-400 rounded-lg">
                          <Image
                            src="https://i.ibb.co/KhG75bv/Rectangle-5.png"
                            className="mr-2"
                            width={15}
                            height={15}
                            alt="Difficulty Icon"
                          />
                          {level.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <p className="lg:p-5 my-10 lg:mt-0 ml-4 font-medium">
                      {stripHtmlTags(level.description)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              console.log(currentLevels.length);
            }}
          >
            asdasd
          </button>
          {currentLevels.length > 0 ? (
            <Pagination>
              <PaginationContent className="cursor-pointer">
                <PaginationItem>
                  <PaginationPrevious
                    className={`${currentPage === 1 && "hidden"}`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={index + 1 === currentPage}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className={`${currentPage === totalPages && "hidden"}`}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : (
            currentLevels.length > 0 && (
              <Pagination>
                <PaginationContent className="cursor-pointer">
                  <PaginationItem>
                    <PaginationPrevious
                      className={`${currentPage === 1 && "hidden"}`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={index + 1 === currentPage}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className={`${currentPage === totalPages && "hidden"}`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )
          )}
        </div>
      </div>
    </>
  );
}
