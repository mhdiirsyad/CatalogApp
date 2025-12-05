import { DeleteObjectCommand, DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

import env from "~/lib/env";

function getS3Client() {
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_ENDPOINT.includes("localhost"),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });
}

export async function deleteImageFromS3(key: string) {
  const client = getS3Client();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    );
    return true;
  }
  catch (error) {
    console.error(`Failed to delete image ${key} from S3:`, error);
    return false;
  }
}

export async function deleteImagesFromS3(keys: string[]) {
  if (keys.length === 0)
    return true;

  const client = getS3Client();

  try {
    await client.send(
      new DeleteObjectsCommand({
        Bucket: env.S3_BUCKET,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
        },
      }),
    );
    return true;
  }
  catch (error) {
    console.error("Failed to delete images from S3:", error);
    return false;
  }
}
