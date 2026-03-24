import { create } from "zustand";
import type { AnalysisResult } from "@/types";

interface AppState {
  resumeText: string | null;
  resumeFileName: string | null;
  jobText: string | null;
  jobUrl: string | null;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  isLoading: boolean;
  error: string | null;

  setResumeText: (text: string) => void;
  setResumeFile: (name: string) => void;
  setJobText: (text: string) => void;
  setJobUrl: (url: string) => void;
  setAnalysis: (result: AnalysisResult) => void;
  setAnalyzing: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  clearAll: () => void;
}

const initialState = {
  resumeText: null,
  resumeFileName: null,
  jobText: null,
  jobUrl: null,
  analysis: null,
  isAnalyzing: false,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setResumeText: (text: string) => set({ resumeText: text, error: null }),
  setResumeFile: (name: string) => set({ resumeFileName: name }),
  setJobText: (text: string) => set({ jobText: text, error: null }),
  setJobUrl: (url: string) => set({ jobUrl: url }),
  setAnalysis: (result: AnalysisResult) => set({ analysis: result }),
  setAnalyzing: (v: boolean) => set({ isAnalyzing: v }),
  setLoading: (v: boolean) => set({ isLoading: v }),
  setError: (msg: string | null) => set({ error: msg }),
  clearAll: () => set({ ...initialState }),
}));
