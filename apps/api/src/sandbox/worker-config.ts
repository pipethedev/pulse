import { z } from "zod";
import { SandboxMode } from "../types/enums.js";

const workerSchema = z.object({
  SANDBOX_MODE: z.nativeEnum(SandboxMode).default(SandboxMode.OneShot),
  CHECK_INTERVAL_MINUTES: z.coerce.number().positive().default(15),
});

export const workerConfig = workerSchema.parse(process.env);
