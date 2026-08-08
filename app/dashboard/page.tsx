import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Logged in as {session?.user?.email} — workspace: {session?.user?.workspaceId}
      </p>
    </div>
  );
}