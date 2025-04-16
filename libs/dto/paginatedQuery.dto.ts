export interface PaginatedResult<TEntity> {
  data: TEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  [key: string]: any;
}
