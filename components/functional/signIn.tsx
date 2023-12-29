import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";

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
interface UserFormProps {
  login: boolean;
}
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email format.",
  }),
  password: z.string().min(6),
});

export default function UserForm({ login }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    login
      ? handleSignIn(values.email, values.password)
      : handleSignUp(values.email, values.password);
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
