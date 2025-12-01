import z from "zod";

export const NameSchema = z.string().min(1).max(100);
export const DesctriptionSchema = z.string().max(255).or(z.null());
