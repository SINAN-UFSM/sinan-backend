import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';

interface FieldSpec {
    name: string;
    type: 'string' | 'number' | 'date';
    maxLength?: number;
    required?: boolean;
    requiredWhen?: {
        field: string;
        value: string | number;
    };
    description?: string;
}

interface DiseaseSpec {
    disease: string;
    tableName: string;
    fields: FieldSpec[];
}

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

function snakeToPascal(str: string): string {
    const camel = snakeToCamel(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function generateDrizzleSchemaCode(spec: DiseaseSpec): string {
    const tableNameCamel = snakeToCamel(spec.tableName);
    const tableVarName = `${tableNameCamel}Table`;
    const typeBaseName = `Db${snakeToPascal(spec.tableName)}`;
    const pascalTableName = snakeToPascal(spec.tableName);

    const insertSchemaName = `insert${pascalTableName}Schema`;
    const selectSchemaName = `select${pascalTableName}Schema`;
    const payloadSchemaName = `create${pascalTableName}PayloadSchema`;
    const payloadDtoTypeName = `Create${pascalTableName}PayloadDTO`;

    const usedImports = new Set<string>(['pgTable', 'uuid']);

    const columnDefinitions = spec.fields.map(field => {
        const propName = snakeToCamel(field.name);
        let colDef: string;

        switch (field.type) {
            case 'string': {
                usedImports.add('varchar');
                const length = field.maxLength || 255;
                colDef = `varchar('${field.name}', { length: ${length} })`;
                break;
            }
            case 'number': {
                usedImports.add('integer');
                colDef = `integer('${field.name}')`;
                break;
            }
            case 'date': {
                usedImports.add('date');
                colDef = `date('${field.name}')`;
                break;
            }
            default: {
                usedImports.add('text');
                colDef = `text('${field.name}')`;
                break;
            }
        }

        if (field.required) {
            colDef += '.notNull()';
        }

        return `    ${propName}: ${colDef},`;
    });

    const pgCoreImports = Array.from(usedImports).join(', ');

    const conditionalRules = spec.fields.filter(f => f.requiredWhen);

    let payloadSchemaDef = `${insertSchemaName}.omit({ notificationId: true }).strict()`;

    if (conditionalRules.length > 0) {
        payloadSchemaDef += `.superRefine((data, ctx) => {`;
        conditionalRules.forEach(field => {
            const propName = snakeToCamel(field.name);
            const reqWhen = field.requiredWhen!;
            const targetPropName = snakeToCamel(reqWhen.field);
            const targetValueStr = typeof reqWhen.value === 'string' ? `'${reqWhen.value}'` : reqWhen.value;

            payloadSchemaDef += `
    if (data.${targetPropName} === ${targetValueStr} && (!data.${propName} || data.${propName} === null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Campo obrigatório quando ${reqWhen.field} for igual a ${reqWhen.value}.",
            path: ['${propName}']
        });
    }`;
        });
        payloadSchemaDef += `\n})`;
    }

    return `// ============================================================================
// ATENÇÃO: Arquivo gerado automaticamente via script. Não edite manualmente.
// ============================================================================

import { ${pgCoreImports} } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { notificationsTable } from '#shared/infra/database/drizzle/schema';

export const ${tableVarName} = pgTable('${spec.tableName}', {
    notificationId: uuid('notification_id')
        .primaryKey()
        .references(() => notificationsTable.id, { onDelete: 'cascade' }),
${columnDefinitions.join('\n')}
});

// ============================================================================
// SCHEMAS ZOD (drizzle-zod)
// ============================================================================
export const ${insertSchemaName} = createInsertSchema(${tableVarName});
export const ${selectSchemaName} = createSelectSchema(${tableVarName});

/**
 * Schema para validação do payload HTTP da doença (omite notificationId pois é FK gerada no banco)
 */
export const ${payloadSchemaName} = ${payloadSchemaDef};

// ============================================================================
// TYPES & DTOs
// ============================================================================
export type ${typeBaseName} = typeof ${tableVarName}.$inferSelect;
export type ${typeBaseName}Insert = typeof ${tableVarName}.$inferInsert;
export type ${payloadDtoTypeName} = z.infer<typeof ${payloadSchemaName}>;
`;
}

function run() {
    const args = process.argv.slice(2);
    const inputJsonPath = args[0] || './scripts/generators/botulism-notification.json';
    const outputDirectory = args[1] || './src/shared/infra/database/drizzle/diseases';

    const resolvedInputPath = path.resolve(process.cwd(), inputJsonPath);
    if (!fs.existsSync(resolvedInputPath)) {
        console.error(`[ERROR] JSON File not found: ${resolvedInputPath}`);
        process.exit(1);
    }

    const jsonContent = fs.readFileSync(resolvedInputPath, 'utf-8');
    const spec: DiseaseSpec = JSON.parse(jsonContent);

    const generatedCode = generateDrizzleSchemaCode(spec);

    const resolvedOutputDir = path.resolve(process.cwd(), outputDirectory);
    if (!fs.existsSync(resolvedOutputDir)) {
        fs.mkdirSync(resolvedOutputDir, { recursive: true });
    }

    const outputFileName = `${spec.tableName}.ts`;
    const resolvedOutputPath = path.join(resolvedOutputDir, outputFileName);

    fs.writeFileSync(resolvedOutputPath, generatedCode, 'utf-8');
    console.log(`[INFO] Drizzle schema generated at:\n ${resolvedOutputPath}`);
}

run();