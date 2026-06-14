import { CreateUserForm } from "@/components/users/create-user.form";
import { ImportUsersSection } from "@/components/users/import-users-section";

export default function Home() {
  return (
    <main className="container mx-auto max-w-2xl space-y-6 py-10">
      <h1 className="text-2xl font-bold">User Management</h1>
      <CreateUserForm />
      <ImportUsersSection />
    </main>
  );
}
