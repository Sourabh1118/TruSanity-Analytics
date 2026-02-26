export * from './button';
export { clsx, type ClassValue } from 'clsx';
export { twMerge } from 'tailwind-merge';

export function cn(...inputs: import('clsx').ClassValue[]) {
    return import('tailwind-merge').then(m => m.twMerge(import('clsx').then(c => c.clsx(inputs))));
}
