/**
 * Sales Line Chart Component
 * 
 * Professional line chart showing sales trends over time.
 * Uses Recharts library for high-quality visualizations.
 */

"use client";

import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const ChartContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  min-height: 350px;
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
    content: '📈';
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
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
  color: ${(props) => props.theme.colors.success};
  margin: 0;
`;

const TooltipCount = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
  margin: ${(props) => props.theme.spacing.xs} 0 0 0;
`;

/**
 * Custom Tooltip for Line Chart
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <CustomTooltip>
        <TooltipLabel>{label}</TooltipLabel>
        <TooltipValue>{formatCurrency(payload[0].value)}</TooltipValue>
        <TooltipCount>{payload[0].payload.count} ventes</TooltipCount>
      </CustomTooltip>
    );
  }
  return null;
}

/**
 * Sales Line Chart Component
 * @param {Object} props
 * @param {Array} props.data - Sales data array
 * @param {string} [props.title] - Chart title
 */
export default function SalesLineChart({
  data = [],
  title = "Ventes des 7 derniers jours",
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="totalAmount"
              name="Ventes (MAD)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}

