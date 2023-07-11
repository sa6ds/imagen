"use client";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "../../../convex/_generated/react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { RiseLoader } from "react-spinners";
import Link from "next/link";
import Filter from "bad-words";

export default function Home() {
  const saveSketchMutation = useMutation("sketches:saveSketch");
  const sketchesQuery = useQuery("sketches:getSketches");
  const [hasError, setHasError] = useState(false);
  const filter = new Filter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    prompt: string;
  }>();

  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const sortedSketches = (sketchesQuery ?? [])
    .sort((a, b) => {
      return b._creationTime - a._creationTime;
    })
    .slice(0, 7);

  return (
    <main className="container mx-auto px-16 py-12 flex flex-col items-center justify-between pt-8 dark:text-slate-200">
      <Head>
        <title>Generate | Imagen</title>
      </Head>
      <div className="container mx-auto lg:flex gap-16">
        <form
          className="flex flex-col gap-2 w-fit mx-auto"
          onSubmit={handleSubmit(async (formData) => {
            if (!canvasRef.current) return;

            const prompt = formData.prompt.trim();

            if (filter.isProfane(prompt)) {
              setHasError(true);
              return;
            }

            setHasError(false);

            const image = await canvasRef.current?.exportImage("jpeg");
            const results = await saveSketchMutation({ ...formData, image });
          })}
        >
          <span className="text-slate-700 dark:text-slate-200">Prompt</span>
          {hasError && (
            <div className="bg-red-300 rounded-lg p-3">
              <p className="text-red-800">
                &#x2022; Your prompt contains bad words.
              </p>
            </div>
          )}
          <input
            required
            className="rounded-md focus:shadow-lg shadow-md p-2 text-slate-900 border"
            {...register("prompt", { required: true })}
          />
          <span>Canvas (Draw something below)</span>
          <ReactSketchCanvas
            ref={canvasRef}
            className="border shadow-md rounded-sm"
            style={{ width: 256, height: 256 }}
            strokeWidth={4}
            strokeColor="black"
          />
          <button
            className="text-slate-700 mt-4 bg-white rounded-md hover:shadow-lg  shadow-md p-2"
            type="button"
            onClick={() => {
              canvasRef.current?.clearCanvas();
            }}
          >
            Clear
          </button>
          <input
            type="submit"
            className="hover:shadow-lg  shadow-md relative w-full border-grey-100 mx-auto rounded-lg border-b-4 border-orange-700 bg-gradient-to-b from-orange-500 to-red-500 px-8 py-1 text-white ease-in-out"
          ></input>
        </form>

        <section className="mt-10 lg:mt-0">
          <h2 className="text-center mb-4 lg:mb-2 lg:text-left">
            Latest Sketches
          </h2>
          <div className="flex flex-wrap justify-center lg:justify-normal gap-4 ">
            {sortedSketches.map((sketch) =>
              sketch && sketch.result ? (
                <div key={sketch._id.toString()} className="shadow-lg">
                  <Image
                    width="256"
                    height="256"
                    src={sketch.result}
                    alt={`Sketch of ${sketch.prompt}`}
                  />
                </div>
              ) : (
                <div
                  className="border rounded-sm dark:border-slate-500 flex flex-col w-[256px] items-center justify-center"
                  key={sketch._id.toString()}
                >
                  <RiseLoader color="#f97316" speedMultiplier={1} />
                </div>
              )
            )}
            <Link
              href={"/collection"}
              type="button"
              className="transition duration-50 ease-in-out delay-100 text-white bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg px-5 py-2 text-base flex text-center w-[256px] h-[256px] flex-col justify-center gap-4"
            >
              <div className="flex flex-col justify-center">
                <div className="text-lg">View Collection -&gt;</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
