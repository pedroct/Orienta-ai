
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTopicsForDiscipline = async (disciplineName: string, planName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere uma lista de tópicos essenciais para estudar a disciplina "${disciplineName}" para o concurso/plano "${planName}". Responda apenas com a lista de nomes dos tópicos.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const suggestDisciplines = async (planName: string, cargos?: string) => {
  const ai = getAI();
  const prompt = `Sugira 8 disciplinas principais para um plano de estudos focado em: "${planName}"${cargos ? ` para o cargo de ${cargos}` : ''}.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            color: { type: Type.STRING, description: "Hex color code" }
          },
          required: ["name", "color"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};
