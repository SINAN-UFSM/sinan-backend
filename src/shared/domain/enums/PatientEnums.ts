enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

// Seguindo o padrão demográfico do IBGE/SUS
enum RaceColor {
    WHITE = 'WHITE',           // Branca
    BLACK = 'BLACK',           // Preta
    PARDO = 'MIXED',           // Parda
    ASIAN = 'ASIAN',           // Amarela
    INDIGENOUS = 'INDIGENOUS', // Indígena
    IGNORED = 'IGNORED'        // Ignorado (Muito comum em fichas do SINAN)
}
enum EducationLevel {
    ILLITERATE = 'ILLITERATE',
    INCOMPLETE_PRIMARY = 'INCOMPLETE_PRIMARY',
    COMPLETE_PRIMARY = 'COMPLETE_PRIMARY',
    INCOMPLETE_SECONDARY = 'INCOMPLETE_SECONDARY',
    COMPLETE_SECONDARY = 'COMPLETE_SECONDARY',
    INCOMPLETE_HIGHER_EDUCATION = 'INCOMPLETE_HIGHER_EDUCATION',
    COMPLETE_HIGHER_EDUCATION = 'COMPLETE_HIGHER_EDUCATION',
    NOT_APPLICABLE = 'NOT_APPLICABLE', // Não se aplica (comum para crianças no SINAN)
    IGNORED = 'IGNORED'
}

export { Gender, RaceColor, EducationLevel };