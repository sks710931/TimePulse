using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Common;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class Repository<T, TId> : IRepository<T, TId> where T : AggregateRoot<TId> where TId : notnull
{
    protected readonly TimePulseDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(TimePulseDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FindAsync([id], cancellationToken);
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
    }

    public virtual void Update(T entity)
    {
        DbSet.Update(entity);
    }

    public virtual void Delete(T entity)
    {
        DbSet.Remove(entity);
    }
}
