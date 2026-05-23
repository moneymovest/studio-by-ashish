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
      <div className="p-6 text-white">
        <div className="flex items-center gap-6">
          <img
            src={pro.avatar_url || "/favicon.ico"}
            alt={pro.full_name ?? "avatar"}
            className="h-28 w-28 rounded-2xl object-cover"
          />
          <div>
            <h3 className="text-2xl font-medium">{pro.full_name}</h3>
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
