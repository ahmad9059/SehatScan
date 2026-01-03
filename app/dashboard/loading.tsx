"use client";

import LogoSpinner from "@/app/components/LogoSpinner";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pb-[10%]">
      <LogoSpinner message="Loading dashboard..." />
    </div>
  );
}
