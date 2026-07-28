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

const patientsTable = pgTable('patients', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 11 }).notNull().unique(),
    susCard: varchar('sus_card', { length: 15 }).notNull().unique(),
    birthDate: timestamp('birth_date', { withTimezone: true }).notNull(),
    birthCity: varchar('birth_city', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 15 }).notNull(),
    gender: varchar('gender', { length: 50 }).notNull(),
    educationLevel: varchar('education_level', { length: 100 }).notNull(),
    raceColor: varchar('race_color', { length: 100 }).notNull(),
    currentAddress: varchar('current_address', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('patient_cpf_index').on(table.cpf),
    index('patient_sus_card_index').on(table.susCard),
]);

type DbUser = typeof usersTable.$inferSelect;
type DbUserInsert = typeof usersTable.$inferInsert;
type DbUnit = typeof unitsTable.$inferSelect;
type DbUnitInsert = typeof unitsTable.$inferInsert;
type DbPatient = typeof patientsTable.$inferSelect;
type DbPatientInsert = typeof patientsTable.$inferInsert;

export { usersTable, roleEnum, refreshTokensTable, unitsTable, patientsTable };
export type { DbUser, DbUserInsert, DbUnit, DbUnitInsert, DbPatient, DbPatientInsert };