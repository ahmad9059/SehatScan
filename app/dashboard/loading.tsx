"use client";

import LogoSpinner from "@/app/components/LogoSpinner";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center pb-[20%]">
      <LogoSpinner message="Loading dashboard..." />
    </div>
  );
}
