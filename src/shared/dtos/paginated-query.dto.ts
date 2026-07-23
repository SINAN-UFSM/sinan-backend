type PaginatedRequestDTO = {
    page?: number;
    limit?: number;
    search?: string;
}
type PaginatedResponseDTO<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

type PaginatedQueryDTO<T> = T & PaginatedRequestDTO;

export type { PaginatedResponseDTO, PaginatedRequestDTO, PaginatedQueryDTO };