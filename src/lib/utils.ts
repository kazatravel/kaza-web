import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('timeout'))) {
      console.warn(`Retrying after error: ${error.message}. ${retries} retries left. Waiting ${delay}ms.`);
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}
