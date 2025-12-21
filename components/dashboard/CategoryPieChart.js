/**
 * Category Pie Chart Component
 * 
 * Professional pie chart showing sales distribution by category.
 * Uses Recharts library with custom colors and styling.
 */

"use client";

import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const ChartContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  min-height: 400px;
`;

const ChartTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  &::before {
    content: '📊';
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 320px;
`;

const CustomTooltip = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  box-shadow: ${(props) => props.theme.shadows.lg};
`;

const TooltipLabel = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
`;

const TooltipValue = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
`;

const TooltipCount = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
  margin: ${(props) => props.theme.spacing.xs} 0 0 0;
`;

// Professional color palette for pie chart
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
];

/**
 * Custom Tooltip for Pie Chart
 */
function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <CustomTooltip>
        <TooltipLabel>{data.name}</TooltipLabel>
        <TooltipValue>{formatCurrency(data.value)}</TooltipValue>
        <TooltipCount>{data.count} articles vendus</TooltipCount>
      </CustomTooltip>
    );
  }
  return null;
}

/**
 * Custom Label for Pie Chart
 */
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is > 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "14px", fontWeight: "bold" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * Category Pie Chart Component
 * @param {Object} props
 * @param {Array} props.data - Category data array
 * @param {string} [props.title] - Chart title
 */
export default function CategoryPieChart({
  data = [],
  title = "Répartition des ventes par catégorie",
}) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>{title}</ChartTitle>
        <ChartWrapper style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#9ca3af" }}>Aucune donnée disponible</p>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}

