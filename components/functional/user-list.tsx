import React, { useState, useEffect } from "react";
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
import { User } from "@/interfaces";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import Image from "next/image";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mount, setMount] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const newUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          newUsers.push({
            ...doc.data(),
          } as User);
        });
        setUsers(newUsers);
        setMount(true);
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (mount) {
      const filteredUsers = users.filter((user) => {
        return (
          user.uid.includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.dateOfRegistration instanceof Timestamp &&
            user.dateOfRegistration
              .toDate()
              .toLocaleDateString()
              .includes(searchTerm))
        );
      });
      setCurrentUsers(filteredUsers.slice(indexOfFirstItem, indexOfLastItem));
    }
  }, [currentPage, searchTerm, users, mount]);

  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handleDeleteuser = async (userId: string) => {
    try {
      const userIndex = currentUsers.findIndex((user) => user.uid === userId);
      if (userIndex !== -1) {
        const newBanStatus = !currentUsers[userIndex].isBanned;

        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          isBanned: newBanStatus,
        });

        setCurrentUsers((prevUsers) => {
          const updatedUsers = [...prevUsers];
          updatedUsers[userIndex].isBanned = newBanStatus;
          return updatedUsers;
        });
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

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
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-white">
                  User UID
                </TableHead>
                <TableHead className="text-center text-white">
                  Profile Picture
                </TableHead>
                <TableHead className="text-center text-white">
                  Username
                </TableHead>
                <TableHead className="text-center text-white">
                  Date of Registration
                </TableHead>
                <TableHead className="text-center text-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell>
                    <Image
                      src={user.pfp}
                      width={100}
                      height={100}
                      className="w-32"
                      alt=""
                    />
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.dateOfRegistration instanceof Timestamp
                      ? user.dateOfRegistration.toDate().toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Link className="mb-3 flex" href={`/profile/${user.uid}`}>
                      <Button>Visit user</Button>
                    </Link>
                    <Button onClick={() => handleDeleteuser(user.uid)}>
                      {user.isBanned ? "Unban User" : "Ban User"}
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
        </div>
      )}
    </>
  );
}
