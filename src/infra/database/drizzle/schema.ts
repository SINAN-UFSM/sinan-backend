import { pgTable, uuid, varchar, integer, pgEnum, timestamp, boolean } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';

const roleEnum = pgEnum('role', ['admin', 'user']);

const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull(),
    unitId: integer('unit_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const refreshTokensTable = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

type DbUser = typeof usersTable.$inferSelect;
type DbUserInsert = typeof usersTable.$inferInsert;

export { usersTable, roleEnum, refreshTokensTable };
export type { DbUser, DbUserInsert };