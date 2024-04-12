import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
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
import { db } from "@/firebase/firebase";
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
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
const storage = getStorage();
interface UserFormProps {
  login: boolean;
}
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email format.",
  }),
  password: z.string().min(6),
  username: z.string().min(3),
  photo: z.instanceof(File).optional(),
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

export default function UserForm({ login }: UserFormProps) {
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      photo: undefined,
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    login
      ? handleSignIn(values.email, values.password)
      : handleSignUp(
          values.email,
          values.password,
          values.username,
          values.photo
        );
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
    photo: File | undefined
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
        <DialogTrigger className="dark:bg-white mb-5 dark:text-black text-sm text-white bg-slate-900 dark:hover:bg-slate-50/90 hover:bg-slate-900/90 w-full py-2 rounded-md">
          {login ? "Вход с имейл и парола" : "Регистрация с имейл и парола"}
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <p className="text-5xl font-black mb-8">
              {login ? "Вход" : "Регистрация"}
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step == 1 && (
                <div className="flex flex-row gap-3 ">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
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
                      <FormItem className="w-1/2">
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
                <div className="flex flex-row gap-3 ">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
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

                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Снимка</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files &&
                              field.onChange(e.target.files[0])
                            }
                            onBlur={field.onBlur}
                            className="w-full p-2 rounded border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
