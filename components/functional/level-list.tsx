import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { User, Level } from "@/interfaces";
import { useRouter } from "next/navigation";
import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "../ui/button";
import Link from "next/link";
import { Input } from "../ui/input";
export default function LevelList() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mount, setMount] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
        newLevels.sort((a, b) => a.id - b.id);
        setLevels(newLevels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };
    setMount(true);
    fetchLevels();
  }, []);

  const handleDeleteLevel = async (levelId: number, authorUID: string) => {
    try {
      const levelsQuery = query(
        collection(db, "levels"),
        where("id", "==", levelId)
      );
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", authorUID)
      );
      const usersQuery = query(collection(db, "users"));

      const usersQuerySnapshot = await getDocs(usersQuery);

      const levelsQuerySnapshot = await getDocs(levelsQuery);
      const userQuerySnapshot = await getDocs(userQuery);

      if (!levelsQuerySnapshot.empty) {
        const levelDocRef = doc(db, "levels", levelsQuerySnapshot.docs[0].id);
        await deleteDoc(levelDocRef);
      }
      if (!userQuerySnapshot.empty) {
        const userDocRef = doc(db, "users", userQuerySnapshot.docs[0].id);

        const userData = userQuerySnapshot.docs[0].data();
        const currentLevels = userData.levels;

        const updatedLevels = currentLevels.filter(
          (id: number) => id !== levelId
        );

        await updateDoc(userDocRef, { levels: updatedLevels });
      } else {
      }
      if (!usersQuerySnapshot.empty) {
        usersQuerySnapshot.forEach(async (userDoc) => {
          const userDocRef = doc(db, "users", userDoc.id);
          const userData = userDoc.data() as User;

          if (userData.likedLevels?.includes(levelId)) {
            const updatedLikedLevels = userData.likedLevels.filter(
              (id: number) => id !== levelId
            );
            await updateDoc(userDocRef, { likedLevels: updatedLikedLevels });
          } else {
          }
          if (userData.completedLevels?.includes(levelId)) {
            const updatedCompletedLevels = userData.completedLevels.filter(
              (id: number) => id !== levelId
            );
            await updateDoc(userDocRef, {
              completedLevels: updatedCompletedLevels,
            });
          } else {
          }
        });
      } else {
      }
      setLevels((prevLevels) =>
        prevLevels.filter((level) => level.id !== levelId)
      );
    } catch (error) {
      console.error("Error deleting level:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredLevels = levels.filter((level) => {
    return (
      level.id.toString().includes(searchTerm) ||
      level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.tags.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.grid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (level.publishDate instanceof Timestamp &&
        level.publishDate.toDate().toLocaleDateString().includes(searchTerm))
    );
  });

  const currentLevels = filteredLevels.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);

  return (
    <>
      {mount && (
        <div>
          <Input
            type="text"
            className="mb-10 w-1/2 flex mx-auto"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table className="mb-5">
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
                  <TableCell>{level.author}</TableCell>
                  <TableCell>
                    <TableCell>
                      {level.publishDate instanceof Timestamp
                        ? level.publishDate.toDate().toLocaleDateString()
                        : ""}
                    </TableCell>
                  </TableCell>
                  <TableCell>
                    <Link className="mb-3 flex" href={`/level/${level.id}`}>
                      <Button>Посети ниво</Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button className="bg-red-500 w-full flex my-3 lg:my-auto">
                          Изтрий ниво
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Сигурен ли сте, че искате да изтриете това ниво?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            След изтриването на нивото, то не може да се
                            възтанови!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Назад</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500"
                            onClick={() => {
                              handleDeleteLevel(level.id, level.authorUID);
                            }}
                          >
                            Изтрий ниво
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination className="">
            <PaginationContent className="cursor-pointer">
              <PaginationItem>
                <PaginationPrevious
                  className={`${currentPage === 1 && "hidden"}`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
              </PaginationItem>
              {/* Generate pagination links dynamically */}
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
        </div>
      )}
    </>
  );
}
