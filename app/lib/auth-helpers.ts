import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export type Role = "ADMIN" | "ANALYST" | "VIEWER";

// Base class — lets withAuth catch anything with a `status` and respond correctly.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class AuthError extends ApiError {
  constructor(status: 401 | 403, message: string) {
    super(status, message);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not found") {
    super(404, message);
  }
}

export async function requireRole(allowed: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AuthError(401, "Not authenticated");
  }

  const role = session.user.role as Role;
  const workspaceId = session.user.workspaceId as string;

  if (!allowed.includes(role)) {
    throw new AuthError(403, `Role ${role} cannot perform this action`);
  }

  return { userId: session.user.id, role, workspaceId };
}

export async function withAuth<T>(
  allowed: Role[],
  handler: (ctx: { userId: string; role: Role; workspaceId: string }) => Promise<T>
) {
  try {
    const ctx = await requireRole(allowed);
    const result = await handler(ctx);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}