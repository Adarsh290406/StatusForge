import { getSession } from "./session";
import { redirect } from "next/navigation";

export async function getRequiredSession() {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    redirect("/login");
  }
  return session;
}
