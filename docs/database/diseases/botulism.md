# Dicionário de Dados: Agravo Botulismo

**Tabela no Banco:** `form_botulism`
**Relacionamento:** 1:1 com a tabela base `notifications` (Chave Primária `notification_id` é também Chave Estrangeira para `notifications.id`).
**Origem dos Dados:** Ficha de Investigação do SINAN - Botulismo.

---

## 📌 Regras de Negócio Gerais
1. **Snapshot do Paciente:** Os dados da Seção 1 devem ser copiados da tabela `patients` no momento da notificação para preservar o histórico (o endereço ou escolaridade da época da doença).
2. **Campos de Status (`st_`) e Tipo (`tp_`):** Geralmente mapeados no front-end como *Selects* (ex: "1 - Sim", "2 - Não", "9 - Ignorado"). No banco, devem ser armazenados como `VARCHAR`.
3. **Datas (`dt_`):** Armazenadas como `DATE` (sem fuso horário irrelevante).
4. **Numéricos (`nu_`):** Armazenados como `INT`.

---

## 🗄️ Estrutura de Colunas

### Chave e Relacionamento
| Coluna Banco      | Tipo SQL | Descrição / Regra                                                      |
| :---------------- | :------- | :--------------------------------------------------------------------- |
| `notification_id` | `UUID`   | **PK e FK**. Referência direta ao ID gerado na tabela `notifications`. |

### 1. Dados do Paciente (Snapshot)
| Coluna Banco         | Tipo SQL  | Descrição / Regra                       |
| :------------------- | :-------- | :-------------------------------------- |
| `patient_name`       | `VARCHAR` | Nome do paciente no dia da notificação. |
| `patient_cpf`        | `VARCHAR` | CPF.                                    |
| `patient_birth_date` | `DATE`    | Data de nascimento.                     |
| `sex`                | `VARCHAR` | Sexo.                                   |
| `race_color`         | `VARCHAR` | Raça / Cor.                             |
| `education_level`    | `VARCHAR` | Nível de escolaridade.                  |
| `sus_card_number`    | `VARCHAR` | Número do Cartão SUS.                   |
| `birth_city`         | `VARCHAR` | Município de residência na época.       |
| `current_address`    | `VARCHAR` | Endereço na época.                      |

### 2. Dados de Atendimento
| Coluna Banco                     | Tipo SQL  | Descrição / Regra                                  |
| :------------------------------- | :-------- | :------------------------------------------------- |
| `dt_first_attendance`            | `DATE`    | Data do 1º atendimento.                            |
| `nu_attendances_until_suspicion` | `INT`     | Número de atendimentos até suspeição.              |
| `dt_clinical_suspicion`          | `DATE`    | Data da suspeição clínica.                         |
| `st_hospitalization_occurred`    | `VARCHAR` | Ocorreu hospitalização? (1-Sim, 2-Não, 9-Ignorado) |
| `dt_hospitalization`             | `DATE`    | Data da internação. Requerido se internou.         |
| `dt_hospital_discharge`          | `DATE`    | Data da alta hospitalar.                           |

### 3. Sintomas Clínicos
*Padrão de preenchimento:* `VARCHAR` indicando Sim/Não/Ignorado para cada sintoma.

| Coluna Banco                      | Tipo SQL  | Descrição / Regra                    |
| :-------------------------------- | :-------- | :----------------------------------- |
| `st_symptoms_fever`               | `VARCHAR` | Febre                                |
| `st_symptoms_nausea`              | `VARCHAR` | Náusea                               |
| `st_symptoms_vomiting`            | `VARCHAR` | Vômito                               |
| `st_symptoms_diarrhea`            | `VARCHAR` | Diarreia                             |
| `st_symptoms_constipation`        | `VARCHAR` | Constipação                          |
| `st_symptoms_headache`            | `VARCHAR` | Cefaleia                             |
| `st_symptoms_dizziness`           | `VARCHAR` | Tontura                              |
| `st_symptoms_blurred_vision`      | `VARCHAR` | Visão turva                          |
| `st_symptoms_diplopia`            | `VARCHAR` | Diplopia                             |
| `st_symptoms_dysarthria`          | `VARCHAR` | Disartria                            |
| `st_symptoms_dysphonia`           | `VARCHAR` | Disfonia                             |
| `st_symptoms_dysphagia`           | `VARCHAR` | Disfagia                             |
| `st_symptoms_dry_mouth`           | `VARCHAR` | Boca seca                            |
| `st_symptoms_wound`               | `VARCHAR` | Ferimento                            |
| `st_symptoms_neck_flaccidity`     | `VARCHAR` | Flacidez de pescoço                  |
| `st_symptoms_dyspnea`             | `VARCHAR` | Dispneia                             |
| `st_symptoms_respiratory_failure` | `VARCHAR` | Insuficiência respiratória           |
| `st_symptoms_heart_failure`       | `VARCHAR` | Insuficiência cardíaca               |
| `st_symptoms_coma`                | `VARCHAR` | Coma                                 |
| `st_symptoms_paresthesia`         | `VARCHAR` | Parestesia                           |
| `ds_symptoms_paresthesia_where`   | `VARCHAR` | Se parestesia = Sim, descrever onde. |
| `st_symptoms_other`               | `VARCHAR` | Outros sintomas.                     |

