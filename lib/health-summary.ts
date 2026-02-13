import { prisma } from "./db";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "./redis";

interface MetricEntry {
  name: string;
  value: string;
  unit: string;
  status: string;
  date: Date;
}

interface TrendEntry {
  name: string;
  earliest: string;
  latest: string;
  unit: string;
  direction: "improving" | "worsening" | "stable";
}

/**
 * Get a compact health summary for a user, suitable for chatbot prompt injection.
 * Considers ALL analyses (not just 10), deduplicates metrics, computes trends,
 * and keeps output to ~2000-3000 chars. Cached in Redis for 15 min.
 */
export async function getCompactHealthSummary(userId: string): Promise<string> {
  // 1. Check Redis cache
  const cacheKey = CACHE_KEYS.healthSummary(userId);
  const cached = await getCache<string>(cacheKey);
  if (cached) return cached;

  // 2. Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true },
  });

  // 3. Fetch ALL analyses (only needed fields, NO rawData)
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      type: true,
      createdAt: true,
      structuredData: true,
      visualMetrics: true,
      riskAssessment: true,
      problemsDetected: true,
      treatments: true,
    },
  });

  // 4. Compute summary
  const summary = buildSummary(user, analyses);

  // 5. Cache for 15 minutes
  await setCache(cacheKey, summary, CACHE_TTL.ANALYSES);

  return summary;
}

function buildSummary(
  user: { name: string | null; email: string; createdAt: Date } | null,
  analyses: {
    type: string;
    createdAt: Date;
    structuredData: unknown;
    visualMetrics: unknown;
    riskAssessment: string | null;
    problemsDetected: unknown;
    treatments: unknown;
  }[],
): string {
  const lines: string[] = [];

  // Profile line
  if (user) {
    const name = user.name || "User";
    const since = formatDate(user.createdAt);
    lines.push(`USER: ${name} (member since ${since})`);
  }

  // No data case
  if (analyses.length === 0) {
    lines.push("");
    lines.push("HEALTH DATA: No health data available yet.");
    lines.push("SUGGESTION: Encourage the user to:");
    lines.push("- Upload a blood test or lab report in 'Scan Report'");
    lines.push("- Take a facial health analysis in 'Scan Face'");
    lines.push("- Generate a comprehensive Risk Assessment");
    return lines.join("\n");
  }

  // Count by type
  const reports = analyses.filter((a) => a.type === "report");
  const faces = analyses.filter((a) => a.type === "face");
  const risks = analyses.filter((a) => a.type === "risk");

  const oldest = analyses[analyses.length - 1].createdAt;
  const newest = analyses[0].createdAt;

  lines.push("");
  lines.push(
    `HEALTH SUMMARY (${analyses.length} analyses: ${reports.length} reports, ${faces.length} face, ${risks.length} risk | ${formatDate(oldest)} - ${formatDate(newest)})`,
  );

  // --- Extract all metrics from report analyses ---
  const allMetrics: MetricEntry[] = [];
  for (const report of reports) {
    const data = report.structuredData as Record<string, unknown> | null;
    if (!data?.metrics || !Array.isArray(data.metrics)) continue;
    for (const m of data.metrics) {
      const metric = m as Record<string, unknown>;
      if (!metric.name || !metric.value) continue;
      allMetrics.push({
        name: String(metric.name),
        value: String(metric.value),
        unit: String(metric.unit || ""),
        status: String(metric.status || "normal"),
        date: report.createdAt,
      });
    }
  }

  // Deduplicate: most recent value per unique metric name
  const latestByName = new Map<string, MetricEntry>();
  for (const m of allMetrics) {
    const key = m.name.toLowerCase();
    const existing = latestByName.get(key);
    if (!existing || m.date > existing.date) {
      latestByName.set(key, m);
    }
  }

  // Latest metrics (show up to 15)
  if (latestByName.size > 0) {
    lines.push("");
    lines.push("LATEST METRICS:");
    let count = 0;
    for (const m of latestByName.values()) {
      if (count >= 15) break;
      const statusTag = m.status === "normal" ? "normal" : m.status.toUpperCase();
      lines.push(
        `- ${m.name}: ${m.value} ${m.unit} [${statusTag}] (${formatDate(m.date)})`,
      );
      count++;
    }
  }

  // Abnormal findings only
  const abnormal = Array.from(latestByName.values()).filter(
    (m) => m.status !== "normal",
  );
  if (abnormal.length > 0) {
    lines.push("");
    lines.push("ABNORMAL FINDINGS:");
    for (const m of abnormal) {
      lines.push(`- ${m.name}: ${m.value} ${m.unit} [${m.status.toUpperCase()}]`);
    }
  }

  // Trends: for metrics with 2+ data points, compare earliest vs latest
  const trends = computeTrends(allMetrics);
  if (trends.length > 0) {
    lines.push("");
    lines.push("TRENDS:");
    for (const t of trends.slice(0, 10)) {
      lines.push(
        `- ${t.name}: ${t.earliest} -> ${t.latest} ${t.unit} [${t.direction}]`,
      );
    }
  }

  // Latest face analysis
  if (faces.length > 0) {
    const latestFace = faces[0];
    const faceDate = formatDate(latestFace.createdAt);
    const parts: string[] = [`LATEST FACE (${faceDate}):`];

    // Extract visual metrics
    const vm = latestFace.visualMetrics;
    if (vm && typeof vm === "object") {
      const metrics = Array.isArray(vm) ? vm[0] : vm;
      if (metrics && typeof metrics === "object") {
        const m = metrics as Record<string, unknown>;
        if (m.redness_percentage !== undefined)
          parts.push(`Redness ${m.redness_percentage}%`);
        if (m.yellowness_percentage !== undefined)
          parts.push(`Yellowness ${m.yellowness_percentage}%`);
      }
    }

    // Extract conditions from structured data
    const faceData = latestFace.structuredData as Record<string, unknown> | null;
    if (faceData) {
      const conditions: string[] = [];
      if (faceData.observations)
        conditions.push(truncate(String(faceData.observations), 80));
      if (faceData.recommendations)
        conditions.push(truncate(String(faceData.recommendations), 80));
      if (conditions.length > 0) parts.push(conditions.join(", "));
    }

    lines.push("");
    lines.push(parts.join(" | "));
  }

  // Latest risk assessment
  if (risks.length > 0) {
    const latestRisk = risks[0];
    const riskDate = formatDate(latestRisk.createdAt);
    const parts: string[] = [`LATEST RISK (${riskDate}):`];

    if (latestRisk.riskAssessment) {
      // Extract overall risk level from markdown
      const riskLevel = extractRiskLevel(latestRisk.riskAssessment);
      if (riskLevel) parts.push(riskLevel);

      // Extract key concerns (up to 3)
      const concerns = extractKeyConcerns(latestRisk.riskAssessment, 3);
      if (concerns.length > 0) parts.push(concerns.join(", "));
    }

    lines.push("");
    lines.push(parts.join(" | "));
  }

  return lines.join("\n");
}

