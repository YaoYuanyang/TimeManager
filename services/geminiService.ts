
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Tag suggestion feature will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const geminiService = {
  suggestTag: async (description: string, existingTags: string[]): Promise<string> => {
     if (!API_KEY) {
        throw new Error("API key is not configured.");
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
