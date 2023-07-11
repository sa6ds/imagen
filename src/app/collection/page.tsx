"use client";

import Image from "next/image";
import { useQuery } from "../../../convex/_generated/react";

export default function Home() {
  const saveSketchMutation = useQuery("sketches:getSketches");

  const sortedSketches = (saveSketchMutation ?? []).sort((a, b) => {
    return b._creationTime - a._creationTime;
  });

  return (
    <main className="dark:text-slate-200 container mx-auto px-16 py-12 flex flex-col items-center justify-between">
      <h2 className="mb-12 text-2xl">Community Sketches</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {sortedSketches.map((sketch) => (
          <div className="w-64" key={sketch._id.toString()}>
            {sketch.result && (
              <Image
                width="256"
                height="256"
                src={sketch.result}
                alt={`Sketch of ${sketch.prompt}`}
              />
            )}
            {sketch.prompt && <p>{sketch.prompt}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
