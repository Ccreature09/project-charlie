import { Timestamp, FieldValue } from "firebase/firestore";

export interface Level {
  id: number;
  seed: string;
  publishDate: Timestamp | FieldValue;
  grid: string;
  name: string;
  author: string;
  authorUid: string;
  tags: string[];
  imgURL: string;
  description: string;
  difficulty: string;
  unlimited: boolean;
}
