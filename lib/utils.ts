import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatTime(ms: number): string {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

