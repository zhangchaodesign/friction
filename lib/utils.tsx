import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import OpenAI from "openai";
import { push, ref, set } from "firebase/database";
import { database } from "@/app/firebaseConfig";
import { useFileSuffixStore, useOpenAIAPIStore } from "@/lib/store";

export function eventTracker(
  event: object | string,
  id: string = useFileSuffixStore.getState().fileSuffix,
) {
  try {
    // console.log('event:', event);
    const refId = ref(database, "events/" + id);
    let newEvent: object = {};
    if (typeof event === "string") {
      newEvent = {
        event: event,
        timestamp: Date.now(),
      };
    } else {
      newEvent = {
        ...event,
        timestamp: Date.now(),
      };
    }
    push(refId, newEvent);
  } catch (error) {
    console.log("event:", event);
    console.error("Error tracking event:", error);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchData(
  url: string,
  payload: any,
  onSuccess?: (data: any) => void,
): Promise<any> {
  try {
    const response = await axios.post(url, payload);
    // console.log(response.data);
    if (onSuccess) {
      // Execute the onSuccess callback if provided
      console.log(url + " onSuccess");
      onSuccess(response.data);
    }
    return response.data; // Return data for cases where the response is needed
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error; // Rethrow the error so the caller can handle it
  }
}

export function isSimilarSentence(
  sentence: string,
  contentSentences: string[],
) {
  const words = sentence.toLowerCase().split(/\W+/).filter(Boolean);
  return contentSentences.some((contentSentence) => {
    const contentWords = contentSentence
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);
    const commonWords = words.filter((word) => contentWords.includes(word));
    const similarity =
      commonWords.length / Math.max(words.length, contentWords.length);
    return similarity >= 0.65;
  });
}

export type ColorMap = {
  [key: string]: string;
};

export const categoryColorMap: ColorMap = {
  Claim: "#ec4899",
  Reasoning: "#ef4444",
  Evidence: "#f97316",
  Rebuttal: "#f59e0b",
  Others: "#78716c",
  Organization: "#8b5cf6",
  "Word-usage": "#06b6d4",
  Orthography: "#3b82f6",
};

export const blockColorMap: ColorMap = {
  Default: "#F3F4F6",
  Prompt: "#1F2937",
  What: "#0284C7",
  Why: "#DC2626",
  How: "#EA580C",
  Revision: "#059669",
  Summary: "#4b5563",
};

export const getIntersection = (arr1: string[], arr2: string[]): string[] => {
  return arr1.filter((item) => arr2.includes(item));
};

export const getOpenAICompletion = async (
  prompt: string,
  input: string,
  temperature: number = 0.7,
) => {
  const API = useOpenAIAPIStore.getState().API;
  const openai = new OpenAI({
    apiKey: API,
    dangerouslyAllowBrowser: true,
  });

  // console.log('prompt:', prompt);
  // console.log('input:', input);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: temperature,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    // console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Error fetching AI response:", error);
    if (error.message.includes("Incorrect API key provided")) {
      alert(
        "Error fetching AI response: Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys.",
      );
    }
  }
};

export const getOpenAIBetterOrNot = async (
  original_sentence: string,
  revised_sentence: string,
) => {
  const API = useOpenAIAPIStore.getState().API;
  const openai = new OpenAI({
    apiKey: API,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0613:jeff-rz-cornell-university::8ru54eYb",
      messages: [
        {
          role: "system",
          content:
            "Given the original sentence, determine whether the revision made the original sentence better or not.",
        },
        {
          role: "user",
          content:
            "original sentence: " +
            original_sentence +
            "\nrevision: " +
            revised_sentence +
            "\nbetter (Yes/No): ",
        },
      ],
      temperature: 0.0,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
  }
};
