export * from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function createDbConnection(connectionString: string) {
    const queryClient = postgres(connectionString);
    return drizzle(queryClient, { schema });
}
