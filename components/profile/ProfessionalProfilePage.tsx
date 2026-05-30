"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Camera,
  ChevronDown,
  Eye,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  Upload,
  Video,
  Triangle,
  X,
} from "lucide-react";
import getSupabaseClient from "@/lib/supabaseClient";

type ViewMode = "professional" | "client";
type TabKey = "portfolio" | "services" | "reviews" | "bookings";

type ProfessionalRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  handle: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  booking_rate: number | null;
  booking_rate_label: string | null;
  roles: string[] | null;
  jobs_done: number | null;
};

type ServiceRow = {
  id: string;
  professional_id: string;
  name: string;
  price: number | null;
};

type MediaRow = {
  id: string;
  professional_id: string;
  url: string;
  type: "image" | "video";
  created_at: string | null;
};

type ReviewRow = {
  id: string;
  professional_id: string;
  client_id: string;
  rating: number;
  review_text: string | null;
  created_at: string | null;
};

type BookingRow = {
  id: string;
  professional_id: string;
  client_id: string;
  status: "inquiry" | "confirmed" | "completed";
  created_at: string | null;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ProfileDraft = {
  display_name: string;
  handle: string;
  location: string;
  bio: string;
  avatar_url: string;
  booking_rate: string;
  booking_rate_label: string;
  roles: string[];
};

const roleChoices = ["Photographer", "Videographer", "Editor"];
const tabLabels: Array<{ key: TabKey; label: string }> = [
  { key: "portfolio", label: "Portfolio" },
  { key: "services", label: "Services" },
  { key: "reviews", label: "Reviews" },
  { key: "bookings", label: "Bookings" },
];

function formatDate(value: string | null) {
  if (!value) return "Today";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FB";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeHandle(value: string) {
  return value.replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
}

function roundRating(value: number) {
  return Math.round(value * 10) / 10;
}

function mediaTypeFromFile(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function iconButtonClass(active = true) {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm transition",
    active
      ? "border-[#6c63ff]/55 bg-[#6c63ff] text-white"
      : "border-white/10 bg-[#18181f] text-white/70 hover:border-[#6c63ff]/35 hover:text-white",
  ].join(" ");
}

function panelClass() {
  return "rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118]";
}

function fieldClass() {
  return "min-h-11 w-full rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#6c63ff]/55";
}

export default function ProfessionalProfilePage() {
  const supabase = getSupabaseClient();
  const searchParams = useSearchParams();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfessionalRow | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [clientProfiles, setClientProfiles] = useState<
    Record<string, ClientProfile>
  >({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("professional");
  const [activeTab, setActiveTab] = useState<TabKey>("portfolio");
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [aboutEditing, setAboutEditing] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState({ name: "", price: "" });
  const [bioDraft, setBioDraft] = useState("");
  const [reviewDraft, setReviewDraft] = useState({
    rating: 0,
    review_text: "",
  });
  const [bookingRateDraft, setBookingRateDraft] = useState({
    amount: "",
    label: "per day",
  });
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    display_name: "",
    handle: "",
    location: "",
    bio: "",
    avatar_url: "",
    booking_rate: "",
    booking_rate_label: "per day",
    roles: ["Photographer"],
  });

  const searchKey = searchParams.toString();
  const requestedProfileId =
    searchParams.get("profileId") || searchParams.get("id") || null;

  const displayName = profile?.display_name || "Professional";
  const handle =
    profile?.handle ||
    (profileDraft.handle
      ? normalizeHandle(profileDraft.handle)
      : normalizeHandle(displayName)) ||
    "professional";
  const location =
    profile?.location || profileDraft.location || "Location not set";
  const bio =
    profile?.bio ||
    profileDraft.bio ||
    "Add a short bio that tells clients what you do.";
  const avatarUrl = profile?.avatar_url || profileDraft.avatar_url || "";
  const roles = profile?.roles?.length ? profile.roles : profileDraft.roles;
  const ratingAverage = reviews.length
    ? roundRating(
        reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length,
      )
    : 0;
  const jobsDone = profile?.jobs_done ?? 0;
  const isOwner = Boolean(
    authUser && targetUserId && authUser.id === targetUserId,
  );
  const professionalView = isOwner && viewMode === "professional";
  const canEdit = professionalView;
  const activeProfileId = profile?.id || targetUserId || authUser?.id || null;
  const imageCount = useMemo(
    () => media.filter((item) => item.type === "image").length,
    [media],
  );
  const videoCount = useMemo(
    () => media.filter((item) => item.type === "video").length,
    [media],
  );
  const imageLimitReached = imageCount >= 10;
  const videoLimitReached = videoCount >= 5;
  const bookingColumns = useMemo(
    () => ({
      inquiry: bookings.filter((item) => item.status === "inquiry"),
      confirmed: bookings.filter((item) => item.status === "confirmed"),
      completed: bookings.filter((item) => item.status === "completed"),
    }),
    [bookings],
  );
  const visibleTabs = canEdit
    ? tabLabels
    : tabLabels.filter((tab) => tab.key !== "bookings");

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        if (mounted) {
          setLoading(false);
          setError("Supabase is not configured.");
        }
        return;
      }

      try {
        const authResult = await supabase.auth.getUser();
        if (!mounted) return;

        const user = authResult.data.user ?? null;
        setAuthUser(user);

        if (requestedProfileId) {
          setTargetUserId(requestedProfileId);
          setViewMode(
            user && user.id === requestedProfileId ? "professional" : "client",
          );
          setLoading(false);
          return;
        }

        if (user) {
          setTargetUserId(user.id);
          setViewMode("professional");
          setLoading(false);
          return;
        }

        const { data: firstProfessional } = await supabase
          .from("professionals")
          .select("user_id")
          .limit(1)
          .maybeSingle();

        if (!mounted) return;
        setTargetUserId(firstProfessional?.user_id ?? null);
        setViewMode("client");
        setLoading(false);
      } catch (initError) {
        if (!mounted) return;
        setError(
          initError instanceof Error
            ? initError.message
            : "Unable to initialize the profile.",
        );
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [requestedProfileId, searchKey, supabase]);

  useEffect(() => {
    if (!supabase || !targetUserId) return;

    const client = supabase;

    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      const [
        { data: professionalData, error: proError },
        { data: profileData },
        { data: serviceData },
        { data: mediaData },
        { data: reviewData },
        { data: bookingData },
      ] = await Promise.all([
        client
          .from("professionals")
          .select("*")
          .eq("id", targetUserId)
          .limit(1)
          .maybeSingle(),
        client
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", targetUserId)
          .limit(1)
          .maybeSingle(),
        client.from("services").select("*").order("id", { ascending: true }),
        client
          .from("portfolio_media")
          .select("*")
          .order("created_at", { ascending: false }),
        client
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false }),
        client
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      if (proError) {
        setError(proError.message);
      }

      const professionalRow = professionalData as ProfessionalRow | null;
      const professionalId = professionalRow?.id ?? targetUserId;

      const filteredServices = ((serviceData ?? []) as ServiceRow[]).filter(
        (item) => item.professional_id === professionalId,
      );
      const filteredMedia = ((mediaData ?? []) as MediaRow[]).filter(
        (item) => item.professional_id === professionalId,
      );
      const filteredReviews = ((reviewData ?? []) as ReviewRow[]).filter(
        (item) => item.professional_id === professionalId,
      );
      const filteredBookings = ((bookingData ?? []) as BookingRow[]).filter(
        (item) => item.professional_id === professionalId,
      );

      const relatedClientIds = Array.from(
        new Set([
          ...filteredReviews.map((item) => item.client_id),
          ...filteredBookings.map((item) => item.client_id),
        ]),
      );

      let clientProfileMap: Record<string, ClientProfile> = {};

      if (relatedClientIds.length > 0) {
        const { data: relatedProfiles } = await client
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", relatedClientIds);

        clientProfileMap = Object.fromEntries(
          ((relatedProfiles ?? []) as ClientProfile[]).map((item) => [
            item.id,
            item,
          ]),
        );
      }

      if (!mounted) return;

      setProfile(professionalRow);
      setServices(filteredServices);
      setMedia(filteredMedia);
      setReviews(filteredReviews);
      setBookings(filteredBookings);
      setClientProfiles(clientProfileMap);
      setProfileDraft({
        display_name:
          professionalRow?.display_name ||
          profileData?.full_name ||
          "Professional",
        handle:
          professionalRow?.handle ||
          normalizeHandle(profileData?.full_name || "professional"),
        location: professionalRow?.location || "",
        bio: professionalRow?.bio || "",
        avatar_url:
          professionalRow?.avatar_url || profileData?.avatar_url || "",
        booking_rate:
          professionalRow?.booking_rate != null
            ? String(professionalRow.booking_rate)
            : "",
        booking_rate_label: professionalRow?.booking_rate_label || "per day",
        roles: professionalRow?.roles?.length
          ? professionalRow.roles
          : ["Photographer"],
      });
      setBioDraft(professionalRow?.bio || "");
      setBookingRateDraft({
        amount:
          professionalRow?.booking_rate != null
            ? String(professionalRow.booking_rate)
            : "",
        label: professionalRow?.booking_rate_label || "per day",
      });
      setLoading(false);
    }

    void loadProfile();

    const channel = client
      .channel(`profile-page:${targetUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `professional_id=eq.${profile?.id || targetUserId}`,
        },
        () => setRefreshTick((value) => value + 1),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `professional_id=eq.${profile?.id || targetUserId}`,
        },
        () => setRefreshTick((value) => value + 1),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
          filter: `professional_id=eq.${profile?.id || targetUserId}`,
        },
        () => setRefreshTick((value) => value + 1),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_media",
          filter: `professional_id=eq.${profile?.id || targetUserId}`,
        },
        () => setRefreshTick((value) => value + 1),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "professionals",
          filter: `id=eq.${targetUserId}`,
        },
        () => setRefreshTick((value) => value + 1),
      )
      .subscribe();

    return () => {
      mounted = false;
      void client.removeChannel(channel);
    };
  }, [authUser, profile?.id, refreshTick, supabase, targetUserId]);

  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setAuthUser(nextUser);

      if (!requestedProfileId) {
        setTargetUserId(nextUser?.id ?? null);
        setViewMode(nextUser ? "professional" : "client");
      }
    });

    return () => {
      try {
        subscription.data.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [requestedProfileId, supabase]);

  async function ensureProfessionalRow() {
    if (!supabase || !authUser) return null;

    if (profile) return profile;

    const payload = {
      id: authUser.id,
      display_name:
        profileDraft.display_name || authUser.email || "Professional",
      handle: normalizeHandle(profileDraft.handle || "professional"),
      location: profileDraft.location || null,
      bio: profileDraft.bio || null,
      avatar_url: profileDraft.avatar_url || null,
      booking_rate: profileDraft.booking_rate
        ? Number(profileDraft.booking_rate)
        : null,
      booking_rate_label: profileDraft.booking_rate_label || "per day",
      roles: profileDraft.roles.length ? profileDraft.roles : ["Photographer"],
      jobs_done: 0,
    };

    const { data, error: ensureError } = await supabase
      .from("professionals")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (ensureError) {
      throw ensureError;
    }

    const nextProfile = (data as ProfessionalRow | null) ?? null;
    if (nextProfile) {
      setProfile(nextProfile);
      setTargetUserId(nextProfile.id);
    }

    return nextProfile;
  }

  async function persistProfilePatch(patch: Partial<ProfileDraft>) {
    if (!supabase || !authUser) return;

    setBusy("profile");
    setError(null);

    try {
      const nextDraft = { ...profileDraft, ...patch };
      const row = await ensureProfessionalRow();
      const payload = {
        ...(row?.id ? { id: row.id } : {}),
        display_name:
          nextDraft.display_name.trim() || authUser.email || "Professional",
        handle: normalizeHandle(nextDraft.handle || "professional"),
        location: nextDraft.location.trim() || null,
        bio: nextDraft.bio.trim() || null,
        avatar_url: nextDraft.avatar_url.trim() || null,
        booking_rate: nextDraft.booking_rate
          ? Number(nextDraft.booking_rate)
          : null,
        booking_rate_label: nextDraft.booking_rate_label.trim() || "per day",
        roles: nextDraft.roles.length ? nextDraft.roles : ["Photographer"],
        jobs_done: row?.jobs_done ?? profile?.jobs_done ?? 0,
      };

      const { data, error: saveError } = await supabase
        .from("professionals")
        .upsert(payload, { onConflict: "user_id" })
        .select("*")
        .maybeSingle();

      if (saveError) {
        throw saveError;
      }

      const savedProfile = data as ProfessionalRow | null;
      if (savedProfile) {
        await supabase.from("profiles").upsert(
          {
            id: authUser.id,
            full_name: savedProfile.display_name || nextDraft.display_name,
            avatar_url: savedProfile.avatar_url || nextDraft.avatar_url || null,
          },
          {
            onConflict: "id",
            defaultToNull: false,
          },
        );

        setProfile(savedProfile);
        setProfileDraft({
          display_name: savedProfile.display_name || nextDraft.display_name,
          handle: savedProfile.handle || nextDraft.handle,
          location: savedProfile.location || nextDraft.location,
          bio: savedProfile.bio || nextDraft.bio,
          avatar_url: savedProfile.avatar_url || nextDraft.avatar_url,
          booking_rate:
            savedProfile.booking_rate != null
              ? String(savedProfile.booking_rate)
              : nextDraft.booking_rate,
          booking_rate_label:
            savedProfile.booking_rate_label || nextDraft.booking_rate_label,
          roles: savedProfile.roles?.length
            ? savedProfile.roles
            : nextDraft.roles,
        });
        setBioDraft(savedProfile.bio || nextDraft.bio);
        setBookingRateDraft({
          amount:
            savedProfile.booking_rate != null
              ? String(savedProfile.booking_rate)
              : nextDraft.booking_rate,
          label:
            savedProfile.booking_rate_label || nextDraft.booking_rate_label,
        });
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleAvatarPick(file: File | null) {
    if (!supabase || !file || !authUser) return;

    setBusy("avatar");
    setError(null);

    try {
      const row = await ensureProfessionalRow();
      const professionalId = row?.id || profile?.id || authUser.id;
      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `avatars/${professionalId}/${crypto.randomUUID?.() ?? `${Date.now()}`}.${extension}`;
      const previewUrl = URL.createObjectURL(file);

      setProfile((current) =>
        current ? { ...current, avatar_url: previewUrl } : current,
      );
      setProfileDraft((current) => ({ ...current, avatar_url: previewUrl }));

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const nextAvatar = publicUrl.publicUrl;

      setProfile((current) =>
        current ? { ...current, avatar_url: nextAvatar } : current,
      );
      setProfileDraft((current) => ({ ...current, avatar_url: nextAvatar }));
      await persistProfilePatch({ avatar_url: nextAvatar });
    } catch (avatarError) {
      setError(
        avatarError instanceof Error
          ? avatarError.message
          : "Unable to upload avatar.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleMediaPick(files: FileList | null) {
    if (!supabase || !authUser || !files || files.length === 0) return;

    setBusy("media");
    setError(null);

    try {
      const row = await ensureProfessionalRow();
      const professionalId = row?.id || profile?.id || authUser.id;
      let currentImageCount = media.filter(
        (item) => item.type === "image",
      ).length;
      let currentVideoCount = media.filter(
        (item) => item.type === "video",
      ).length;

      for (const file of Array.from(files)) {
        const mediaType = mediaTypeFromFile(file);
        if (!mediaType) continue;

        if (mediaType === "image" && currentImageCount >= 10) {
          throw new Error("Image limit reached (10/10).");
        }
        if (mediaType === "video" && currentVideoCount >= 5) {
          throw new Error("Video limit reached (5/5).");
        }

        const extension =
          file.name.split(".").pop() || (mediaType === "image" ? "jpg" : "mp4");
        const filePath = `portfolio-media/${professionalId}/${crypto.randomUUID?.() ?? `${Date.now()}`}.${extension}`;
        const previewUrl = URL.createObjectURL(file);
        const temporaryId = `${professionalId}-${Date.now()}-${file.name}`;

        setMedia((current) => [
          {
            id: temporaryId,
            professional_id: professionalId,
            url: previewUrl,
            type: mediaType,
            created_at: new Date().toISOString(),
          },
          ...current,
        ]);

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(filePath, file, { upsert: false, contentType: file.type });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrl } = supabase.storage
          .from("portfolio-media")
          .getPublicUrl(filePath);
        const url = publicUrl.publicUrl;

        const { error: insertError } = await supabase
          .from("portfolio_media")
          .insert({
            professional_id: professionalId,
            url,
            type: mediaType,
          });

        if (insertError) {
          throw insertError;
        }

        setMedia((current) =>
          current.map((item) =>
            item.id === temporaryId ? { ...item, id: url, url } : item,
          ),
        );

        if (mediaType === "image") {
          currentImageCount += 1;
        } else {
          currentVideoCount += 1;
        }
      }

    } catch (mediaError) {
      setError(
        mediaError instanceof Error
          ? mediaError.message
          : "Unable to upload media.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function saveBio() {
    setAboutEditing(false);
    try {
      await persistProfilePatch({ bio: bioDraft });
    } catch {
      setAboutEditing(true);
    }
  }

  async function saveProfileEditor() {
    setShowProfileEditor(false);
    try {
      await persistProfilePatch({
        display_name: profileDraft.display_name,
        handle: profileDraft.handle,
        location: profileDraft.location,
        bio: profileDraft.bio,
        avatar_url: profileDraft.avatar_url,
        booking_rate: profileDraft.booking_rate,
        booking_rate_label: profileDraft.booking_rate_label,
        roles: profileDraft.roles,
      });
    } catch {
      setShowProfileEditor(true);
    }
  }

  async function saveBookingRate() {
    await persistProfilePatch({
      booking_rate: bookingRateDraft.amount,
      booking_rate_label: bookingRateDraft.label,
    });
  }

  async function saveService() {
    if (!supabase || !profile) return;

    setBusy("service");
    setError(null);

    try {
      const payload = {
        professional_id: profile.id,
        name: serviceDraft.name.trim() || "New service",
        price: serviceDraft.price ? Number(serviceDraft.price) : 0,
      };

      if (editingServiceId) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingServiceId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert(payload);
        if (insertError) throw insertError;
      }

      setEditingServiceId(null);
      setServiceDraft({ name: "", price: "" });
      setRefreshTick((value) => value + 1);
    } catch (serviceError) {
      setError(
        serviceError instanceof Error
          ? serviceError.message
          : "Unable to save service.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function deleteService(serviceId: string) {
    if (!supabase) return;

    setBusy("service");
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);
      if (deleteError) throw deleteError;
      setRefreshTick((value) => value + 1);
    } catch (serviceError) {
      setError(
        serviceError instanceof Error
          ? serviceError.message
          : "Unable to delete service.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function addService() {
    if (!supabase || !profile) return;

    setBusy("service");
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("services")
        .insert({ professional_id: profile.id, name: "New service", price: 0 })
        .select("*")
        .maybeSingle();

      if (insertError) throw insertError;

      const service = data as ServiceRow | null;
      if (service) {
        setEditingServiceId(service.id);
        setServiceDraft({
          name: service.name,
          price: String(service.price ?? 0),
        });
      }

      setRefreshTick((value) => value + 1);
    } catch (serviceError) {
      setError(
        serviceError instanceof Error
          ? serviceError.message
          : "Unable to add service.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function saveReview() {
    if (!supabase || !authUser || !profile) return;

    setBusy("review");
    setError(null);

    try {
      const { error: reviewError } = await supabase.from("reviews").insert({
        professional_id: profile.id,
        client_id: authUser.id,
        rating: reviewDraft.rating,
        review_text: reviewDraft.review_text.trim(),
      });

      if (reviewError) throw reviewError;

      setReviewDraft({ rating: 0, review_text: "" });
      setShowReviewForm(false);
      setRefreshTick((value) => value + 1);
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to save review.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function createInquiry() {
    if (!supabase || !authUser || !profile) return;

    setBusy("booking");
    setError(null);

    try {
      const { error: bookingError } = await supabase.from("bookings").insert({
        professional_id: profile.id,
        client_id: authUser.id,
        status: "inquiry",
      });

      if (bookingError) throw bookingError;

      setShowBookingForm(false);
      setRefreshTick((value) => value + 1);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to create inquiry.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function updateBookingStatus(
    bookingId: string,
    status: BookingRow["status"],
  ) {
    if (!supabase) return;

    setBusy("booking");
    setError(null);

    try {
      const { error: statusError } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);
      if (statusError) throw statusError;
      setRefreshTick((value) => value + 1);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to update booking.",
      );
    } finally {
      setBusy(null);
    }
  }

  function selectServiceForEdit(service: ServiceRow) {
    setEditingServiceId(service.id);
    setServiceDraft({ name: service.name, price: String(service.price ?? 0) });
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-1 text-[#6c63ff]">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < Math.round(rating) ? "fill-current" : "text-white/20"}`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="profile-page min-h-screen bg-[#0a0a0f] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] px-4 py-3 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin text-[#6c63ff]" />
            Loading professional profile...
          </div>
        </div>
      </main>
    );
  }

  if (!supabase) {
    return (
      <main className="profile-page min-h-screen bg-[#0a0a0f] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center px-4">
          <div
            className={
              panelClass() + " w-full max-w-lg p-6 text-sm text-white/70"
            }
          >
            Supabase is not configured in this environment.
          </div>
        </div>
      </main>
    );
  }

  const coverBadge = professionalView ? "Available for work" : "Client view";

  return (
    <main className="profile-page min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.07)] pb-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118]">
              <Triangle className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.9rem] font-medium tracking-[0.28em]">
                FRAMEBOOK
              </span>
              <span className="block text-[0.65rem] uppercase tracking-[0.32em] text-white/45">
                Professional&apos;s Network
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] px-4 py-2 text-sm text-white/70 md:flex">
              Viewing as:{" "}
              <span className="text-white">
                {professionalView ? "professional" : "client"}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setViewMode((current) =>
                  current === "professional" ? "client" : "professional",
                )
              }
              disabled={!isOwner}
              className={iconButtonClass(isOwner)}
            >
              {professionalView
                ? "Switch to client view"
                : "Preview professional view"}
            </button>
            <ProfileMenu
              user={authUser}
              displayName={displayName}
              avatarUrl={avatarUrl}
              onSignOut={async () => {
                await supabase.auth.signOut();
              }}
            />
          </div>
        </header>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] px-4 py-3 text-sm text-white/70">
            {error}
          </div>
        ) : null}

        <section className="mt-4 overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118]">
          <div className="h-40 bg-[#1a1035]" />

          <div className="px-4 pb-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <button
                    type="button"
                    onClick={() => canEdit && avatarInputRef.current?.click()}
                    disabled={!canEdit}
                    className="group relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#0a0a0f] bg-[#18181f]"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1a1035] text-2xl font-medium text-[#b7a9ff]">
                        {initials(displayName)}
                      </div>
                    )}
                    {canEdit ? (
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/55 text-center text-xs text-white group-hover:flex">
                        <div>
                          <Camera className="mx-auto mb-1 h-4 w-4" />
                          Change photo
                        </div>
                      </div>
                    ) : null}
                    {canEdit ? (
                      <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0a0a0f] bg-[#6c63ff] text-white">
                        <Camera className="h-3 w-3" />
                      </span>
                    ) : null}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    title="Change avatar photo"
                    className="hidden"
                    onChange={(event) => {
                      void handleAvatarPick(event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>

                <div className="space-y-2 pb-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[26px] font-medium leading-none tracking-[-0.03em]">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/35 bg-[#10b981]/12 px-3 py-1 text-xs text-[#10b981]">
                      <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                      {coverBadge}
                    </span>
                  </div>
                  <p className="text-sm text-white/55">
                    @{handle} · {location}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-[#6c63ff]/35 bg-[#6c63ff]/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#c6c0ff]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pb-1">
                {professionalView ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/35 bg-[#10b981]/12 px-4 py-2 text-sm text-[#10b981]">
                      <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                      Available for work
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProfileEditor(true)}
                      className="inline-flex min-h-11 items-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] px-5 text-sm text-white"
                    >
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(true)}
                      className="inline-flex min-h-11 items-center rounded-full bg-[#6c63ff] px-5 text-sm font-medium text-white"
                    >
                      Book now
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="inline-flex min-h-11 items-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] px-5 text-sm text-white"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)]">
              <StatCard
                label="Rating"
                value={reviews.length ? `★ ${ratingAverage.toFixed(1)}` : "0"}
              />
              <StatCard label="Reviews" value={String(reviews.length)} />
              <StatCard label="Jobs Done" value={String(jobsDone)} />
            </div>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[rgba(255,255,255,0.07)] pb-3">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === tab.key
                  ? "bg-[#6c63ff] text-white"
                  : "bg-[#111118] text-white/55 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {!canEdit ? (
            <span className="text-xs text-white/35">
              Bookings are visible to the profile owner only.
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-4">
            {activeTab === "portfolio" ? (
              <PortfolioPanel
                canEdit={canEdit}
                imageCount={imageCount}
                videoCount={videoCount}
                imageLimitReached={imageLimitReached}
                videoLimitReached={videoLimitReached}
                media={media}
                onBrowse={() => mediaInputRef.current?.click()}
                onUpload={(files) => void handleMediaPick(files)}
                mediaInputRef={mediaInputRef}
              />
            ) : null}

            {activeTab === "services" ? (
              <ServicesTab
                canEdit={canEdit}
                services={services}
                bookingRate={
                  profile?.booking_rate ?? Number(bookingRateDraft.amount || 0)
                }
                bookingRateLabel={
                  profile?.booking_rate_label || bookingRateDraft.label
                }
                editingServiceId={editingServiceId}
                serviceDraft={serviceDraft}
                onEdit={(service) => selectServiceForEdit(service)}
                onChangeDraft={setServiceDraft}
                onSaveService={() => void saveService()}
                onDeleteService={(serviceId) => void deleteService(serviceId)}
                onAddService={() => void addService()}
                onCancelEdit={() => {
                  setEditingServiceId(null);
                  setServiceDraft({ name: "", price: "" });
                }}
                bookingRateDraft={bookingRateDraft}
                onChangeBookingRateDraft={setBookingRateDraft}
                onSaveBookingRate={() => void saveBookingRate()}
              />
            ) : null}

            {activeTab === "reviews" ? (
              <ReviewsTab
                canEdit={canEdit}
                authUser={authUser}
                reviews={reviews}
                clientProfiles={clientProfiles}
                average={ratingAverage}
                onToggleForm={() => setShowReviewForm((value) => !value)}
                showReviewForm={showReviewForm}
                reviewDraft={reviewDraft}
                onChangeReviewDraft={setReviewDraft}
                onSaveReview={() => void saveReview()}
              />
            ) : null}

            {activeTab === "bookings" && canEdit ? (
              <BookingsTab
                bookings={bookingColumns}
                clientProfiles={clientProfiles}
                onMove={(bookingId, status) =>
                  void updateBookingStatus(bookingId, status)
                }
              />
            ) : null}
          </div>

          <aside className="space-y-4">
            <AboutCard
              canEdit={canEdit}
              bio={bio}
              aboutEditing={aboutEditing}
              bioDraft={bioDraft}
              onStartEdit={() => {
                setAboutEditing(true);
                setBioDraft(bio);
              }}
              onChangeBioDraft={setBioDraft}
              onSaveBio={() => void saveBio()}
              onCancel={() => {
                setAboutEditing(false);
                setBioDraft(bio);
              }}
            />

            <ServicesSidebar
              canEdit={canEdit}
              services={services}
              bookingRate={
                profile?.booking_rate ?? Number(bookingRateDraft.amount || 0)
              }
              bookingRateLabel={
                profile?.booking_rate_label || bookingRateDraft.label
              }
              editingServiceId={editingServiceId}
              serviceDraft={serviceDraft}
              onEdit={(service) => selectServiceForEdit(service)}
              onChangeDraft={setServiceDraft}
              onSaveService={() => void saveService()}
              onDeleteService={(serviceId) => void deleteService(serviceId)}
              onAddService={() => void addService()}
              onCancelEdit={() => {
                setEditingServiceId(null);
                setServiceDraft({ name: "", price: "" });
              }}
              bookingRateDraft={bookingRateDraft}
              onChangeBookingRateDraft={setBookingRateDraft}
              onSaveBookingRate={() => void saveBookingRate()}
            />

            <RatingsSidebar
              canEdit={canEdit}
              average={ratingAverage}
              reviews={reviews}
              clientProfiles={clientProfiles}
              onToggleForm={() => setShowReviewForm((value) => !value)}
              showReviewForm={showReviewForm}
              authUser={authUser}
              reviewDraft={reviewDraft}
              onChangeReviewDraft={setReviewDraft}
              onSaveReview={() => void saveReview()}
            />
          </aside>
        </div>
      </div>

      {showProfileEditor ? (
        <Modal title="Edit profile" onClose={() => setShowProfileEditor(false)}>
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-white/45">
                Display name
              </span>
              <input
                value={profileDraft.display_name}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    display_name: event.target.value,
                  }))
                }
                title="Display name"
                placeholder="Display name"
                className={fieldClass()}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-white/45">
                Handle
              </span>
              <input
                value={profileDraft.handle}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    handle: event.target.value,
                  }))
                }
                title="Handle"
                placeholder="Handle"
                className={fieldClass()}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-white/45">
                Location
              </span>
              <input
                value={profileDraft.location}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                title="Location"
                placeholder="Location"
                className={fieldClass()}
              />
            </label>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-white/45">
                Roles
              </span>
              <div className="flex flex-wrap gap-2">
                {roleChoices.map((role) => {
                  const active = profileDraft.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setProfileDraft((current) => ({
                          ...current,
                          roles: active
                            ? current.roles.filter((item) => item !== role)
                            : [...current.roles, role],
                        }))
                      }
                      className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.24em] ${
                        active
                          ? "border-[#6c63ff]/55 bg-[#6c63ff]/10 text-white"
                          : "border-[rgba(255,255,255,0.07)] bg-[#18181f] text-white/55"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProfileEditor(false)}
                className={iconButtonClass(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveProfileEditor()}
                className={iconButtonClass(true)}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showBookingForm ? (
        <Modal title="Book now" onClose={() => setShowBookingForm(false)}>
          <div className="space-y-4 text-sm text-white/70">
            <p>
              Send a booking inquiry to this professional. The booking will
              appear in the owner&apos;s pipeline as an inquiry.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className={iconButtonClass(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void createInquiry()}
                className={iconButtonClass(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Send inquiry
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function ProfileMenu({
  user,
  displayName,
  avatarUrl,
  onSignOut,
}: {
  user: User | null;
  displayName: string;
  avatarUrl: string;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-3 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] px-3 py-2 text-left text-sm text-white"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1035] text-xs text-[#b7a9ff]">
            {initials(displayName)}
          </span>
        )}
        <span className="hidden max-w-28 truncate sm:block">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-white/55" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-56 rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-2">
          <div className="px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/35">
            {user?.email || "Not signed in"}
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-white/80 hover:bg-[#18181f]"
            onClick={() => setOpen(false)}
          >
            <Eye className="h-4 w-4 text-[#6c63ff]" />
            Open profile
          </Link>
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await onSignOut();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-white/80 hover:bg-[#18181f]"
            >
              <LogOut className="h-4 w-4 text-[#6c63ff]" />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-white/80 hover:bg-[#18181f]"
              onClick={() => setOpen(false)}
            >
              <MessageSquare className="h-4 w-4 text-[#6c63ff]" />
              Sign in
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111118] px-4 py-3">
      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-white/35">
        {label}
      </div>
      <div className="mt-2 text-lg font-medium text-white">{value}</div>
    </div>
  );
}

function PortfolioPanel({
  canEdit,
  imageCount,
  videoCount,
  imageLimitReached,
  videoLimitReached,
  media,
  onBrowse,
  onUpload,
  mediaInputRef,
}: {
  canEdit: boolean;
  imageCount: number;
  videoCount: number;
  imageLimitReached: boolean;
  videoLimitReached: boolean;
  media: MediaRow[];
  onBrowse: () => void;
  onUpload: (files: FileList | null) => void;
  mediaInputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <section className={panelClass() + " p-4"}>
      {canEdit ? (
        <div className="mb-4 rounded-[12px] border border-dashed border-[#6c63ff]/45 bg-[#18181f] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-white">
                Drop photos or videos · Browse files
              </div>
              <div className="mt-1 text-xs text-white/45">
                {imageCount} / 10 images · {videoCount} / 5 videos
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onBrowse}
                disabled={imageLimitReached && videoLimitReached}
                className={iconButtonClass(
                  !(imageLimitReached && videoLimitReached),
                )}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload media
              </button>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                title="Upload portfolio media"
                className="hidden"
                onChange={(event) => {
                  onUpload(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
            {imageLimitReached ? (
              <span className="rounded-full border border-[#6c63ff]/35 bg-[#6c63ff]/10 px-3 py-1 text-[#c6c0ff]">
                Image limit reached (10/10)
              </span>
            ) : null}
            {videoLimitReached ? (
              <span className="rounded-full border border-[#6c63ff]/35 bg-[#6c63ff]/10 px-3 py-1 text-[#c6c0ff]">
                Video limit reached (5/5)
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-[3px]">
        {media.length > 0
          ? media.map((item) => <MediaTile key={item.id} item={item} />)
          : Array.from({ length: 9 }, (_, index) => (
              <div key={index} className="aspect-square bg-[#18181f]" />
            ))}
      </div>
    </section>
  );
}

function MediaTile({ item }: { item: MediaRow }) {
  return (
    <div className="group relative aspect-square overflow-hidden bg-[#18181f]">
      {item.type === "image" ? (
        <img
          src={item.url}
          alt="Portfolio item"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#111118] text-white/35">
          <Video className="h-8 w-8" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-[#6c63ff]/0 text-white opacity-0 transition group-hover:bg-[#6c63ff]/16 group-hover:opacity-100">
        <Eye className="h-5 w-5" />
      </div>
    </div>
  );
}

function ServicesTab({
  canEdit,
  services,
  bookingRate,
  bookingRateLabel,
  editingServiceId,
  serviceDraft,
  onEdit,
  onChangeDraft,
  onSaveService,
  onDeleteService,
  onAddService,
  onCancelEdit,
  bookingRateDraft,
  onChangeBookingRateDraft,
  onSaveBookingRate,
}: {
  canEdit: boolean;
  services: ServiceRow[];
  bookingRate: number | null | undefined;
  bookingRateLabel: string | null | undefined;
  editingServiceId: string | null;
  serviceDraft: { name: string; price: string };
  onEdit: (service: ServiceRow) => void;
  onChangeDraft: (draft: { name: string; price: string }) => void;
  onSaveService: () => void;
  onDeleteService: (serviceId: string) => void;
  onAddService: () => void;
  onCancelEdit: () => void;
  bookingRateDraft: { amount: string; label: string };
  onChangeBookingRateDraft: (draft: { amount: string; label: string }) => void;
  onSaveBookingRate: () => void;
}) {
  return (
    <section className={panelClass() + " p-4 space-y-4"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Services & Pricing
          </div>
          <h2 className="mt-1 text-lg font-medium text-white">Services</h2>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={onAddService}
            className={iconButtonClass(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add service
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        {services.length > 0 ? (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-3"
            >
              {editingServiceId === service.id ? (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <input
                    value={serviceDraft.name}
                    onChange={(event) =>
                      onChangeDraft({
                        ...serviceDraft,
                        name: event.target.value,
                      })
                    }
                    className={fieldClass()}
                    title="Service name"
                    placeholder="Service name"
                  />
                  <input
                    value={serviceDraft.price}
                    onChange={(event) =>
                      onChangeDraft({
                        ...serviceDraft,
                        price: event.target.value,
                      })
                    }
                    className={fieldClass()}
                    inputMode="numeric"
                    title="Service price"
                    placeholder="Price"
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <button
                      type="button"
                      onClick={onSaveService}
                      className={iconButtonClass(true)}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className={iconButtonClass(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white">{service.name}</div>
                    <div className="mt-1 text-sm text-white/55">
                      {formatMoney(service.price)}
                    </div>
                  </div>
                  {canEdit ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(service)}
                        title="Edit service"
                        aria-label="Edit service"
                        className="rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] p-2 text-white/60"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteService(service.id)}
                        title="Delete service"
                        aria-label="Delete service"
                        className="rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] p-2 text-white/60"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4 text-sm text-white/55">
            No services yet.
          </div>
        )}
      </div>

      <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4">
        <div className="text-xs uppercase tracking-[0.24em] text-white/35">
          Booking rate
        </div>
        <div className="mt-2 text-lg text-white">
          {formatMoney(bookingRate)}{" "}
          {bookingRateLabel ? (
            <span className="text-sm text-white/55">{bookingRateLabel}</span>
          ) : null}
        </div>
        {canEdit ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
            <input
              value={bookingRateDraft.amount}
              onChange={(event) =>
                onChangeBookingRateDraft({
                  ...bookingRateDraft,
                  amount: event.target.value,
                })
              }
              className={fieldClass()}
              inputMode="numeric"
              title="Booking rate amount"
              placeholder="Amount"
            />
            <input
              value={bookingRateDraft.label}
              onChange={(event) =>
                onChangeBookingRateDraft({
                  ...bookingRateDraft,
                  label: event.target.value,
                })
              }
              className={fieldClass()}
              title="Booking rate label"
              placeholder="per day"
            />
            <button
              type="button"
              onClick={onSaveBookingRate}
              className={iconButtonClass(true)}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ReviewsTab({
  canEdit,
  authUser,
  reviews,
  clientProfiles,
  average,
  onToggleForm,
  showReviewForm,
  reviewDraft,
  onChangeReviewDraft,
  onSaveReview,
}: {
  canEdit: boolean;
  authUser: User | null;
  reviews: ReviewRow[];
  clientProfiles: Record<string, ClientProfile>;
  average: number;
  onToggleForm: () => void;
  showReviewForm: boolean;
  reviewDraft: { rating: number; review_text: string };
  onChangeReviewDraft: (draft: { rating: number; review_text: string }) => void;
  onSaveReview: () => void;
}) {
  return (
    <section className={panelClass() + " p-4 space-y-4"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Ratings
          </div>
          <h2 className="mt-1 text-lg font-medium text-white">Reviews</h2>
        </div>
        {!canEdit ? (
          <button
            type="button"
            onClick={onToggleForm}
            className={iconButtonClass(true)}
          >
            Leave a review
          </button>
        ) : null}
      </div>

      {showReviewForm && !canEdit ? (
        <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4 space-y-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  onChangeReviewDraft({ ...reviewDraft, rating: index + 1 })
                }
                title={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
                aria-label={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
                className={`rounded-full p-1 ${index < reviewDraft.rating ? "text-[#6c63ff]" : "text-white/30"}`}
              >
                <Star
                  className={`h-5 w-5 ${index < reviewDraft.rating ? "fill-current" : ""}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={reviewDraft.review_text}
            onChange={(event) =>
              onChangeReviewDraft({
                ...reviewDraft,
                review_text: event.target.value,
              })
            }
            rows={4}
            className={fieldClass() + " resize-none"}
            placeholder="Write your review"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onToggleForm}
              className={iconButtonClass(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveReview}
              className={iconButtonClass(true)}
              disabled={!authUser || !reviewDraft.rating}
            >
              <Save className="mr-2 h-4 w-4" />
              Submit
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4">
        {reviews.length > 0 ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[2rem] font-medium leading-none text-white">
                  {average.toFixed(1)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {renderStaticStars(average)}
                  <span className="text-sm text-white/55">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              {!canEdit ? null : null}
            </div>

            <div className="mt-4 space-y-3">
              {reviews.map((review) => {
                const client = clientProfiles[review.client_id];
                const name = client?.full_name || "Client";
                return (
                  <div
                    key={review.id}
                    className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1035] text-sm text-[#b7a9ff]">
                        {initials(name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate text-sm text-white">
                            {name}
                          </div>
                          <div className="text-xs text-white/35">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        <div className="mt-1">
                          {renderStaticStars(review.rating)}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/65">
                          {review.review_text || "No review text provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-sm text-white/55">
            No reviews yet — your score will appear here once a client rates
            you.
          </div>
        )}
      </div>
    </section>
  );
}

function renderStaticStars(value: number) {
  return (
    <div className="flex items-center gap-1 text-[#6c63ff]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(value) ? "fill-current" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

function BookingsTab({
  bookings,
  clientProfiles,
  onMove,
}: {
  bookings: {
    inquiry: BookingRow[];
    confirmed: BookingRow[];
    completed: BookingRow[];
  };
  clientProfiles: Record<string, ClientProfile>;
  onMove: (bookingId: string, status: BookingRow["status"]) => void;
}) {
  const columns: Array<{ key: BookingRow["status"]; label: string }> = [
    { key: "inquiry", label: "New Inquiries" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <section className={panelClass() + " p-4"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Bookings
          </div>
          <h2 className="mt-1 text-lg font-medium text-white">
            Booking pipeline
          </h2>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.key}
            className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-3"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">
              {column.label}
            </div>
            <div className="mt-3 space-y-3">
              {bookings[column.key].length > 0 ? (
                bookings[column.key].map((booking) => {
                  const client = clientProfiles[booking.client_id];
                  const nextStatus =
                    booking.status === "inquiry"
                      ? "confirmed"
                      : booking.status === "confirmed"
                        ? "completed"
                        : null;
                  return (
                    <div
                      key={booking.id}
                      className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-white">
                            {client?.full_name || "Client"}
                          </div>
                          <div className="mt-1 text-xs text-white/40">
                            {formatDate(booking.created_at)}
                          </div>
                        </div>
                        <span className="rounded-full border border-[#6c63ff]/35 bg-[#6c63ff]/10 px-2 py-1 text-xs text-[#c6c0ff]">
                          {booking.status}
                        </span>
                      </div>
                      {nextStatus ? (
                        <button
                          type="button"
                          onClick={() => onMove(booking.id, nextStatus)}
                          className="mt-3 inline-flex min-h-10 items-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[#18181f] px-4 text-xs text-white"
                        >
                          {nextStatus === "completed"
                            ? "Mark complete"
                            : "Confirm"}
                        </button>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-3 text-sm text-white/45">
                  No bookings here.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutCard({
  canEdit,
  bio,
  aboutEditing,
  bioDraft,
  onStartEdit,
  onChangeBioDraft,
  onSaveBio,
  onCancel,
}: {
  canEdit: boolean;
  bio: string;
  aboutEditing: boolean;
  bioDraft: string;
  onStartEdit: () => void;
  onChangeBioDraft: (value: string) => void;
  onSaveBio: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={panelClass() + " p-4 space-y-3"}>
      <div className="text-xs uppercase tracking-[0.24em] text-white/35">
        About
      </div>
      {aboutEditing ? (
        <>
          <textarea
            value={bioDraft}
            onChange={(event) => onChangeBioDraft(event.target.value)}
            rows={5}
            className={fieldClass() + " resize-none"}
            title="Bio"
            placeholder="Add a short bio"
          />
          {canEdit ? (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className={iconButtonClass(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveBio}
                className={iconButtonClass(true)}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={() => canEdit && onStartEdit()}
          className="w-full rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4 text-left text-sm leading-6 text-white/70"
        >
          {bio}
          {canEdit ? (
            <div className="mt-3 text-xs text-[#b7a9ff]">Click to edit bio</div>
          ) : null}
        </button>
      )}
    </section>
  );
}

function ServicesSidebar(props: React.ComponentProps<typeof ServicesTab>) {
  return <ServicesTab {...props} />;
}

function RatingsSidebar({
  canEdit,
  average,
  reviews,
  clientProfiles,
  onToggleForm,
  showReviewForm,
  authUser,
  reviewDraft,
  onChangeReviewDraft,
  onSaveReview,
}: {
  canEdit: boolean;
  average: number;
  reviews: ReviewRow[];
  clientProfiles: Record<string, ClientProfile>;
  onToggleForm: () => void;
  showReviewForm: boolean;
  authUser: User | null;
  reviewDraft: { rating: number; review_text: string };
  onChangeReviewDraft: (draft: { rating: number; review_text: string }) => void;
  onSaveReview: () => void;
}) {
  return (
    <section className={panelClass() + " p-4 space-y-4"}>
      <div className="text-xs uppercase tracking-[0.24em] text-white/35">
        Ratings
      </div>
      {reviews.length > 0 ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[2rem] font-medium leading-none text-white">
                {average.toFixed(1)}
              </div>
              <div className="mt-2">{renderStaticStars(average)}</div>
            </div>
            <div className="text-sm text-white/55">{reviews.length} total</div>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => {
              const client = clientProfiles[review.client_id];
              const name = client?.full_name || "Client";
              return (
                <div
                  key={review.id}
                  className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1035] text-xs text-[#b7a9ff]">
                      {initials(name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-white">{name}</div>
                      <div className="text-xs text-white/35">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">{renderStaticStars(review.rating)}</div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {review.review_text || "No text provided."}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4 text-sm text-white/55">
          No reviews yet — your score will appear here once a client rates you.
        </div>
      )}

      {!canEdit ? (
        <button
          type="button"
          onClick={onToggleForm}
          className={iconButtonClass(true)}
        >
          Leave a review
        </button>
      ) : null}

      {showReviewForm && !canEdit ? (
        <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-4 space-y-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  onChangeReviewDraft({ ...reviewDraft, rating: index + 1 })
                }
                title={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
                aria-label={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
                className={`rounded-full p-1 ${index < reviewDraft.rating ? "text-[#6c63ff]" : "text-white/30"}`}
              >
                <Star
                  className={`h-5 w-5 ${index < reviewDraft.rating ? "fill-current" : ""}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={reviewDraft.review_text}
            onChange={(event) =>
              onChangeReviewDraft({
                ...reviewDraft,
                review_text: event.target.value,
              })
            }
            rows={4}
            className={fieldClass() + " resize-none"}
            placeholder="Share your experience"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onToggleForm}
              className={iconButtonClass(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveReview}
              className={iconButtonClass(true)}
              disabled={!authUser || !reviewDraft.rating}
            >
              <Save className="mr-2 h-4 w-4" />
              Submit
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-lg rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[#111118] p-4 shadow-none">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-lg font-medium text-white">{title}</div>
          <button
            type="button"
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal"
            className="rounded-full border border-[rgba(255,255,255,0.07)] bg-[#18181f] p-2 text-white/55"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
