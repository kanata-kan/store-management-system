/**
 * TVA Collected Over Time Chart Component
 *
 * Displays TVA collected trends over time using Bar Chart.
 */

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styled, { useTheme } from "styled-components";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
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

export default function TVAChart({ data = [], loading = false }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartContainer>
        <ChartTitle>Évolution de la TVA Collectée</ChartTitle>
        <EmptyState>Chargement...</EmptyState>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Évolution de la TVA Collectée</ChartTitle>
        <EmptyState>Aucune donnée disponible pour cette période</EmptyState>
      </ChartContainer>
    );
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                color: entry.color,
                margin: "4px 0",
                fontWeight: "600",
              }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartTitle>Évolution de la TVA Collectée</ChartTitle>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          <XAxis
            dataKey="date"
            stroke={theme.colors.muted}
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke={theme.colors.muted}
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="tvaCollected"
            name="TVA Collectée"
            fill={theme.colors.warning}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

