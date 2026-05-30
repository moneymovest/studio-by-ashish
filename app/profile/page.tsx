import { Suspense } from "react";
import ProfessionalProfilePage from "@/components/profile/ProfessionalProfilePage";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-white">
          Loading profile...
        </div>
      }
    >
      <ProfessionalProfilePage />
    </Suspense>
  );
}
