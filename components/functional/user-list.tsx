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
import { User } from "@/interfaces";
import { useRouter } from "next/navigation";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "../ui/button";
export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mount, setMount] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const FetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const newUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          newUsers.push({
            ...doc.data(),
          } as User);
        });
        setUsers(newUsers);
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };
    setMount(true);
    FetchUsers();
  }, []);

  const handleVisituser = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleDeleteuser = (userId: string) => {
    alert(`Banning user ${userId}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      {mount && (
        <div >
          <Table >
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-white">
                  User UID
                </TableHead>
                <TableHead className="text-center text-white">
                  User PFP
                </TableHead>
                <TableHead className="text-center text-white">
                  Username
                </TableHead>
                <TableHead className="text-center text-white">
                  Register Data
                </TableHead>

                <TableHead className="text-center text-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {" "}
              {currentUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell>
                    <img src={user.pfp} alt="" />
                  </TableCell>

                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.dateOfRegistration instanceof Timestamp
                      ? user.dateOfRegistration.toDate().toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    {/* Actions column */}
                    {/* Visit user Button */}
                    <Button onClick={() => handleVisituser(user.uid)}>
                      Visit user
                    </Button>
                    {/* Warn user Button */}

                    <Button onClick={() => handleDeleteuser(user.uid)}>
                      Ban User
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
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      Math.min(
                        prevPage + 1,
                        Math.ceil(users.length / itemsPerPage)
                      )
                    )
                  }
                  //   disabled={
                  //    currentusers.length < itemsPerPage ||
                  //    currentPage === Math.ceil(users.length / itemsPerPage)
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
