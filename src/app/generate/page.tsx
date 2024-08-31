"use client";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { RiseLoader } from "react-spinners";
import Filter from "bad-words";
import axios from "axios";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useAuthUser } from "../components/auth/useAuthUser";
import { db, storage } from "../Firebase";
import { Id } from "../../../convex/_generated/dataModel";

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

function GeneratePage() {
  const saveSketchMutation = useMutation(api.sketches.saveSketch);
  const sketchesQuery = useQuery(api.sketches.getSketches);
  const updateSketchResult = useMutation(api.sketches.updateSketchResult);
  const [hasError, setHasError] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filter = new Filter();
  const { user, logRejectedPrompt, logAcceptedPrompt } = useAuthUser();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{
    prompt: string;
  }>();

  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);

  const clearCanvasAndHistory = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      canvasRef.current.resetCanvas();
    }
  };

  const sortedSketches = (sketchesQuery ?? [])
    .sort((a, b) => {
      return b._creationTime - a._creationTime;
    })
    .slice(0, 5);

  const promptValue = watch("prompt");

  useEffect(() => {
    setCharCount(promptValue ? promptValue.length : 0);
  }, [promptValue]);

  const debouncedProfanityCheck = debounce((value: string) => {
    if (filter.isProfane(value.trim())) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, 300);

  useEffect(() => {
    if (promptValue) {
      debouncedProfanityCheck(promptValue);
    }
  }, [promptValue]);

  const downloadAndStoreImage = async (
    imageUrl: string,
    sketchId: string
  ): Promise<string> => {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");

      const base64Image = buffer.toString("base64");

      const storageRef = ref(storage, `sketches/${sketchId}`);
      await uploadString(storageRef, base64Image, "base64", {
        contentType: "image/jpeg",
      });

      const downloadURL = await getDownloadURL(storageRef);

      const sketchRef = doc(db, "sketches", sketchId);
      await updateDoc(sketchRef, { result: downloadURL });

      await updateSketchResult({
        sketchId: sketchId as Id<"sketches">,
        result: imageUrl,
        firebaseUrl: downloadURL,
      });

      return downloadURL;
    } catch (error) {
      throw new Error("Failed to download and store image");
    }
  };

  const handlePromptSubmit = async (formData: { prompt: string }) => {
    if (!user || !user.isActive) {
      alert("Your account is not active. Please contact support.");
      return;
    }

    if (!canvasRef.current) return;

    const prompt = formData.prompt.trim();

    if (filter.isProfane(prompt)) {
      setHasError(true);
      canvasRef.current?.clearCanvas();
      reset();
      const isStillActive = await logRejectedPrompt(prompt);
      if (!isStillActive) {
        alert(
          "Your account has been deactivated due to multiple violations. Please contact support."
        );
      }
      return;
    }

    setHasError(false);
    setIsLoading(true);

    try {
      const image = await canvasRef.current?.exportImage("jpeg");

      const replicateResponse = await saveSketchMutation({
        ...formData,
        image,
      });

      const typedResponse = replicateResponse as unknown as {
        result: string;
        _id: string;
      };

      if (typedResponse.result && typedResponse._id) {
        await downloadAndStoreImage(typedResponse.result, typedResponse._id);
      }

      await logAcceptedPrompt(formData.prompt);
      clearCanvasAndHistory();
      reset();
    } catch (error) {
      alert(
        "An error occurred while submitting your prompt. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (
      ["c", "z", "x"].includes(e.key.toLowerCase()) &&
      !e.metaKey &&
      !e.ctrlKey
    ) {
      e.preventDefault();

      switch (e.key.toLowerCase()) {
        case "c":
          canvasRef.current?.clearCanvas();
          setActiveButton("clear");
          setTimeout(() => setActiveButton(null), 200);
          break;
        case "z":
          canvasRef.current?.undo();
          setActiveButton("undo");
          setTimeout(() => setActiveButton(null), 200);
          break;
        case "x":
          canvasRef.current?.redo();
          setActiveButton("redo");
          setTimeout(() => setActiveButton(null), 200);
          break;
      }
    }
  };

  const handleButtonClick = (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveButton(action);
    setTimeout(() => setActiveButton(null), 200);
    switch (action) {
      case "clear":
        clearCanvasAndHistory();
        break;
      case "undo":
        canvasRef.current?.undo();
        break;
      case "redo":
        canvasRef.current?.redo();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="sm:container mx-auto py-12 flex flex-col items-center justify-between pt-8 dark:text-slate-200">
      <Head>
        <title>Generate | Imagen</title>
      </Head>

      <div className="container mx-auto lg:flex lg:gap-16">
        <div className="lg:w-[300px] flex-shrink-0 mb-10 lg:mb-0">
          <form
            className="flex flex-col gap-2 w-fit mx-auto"
            onSubmit={handleSubmit(handlePromptSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handlePromptSubmit)();
              }
            }}
          >
            <label htmlFor="prompt" className="font-semibold">
              Prompt
            </label>
            {hasError && (
              <div className="bg-red-300 rounded-lg p-3">
                <p className="text-red-800">
                  &#x2022; Your prompt contains inappropriate words.
                </p>
              </div>
            )}
            <div className="relative">
              <input
                id="prompt"
                maxLength={60}
                required
                className="rounded-md text-slate-700 focus:shadow-lg shadow-md p-2 border pr-16"
                {...register("prompt", { required: true })}
                aria-label="Enter your prompt"
              />
              <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm text-gray-500">
                {charCount}/60
              </span>
            </div>
            <label htmlFor="canvas-container" className="font-semibold">
              Canvas (Draw something below)
            </label>
            <div
              id="canvas-container"
              tabIndex={0}
              className="focus:outline-none"
            >
              <ReactSketchCanvas
                ref={canvasRef}
                className="border shadow-md rounded-sm"
                style={{ width: 256, height: 256 }}
                strokeWidth={4}
                strokeColor="black"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleButtonClick("undo", e)}
                title="Undo last stroke (Z)"
                className={`btn text-slate-700 mt-4 bg-white rounded-md hover:shadow-lg shadow-md p-2 flex-1 transition-colors duration-200 ${
                  activeButton === "undo" ? "btn-active" : ""
                }`}
              >
                Undo
              </button>
              <button
                onClick={(e) => handleButtonClick("redo", e)}
                title="Redo last undone stroke (X)"
                className={`btn text-slate-700 mt-4 bg-white rounded-md hover:shadow-lg shadow-md p-2 flex-1 transition-colors duration-200 ${
                  activeButton === "redo" ? "btn-active" : ""
                }`}
              >
                Redo
              </button>
              <button
                onClick={(e) => handleButtonClick("clear", e)}
                title="Clear canvas (C)"
                className={`btn text-slate-700 mt-4 bg-white rounded-md hover:shadow-lg shadow-md p-2 flex-1 transition-colors duration-200 ${
                  activeButton === "clear" ? "btn-active" : ""
                }`}
              >
                Clear
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`hover:shadow-lg cursor-pointer shadow-md relative w-full border-grey-100 mx-auto rounded-lg border-b-4 border-orange-700 bg-gradient-to-b from-orange-500 to-red-500 px-8 py-1 text-white ease-in-out ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Submit (Enter)"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        <section className="flex-grow">
          <h2 className="font-semibold text-center mb-4 lg:mb-2 lg:text-left">
            Latest Sketches
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSketches.map((sketch) =>
              sketch && sketch.result ? (
                <div
                  key={sketch._id.toString()}
                  className="shadow-lg relative group aspect-square w-full"
                >
                  {sketch.result ? (
                    <Image
                      src={`data:image/jpeg;base64,${sketch.result}`}
                      alt={`Sketch of ${sketch.prompt}`}
                      layout="fill"
                      objectFit="cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <RiseLoader color="#f97316" speedMultiplier={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-white text-center p-2">
                      {sketch.prompt}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-square w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                  key={sketch._id.toString()}
                >
                  <RiseLoader color="#f97316" speedMultiplier={1} />
                </div>
              )
            )}
            <Link
              href={"/collection"}
              className="aspect-square w-full flex items-center justify-center transition duration-50 ease-in-out delay-100 text-white bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg"
            >
              <div className="text-lg font-semibold">View Collection -&gt;</div>
            </Link>
          </div>
        </section>
      </div>

      {/* Help button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-5 right-5 bg-gradient-to-b from-orange-500 to-red-500 border-orange-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors duration-200"
        aria-label="Keyboard Shortcuts"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-xs sm:max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Keyboard Shortcuts
            </h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center">
                <span className="border border-orange-500 rounded px-2 font-mono font-semibold mr-3">
                  Z
                </span>
                <span>Undo last stroke</span>
              </li>
              <li className="flex items-center">
                <span className="border border-orange-500 rounded px-2 font-mono font-semibold mr-3">
                  X
                </span>
                <span>Redo last undone stroke</span>
              </li>
              <li className="flex items-center">
                <span className="border border-orange-500 rounded px-2 font-mono font-semibold mr-3">
                  C
                </span>
                <span>Clear canvas</span>
              </li>
              <li className="flex items-center">
                <span className="border border-orange-500 rounded px-2 py-0.5 font-mono font-semibold mr-3 text-sm">
                  Enter
                </span>
                <span>Submit prompt</span>
              </li>
            </ul>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-white mt-6 bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default GeneratePage;
