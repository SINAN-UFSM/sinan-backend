def _extract_first_value(source, aliases, default_value=None):
    for key in aliases:
        value = source.get(key)
        if value not in [None, '']:
            return value
    return default_value


def build_specific_payload(specific_fields, config):
    payload = {}
    field_aliases = config.get('field_aliases', {})

    for model_field, aliases in field_aliases.items():
        payload[model_field] = _extract_first_value(specific_fields, aliases)

    return payload


def build_snapshot_payload(patient):
    return {
        'document_snapshot': patient.document,
        'birth_date_snapshot': patient.birth_date,
        'birth_city_snapshot': patient.birth_city,
        'sus_card_snapshot': patient.sus_card,
        'race_color_snapshot': patient.race_color,
        'name_snapshot': patient.name,
        'gender_snapshot': patient.gender,
        'education_level_snapshot': patient.education_level,
        'address_snapshot': patient.current_address or '',
        'phone_snapshot': patient.phone,
    }
