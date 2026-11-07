import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Trigram indexes for the visitor search (case-insensitive partial match on
 * photo title, species and tag name). Payload cannot declare these, so they
 * live in this hand-written migration.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS "photos_title_trgm_idx" ON "photos" USING gin ("title" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "photos_species_trgm_idx" ON "photos" USING gin ("species" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "tags_name_trgm_idx" ON "tags" USING gin ("name" gin_trgm_ops);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "photos_title_trgm_idx";
    DROP INDEX IF EXISTS "photos_species_trgm_idx";
    DROP INDEX IF EXISTS "tags_name_trgm_idx";
  `)
}
