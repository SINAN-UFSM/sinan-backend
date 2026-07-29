CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"unit_id" integer NOT NULL,
	"patient_name" varchar(255) NOT NULL,
	"patient_cpf" varchar(11) NOT NULL,
	"patient_sus_card" varchar(15) NOT NULL,
	"patient_birth_date" date NOT NULL,
	"patient_birth_city" varchar(255) NOT NULL,
	"patient_gender" varchar(50) NOT NULL,
	"patient_education_level" varchar(100) NOT NULL,
	"patient_race_color" varchar(100) NOT NULL,
	"patient_current_address" varchar(255) NOT NULL,
	"notification_type_slug" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"dt_notification" date NOT NULL,
	"occurrence_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"sus_card" varchar(15) NOT NULL,
	"birth_date" date NOT NULL,
	"birth_city" varchar(255) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"gender" varchar(50) NOT NULL,
	"education_level" varchar(100) NOT NULL,
	"race_color" varchar(100) NOT NULL,
	"current_address" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "patients_sus_card_unique" UNIQUE("sus_card")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"unit_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications_botulism" (
	"notification_id" uuid PRIMARY KEY NOT NULL,
	"dt_first_attendance" date,
	"nu_attendances_until_suspicion" integer,
	"dt_clinical_suspicion" date,
	"st_hospitalization_occurred" varchar(1),
	"dt_hospitalization" date,
	"dt_hospital_discharge" date,
	"st_symptoms_fever" varchar(1),
	"st_symptoms_nausea" varchar(1),
	"st_symptoms_vomiting" varchar(1),
	"st_symptoms_diarrhea" varchar(1),
	"st_symptoms_constipation" varchar(1),
	"st_symptoms_headache" varchar(1),
	"st_symptoms_dizziness" varchar(1),
	"st_symptoms_blurred_vision" varchar(1),
	"st_symptoms_diplopia" varchar(1),
	"st_symptoms_dysarthria" varchar(1),
	"st_symptoms_dysphonia" varchar(1),
	"st_symptoms_dysphagia" varchar(1),
	"st_symptoms_dry_mouth" varchar(1),
	"st_symptoms_wound" varchar(1),
	"st_symptoms_neck_flaccidity" varchar(1),
	"st_symptoms_dyspnea" varchar(1),
	"st_symptoms_respiratory_failure" varchar(1),
	"st_symptoms_heart_failure" varchar(1),
	"st_symptoms_coma" varchar(1),
	"st_symptoms_paresthesia" varchar(1),
	"ds_symptoms_paresthesia_where" varchar(255),
	"st_symptoms_other" varchar(1),
	"st_exam_ptosis" varchar(1),
	"st_exam_ophthalmoparesis" varchar(1),
	"st_exam_mydriasis" varchar(1),
	"st_exam_facial_paralysis" varchar(1),
	"st_exam_bulbar_musculature" varchar(1),
	"st_exam_upper_limb_weakness" varchar(1),
	"st_exam_lower_limb_weakness" varchar(1),
	"st_exam_descending_weakness" varchar(1),
	"st_exam_symmetric_weakness" varchar(1),
	"st_exam_altered_sensitivity" varchar(1),
	"st_neurological_reflexes" varchar(1),
	"transmission_source_food" varchar(1),
	"ds_transmission_source_food" varchar(255),
	"tp_exposure_food" varchar(1),
	"st_food_industrial" varchar(1),
	"st_food_homemade" varchar(1),
	"ds_food_industrial_info" varchar(255),
	"st_location_domicile" varchar(1),
	"st_location_daycare" varchar(1),
	"st_location_work" varchar(1),
	"st_location_restaurant" varchar(1),
	"st_location_party" varchar(1),
	"st_location_other" varchar(1),
	"nu_people_consumed_food" integer,
	"st_treatment_ventilatory_support" varchar(1),
	"st_treatment_antibiotic_therapy" varchar(1),
	"st_treatment_antibotulinum_serum" varchar(1),
	"dt_antibotulinum_serum" date,
	"tp_cerebrospinal_fluid" varchar(1),
	"dt_cerebrospinal_fluid_collection" date,
	"nu_cerebrospinal_fluid_cells" integer,
	"nu_cerebrospinal_fluid_protein" integer,
	"st_electroneuromyography" varchar(1),
	"dt_electroneuromyography_date" date,
	"tp_emg_sensitive_neuroconduction" varchar(1),
	"tp_emg_motor_neuroconduction" varchar(1),
	"tp_emg_repetitive_stimulation" varchar(1),
	"st_botuli_serum_collected" varchar(1),
	"dt_botuli_serum_collection" date,
	"st_botuli_serum_result" varchar(1),
	"tp_botuli_serum_toxin" varchar(2),
	"st_botuli_feces_collected" varchar(1),
	"dt_botuli_feces_collection" date,
	"st_botuli_feces_result" varchar(1),
	"tp_botuli_feces_toxin" varchar(2),
	"ds_botuli_food1_info" varchar(255),
	"st_botuli_food1_collected" varchar(1),
	"dt_botuli_food1_collection" date,
	"st_botuli_food1_result" varchar(1),
	"tp_botuli_food1_toxin" varchar(2),
	"ds_botuli_food2_info" varchar(255),
	"st_botuli_food2_collected" varchar(1),
	"dt_botuli_food2_collection" date,
	"st_botuli_food2_result" varchar(1),
	"tp_botuli_food2_toxin" varchar(2),
	"ds_botuli_other_info" varchar(255),
	"st_botuli_other_collected" varchar(1),
	"dt_botuli_other_collection" date,
	"st_botuli_other_result" varchar(1),
	"tp_botuli_other_toxin" varchar(2),
	"tp_final_classification" varchar(2),
	"tp_confirmation_criteria" varchar(2),
	"tp_botulism" varchar(2),
	"tp_case_evolution" varchar(2),
	"ds_cause" varchar(255),
	"st_work_related_disease" varchar(1),
	"dt_death" date,
	"dt_closing" date
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_botulism" ADD CONSTRAINT "notifications_botulism_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_patient_id_index" ON "notifications" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "notification_unit_id_index" ON "notifications" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "patient_cpf_index" ON "patients" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "patient_sus_card_index" ON "patients" USING btree ("sus_card");--> statement-breakpoint
CREATE INDEX "token_hash_index" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "unit_name_trgm_index" ON "units" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "unit_city_trgm_index" ON "units" USING gin ("city" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "unit_state_trgm_index" ON "units" USING gin ("state" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "user_unit_id_index" ON "users" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "notifications_botulism_notification_id_idx" ON "notifications_botulism" USING btree ("notification_id");