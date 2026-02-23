import { z } from "zod";

export const startVerificationSchema = z.object({
  phone: z.string().min(8).max(20),
});

export const completeRegistrationSchema = z.object({
  token: z.string().uuid(),
  name: z.string().min(2).max(40),
});

export const createDailyDuoSchema = z.object({
  caption: z.string().max(140).optional(),
});

export const icebreakerSchema = z.object({
  user1: z.object({
    id: z.string().uuid(),
    name: z.string(),
    interests: z.array(z.string()),
  }),
  user2: z.object({
    id: z.string().uuid(),
    name: z.string(),
    interests: z.array(z.string()),
  }),
  context: z.string().max(500).optional(),
});

export const faceValidateSchema = z.object({
  imageUrl: z.string().url().optional(),
  base64: z.string().min(50).optional(),
});
