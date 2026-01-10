"use client";

import LogoSpinner from "@/app/components/LogoSpinner";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

export default function DashboardLoading() {
  const { t } = useSimpleLanguage();
  return (
    <div className="flex min-h-[60vh] items-center justify-center pb-[10%]">
      <LogoSpinner message={t("dashboard.loadingDashboard")} />
    </div>
  );
}
