import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Level } from "@/interfaces";
import { useRouter } from "next/navigation";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "../ui/button";
import Link from "next/link";
export default function LevelList() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mount, setMount] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "levels"));
        const newLevels: Level[] = [];
        querySnapshot.forEach((doc) => {
          newLevels.push({
            ...doc.data(),
          } as Level);
        });
        setLevels(newLevels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };
    setMount(true);
    fetchLevels();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts


 

  const handleDeleteLevel = (levelId: number) => {
    // Implement your delete level logic here
    alert(`Deleting level ${levelId}`);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLevels = levels.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <>
      {mount && (
        <div className="flex flex-col ">
          <Table className="w-full">
            <TableHeader className="w-full">
              <TableRow className="w-full mx-auto">
                <TableHead className="text-center text-white">
                  Level ID
                </TableHead>
                <TableHead className="text-center text-white">Image</TableHead>
                <TableHead className="text-center text-white">Name</TableHead>
                <TableHead className="text-center text-white">Tags</TableHead>
                <TableHead className="text-center text-white">
                  Difficulty
                </TableHead>
                <TableHead className="text-center text-white">
                  Grid Size
                </TableHead>
                <TableHead className="text-center text-white">
                  Unlimited
                </TableHead>
                <TableHead className="text-center text-white">Author</TableHead>
                <TableHead className="text-center text-white">
                  Publish Date
                </TableHead>
                <TableHead className="text-center text-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {" "}
              {currentLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell>{level.id}</TableCell>
                  {/* Image column */}
                  <TableCell>
                    <img
                      src={`${level.imgURL}`}
                      alt="Level Image"
                      className="w-1/2 flex mx-auto"
                    />
                  </TableCell>
                  <TableCell>{level.name}</TableCell>
                  <TableCell>{level.tags.join(", ")}</TableCell>
                  <TableCell>{level.difficulty}</TableCell>
                  <TableCell>{level.grid}</TableCell>
                  <TableCell>{level.unlimited ? "true" : "false"}</TableCell>
                  <TableCell>{level.author}</TableCell>
                  <TableCell>
                    <TableCell>
                      {level.publishDate instanceof Timestamp
                        ? level.publishDate.toDate().toLocaleDateString()
                        : ""}
                    </TableCell>
                  </TableCell>
                  <TableCell>
                    {/* Actions column */}
                    {/* Visit Level Button */}
                   
                    <Link
                    href={`/level/${level.id}`}
                    > <Button >
                    Visit Level
                  </Button></Link>
                    {/* Delete Level Button */}
                    <Button onClick={() => handleDeleteLevel(level.id)}>
                      Delete Level
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
                  }
                  //   disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(2)}
                  isActive={currentPage === 2}
                >
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(3)}
                  isActive={currentPage === 3}
                >
                  3
                </PaginationLink>
              </PaginationItem>
              {/* ... other pages ... */}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      Math.min(
                        prevPage + 1,
                        Math.ceil(levels.length / itemsPerPage)
                      )
                    )
                  }
                  //   disabled={
                  //    currentLevels.length < itemsPerPage ||
                  //    currentPage === Math.ceil(levels.length / itemsPerPage)
                  //  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
