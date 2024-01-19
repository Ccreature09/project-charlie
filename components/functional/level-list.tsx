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
import { Level } from "@/interfaces";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Button } from "../ui/button";
export default function LevelList() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);

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

    fetchLevels();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  const handleVisitLevel = (levelId: number) => {
    router.push(`/level/${levelId}`);
  };

  const handleWarnLevel = (levelId: number) => {
    // Implement your custom warning logic here
    alert(`Warning: This is a custom warning for level ${levelId}`);
  };

  const handleDeleteLevel = (levelId: number) => {
    // Implement your delete level logic here
    alert(`Deleting level ${levelId}`);
    // You may want to trigger an API call or state update to delete the level
  };

  return (
    <Table className="w-full">
      <TableCaption>A list of your levels.</TableCaption>
      <TableHeader className="w-full">
        <TableRow className="w-full mx-auto">
          <TableHead className="text-center text-white">Level ID</TableHead>
          <TableHead className="text-center text-white">Image</TableHead>
          <TableHead className="text-center text-white">Name</TableHead>
          <TableHead className="text-center text-white">Tags</TableHead>
          <TableHead className="text-center text-white">Difficulty</TableHead>
          <TableHead className="text-center text-white">Grid Size</TableHead>
          <TableHead className="text-center text-white">Unlimited</TableHead>
          <TableHead className="text-center text-white">Author</TableHead>
          <TableHead className="text-center text-white">Publish Date</TableHead>
          <TableHead className="text-center text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {" "}
        {levels.map((level) => (
          <TableRow key={level.id}>
            <TableCell>{level.id}</TableCell>
            {/* Image column */}
            <TableCell>
              <img
                src={`https://example.com/${level.imgURL}`}
                alt="Level Image"
                className="w-8 h-8"
              />
            </TableCell>
            <TableCell>{level.name}</TableCell>
            <TableCell>{level.tags.join(", ")}</TableCell>
            <TableCell>{level.difficulty}</TableCell>
            <TableCell>{level.grid}</TableCell>
            <TableCell>{level.unlimited ? "true" : "false"}</TableCell>
            <TableCell>{level.author}</TableCell>
            <TableCell>{level.publishDate.toString()}</TableCell>
            <TableCell>
              {/* Actions column */}
              {/* Visit Level Button */}
              <Button onClick={() => handleVisitLevel(level.id)}>
                Visit Level
              </Button>
              {/* Warn Level Button */}
              <Button onClick={() => handleWarnLevel(level.id)}>
                Warn User
              </Button>
              {/* Delete Level Button */}
              <Button onClick={() => handleDeleteLevel(level.id)}>
                Delete Level
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
