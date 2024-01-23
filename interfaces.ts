import { Timestamp, FieldValue } from "firebase/firestore";

export interface Level {
  id: number;
  seed: string;
  publishDate: Timestamp | FieldValue;
  grid: string;
  name: string;
  author: string;
  authorUID: string;
  tags: string[];
  imgURL: string;
  description: string;
  difficulty: string;
  unlimited: boolean;
}

export interface User {
  uid: string;
  pfp: string;
  username: string;
  dateOfRegistration: Timestamp | FieldValue;
  badges: string[];
  levels: number[];
}
