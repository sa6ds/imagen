"use client";

import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

import { RiseLoader } from "react-spinners";

export default function Home() {
  const sketches = useQuery(api.sketches.getSketches);

  const sortedSketches = (sketches ?? []).sort((a, b) => {
    return b._creationTime - a._creationTime;
  });

  return (
    <main className="container mx-auto px-16 py-12 flex flex-col items-center justify-between">
      <h2 className="mb-12 text-center dark:text-white text-slate-900 text-2xl font-semibold">
        Community Sketches
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {sortedSketches.map((sketch) => (
          <div className="w-64" key={sketch._id.toString()}>
            {sketch.result && sketch ? (
              <Image
                width="256"
                height="256"
                src={sketch.result}
                alt={`Sketch of ${sketch.prompt}`}
              />
            ) : (
              <div
                className="border h-[256px] rounded-sm dark:border-slate-500 flex flex-col w-[256px] items-center justify-center"
                key={sketch._id.toString()}
              >
                <RiseLoader color="#f97316" speedMultiplier={1} />
              </div>
            )}
            {sketch.prompt && <p className="text-center">{sketch.prompt}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
