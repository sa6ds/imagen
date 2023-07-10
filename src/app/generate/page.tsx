"use client";
import { useForm } from "react-hook-form";
import { useMutation } from "../../../convex/_generated/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const saveSketchMutation = useMutation("sketches:saveSketch");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    prompt: string;
  }>();

  return (
    <div className="min-h-[100vh]">
      <div className="container mx-auto px-12 py-12">
        <Navbar />
        <main className="flex dark:text-slate-300 min-h-screen flex-col items-center justify-between p-24">
          <form
            onSubmit={handleSubmit((formData) => {
              console.log(formData);
              saveSketchMutation(formData);
            })}
          >
            <input
              className="text-black border"
              {...register("prompt", { required: true })}
            />
            {errors.prompt && <span>This field is required</span>}
            <input type="submit" />
          </form>
        </main>
      </div>
      <Footer />
    </div>
  );
}
