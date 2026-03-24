import { z } from "zod";

export const contactInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  location: z.string().optional(),
});

export const workExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

export const resumeDataSchema = z.object({
  contactInfo: contactInfoSchema,
  summary: z.string(),
  experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  certifications: z.array(z.string()).optional(),
  rawText: z.string(),
});

export const jobDescriptionSchema = z.object({
  title: z.string(),
  company: z.string(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  rawText: z.string(),
});

export const linkedInTipSchema = z.object({
  section: z.string(),
  current: z.string().optional(),
  suggested: z.string(),
  reason: z.string(),
});

export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  keywordGaps: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  strengthAreas: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  optimizedResume: resumeDataSchema,
  linkedinSuggestions: z.array(linkedInTipSchema),
});
