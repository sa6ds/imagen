"use node";

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import Replicate from "replicate";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { DataModel } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { updateSketchResult } from "./sketches";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

type ReplicateResponse = [string, string];

export const generate = internalAction({
  args: { sketchId: v.id("sketches"), prompt: v.string(), image: v.string() },
  handler: async (ctx, { prompt, image, sketchId }) => {
    console.log("Starting generate function");

    try {
      if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error(
          "Add REPLICATE_API_TOKEN to your environment variables: " +
            "https://docs.convex.dev/production/environment-variables"
        );
      }
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      console.log("Calling Replicate API");
      const output = (await replicate.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        {
          input: {
            image,
            scale: 7,
            prompt,
            image_resolution: "512",
            n_prompt:
              "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
          },
        }
      )) as ReplicateResponse;

      console.log("Replicate API call completed");

      const generatedImageUrl = output[1];
      console.log("Generated image URL:", generatedImageUrl);

      const response = await fetch(generatedImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      // Save the image data to Convex
      await ctx.runMutation(internal.sketches.internalUpdateSketchResult, {
        sketchId,
        result: base64Image,
        firebaseUrl: generatedImageUrl,
      });
      console.log("Sketch result updated in database");

      return { generatedImageUrl: `data:image/png;base64,${base64Image}` };
    } catch (error) {
      console.error("Error in generate function:", error);
      throw new Error("Failed to generate image");
    }
  },
});
