import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Equal,
  Not,
  MoreThanOrEqual,
  MoreThan,
  LessThanOrEqual,
  LessThan,
  FindOperator,
  ILike,
} from 'typeorm';
import { PaginatedQuery, PaginatedResult } from '../dto/paginatedQuery.dto';

export abstract class AbstractRepositoryBase<TEntity extends ObjectLiteral> {
  protected constructor(protected readonly repo: Repository<TEntity>) {}

  async create(data: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: number | string): Promise<TEntity | null> {
    return this.repo.findOne({ where: { id } as any });
  }

  async findBy<K extends keyof TEntity>(
    field: K,
    value: TEntity[K],
  ): Promise<TEntity | null> {
    const where: FindOptionsWhere<TEntity> = { [field]: value } as any;
    return this.repo.findOne({ where });
  }

  async update(
    id: number | string,
    data: DeepPartial<TEntity>,
  ): Promise<TEntity | null> {
    const entity = await this.repo.preload({ id, ...(data as object) } as any);
    if (!entity) return null;
    return this.repo.save(entity);
  }

  async delete(id: number | string): Promise<boolean> {
    const res = await this.repo.delete(id as any);
    return !!res.affected;
  }

  async list(options?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return this.repo.find(options);
  }

  /**
   * Paginated list with filtering operators including case-insensitive string contains
   */
  async listPaginated(
    query: PaginatedQuery,
    allowedFilters: (keyof TEntity)[] = [],
  ): Promise<PaginatedResult<TEntity>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    // base options
    const options: FindManyOptions<TEntity> = {
      skip,
      take: limit,
      order: {
        [query.sort || 'id']:
          query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      } as any,
    };

    // build "where" using both suffix‑operators and exact matches
    const where: Record<string, any> = {};

    for (const [rawKey, rawVal] of Object.entries(query)) {
      if (['page', 'limit', 'sort', 'order'].includes(rawKey)) continue;

      const m = /^(.+?)_(lt|lte|gt|gte|ne|eq|contains)$/.exec(rawKey);
      if (m) {
        const [, field, op] = m;
        if (!allowedFilters.includes(field as keyof TEntity)) continue;

        if (['lt', 'lte', 'gt', 'gte', 'ne', 'eq'].includes(op)) {
          const valNum = Number(rawVal);
          if (isNaN(valNum)) continue;
          let findOperator: FindOperator<any> | null = null;
          switch (op) {
            case 'lt':
              findOperator = LessThan(valNum);
              break;
            case 'lte':
              findOperator = LessThanOrEqual(valNum);
              break;
            case 'gt':
              findOperator = MoreThan(valNum);
              break;
            case 'gte':
              findOperator = MoreThanOrEqual(valNum);
              break;
            case 'ne':
              findOperator = Not(Equal(valNum));
              break;
            case 'eq':
              findOperator = Equal(valNum);
              break;
          }
          where[field] = findOperator;
        } else if (op === 'contains') {
          const valStr = String(rawVal);
          where[field] = ILike(`%${valStr}%`);
        }
      } else {
        const field = rawKey;
        if (!allowedFilters.includes(field as keyof TEntity)) continue;
        where[field] = rawVal;
      }
    }

    if (Object.keys(where).length) {
      options.where = where as any;
    }

    const [data, total] = await Promise.all([
      this.repo.find(options),
      this.repo.count({ where } as any),
    ]);

    return { data, total, page, limit };
  }
}
