import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_photos_status" AS ENUM('published', 'hidden');
  CREATE TYPE "public"."enum_photos_source" AS ENUM('manual', 'bulk');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('active', 'hidden', 'archived');
  CREATE TYPE "public"."enum_photo_collections_status" AS ENUM('active', 'hidden', 'archived');
  CREATE TYPE "public"."enum_locations_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_media_kind" AS ENUM('raw', 'audio', 'other');
  CREATE TYPE "public"."enum_bulk_upload_batches_status" AS ENUM('draft', 'processing', 'completed', 'completed_with_errors');
  CREATE TYPE "public"."enum_bulk_upload_rows_status" AS ENUM('draft', 'invalid', 'ready', 'queued', 'downloading', 'processing', 'done', 'failed', 'duplicate');
  CREATE TABLE "photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"species" varchar,
  	"scientific_name" varchar,
  	"description" varchar,
  	"location_id" integer,
  	"camera_id" integer,
  	"lens_id" integer,
  	"teleconverter" varchar,
  	"focal_length_mm" numeric,
  	"aperture" numeric,
  	"shutter_speed" varchar,
  	"iso" numeric,
  	"taken_at" timestamp(3) with time zone,
  	"taken_year" numeric,
  	"exif_raw" jsonb,
  	"raw_image_id" integer,
  	"ambient_sound_id" integer,
  	"slug" varchar NOT NULL,
  	"status" "enum_photos_status" DEFAULT 'published' NOT NULL,
  	"source" "enum_photos_source" DEFAULT 'manual' NOT NULL,
  	"drive_file_id" varchar,
  	"bulk_row_id" integer,
  	"placeholder" varchar,
  	"dominant_color" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "photos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"photo_collections_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"path" varchar,
  	"depth" numeric,
  	"status" "enum_categories_status" DEFAULT 'active' NOT NULL,
  	"sort_order" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "photo_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"code" varchar,
  	"description" varchar,
  	"cover_id" integer,
  	"status" "enum_photo_collections_status" DEFAULT 'active' NOT NULL,
  	"sort_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"place" varchar,
  	"state" varchar,
  	"country" varchar,
  	"status" "enum_locations_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cameras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"make" varchar,
  	"needs_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cameras_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "lenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"make" varchar,
  	"needs_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lenses_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_media_kind" DEFAULT 'raw' NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "bulk_upload_batches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"status" "enum_bulk_upload_batches_status" DEFAULT 'draft' NOT NULL,
  	"total_rows" numeric DEFAULT 0,
  	"done_rows" numeric DEFAULT 0,
  	"failed_rows" numeric DEFAULT 0,
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bulk_upload_rows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"batch_id" integer NOT NULL,
  	"row_index" numeric NOT NULL,
  	"drive_url" varchar NOT NULL,
  	"drive_file_id" varchar,
  	"drive_file_name" varchar,
  	"drive_mime_type" varchar,
  	"drive_size_bytes" numeric,
  	"title" varchar NOT NULL,
  	"species" varchar,
  	"scientific_name" varchar,
  	"description" varchar,
  	"location_id" integer,
  	"status" "enum_bulk_upload_rows_status" DEFAULT 'draft' NOT NULL,
  	"error" varchar,
  	"attempts" numeric DEFAULT 0,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bulk_upload_rows_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"photo_collections_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"photos_id" integer,
  	"categories_id" integer,
  	"photo_collections_id" integer,
  	"locations_id" integer,
  	"tags_id" integer,
  	"cameras_id" integer,
  	"lenses_id" integer,
  	"media_id" integer,
  	"bulk_upload_batches_id" integer,
  	"bulk_upload_rows_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "photos" ADD CONSTRAINT "photos_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_camera_id_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."cameras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_lens_id_lenses_id_fk" FOREIGN KEY ("lens_id") REFERENCES "public"."lenses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_raw_image_id_media_id_fk" FOREIGN KEY ("raw_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_ambient_sound_id_media_id_fk" FOREIGN KEY ("ambient_sound_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_bulk_row_id_bulk_upload_rows_id_fk" FOREIGN KEY ("bulk_row_id") REFERENCES "public"."bulk_upload_rows"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos_rels" ADD CONSTRAINT "photos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photos_rels" ADD CONSTRAINT "photos_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photos_rels" ADD CONSTRAINT "photos_rels_photo_collections_fk" FOREIGN KEY ("photo_collections_id") REFERENCES "public"."photo_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photos_rels" ADD CONSTRAINT "photos_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photo_collections" ADD CONSTRAINT "photo_collections_cover_id_photos_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cameras_texts" ADD CONSTRAINT "cameras_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cameras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lenses_texts" ADD CONSTRAINT "lenses_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows" ADD CONSTRAINT "bulk_upload_rows_batch_id_bulk_upload_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."bulk_upload_batches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows" ADD CONSTRAINT "bulk_upload_rows_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows" ADD CONSTRAINT "bulk_upload_rows_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows_rels" ADD CONSTRAINT "bulk_upload_rows_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bulk_upload_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows_rels" ADD CONSTRAINT "bulk_upload_rows_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows_rels" ADD CONSTRAINT "bulk_upload_rows_rels_photo_collections_fk" FOREIGN KEY ("photo_collections_id") REFERENCES "public"."photo_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bulk_upload_rows_rels" ADD CONSTRAINT "bulk_upload_rows_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photos_fk" FOREIGN KEY ("photos_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photo_collections_fk" FOREIGN KEY ("photo_collections_id") REFERENCES "public"."photo_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cameras_fk" FOREIGN KEY ("cameras_id") REFERENCES "public"."cameras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lenses_fk" FOREIGN KEY ("lenses_id") REFERENCES "public"."lenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bulk_upload_batches_fk" FOREIGN KEY ("bulk_upload_batches_id") REFERENCES "public"."bulk_upload_batches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bulk_upload_rows_fk" FOREIGN KEY ("bulk_upload_rows_id") REFERENCES "public"."bulk_upload_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "photos_location_idx" ON "photos" USING btree ("location_id");
  CREATE INDEX "photos_camera_idx" ON "photos" USING btree ("camera_id");
  CREATE INDEX "photos_lens_idx" ON "photos" USING btree ("lens_id");
  CREATE INDEX "photos_taken_year_idx" ON "photos" USING btree ("taken_year");
  CREATE INDEX "photos_raw_image_idx" ON "photos" USING btree ("raw_image_id");
  CREATE INDEX "photos_ambient_sound_idx" ON "photos" USING btree ("ambient_sound_id");
  CREATE UNIQUE INDEX "photos_slug_idx" ON "photos" USING btree ("slug");
  CREATE INDEX "photos_status_idx" ON "photos" USING btree ("status");
  CREATE UNIQUE INDEX "photos_drive_file_id_idx" ON "photos" USING btree ("drive_file_id");
  CREATE INDEX "photos_bulk_row_idx" ON "photos" USING btree ("bulk_row_id");
  CREATE INDEX "photos_updated_at_idx" ON "photos" USING btree ("updated_at");
  CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");
  CREATE UNIQUE INDEX "photos_filename_idx" ON "photos" USING btree ("filename");
  CREATE INDEX "photos_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "photos" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "photos_sizes_card_sizes_card_filename_idx" ON "photos" USING btree ("sizes_card_filename");
  CREATE INDEX "photos_sizes_large_sizes_large_filename_idx" ON "photos" USING btree ("sizes_large_filename");
  CREATE INDEX "photos_sizes_xlarge_sizes_xlarge_filename_idx" ON "photos" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "status_takenAt_idx" ON "photos" USING btree ("status","taken_at");
  CREATE INDEX "camera_lens_idx" ON "photos" USING btree ("camera_id","lens_id");
  CREATE INDEX "photos_rels_order_idx" ON "photos_rels" USING btree ("order");
  CREATE INDEX "photos_rels_parent_idx" ON "photos_rels" USING btree ("parent_id");
  CREATE INDEX "photos_rels_path_idx" ON "photos_rels" USING btree ("path");
  CREATE INDEX "photos_rels_categories_id_idx" ON "photos_rels" USING btree ("categories_id");
  CREATE INDEX "photos_rels_photo_collections_id_idx" ON "photos_rels" USING btree ("photo_collections_id");
  CREATE INDEX "photos_rels_tags_id_idx" ON "photos_rels" USING btree ("tags_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX "categories_path_idx" ON "categories" USING btree ("path");
  CREATE INDEX "categories_status_idx" ON "categories" USING btree ("status");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "photo_collections_slug_idx" ON "photo_collections" USING btree ("slug");
  CREATE INDEX "photo_collections_cover_idx" ON "photo_collections" USING btree ("cover_id");
  CREATE INDEX "photo_collections_status_idx" ON "photo_collections" USING btree ("status");
  CREATE INDEX "photo_collections_updated_at_idx" ON "photo_collections" USING btree ("updated_at");
  CREATE INDEX "photo_collections_created_at_idx" ON "photo_collections" USING btree ("created_at");
  CREATE UNIQUE INDEX "locations_name_idx" ON "locations" USING btree ("name");
  CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
  CREATE INDEX "locations_status_idx" ON "locations" USING btree ("status");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "cameras_name_idx" ON "cameras" USING btree ("name");
  CREATE UNIQUE INDEX "cameras_slug_idx" ON "cameras" USING btree ("slug");
  CREATE INDEX "cameras_updated_at_idx" ON "cameras" USING btree ("updated_at");
  CREATE INDEX "cameras_created_at_idx" ON "cameras" USING btree ("created_at");
  CREATE INDEX "cameras_texts_order_parent" ON "cameras_texts" USING btree ("order","parent_id");
  CREATE INDEX "cameras_texts_text_idx" ON "cameras_texts" USING btree ("text");
  CREATE UNIQUE INDEX "lenses_name_idx" ON "lenses" USING btree ("name");
  CREATE UNIQUE INDEX "lenses_slug_idx" ON "lenses" USING btree ("slug");
  CREATE INDEX "lenses_updated_at_idx" ON "lenses" USING btree ("updated_at");
  CREATE INDEX "lenses_created_at_idx" ON "lenses" USING btree ("created_at");
  CREATE INDEX "lenses_texts_order_parent" ON "lenses_texts" USING btree ("order","parent_id");
  CREATE INDEX "lenses_texts_text_idx" ON "lenses_texts" USING btree ("text");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "bulk_upload_batches_status_idx" ON "bulk_upload_batches" USING btree ("status");
  CREATE INDEX "bulk_upload_batches_updated_at_idx" ON "bulk_upload_batches" USING btree ("updated_at");
  CREATE INDEX "bulk_upload_batches_created_at_idx" ON "bulk_upload_batches" USING btree ("created_at");
  CREATE INDEX "bulk_upload_rows_batch_idx" ON "bulk_upload_rows" USING btree ("batch_id");
  CREATE INDEX "bulk_upload_rows_drive_file_id_idx" ON "bulk_upload_rows" USING btree ("drive_file_id");
  CREATE INDEX "bulk_upload_rows_location_idx" ON "bulk_upload_rows" USING btree ("location_id");
  CREATE INDEX "bulk_upload_rows_status_idx" ON "bulk_upload_rows" USING btree ("status");
  CREATE INDEX "bulk_upload_rows_photo_idx" ON "bulk_upload_rows" USING btree ("photo_id");
  CREATE INDEX "bulk_upload_rows_updated_at_idx" ON "bulk_upload_rows" USING btree ("updated_at");
  CREATE INDEX "bulk_upload_rows_created_at_idx" ON "bulk_upload_rows" USING btree ("created_at");
  CREATE INDEX "batch_rowIndex_idx" ON "bulk_upload_rows" USING btree ("batch_id","row_index");
  CREATE INDEX "bulk_upload_rows_rels_order_idx" ON "bulk_upload_rows_rels" USING btree ("order");
  CREATE INDEX "bulk_upload_rows_rels_parent_idx" ON "bulk_upload_rows_rels" USING btree ("parent_id");
  CREATE INDEX "bulk_upload_rows_rels_path_idx" ON "bulk_upload_rows_rels" USING btree ("path");
  CREATE INDEX "bulk_upload_rows_rels_categories_id_idx" ON "bulk_upload_rows_rels" USING btree ("categories_id");
  CREATE INDEX "bulk_upload_rows_rels_photo_collections_id_idx" ON "bulk_upload_rows_rels" USING btree ("photo_collections_id");
  CREATE INDEX "bulk_upload_rows_rels_tags_id_idx" ON "bulk_upload_rows_rels" USING btree ("tags_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_photos_id_idx" ON "payload_locked_documents_rels" USING btree ("photos_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_photo_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("photo_collections_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_cameras_id_idx" ON "payload_locked_documents_rels" USING btree ("cameras_id");
  CREATE INDEX "payload_locked_documents_rels_lenses_id_idx" ON "payload_locked_documents_rels" USING btree ("lenses_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_bulk_upload_batches_id_idx" ON "payload_locked_documents_rels" USING btree ("bulk_upload_batches_id");
  CREATE INDEX "payload_locked_documents_rels_bulk_upload_rows_id_idx" ON "payload_locked_documents_rels" USING btree ("bulk_upload_rows_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "photos" CASCADE;
  DROP TABLE "photos_rels" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "photo_collections" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "cameras" CASCADE;
  DROP TABLE "cameras_texts" CASCADE;
  DROP TABLE "lenses" CASCADE;
  DROP TABLE "lenses_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "bulk_upload_batches" CASCADE;
  DROP TABLE "bulk_upload_rows" CASCADE;
  DROP TABLE "bulk_upload_rows_rels" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_photos_status";
  DROP TYPE "public"."enum_photos_source";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum_photo_collections_status";
  DROP TYPE "public"."enum_locations_status";
  DROP TYPE "public"."enum_media_kind";
  DROP TYPE "public"."enum_bulk_upload_batches_status";
  DROP TYPE "public"."enum_bulk_upload_rows_status";`)
}
