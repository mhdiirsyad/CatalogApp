import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import env from "~/lib/env";

const MAX_IMAGE_SIZE = 1024 * 1024;

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const formData = await readFormData(event);
  const file = formData.get("file") as File;

  if (!file || !file.type.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid file type. Only images are allowed.",
    });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `File size exceeds maximum of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    });
  }

  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_ENDPOINT.includes("localhost"),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });

  const filename = crypto.randomUUID();
  const key = `${(session.user as any).id}/${filename}.jpeg`;

  const arrayBuffer = await file.arrayBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: new Uint8Array(arrayBuffer),
      ContentType: "image/jpeg",
    }),
  );

  return {
    key,
  };
});