### 4 e 5. Exame Neurológico e Reflexos
| Coluna Banco                  | Tipo SQL  | Descrição / Regra               |
| :---------------------------- | :-------- | :------------------------------ |
| `st_exam_ptosis`              | `VARCHAR` | Ptose palpebral                 |
| `st_exam_ophthalmoparesis`    | `VARCHAR` | Oftalmoparesia / Oftalmoplegia  |
| `st_exam_mydriasis`           | `VARCHAR` | Midríase                        |
| `st_exam_facial_paralysis`    | `VARCHAR` | Paralisia facial                |
| `st_exam_bulbar_musculature`  | `VARCHAR` | Musculatura bulbar comprometida |
| `st_exam_upper_limb_weakness` | `VARCHAR` | Fraqueza em MMSS                |
| `st_exam_lower_limb_weakness` | `VARCHAR` | Fraqueza em MMII                |
| `st_exam_descending_weakness` | `VARCHAR` | Fraqueza descendente            |
| `st_exam_symmetric_weakness`  | `VARCHAR` | Fraqueza simétrica              |
| `st_exam_altered_sensitivity` | `VARCHAR` | Sensibilidade alterada          |
| `st_neurological_reflexes`    | `VARCHAR` | Status geral dos reflexos       |

### 6. Fonte de Transmissão
| Coluna Banco                  | Tipo SQL  | Descrição / Regra                  |
| :---------------------------- | :-------- | :--------------------------------- |
| `transmission_source_food`    | `VARCHAR` | Suspeita de transmissão alimentar? |
| `ds_transmission_source_food` | `VARCHAR` | Descrição do alimento suspeito     |
| `tp_exposure_food`            | `VARCHAR` | Única, Múltipla, etc.              |
| `st_food_industrial`          | `VARCHAR` | Alimento industrializado?          |
| `st_food_homemade`            | `VARCHAR` | Alimento caseiro?                  |
| `ds_food_industrial_info`     | `VARCHAR` | Marca, Lote, Validade              |
| `st_location_domicile`        | `VARCHAR` | Consumido em domicílio?            |
| `st_location_daycare`         | `VARCHAR` | Consumido em creche?               |
| `st_location_work`            | `VARCHAR` | Consumido no trabalho?             |
| `st_location_restaurant`      | `VARCHAR` | Consumido em restaurante?          |
| `st_location_party`           | `VARCHAR` | Consumido em festa?                |
| `st_location_other`           | `VARCHAR` | Outro local                        |
| `nu_people_consumed_food`     | `INT`     | Nº de pessoas expostas             |

### 7. Tratamento
| Coluna Banco                       | Tipo SQL  | Descrição / Regra             |
| :--------------------------------- | :-------- | :---------------------------- |
| `st_treatment_ventilatory_support` | `VARCHAR` | Recebeu suporte ventilatório? |
| `st_treatment_antibiotic_therapy`  | `VARCHAR` | Uso de antibióticos?          |
| `st_treatment_antibotulinum_serum` | `VARCHAR` | Uso de soro antibotulínico?   |
| `dt_antibotulinum_serum`           | `DATE`    | Data de administração do soro |

