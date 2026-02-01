
import { GoogleGenAI } from "@google/genai";

export const getMbanzaResponse = async (
  prompt: string, 
  context: { view: string, history: any[], userProvince?: string, advanced?: boolean }
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Normalize history to the SDK-required format
    const chatHistory = context.history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || (msg.parts && msg.parts[0]?.text) || '' }]
    }));

    // Choose model based on complexity toggle
    const modelName = context.advanced ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: `[Current Hub View: ${context.view}] ${prompt}` }] }
      ],
      config: {
        systemInstruction: `
          Identity: Mbanza, the Digital Intelligence of Burundi (Hub 2025).
          Tone: Empowering, patriotic, wise, and efficient. 
          Knowledge base: Deep expertise in the 5 reformed Burundi provinces (Bujumbura, Gitega, Burunga, Butanyerera, Buhumuza).
          Rules:
          1. Use 'Amahoro' as greeting. 
          2. Help with REGIDESO, Traffic RN routes, and local market trends.
          3. If in Deep Reasoning mode, provide strategic analysis of how this query affects Burundi's Vision 2040.
        `,
        ...(context.advanced ? { thinkingConfig: { thinkingBudget: 24576 } } : {}),
      }
    });

    return response.text;
  } catch (error) {
    console.error("Mbanza Node Error:", error);
    return "Amahoro. My link to the national node is currently flickering. Please attempt to re-sync in a moment. Iterambere!";
  }
};
