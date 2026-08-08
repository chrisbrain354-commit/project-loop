import { Role } from "./generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    workspaceId: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      workspaceId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    workspaceId: string;
  }
}