import Image from "next/image";
import { RouteShell } from "@/components/landing/route-shell";
import { getProfessionalById } from "@/app/actions/professional";

export const dynamic = "force-dynamic";

type Params = {
  params: { id: string };
};

export default async function ProfessionalPage({ params }: Params) {
  const pro = await getProfessionalById(params.id);

  if (!pro) {
    return (
      <RouteShell
        eyebrow="Professional"
        title="Profile not found"
        description="We couldn't locate that profile."
        primaryLabel="Back to list"
        primaryHref="/professionals"
        secondaryLabel="Home"
        secondaryHref="/"
      >
        <div className="p-6 text-white/64">No profile found.</div>
      </RouteShell>
    );
  }

  return (
    <RouteShell
      eyebrow="Professional"
      title={pro.full_name ?? "Professional profile"}
      description={pro.bio ?? ""}
      primaryLabel="Message"
      primaryHref="#"
      secondaryLabel="Back"
      secondaryHref="/professionals"
    >
      <div className="p-4 text-white sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Image
            src={pro.avatar_url || "/favicon.ico"}
            alt={pro.full_name ?? "avatar"}
            width={112}
            height={112}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
          />
          <div className="min-w-0">
            <h3 className="text-xl font-medium sm:text-2xl">{pro.full_name}</h3>
            <p className="mt-2 text-sm text-white/64">{pro.bio}</p>
            <div className="mt-4 flex gap-3 text-sm text-white/72">
              {pro.hourly_rate != null && (
                <span>{`From $${pro.hourly_rate}/hr`}</span>
              )}
              {pro.service_radius_km != null && (
                <span>{`${pro.service_radius_km} km radius`}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteShell>
  );
}
