import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./client.js";
import { config } from "../config/index.js";

const PNG_CONTENT_TYPE = "image/png";

export function screenshotKey(siteId: string, checkedAt: Date): string {
  return `screenshots/${siteId}/${checkedAt.getTime()}.png`;
}

export async function uploadScreenshot(
  key: string,
  png: Buffer,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.S3_BUCKET,
      Key: key,
      Body: png,
      ContentType: PNG_CONTENT_TYPE,
    }),
  );
}

export function screenshotUrl(key: string | null): string | null {
  if (!key) return null;
  return new URL(key, `${config.PUBLIC_ASSET_BASE_URL}/`).toString();
}
