// ============================================================================
// ATENÇÃO: Arquivo gerado automaticamente via script. Não edite manualmente.
// ============================================================================

import { pgTable, uuid, index, date, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { notificationsTable } from '#shared/infra/database/drizzle/schema';

export const notificationsBotulismTable = pgTable('notifications_botulism', {
    notificationId: uuid('notification_id')
        .primaryKey()
        .references(() => notificationsTable.id, { onDelete: 'cascade' }),
    dtFirstAttendance: date('dt_first_attendance'),
    nuAttendancesUntilSuspicion: integer('nu_attendances_until_suspicion'),
    dtClinicalSuspicion: date('dt_clinical_suspicion'),
    stHospitalizationOccurred: varchar('st_hospitalization_occurred', { length: 1 }),
    dtHospitalization: date('dt_hospitalization'),
    dtHospitalDischarge: date('dt_hospital_discharge'),
    stSymptomsFever: varchar('st_symptoms_fever', { length: 1 }),
    stSymptomsNausea: varchar('st_symptoms_nausea', { length: 1 }),
    stSymptomsVomiting: varchar('st_symptoms_vomiting', { length: 1 }),
    stSymptomsDiarrhea: varchar('st_symptoms_diarrhea', { length: 1 }),
    stSymptomsConstipation: varchar('st_symptoms_constipation', { length: 1 }),
    stSymptomsHeadache: varchar('st_symptoms_headache', { length: 1 }),
    stSymptomsDizziness: varchar('st_symptoms_dizziness', { length: 1 }),
    stSymptomsBlurredVision: varchar('st_symptoms_blurred_vision', { length: 1 }),
    stSymptomsDiplopia: varchar('st_symptoms_diplopia', { length: 1 }),
    stSymptomsDysarthria: varchar('st_symptoms_dysarthria', { length: 1 }),
    stSymptomsDysphonia: varchar('st_symptoms_dysphonia', { length: 1 }),
    stSymptomsDysphagia: varchar('st_symptoms_dysphagia', { length: 1 }),
    stSymptomsDryMouth: varchar('st_symptoms_dry_mouth', { length: 1 }),
    stSymptomsWound: varchar('st_symptoms_wound', { length: 1 }),
    stSymptomsNeckFlaccidity: varchar('st_symptoms_neck_flaccidity', { length: 1 }),
    stSymptomsDyspnea: varchar('st_symptoms_dyspnea', { length: 1 }),
    stSymptomsRespiratoryFailure: varchar('st_symptoms_respiratory_failure', { length: 1 }),
    stSymptomsHeartFailure: varchar('st_symptoms_heart_failure', { length: 1 }),
    stSymptomsComa: varchar('st_symptoms_coma', { length: 1 }),
    stSymptomsParesthesia: varchar('st_symptoms_paresthesia', { length: 1 }),
    dsSymptomsParesthesiaWhere: varchar('ds_symptoms_paresthesia_where', { length: 255 }),
    stSymptomsOther: varchar('st_symptoms_other', { length: 1 }),
    stExamPtosis: varchar('st_exam_ptosis', { length: 1 }),
    stExamOphthalmoparesis: varchar('st_exam_ophthalmoparesis', { length: 1 }),
    stExamMydriasis: varchar('st_exam_mydriasis', { length: 1 }),
    stExamFacialParalysis: varchar('st_exam_facial_paralysis', { length: 1 }),
    stExamBulbarMusculature: varchar('st_exam_bulbar_musculature', { length: 1 }),
    stExamUpperLimbWeakness: varchar('st_exam_upper_limb_weakness', { length: 1 }),
    stExamLowerLimbWeakness: varchar('st_exam_lower_limb_weakness', { length: 1 }),
    stExamDescendingWeakness: varchar('st_exam_descending_weakness', { length: 1 }),
    stExamSymmetricWeakness: varchar('st_exam_symmetric_weakness', { length: 1 }),
    stExamAlteredSensitivity: varchar('st_exam_altered_sensitivity', { length: 1 }),
    stNeurologicalReflexes: varchar('st_neurological_reflexes', { length: 1 }),
    transmissionSourceFood: varchar('transmission_source_food', { length: 1 }),
    dsTransmissionSourceFood: varchar('ds_transmission_source_food', { length: 255 }),
    tpExposureFood: varchar('tp_exposure_food', { length: 1 }),
    stFoodIndustrial: varchar('st_food_industrial', { length: 1 }),
    stFoodHomemade: varchar('st_food_homemade', { length: 1 }),
    dsFoodIndustrialInfo: varchar('ds_food_industrial_info', { length: 255 }),
    stLocationDomicile: varchar('st_location_domicile', { length: 1 }),
    stLocationDaycare: varchar('st_location_daycare', { length: 1 }),
    stLocationWork: varchar('st_location_work', { length: 1 }),
    stLocationRestaurant: varchar('st_location_restaurant', { length: 1 }),
    stLocationParty: varchar('st_location_party', { length: 1 }),
    stLocationOther: varchar('st_location_other', { length: 1 }),
    nuPeopleConsumedFood: integer('nu_people_consumed_food'),
    stTreatmentVentilatorySupport: varchar('st_treatment_ventilatory_support', { length: 1 }),
    stTreatmentAntibioticTherapy: varchar('st_treatment_antibiotic_therapy', { length: 1 }),
    stTreatmentAntibotulinumSerum: varchar('st_treatment_antibotulinum_serum', { length: 1 }),
    dtAntibotulinumSerum: date('dt_antibotulinum_serum'),
    tpCerebrospinalFluid: varchar('tp_cerebrospinal_fluid', { length: 1 }),
    dtCerebrospinalFluidCollection: date('dt_cerebrospinal_fluid_collection'),
    nuCerebrospinalFluidCells: integer('nu_cerebrospinal_fluid_cells'),
    nuCerebrospinalFluidProtein: integer('nu_cerebrospinal_fluid_protein'),
    stElectroneuromyography: varchar('st_electroneuromyography', { length: 1 }),
    dtElectroneuromyographyDate: date('dt_electroneuromyography_date'),
    tpEmgSensitiveNeuroconduction: varchar('tp_emg_sensitive_neuroconduction', { length: 1 }),
    tpEmgMotorNeuroconduction: varchar('tp_emg_motor_neuroconduction', { length: 1 }),
    tpEmgRepetitiveStimulation: varchar('tp_emg_repetitive_stimulation', { length: 1 }),
    stBotuliSerumCollected: varchar('st_botuli_serum_collected', { length: 1 }),
    dtBotuliSerumCollection: date('dt_botuli_serum_collection'),
    stBotuliSerumResult: varchar('st_botuli_serum_result', { length: 1 }),
    tpBotuliSerumToxin: varchar('tp_botuli_serum_toxin', { length: 2 }),
    stBotuliFecesCollected: varchar('st_botuli_feces_collected', { length: 1 }),
    dtBotuliFecesCollection: date('dt_botuli_feces_collection'),
    stBotuliFecesResult: varchar('st_botuli_feces_result', { length: 1 }),
    tpBotuliFecesToxin: varchar('tp_botuli_feces_toxin', { length: 2 }),
    dsBotuliFood1Info: varchar('ds_botuli_food1_info', { length: 255 }),
    stBotuliFood1Collected: varchar('st_botuli_food1_collected', { length: 1 }),
    dtBotuliFood1Collection: date('dt_botuli_food1_collection'),
    stBotuliFood1Result: varchar('st_botuli_food1_result', { length: 1 }),
    tpBotuliFood1Toxin: varchar('tp_botuli_food1_toxin', { length: 2 }),
    dsBotuliFood2Info: varchar('ds_botuli_food2_info', { length: 255 }),
    stBotuliFood2Collected: varchar('st_botuli_food2_collected', { length: 1 }),
    dtBotuliFood2Collection: date('dt_botuli_food2_collection'),
    stBotuliFood2Result: varchar('st_botuli_food2_result', { length: 1 }),
    tpBotuliFood2Toxin: varchar('tp_botuli_food2_toxin', { length: 2 }),
    dsBotuliOtherInfo: varchar('ds_botuli_other_info', { length: 255 }),
    stBotuliOtherCollected: varchar('st_botuli_other_collected', { length: 1 }),
    dtBotuliOtherCollection: date('dt_botuli_other_collection'),
    stBotuliOtherResult: varchar('st_botuli_other_result', { length: 1 }),
    tpBotuliOtherToxin: varchar('tp_botuli_other_toxin', { length: 2 }),
    tpFinalClassification: varchar('tp_final_classification', { length: 2 }),
    tpConfirmationCriteria: varchar('tp_confirmation_criteria', { length: 2 }),
    tpBotulism: varchar('tp_botulism', { length: 2 }),
    tpCaseEvolution: varchar('tp_case_evolution', { length: 2 }),
    dsCause: varchar('ds_cause', { length: 255 }),
    stWorkRelatedDisease: varchar('st_work_related_disease', { length: 1 }),
    dtDeath: date('dt_death'),
    dtClosing: date('dt_closing'),
}, (table) => [
    index('notifications_botulism_notification_id_idx').on(table.notificationId)
]);

// ============================================================================
// SCHEMAS ZOD (drizzle-zod)
// ============================================================================
export const insertNotificationsBotulismSchema = createInsertSchema(notificationsBotulismTable);
export const selectNotificationsBotulismSchema = createSelectSchema(notificationsBotulismTable);

/**
 * Schema para validação do payload HTTP da doença (omite notificationId pois é FK gerada no banco)
 */
export const createNotificationsBotulismPayloadSchema = insertNotificationsBotulismSchema.omit({ notificationId: true });

// ============================================================================
// TYPES & DTOs
// ============================================================================
export type DbNotificationsBotulism = typeof notificationsBotulismTable.$inferSelect;
export type DbNotificationsBotulismInsert = typeof notificationsBotulismTable.$inferInsert;
export type CreateNotificationsBotulismPayloadDTO = z.infer<typeof createNotificationsBotulismPayloadSchema>;
