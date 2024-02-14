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

  // Calculate total pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <>
      {mount && (
        <div>
          <Table className="mb-5" >
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-white">
                  Потребителски UID
                </TableHead>
                <TableHead className="text-center text-white">
                  Профилна Снимка
                </TableHead>
                <TableHead className="text-center text-white">
                  Потребителско Име
                </TableHead>
                <TableHead className="text-center text-white">
                  Дата на Регистрация
                </TableHead>

                <TableHead className="text-center text-white">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
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
          <Pagination >
            <PaginationContent className="cursor-pointer">
              <PaginationItem>
              <PaginationPrevious  className={`${currentPage === 1 && 'hidden'}`} onClick={() => setCurrentPage(currentPage - 1)} />

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
        <PaginationNext  className={`${currentPage === totalPages && 'hidden'}`} onClick={() => setCurrentPage(currentPage + 1)} />

              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
