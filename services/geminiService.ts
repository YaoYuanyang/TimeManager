import { GoogleGenAI } from "@google/genai";

// A function to safely get the API key.
const getApiKey = (): string | undefined => {
  try {
    // Check if 'process' and 'process.env' are defined.
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // In a browser environment without a build step, 'process' is not defined.
    console.warn("`process.env` is not available in this environment.");
    return undefined;
  }
  return undefined;
};

const API_KEY = getApiKey();

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key not found. Tag suggestion feature will be disabled.");
}

const geminiService = {
  suggestTag: async (description: string, existingTags: string[]): Promise<string> => {
     // Check if the AI client was initialized.
     if (!ai) {
        throw new Error("AI features are not configured. API key is missing.");
     }
    
    const model = 'gemini-2.5-flash';
    
    const prompt = `Based on the task description, suggest an appropriate one or two-word tag.
    Task Description: "${description}"
    
    Here are some existing tags you can use if they fit: ${existingTags.join(', ')}.
    
    If none of the existing tags are a good fit, suggest a new, simple, and concise tag.
    
    Respond with ONLY the tag name. For example: "Work", "Learning", "Exercise".`;

    try {
      const response = await ai.models.generateContent({
          model,
          contents: prompt,
      });
      const text = response.text.trim().replace(/"/g, ''); // Clean up response
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to get suggestion from AI.");
    }
  },
};

export default geminiService;