### 8. Exames Complementares
| Coluna Banco                        | Tipo SQL  | Descrição / Regra            |
| :---------------------------------- | :-------- | :--------------------------- |
| `tp_cerebrospinal_fluid`            | `VARCHAR` | Líquor: Realizado/Não        |
| `dt_cerebrospinal_fluid_collection` | `DATE`    | Líquor: Data                 |
| `nu_cerebrospinal_fluid_cells`      | `INT`     | Líquor: Células              |
| `nu_cerebrospinal_fluid_protein`    | `INT`     | Líquor: Proteínas            |
| `st_electroneuromyography`          | `VARCHAR` | Eletroneuromiografia: Status |
| `dt_electroneuromyography_date`     | `DATE`    | Eletroneuromiografia: Data   |
| `tp_emg_sensitive_neuroconduction`  | `VARCHAR` | EMG: Sensitiva               |
| `tp_emg_motor_neuroconduction`      | `VARCHAR` | EMG: Motora                  |
| `tp_emg_repetitive_stimulation`     | `VARCHAR` | EMG: Estimulação repetitiva  |

### 9. Dados Laboratoriais (Toxina Botulínica)
| Coluna Banco                 | Tipo SQL  | Descrição / Regra       |
| :--------------------------- | :-------- | :---------------------- |
| `st_botuli_serum_collected`  | `VARCHAR` | Soro: Coletado?         |
| `dt_botuli_serum_collection` | `DATE`    | Soro: Data              |
| `st_botuli_serum_result`     | `VARCHAR` | Soro: Resultado         |
| `tp_botuli_serum_toxin`      | `VARCHAR` | Soro: Tipo toxina       |
| `st_botuli_feces_collected`  | `VARCHAR` | Fezes: Coletado?        |
| `dt_botuli_feces_collection` | `DATE`    | Fezes: Data             |
| `st_botuli_feces_result`     | `VARCHAR` | Fezes: Resultado        |
| `tp_botuli_feces_toxin`      | `VARCHAR` | Fezes: Tipo toxina      |
| `ds_botuli_food1_info`       | `VARCHAR` | Alimento 1: Descrição   |
| `st_botuli_food1_collected`  | `VARCHAR` | Alimento 1: Coletado?   |
| `dt_botuli_food1_collection` | `DATE`    | Alimento 1: Data        |
| `st_botuli_food1_result`     | `VARCHAR` | Alimento 1: Resultado   |
| `tp_botuli_food1_toxin`      | `VARCHAR` | Alimento 1: Tipo toxina |
| `ds_botuli_food2_info`       | `VARCHAR` | Alimento 2: Descrição   |
| `st_botuli_food2_collected`  | `VARCHAR` | Alimento 2: Coletado?   |
| `dt_botuli_food2_collection` | `DATE`    | Alimento 2: Data        |
| `st_botuli_food2_result`     | `VARCHAR` | Alimento 2: Resultado   |
| `tp_botuli_food2_toxin`      | `VARCHAR` | Alimento 2: Tipo toxina |
| `ds_botuli_other_info`       | `VARCHAR` | Outros: Descrição       |
| `st_botuli_other_collected`  | `VARCHAR` | Outros: Coletado?       |
| `dt_botuli_other_collection` | `DATE`    | Outros: Data            |
| `st_botuli_other_result`     | `VARCHAR` | Outros: Resultado       |
| `tp_botuli_other_toxin`      | `VARCHAR` | Outros: Tipo toxina     |

### 10. Conclusão
| Coluna Banco               | Tipo SQL  | Descrição / Regra                           |
| :------------------------- | :-------- | :------------------------------------------ |
| `tp_final_classification`  | `VARCHAR` | Confirmado / Descartado                     |
| `tp_confirmation_criteria` | `VARCHAR` | Laboratorial / Clínico-Epidemiológico       |
| `tp_botulism`              | `VARCHAR` | Alimentar, Intestinal, Ferimento            |
| `tp_case_evolution`        | `VARCHAR` | Cura, Óbito por agravo, Óbito outras causas |
| `ds_cause`                 | `VARCHAR` | Causa final descritiva                      |
| `st_work_related_disease`  | `VARCHAR` | Relacionado ao trabalho?                    |
| `dt_death`                 | `DATE`    | Data do óbito (se houver)                   |
| `dt_closing`               | `DATE`    | Data de encerramento do caso                |