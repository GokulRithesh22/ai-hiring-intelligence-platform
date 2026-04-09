import { query } from "@ai-hiring/database";
import type { CreateDemoSessionInput, User } from "@ai-hiring/shared-types";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: User["role"];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class AuthRepository {
  async findById(userId: string): Promise<User | null> {
    const result = await query<UserRow>("SELECT * FROM users WHERE id = $1 LIMIT 1", [userId]);
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<UserRow>("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async upsertDemoUser(input: CreateDemoSessionInput): Promise<User> {
    const result = await query<UserRow>(
      `
        INSERT INTO users (email, full_name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          updated_at = NOW()
        RETURNING *
      `,
      [input.email, input.fullName, input.role]
    );

    return mapUser(result.rows[0]);
  }

  async upsertSupabaseUser(input: {
    email: string;
    fullName: string;
    role: User["role"];
  }): Promise<User> {
    const result = await query<UserRow>(
      `
        INSERT INTO users (email, full_name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          updated_at = NOW()
        RETURNING *
      `,
      [input.email, input.fullName, input.role]
    );

    return mapUser(result.rows[0]);
  }
}

export const authRepository = new AuthRepository();
