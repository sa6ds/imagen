import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSketch = mutation({
  args: { prompt: v.string(), image: v.string() },
  handler: async (ctx, { prompt, image }) => {
    console.log("Saving sketch");
    const sketch = await ctx.db.insert("sketches", {
      prompt,
    });

    await ctx.scheduler.runAfter(0, internal.generate.generate, {
      sketchId: sketch,
      prompt,
      image,
    });

    console.log("Sketch saved, ID:", sketch);
    return sketch;
  },
});

export const getSketch = query({
  args: { sketchId: v.id("sketches") },
  handler: (ctx, { sketchId }) => {
    console.log("Getting sketch, ID:", sketchId);
    if (!sketchId) return null;
    return ctx.db.get(sketchId);
  },
});

export const updateSketchResult = mutation({
  args: {
    sketchId: v.id("sketches"),
    result: v.string(),
    firebaseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sketchId, {
      result: args.result,
      firebaseUrl: args.firebaseUrl,
    });
  },
});

export const internalUpdateSketchResult = internalMutation({
  args: {
    sketchId: v.id("sketches"),
    result: v.string(),
    firebaseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Updating sketch result:", args);
    await ctx.db.patch(args.sketchId, {
      result: args.result,
      firebaseUrl: args.firebaseUrl,
    });
    console.log("Sketch updated successfully");
  },
});

export const getSketches = query({
  handler: async (ctx) => {
    console.log("Getting all sketches");
    const sketches = await ctx.db.query("sketches").collect();
    console.log("Number of sketches retrieved:", sketches.length);
    return sketches;
  },
});
