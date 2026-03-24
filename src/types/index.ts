export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface ResumeData {
  contactInfo: ContactInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
  rawText: string;
}

export interface JobDescription {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  rawText: string;
}

export interface LinkedInTip {
  section: string;
  current?: string;
  suggested: string;
  reason: string;
}

export interface AnalysisResult {
  matchScore: number;
  keywordGaps: string[];
  matchedKeywords: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  optimizedResume: ResumeData;
  linkedinSuggestions: LinkedInTip[];
}
