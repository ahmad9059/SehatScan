import { redirect } from "next/navigation";

export default function LegacyRiskAssessmentPage() {
  redirect("/dashboard/health-check");
}
