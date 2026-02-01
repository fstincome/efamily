
import { GoogleGenAI } from "@google/genai";

export const getMbanzaResponse = async (prompt, context) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chatHistory = (context.history || []).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || (msg.parts && msg.parts[0]?.text) || '' }]
    }));

    const modelName = context.advanced ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: `[View: ${context.view}] ${prompt}` }] }
      ],
      config: {
        systemInstruction: `
          Identity: Mbanza, Digital Intelligence of Burundi.
          Use 'Amahoro' as greeting. 
          Knowledge: 5 reformed provinces (Bujumbura, Gitega, Burunga, Butanyerera, Buhumuza).
        `,
        ...(context.advanced ? { thinkingConfig: { thinkingBudget: 24576 } } : {}),
      }
    });

    return response.text;
  } catch (error) {
    console.error("Mbanza Node Error:", error);
    return "Amahoro. Link failure. Please re-sync. Iterambere!";
  }
};
