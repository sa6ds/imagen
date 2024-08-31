"use node";
import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import Replicate from "replicate";
import { internal } from "./_generated/api";

type ReplicateResponse = [string, string];

export const generate = internalAction({
  args: { sketchId: v.id("sketches"), prompt: v.string(), image: v.string() },
  handler: async (ctx, { prompt, image, sketchId }) => {
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

      const generatedImageUrl = output[1];

      const response = await fetch(generatedImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      await ctx.runMutation(internal.sketches.internalUpdateSketchResult, {
        sketchId,
        result: base64Image,
        firebaseUrl: generatedImageUrl,
      });

      return { generatedImageUrl: `data:image/png;base64,${base64Image}` };
    } catch (error) {
      console.error("Error in generate function:", error);
      throw new Error("Failed to generate image");
    }
  },
});
