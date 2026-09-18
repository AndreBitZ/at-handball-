#!/usr/bin/env node
// Build command used by Vercel (see vercel.json → buildCommand).
//
// Two modes:
//  1. CONVEX_DEPLOY_KEY is set (recommended): `convex deploy` pushes the
//     backend functions to the production Convex deployment AND exposes the
//     deployment URL to `vite build` as VITE_CONVEX_URL, then builds the
//     frontend. Zero manual env-var wiring after the key is pasted once.
//  2. No key yet: build the frontend anyway so the deploy never fails —
//     the app shows friendly setup instructions until the key is added.
import { spawnSync } from "node:child_process";

const useConvex = Boolean(process.env.CONVEX_DEPLOY_KEY);

const args = useConvex
  ? ["convex", "deploy", "--cmd", "vite build", "--cmd-url-env-var-name", "VITE_CONVEX_URL"]
  : ["vite", "build"];

if (!useConvex) {
  console.warn(
    "[vercel-build] CONVEX_DEPLOY_KEY not set — building frontend only. " +
      "The site will deploy but show setup instructions until the Convex deploy key is added in Vercel settings.",
  );
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
