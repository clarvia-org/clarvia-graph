/**
 * PostgreSQL application client for the Clarvia donation engine.
 *
 * Uses the clarvia_app role via DATABASE_URL.
 * Provides a singleton connection pool with typed query helpers.
 */

import pg from "pg";

// ---------------------------------------------------------------------------
// Pool
// ---------------------------------------------------------------------------

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Execute a SQL query and return all rows.
 */
async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<T[]> {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

/**
 * Execute a SQL query and return the first row, or null if no rows.
 */
async function oneOrNone<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<T | null> {
  const result = await pool.query<T>(text, values);
  return result.rows[0] ?? null;
}

/**
 * Execute a SQL query and return exactly one row.
 * Throws if zero or more than one row is returned.
 */
async function one<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<T> {
  const result = await pool.query<T>(text, values);
  if (result.rows.length !== 1) {
    throw new Error(
      `Expected exactly one row, got ${result.rows.length}`,
    );
  }
  return result.rows[0];
}

/**
 * Execute a SQL query that is not expected to return rows.
 */
async function none(text: string, values?: unknown[]): Promise<void> {
  await pool.query(text, values);
}

// ---------------------------------------------------------------------------
// Transaction helper
// ---------------------------------------------------------------------------

export interface TransactionClient {
  query: <T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => Promise<T[]>;
  oneOrNone: <T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => Promise<T | null>;
  one: <T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => Promise<T>;
  none: (text: string, values?: unknown[]) => Promise<void>;
}

/**
 * Execute a function inside a database transaction.
 *
 * Acquires a client from the pool, runs BEGIN, executes the callback,
 * and issues COMMIT on success or ROLLBACK on error.
 */
async function transaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  const txQuery = async <R extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<R[]> => {
    const result = await client.query<R>(text, values);
    return result.rows;
  };

  const txOneOrNone = async <
    R extends pg.QueryResultRow = pg.QueryResultRow,
  >(
    text: string,
    values?: unknown[],
  ): Promise<R | null> => {
    const result = await client.query<R>(text, values);
    return result.rows[0] ?? null;
  };

  const txOne = async <R extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<R> => {
    const result = await client.query<R>(text, values);
    if (result.rows.length !== 1) {
      throw new Error(
        `Expected exactly one row, got ${result.rows.length}`,
      );
    }
    return result.rows[0];
  };

  const txNone = async (
    text: string,
    values?: unknown[],
  ): Promise<void> => {
    await client.query(text, values);
  };

  const tx: TransactionClient = {
    query: txQuery,
    oneOrNone: txOneOrNone,
    one: txOne,
    none: txNone,
  };

  try {
    await client.query("BEGIN");
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const db = {
  query,
  oneOrNone,
  one,
  none,
  transaction,
  /** Direct pool access for advanced use cases. */
  pool,
} as const;
