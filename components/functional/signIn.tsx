"use client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useState } from "react";
import {
  setDoc,
  serverTimestamp,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db, storage, auth } from "@/firebase/firebase";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
interface UserFormProps {
  login: boolean;
  mobile: boolean;
}
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email format.",
  }),
  password: z.string().min(6),
  username: z.string().min(3),
});
const provider = new GoogleAuthProvider();

export const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const querySnapshot = await query(
      collection(db, "users"),
      where("uid", "==", user.uid)
    );
    const queryData = await getDocs(querySnapshot);

    if (queryData.empty) {
      const userData = {
        uid: user.uid,
        pfp: user.photoURL,
        username: user.displayName || "",
        lowercaseUsername: user.displayName?.toLowerCase(),
        dateOfRegistration: serverTimestamp(),
        badges: [],
        levels: [],
        likedLevels: [],
        completedLevels: [],
      };

      await setDoc(userDocRef, userData);
    }
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
};

export default function UserForm({ login, mobile }: UserFormProps) {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    login
      ? handleSignIn(values.email, values.password)
      : handleSignUp(values.email, values.password, values.username, photo);
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = await query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        const userData = {
          uid: user.uid,
          pfp: user.photoURL,
          username: user.displayName || "",
          lowercaseUsername: user.displayName?.toLowerCase(),
          dateOfRegistration: serverTimestamp(),
          badges: [],
          levels: [],
          likedLevels: [],
          completedLevels: [],
        };

        await setDoc(userDocRef, userData);
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    username: string,
    photo: File | null
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      let photoURL = "";
      if (photo) {
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(storageRef);
      }

      const userDocRef = doc(db, "users", user.uid);
      const querySnapshot = await query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const queryData = await getDocs(querySnapshot);

      if (queryData.empty) {
        const userData = {
          uid: user.uid,
          pfp: photoURL || "",
          username: username,
          lowercaseUsername: username.toLowerCase(),
          dateOfRegistration: serverTimestamp(),
          badges: [],
          levels: [],
          likedLevels: [],
          completedLevels: [],
        };

        await setDoc(userDocRef, userData);
      }
    } catch (error) {
      console.error("Sign-up failed:", error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger
          className={`bg-white text-sm   hover:bg-slate-50/90 ${
            mobile ? "py-1 ml-2 justify-start" : "py-3 justify-center"
          } text-black flex w-full rounded-md`}
        >
          <svg
            data-testid="geist-icon"
            height="24"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="24"
            className="mx-3"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 2.5L9.25 2.5V1H14C14.5523 1 15 1.44771 15 2L15 14C15 14.5523 14.5523 15 14 15H9.25V13.5H13.5L13.5 2.5ZM8.43934 7.24999L6.46967 5.28031L5.93934 4.74998L7 3.68932L7.53033 4.21965L10.6036 7.29288C10.9941 7.6834 10.9941 8.31657 10.6036 8.70709L7.53033 11.7803L7 12.3106L5.93934 11.25L6.46967 10.7197L8.43934 8.74999L1.75 8.74999H1V7.24999H1.75L8.43934 7.24999Z"
              fill="currentColor"
            ></path>
          </svg>
          {login ? "Вход с имейл" : "Регистрация с имейл"}
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <p className="text-5xl font-black mb-8">
              {login ? "Вход" : "Регистрация"}
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step == 1 && (
                <div className="flex flex-col gap-3 ">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Имейл</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@email.com"
                            {...field}
                            className="w-full p-2 rounded border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Парола</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="*******"
                            {...field}
                            className="w-full p-2 rounded border"
                            type="password"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step == 2 && (
                <div className="flex flex-col gap-3 ">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Име</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Георги"
                            {...field}
                            className="w-full p-2 rounded border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full">
                    <FormLabel>Снимка</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          e.target.files && setPhoto(e.target.files[0]);
                        }}
                        className="w-full p-2 rounded border"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </div>
              )}
              {!login && (
                <Button
                  type="button"
                  onClick={() => {
                    step == 1 ? setStep(2) : setStep(1);
                  }}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  {step == 1 ? "Продължи" : " Назад"}
                </Button>
              )}

              <Button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                {login ? "Вход" : "Регистрация"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
