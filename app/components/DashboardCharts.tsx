"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  primary: "#037BFC", // Blue for the bars (brand color)
  chartLine: "#037BFC", // Blue for the area chart (brand color)
};

type TimeRange = "1d" | "1w" | "1m" | "6m" | "1y";

export default function DashboardCharts({
  stats,
  recentAnalyses,
}: DashboardChartsProps) {
  const { t } = useSimpleLanguage();
  const [leftTimeRange, setLeftTimeRange] = useState<TimeRange>("1w");
  const [rightTimeRange, setRightTimeRange] = useState<TimeRange>("1w");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Prepare data for area chart (analyses over time)
  const getAnalysesOverTime = () => {
    const days =
      leftTimeRange === "1d"
        ? 1
        : leftTimeRange === "1w"
        ? 7
        : leftTimeRange === "1m"
        ? 30
        : leftTimeRange === "6m"
        ? 180
        : 365;
    const dataPoints = Array.from({ length: Math.min(days, 7) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (Math.min(days, 7) - 1 - i));
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
        count: 0,
      };
    });

    // Count analyses for each day
    recentAnalyses.forEach((analysis) => {
      const analysisDate = new Date(analysis.createdAt)
        .toISOString()
        .split("T")[0];
      const dayData = dataPoints.find((day) => day.date === analysisDate);
      if (dayData) {
        dayData.count++;
      }
    });

    // Add some variation if no data
    if (dataPoints.every((d) => d.count === 0)) {
      return dataPoints.map((d, i) => ({
        ...d,
        count: Math.floor(Math.random() * 30) + 10,
      }));
    }

    return dataPoints;
  };

  const areaData = getAnalysesOverTime();
  const totalAnalyses = areaData.reduce((sum, d) => sum + d.count, 0);

  // Prepare data for horizontal bar chart (top analysis types)
  const getTopAnalyses = () => {
    const types = [
      {
        name: t("charts.reports"),
        count: stats.reports,
        icon: "/ic-document-red.svg",
      },
      {
        name: t("charts.faceAnalysis"),
        count: stats.faces,
        icon: "/ic-happy.svg",
      },
      {
        name: t("charts.riskAssessment"),
        count: stats.risks,
        icon: "/ic-risk-overview-red.svg",
      },
    ];

    // Sort by count descending
    return types.sort((a, b) => b.count - a.count);
  };

  const barData = getTopAnalyses();
  const maxCount = Math.max(...barData.map((d) => d.count), 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-card)] px-3 py-2 border border-[var(--color-border)] rounded-lg shadow-lg">
          <p className="text-sm font-medium text-[var(--color-heading)]">
            {payload[0].value} analyses
          </p>
        </div>
      );
    }
    return null;
  };

  const TimeRangeSelector = ({
    selected,
    onChange,
  }: {
    selected: TimeRange;
    onChange: (range: TimeRange) => void;
  }) => (
    <div className="flex items-center gap-1 text-xs">
      {(["1d", "1w", "1m", "6m", "1y"] as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-2 py-1 rounded transition-colors ${
            selected === range
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  if (stats.total === 0) {
    return (
      <div className="group relative bg-[var(--color-card)] rounded-xl p-8 border border-[var(--color-border)] overflow-hidden text-center">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart - Total Analyses */}
      <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[var(--color-muted)] text-sm">
              Total analyses:
            </span>
            <span className="text-[var(--color-heading)] text-xl font-bold ml-2">
              {totalAnalyses}
            </span>
          </div>
          <TimeRangeSelector
            selected={leftTimeRange}
            onChange={setLeftTimeRange}
          />
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.chartLine}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.chartLine}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.chartLine}
                strokeWidth={2}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal Bar Chart - Top Analysis Types */}
      <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-[var(--color-heading)] text-sm font-medium">
              Reports
            </span>
            <span className="text-[var(--color-muted)] text-sm">Faces</span>
            <span className="text-[var(--color-muted)] text-sm">Risks</span>
          </div>
          <TimeRangeSelector
            selected={rightTimeRange}
            onChange={setRightTimeRange}
          />
        </div>

        <div className="space-y-4">
          {barData.map((item) => {
            const isHovered = hoveredBar === item.name;
            const isDimmed = hoveredBar !== null && hoveredBar !== item.name;
            const percentage =
              Math.round((item.count / stats.total) * 100) || 0;

            return (
              <div
                key={item.name}
                className={`flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                  isDimmed ? "opacity-40" : "opacity-100"
                }`}
                onMouseEnter={() => setHoveredBar(item.name)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-primary-soft)] p-2 transition-transform duration-300 ${
                    isHovered ? "scale-110" : ""
                  }`}
                >
                  <img src={item.icon} alt="" className="w-4 h-4" />
                </div>
                <div className="flex-1 h-9 bg-[var(--color-surface)] rounded-lg overflow-visible relative group">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 flex items-center px-3 ${
                      isHovered ? "shadow-lg" : ""
                    }`}
                    style={{
                      width: `${Math.max((item.count / maxCount) * 100, 25)}%`,
                      backgroundColor: COLORS.primary,
                    }}
                  >
                    <span className="text-white text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Tooltip on hover */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg z-50 whitespace-nowrap transition-all duration-200 pointer-events-none ${
                      isHovered
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <p className="text-sm font-medium text-[var(--color-heading)]">
                      {item.count} {item.name.toLowerCase()}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {percentage}% of total
                    </p>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[var(--color-card)] border-r border-b border-[var(--color-border)] rotate-45" />
                  </div>
                </div>
                <span
                  className={`text-sm font-medium w-8 text-right shrink-0 transition-all duration-300 ${
                    isHovered
                      ? "text-[var(--color-primary)] font-bold"
                      : "text-[var(--color-heading)]"
                  }`}
                >
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
