import Link from "next/link";
import { RouteShell } from "@/components/landing/route-shell";

type VerifyEmailPageProps = {
  searchParams?: { email?: string };
};

export default function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  return (
    <RouteShell
      eyebrow="Verify email"
      title="Confirm your email first"
      description="We created your account. Check your inbox and confirm the email address before signing in."
      primaryLabel="Go to sign in"
      primaryHref="/login"
      secondaryLabel="Back home"
      secondaryHref="/"
    >
      <div className="space-y-4 p-4 sm:p-6">
        {searchParams?.email ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            Confirmation mail sent to {searchParams.email}.
          </div>
        ) : null}

        <p className="text-sm leading-6 text-white/64">
          After you click the link in the email, you can return here and sign
          in.
        </p>

        <p className="text-sm leading-6 text-white/64">
          If you do not see the message, check spam or promotions.
        </p>

        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-sm text-cyan-300 hover:text-white"
        >
          Open sign in
        </Link>
      </div>
    </RouteShell>
  );
}