function computeTrends(allMetrics: MetricEntry[]): TrendEntry[] {
  // Group by metric name
  const byName = new Map<string, MetricEntry[]>();
  for (const m of allMetrics) {
    const key = m.name.toLowerCase();
    const arr = byName.get(key) || [];
    arr.push(m);
    byName.set(key, arr);
  }

  const trends: TrendEntry[] = [];
  for (const [, entries] of byName) {
    if (entries.length < 2) continue;

    // Sort by date ascending
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const earliest = entries[0];
    const latest = entries[entries.length - 1];

    const earliestVal = parseFloat(earliest.value);
    const latestVal = parseFloat(latest.value);
    if (isNaN(earliestVal) || isNaN(latestVal)) continue;

    // Determine direction based on status context
    let direction: TrendEntry["direction"];
    const diff = latestVal - earliestVal;
    if (Math.abs(diff) < 0.01) {
      direction = "stable";
    } else if (
      latest.status === "normal" &&
      (earliest.status === "high" || earliest.status === "low" || earliest.status === "critical")
    ) {
      direction = "improving";
    } else if (
      (latest.status === "high" || latest.status === "low" || latest.status === "critical") &&
      earliest.status === "normal"
    ) {
      direction = "worsening";
    } else if (latest.status === "normal" && earliest.status === "normal") {
      direction = "stable";
    } else {
      // Both abnormal or mixed — use numeric direction vs normal range heuristic
      // If going from high toward normal, improving; away from normal, worsening
      direction = diff > 0
        ? latest.status === "low" ? "improving" : "worsening"
        : latest.status === "high" ? "improving" : "worsening";
    }

    trends.push({
      name: latest.name,
      earliest: earliest.value,
      latest: latest.value,
      unit: latest.unit,
      direction,
    });
  }

  return trends;
}

function extractRiskLevel(riskText: string): string | null {
  // Look for "Overall Risk Level: X" pattern in markdown
  const match = riskText.match(
    /overall risk level[:\s]*\*{0,2}\s*(low|moderate|elevated|high)/i,
  );
  return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : null;
}

function extractKeyConcerns(riskText: string, max: number): string[] {
  const concerns: string[] = [];

  // Extract from "Immediate Concerns" and "Moderate Concerns" sections
  const sections = [
    /immediate concerns.*?\n([\s\S]*?)(?=\n##|\n---|\n\*\*|$)/i,
    /moderate concerns.*?\n([\s\S]*?)(?=\n##|\n---|\n\*\*|$)/i,
  ];

  for (const pattern of sections) {
    const match = riskText.match(pattern);
    if (match) {
      const bullets = match[1].match(/[-*]\s+(.+)/g);
      if (bullets) {
        for (const b of bullets) {
          const text = b.replace(/^[-*]\s+/, "").trim();
          if (
            text &&
            !text.toLowerCase().includes("no immediate") &&
            !text.toLowerCase().includes("none identified")
          ) {
            concerns.push(truncate(text, 60));
            if (concerns.length >= max) return concerns;
          }
        }
      }
    }
  }

  return concerns;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
