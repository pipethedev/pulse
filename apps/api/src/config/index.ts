import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().url(),
  BRIMBLE_SANDBOX_KEY: z.string().min(1),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  PUBLIC_ASSET_BASE_URL: z.string().url(),
  SANDBOX_TEMPLATE: z.string().default("node-22"),
  SANDBOX_REGION: z.string().default("auto"),
});

export type Config = z.infer<typeof schema>;

export const config: Config = schema.parse(process.env);
