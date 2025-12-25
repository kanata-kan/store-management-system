/**
 * Finance Charts & Trends Client Component
 *
 * Client Component for Finance Charts Dashboard with date range selection.
 * Handles user interactions and chart data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import DatePicker from "@/components/ui/datepicker/DatePicker.js";
import { AppIcon } from "@/components/ui";
import { smoothTransition } from "@/components/motion";
import RevenueProfitChart from "./charts/RevenueProfitChart.js";
import TVAChart from "./charts/TVAChart.js";
import SalesVolumeChart from "./charts/SalesVolumeChart.js";
import RevenueByCategoryChart from "./charts/RevenueByCategoryChart.js";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  
  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(
      to right,
      ${(props) => props.theme.colors.primary}40,
      transparent
    );
  }
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const DateRangeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const DateRangeButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const DateRangeButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => 
    props.$active 
      ? props.theme.colors.primary 
      : props.theme.colors.border
  };
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => 
    props.$active 
      ? props.theme.colors.primary 
      : props.theme.colors.surface
  };
  color: ${(props) => 
    props.$active 
      ? props.theme.colors.surface 
      : props.theme.colors.foreground
  };
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => 
    props.$active 
      ? props.theme.typography.fontWeight.semibold 
      : props.theme.typography.fontWeight.normal
  };
  cursor: pointer;
  ${smoothTransition("background-color, border-color, color")}
  
  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => 
      props.$active 
        ? props.theme.colors.primaryHover 
        : props.theme.colors.elevation2
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CustomRangeSection = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
  flex-wrap: wrap;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DateInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  flex: 1;
  min-width: 200px;
`;

const DateLabel = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing["4xl"]};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.lg};
`;

const ErrorState = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  text-align: center;
`;

const Section = styled.section`
  margin-top: ${(props) => props.theme.spacing["2xl"]};
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};
  margin-top: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

export default function FinanceChartsClient() {
  const [dateRange, setDateRange] = useState("today"); // "today" | "month" | "custom"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartsData, setChartsData] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [chartsError, setChartsError] = useState(null);

  // Fetch charts data from API
  const fetchChartsData = async (start, end) => {
    setChartsLoading(true);
    setChartsError(null);
    
    try {
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      
      const url = `/api/finance/charts${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.error?.message || "Erreur lors du chargement des données graphiques");
      }
      
      setChartsData(result.data);
    } catch (err) {
      setChartsError(err.message || "Erreur lors du chargement des données graphiques");
      console.error("Charts Data Error:", err);
    } finally {
      setChartsLoading(false);
    }
  };

  // Handle date range button click
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setChartsError(null);
    
    const now = new Date();
    let start, end;
    
    if (range === "today") {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (range === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      // Custom range - wait for user to select dates
      return;
    }
    
    fetchChartsData(start.toISOString(), end.toISOString());
  };

  // Handle custom date range change
  useEffect(() => {
    if (dateRange === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate date range
      if (start > end) {
        setChartsError("La date de début doit être antérieure à la date de fin");
        return;
      }
      
      fetchChartsData(start.toISOString(), end.toISOString());
    }
  }, [dateRange, startDate, endDate]);

  // Fetch charts data on mount
  useEffect(() => {
    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);
    fetchChartsData(start.toISOString(), end.toISOString());
  }, []); // Only on mount

  return (
    <DashboardContainer>
      <PageTitle>Évolutions et Tendances</PageTitle>

      {/* Date Range Selector */}
      <DateRangeSection>
        <DateRangeButtons>
          <DateRangeButton
            $active={dateRange === "today"}
            onClick={() => handleDateRangeChange("today")}
            disabled={chartsLoading}
          >
            Aujourd'hui
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === "month"}
            onClick={() => handleDateRangeChange("month")}
            disabled={chartsLoading}
          >
            Ce mois
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === "custom"}
            onClick={() => handleDateRangeChange("custom")}
            disabled={chartsLoading}
          >
            Période personnalisée
          </DateRangeButton>
        </DateRangeButtons>

        {dateRange === "custom" && (
          <CustomRangeSection>
            <DateInputGroup>
              <DateLabel>Date de début</DateLabel>
              <DatePicker
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Sélectionner la date de début"
                disabled={chartsLoading}
              />
            </DateInputGroup>
            <DateInputGroup>
              <DateLabel>Date de fin</DateLabel>
              <DatePicker
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Sélectionner la date de fin"
                disabled={chartsLoading}
              />
            </DateInputGroup>
          </CustomRangeSection>
        )}
      </DateRangeSection>

      {/* Charts Loading State */}
      {chartsLoading && (
        <LoadingState>Chargement des graphiques...</LoadingState>
      )}

      {/* Charts Error State */}
      {chartsError && !chartsLoading && (
        <ErrorState>
          ⚠️ {chartsError}
        </ErrorState>
      )}

      {/* Charts Content */}
      {!chartsLoading && !chartsError && chartsData && (
        <>
          {/* Revenue & Profit Over Time Chart */}
          <RevenueProfitChart
            data={chartsData.revenueProfit || []}
            loading={chartsLoading}
          />

          {/* Charts Grid: TVA & Sales Volume */}
          <ChartsGrid>
            <TVAChart
              data={chartsData.tva || []}
              loading={chartsLoading}
            />
            <SalesVolumeChart
              data={chartsData.salesVolume || []}
              loading={chartsLoading}
            />
          </ChartsGrid>

          {/* Revenue by Category Chart */}
          <RevenueByCategoryChart
            data={chartsData.revenueByCategory || []}
            loading={chartsLoading}
          />
        </>
      )}
    </DashboardContainer>
  );
}

