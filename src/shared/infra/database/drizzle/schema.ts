import { pgTable, uuid, varchar, integer, pgEnum, timestamp, boolean, index, serial } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const roleEnum = pgEnum('role', ['admin', 'user']);

const unitsTable = pgTable('units', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    state: varchar('state', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
    index('unit_name_trgm_index').using('gin', sql`${table.name} gin_trgm_ops`),
    index('unit_city_trgm_index').using('gin', sql`${table.city} gin_trgm_ops`),
    index('unit_state_trgm_index').using('gin', sql`${table.state} gin_trgm_ops`),
]);

const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull(),
    unitId: integer('unit_id').notNull().references(() => unitsTable.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
    index('user_unit_id_index').on(table.unitId)
]);

const refreshTokensTable = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('token_hash_index').on(table.tokenHash),
]);

type DbUser = typeof usersTable.$inferSelect;
type DbUserInsert = typeof usersTable.$inferInsert;
type DbUnit = typeof unitsTable.$inferSelect;
type DbUnitInsert = typeof unitsTable.$inferInsert;

export { usersTable, roleEnum, refreshTokensTable, unitsTable };
export type { DbUser, DbUserInsert, DbUnit, DbUnitInsert };