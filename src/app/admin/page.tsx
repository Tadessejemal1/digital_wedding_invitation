import { redirect } from "next/navigation";

/** No login — open the admin dashboard directly. */
export default function AdminPage() {
  redirect("/admin/dashboard");
}
