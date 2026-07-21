import { redirect } from "next/navigation";

export default function LoginRedirectPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const next = typeof searchParams?.next === "string" ? searchParams.next : "/search";
  redirect(`/auth?next=${encodeURIComponent(next)}`);
}
