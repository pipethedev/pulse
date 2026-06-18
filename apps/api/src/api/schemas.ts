import { z } from "zod";

export const createSiteSchema = z.object({
  url: z.string().url(),
});
