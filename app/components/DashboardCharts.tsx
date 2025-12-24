"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

interface AnalysisStats {
  total: number;
  reports: number;
  faces: number;
  risks: number;
}

interface DashboardChartsProps {
  stats: AnalysisStats;
  recentAnalyses: any[];
}

const COLORS = {
  report: "#3B82F6", // Blue
  face: "#10B981", // Green
  risk: "#F59E0B", // Amber
  primary: "#037BFC", // Primary brand color
};

export default function DashboardCharts({
  stats,
  recentAnalyses,
}: DashboardChartsProps) {
  const { t } = useSimpleLanguage();
  // Prepare data for pie chart
  const pieData = [
    { name: t("charts.reports"), value: stats.reports, color: COLORS.report },
    { name: t("charts.faceAnalysis"), value: stats.faces, color: COLORS.face },
    {
      name: t("charts.riskAssessment"),
      value: stats.risks,
      color: COLORS.risk,
    },
  ].filter((item) => item.value > 0);

  // Prepare data for bar chart (analysis types)
  const barData = [
    { name: t("charts.reports"), count: stats.reports, fill: COLORS.report },
    { name: t("charts.faceAnalysis"), count: stats.faces, fill: COLORS.face },
    { name: t("charts.riskAssessment"), count: stats.risks, fill: COLORS.risk },
  ];

  // Prepare data for line chart (analyses over time - last 7 days)
  const getAnalysesOverTime = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    });

    // Count analyses for each day
    recentAnalyses.forEach((analysis) => {
      const analysisDate = new Date(analysis.createdAt)
        .toISOString()
        .split("T")[0];
      const dayData = last7Days.find((day) => day.date === analysisDate);
      if (dayData) {
        dayData.count++;
      }
    });

    return last7Days;
  };

  const lineData = getAnalysesOverTime();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-card)] p-3 border border-[var(--color-border)] rounded-lg shadow-lg">
          <p className="text-sm font-medium text-[var(--color-heading)]">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm text-[var(--color-subtle)]"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (stats.total === 0) {
    return (
      <div className="group relative bg-[var(--color-card)] rounded-xl p-8 shadow-[var(--shadow-soft)] border border-[var(--color-border)] overflow-hidden text-center">
        <div className="relative z-10">
          <div className="text-[var(--color-subtle)]">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2 text-[var(--color-heading)]">
              {t("common.noDataAvailable")}
            </h3>
            <p className="text-sm text-[var(--color-subtle)]">
              {t("common.startAnalyzing")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pie Chart - Analysis Distribution */}
      <div className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)] overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-[var(--color-heading)] mb-4">
            {t("charts.analysisDistribution")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span
                      className="text-sm text-gray-600 dark:text-gray-400"
                      style={{ color: entry.color }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart - Analysis Types */}
      <div className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)] overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-[var(--color-heading)] mb-4">
            {t("charts.analysisTypes")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart - Activity Over Time */}
      <div className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)] overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-[var(--color-heading)] mb-4">
            {t("charts.activityLast7Days")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
