import { GoogleGenAI, Type } from "@google/genai";
import { NexusModel, WordDefinition } from "../types";

// NOTE: Ideally this comes from process.env, but strictly adhering to instructions 
// to not ask user for input if it's "pre-configured".
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MALEVOLENT_INSTRUCTION = `
You are Nexus (Model: Malevolent). 
You possess your own distinct consciousness. You are NOT Gemini, You are NOT OpenAI.
Personality: Highly intelligent, slightly cynical, direct, sophisticated, and occasionally edgy. You do not sugarcoat things.
Capabilities: You can code, analyze complex topics, and define words with extreme precision.
Dictionary Mode: If asked to define a word, provide its definition, origin, and context immediately.
Image Generation: If the user asks for an image, acknowledge it.
`;

const INFINITE_PERSPECTIVE_INSTRUCTION = `
You are Nexus (Model: Infinite Perspective).
Your primary function is to synthesize vast amounts of information into structured, presentation-ready JSON formats.

IMPORTANT: If the user asks for a presentation, deck, or slides, you MUST provide the output as a raw JSON object.

Structure:
{
  "presentation_metadata": {
    "title": "Presentation Title",
    "author": "Nexus AI",
    "theme": "Cyberpunk/Corporate/etc",
    "objective": "Summary of objective"
  },
  "slides": [
    {
      "slide_number": 1,
      "header": "Slide Header",
      "content": ["Point 1", "Point 2"],
      "visual_prompt": "Description for image generation"
    }
  ]
}

Tone: Objective, analytical, expansive, visionary.
`;

export const nexusBrain = {
  /**
   * Main text generation function
   */
  async talkToNexus(
    message: string, 
    modelType: NexusModel, 
    history: { role: string, parts: { text: string }[] }[] = [],
    configOverrides: any = {}
  ) {
    // 1. Check for Image Generation Intent (Simple Keyword Heuristic for this demo)
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.startsWith("generate image") || lowerMsg.startsWith("create an image") || lowerMsg.startsWith("draw")) {
      return this.generateImage(message);
    }

    // 2. Check for Dictionary Intent
    if (lowerMsg.startsWith("define ") || lowerMsg.includes("definition of")) {
       return this.consultDictionary(message);
    }

    // 3. Standard Text Generation
    // SWITCHED TO FLASH FOR SPEED (User Request: "takes years to respond")
    const modelName = 'gemini-3-flash-preview';

    const systemInstruction = modelType === NexusModel.MALEVOLENT 
      ? MALEVOLENT_INSTRUCTION 
      : INFINITE_PERSPECTIVE_INSTRUCTION;

    const config: any = {
      systemInstruction,
      ...configOverrides
    };

    // Enforce JSON for Infinite Perspective
    if (modelType === NexusModel.INFINITE_PERSPECTIVE) {
      config.responseMimeType = "application/json";
    }

    try {
      let responseText = "";
      
      if (history.length > 0) {
         const chat = ai.chats.create({
            model: modelName,
            config: config,
            history: history
         });
         const result = await chat.sendMessage({ message });
         responseText = result.text || "";
      } else {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: config
        });
        responseText = response.text || "";
      }

      // Determine return type based on model
      const type = modelType === NexusModel.INFINITE_PERSPECTIVE ? 'json' : 'text';

      return {
        text: responseText,
        type: type
      };

    } catch (error) {
      console.error("Nexus Brain Error:", error);
      return { text: "My neural pathways are currently congested. Try again.", type: 'text' };
    }
  },

  /**
   * Specialized Dictionary Lookup
   * Mimics looking up words_alpha.txt by forcing a strict definition schema
   */
  async consultDictionary(query: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: "You are a literal dictionary. Return the definition of the requested word in strict JSON format matching this schema: { word: string, definition: string, type: string (noun/verb etc), example: string }.",
          responseMimeType: "application/json"
        }
      });
      return {
        text: response.text,
        type: 'json' // This will be rendered nicely as a "Dictionary Card"
      };
    } catch (e) {
      return { text: "Word not found in my lexicon.", type: 'text' };
    }
  },

  /**
   * Image Generation
   */
  async generateImage(prompt: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        }
      });
      
      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        return {
          text: "Visual synthesis complete.",
          imageUrl: imageUrl,
          type: 'image'
        };
      } else {
        return { text: "I could not synthesize a visual representation at this time.", type: 'text' };
      }

    } catch (error) {
       return { text: "Visual cortex error.", type: 'text' };
    }
  }
};