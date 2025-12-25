/**
 * Revenue by Category Chart Component
 *
 * Displays revenue contribution by category using Pie Chart.
 */

"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import styled, { useTheme } from "styled-components";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const ChartContainer = styled.div`
  width: 100%;
  height: 500px;
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const ChartTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

export default function RevenueByCategoryChart({ data = [], loading = false }) {
  const theme = useTheme();

  // Color palette for pie chart segments (using theme colors)
  const COLORS = [
    theme.colors.info, // blue
    theme.colors.success, // green
    theme.colors.warning, // amber
    theme.colors.error, // red
    theme.colors.accent, // purple
    theme.colors.secondary, // secondary color
    theme.colors.primary, // primary blue
    theme.colors.critical, // orange-red
  ];

  if (loading) {
    return (
      <ChartContainer>
        <ChartTitle>Répartition du Chiffre d'affaires par Catégorie</ChartTitle>
        <EmptyState>Chargement...</EmptyState>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Répartition du Chiffre d'affaires par Catégorie</ChartTitle>
        <EmptyState>Aucune donnée disponible pour cette période</EmptyState>
      </ChartContainer>
    );
  }

  // Transform data for pie chart
  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.revenueHT,
    color: COLORS[index % COLORS.length],
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div
          style={{
            backgroundColor: theme.colors.surface,
            padding: "10px",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.sm,
          }}
        >
          <p style={{ margin: "4px 0", fontWeight: "600" }}>{data.name}</p>
          <p style={{ margin: "4px 0", color: data.payload.color }}>
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartTitle>Répartition du Chiffre d'affaires par Catégorie</ChartTitle>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill={theme.colors.primary}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

