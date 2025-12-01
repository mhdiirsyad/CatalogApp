import db from "~/lib/db";
import { InsertSeller, sellers } from "~/lib/db/schema/seller";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertSeller.safeParse);

  if (!result.success) {
    const statusMessage = result.error.issues.map(issue =>
      `${issue.path.join("")}: ${issue.message}`).join("; ");
    const data = result.error.issues.reduce((errors, issue) => {
      errors[issue.path.join("")] = issue.message;
      return errors;
    }, {} as Record<string, string>);
    sendError(event, createError({
      statusCode: 422,
      statusMessage,
      data,
    }));
  }

  const hashedPasword = await hashPassword(result.data?.password || "");
  const [inserted] = await db.insert(sellers).values({ ...result.data as any, password: hashedPasword }).returning();
  return inserted;
});
