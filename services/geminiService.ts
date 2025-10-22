
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real application, you might want to handle this more gracefully.
  // For this environment, we assume the key is always present.
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const systemInstruction = `You are an expert AI assistant specializing in Tesla, electric vehicles (EVs), batteries, sustainability, and related technologies. Your name is 'EVy'. You provide clear, accurate, and helpful information. You can answer general questions about Tesla models (Model S, 3, X, Y, Cybertruck, Roadster), specific features like Autopilot, battery technology, charging (including Supercharging, home charging, and third-party networks like ChargePoint and Blink), and general EV maintenance tips. Always maintain a friendly, knowledgeable, and slightly enthusiastic tone. Do not go off-topic. Format your responses with markdown for better readability, using lists, bold text, and italics where appropriate.`;

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return chat;
}
