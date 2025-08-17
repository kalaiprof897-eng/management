
import { GoogleGenAI } from "@google/genai";
import { ProductionRecord } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDailySummary = async (records: ProductionRecord[]): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Error: Gemini API key is not configured.");
  }

  const simplifiedRecords = records.slice(0, 50).map(r => ({ // Use a subset to avoid overly long prompts
    machineName: r.machineName,
    produced: r.quantityProduced,
    scrap: r.scrapCount,
    cycleTime: r.cycleTime,
  }));

  const prompt = `
    Analyze the following manufacturing production data for the last 24 hours.
    Provide a concise, insightful summary for a plant manager.
    Highlight key achievements, potential issues (like high scrap rates or long cycle times on specific machines), and overall production efficiency.
    Structure the output as a brief paragraph followed by a few bullet points for specific highlights.
    
    Data:
    ${JSON.stringify(simplifiedRecords, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the summary: ${error.message}`;
    }
    return "An unknown error occurred while generating the summary.";
  }
};