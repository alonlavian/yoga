import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  knownIssues: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
});

export const timelineEntrySchema = z.object({
  studentId: z.number().int().positive(),
  type: z.enum(["note", "class", "plan_attachment"]),
  date: z.string().min(1, "Date is required"),
  content: z.string().optional().or(z.literal("")),
  duration: z.number().int().positive().optional(),
  classPlanId: z.number().int().positive().optional().nullable(),
  summary: z.string().optional().or(z.literal("")),
});

export const classPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  items: z.array(
    z.object({
      poseName: z.string().min(1, "Pose name is required"),
      duration: z.string().optional().or(z.literal("")),
      notes: z.string().optional().or(z.literal("")),
      orderIndex: z.number().int().min(0),
    })
  ),
});

export const chatMessageSchema = z.object({
  studentId: z.number().int().positive(),
  content: z.string().min(1, "Message is required"),
});

export const settingsUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type TimelineEntryInput = z.infer<typeof timelineEntrySchema>;
export type ClassPlanInput = z.infer<typeof classPlanSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
