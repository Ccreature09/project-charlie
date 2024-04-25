import { Timestamp, FieldValue } from "firebase/firestore";

export interface Level {
  id: number;
  likes: number;
  seed: string;
  grid: string;
  name: string;
  lowercaseName: string;
  author: string;
  authorUID: string;
  pfp: string;
  imgURL: string;
  description: string;
  difficulty: string;
  tags: string[];
  publishDate: Timestamp | FieldValue;
}

export interface User {
  uid: string;
  pfp: string;
  username: string;
  lowercaseUsername: string;
  badges: string[];
  levels: number[];
  draftLevel: Level;
  completedLevels: number[];
  likedLevels: number[];
  dateOfRegistration: Timestamp | FieldValue;
  isBanned: boolean;
}
