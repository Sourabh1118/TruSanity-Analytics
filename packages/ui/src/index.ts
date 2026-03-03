export * from './button';
export * from './card';
export * from './input';
export * from './label';
export * from './badge';
export * from './table';
// Note: Radix dialog requires more complex portalling, stubbing simpler generic exports

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
