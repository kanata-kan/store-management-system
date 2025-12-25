/**
 * Finance Dashboard Client Component
 *
 * Client Component for Finance Dashboard with date range selection.
 * Handles user interactions and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  differenceInDays,
} from "date-fns";
import KPICard from "./KPICard.js";
import DatePicker from "@/components/ui/datepicker/DatePicker.js";
import { AppIcon } from "@/components/ui";
import { smoothTransition } from "@/components/motion";
import PeriodComparison from "./PeriodComparison.js";

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
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

const TVAGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const TVABreakdownTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const TableHeader = styled.thead`
  background-color: ${(props) => props.theme.colors.elevation2};
`;

const TableHeaderRow = styled.tr`
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const TableHeaderCell = styled.th`
  padding: ${(props) => props.theme.spacing.md};
  text-align: left;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${(props) => props.theme.colors.elevation2};
  }
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foreground};
  
  &:first-child {
    font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  }
  
  &:not(:first-child) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

const EmptyState = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

const ExportSection = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.elevation2};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ExportLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
  margin-right: ${(props) => props.theme.spacing.sm};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    margin-right: 0;
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`;

const ExportButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  ${smoothTransition("background-color, border-color, color, transform")}
  
  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.elevation2};
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex: 1;
    justify-content: center;
  }
`;

/**
 * Finance Dashboard Client Component
 * @param {Object} props
 * @param {Object} props.initialData - Initial financial data from server
 * @param {string} [props.initialError] - Initial error message if data fetch failed
 */
export default function FinanceDashboardClient({ initialData, initialError }) {
  const [dateRange, setDateRange] = useState("today"); // "today" | "month" | "custom"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || null);
  
  // TVA Monitoring state
  const [tvaData, setTvaData] = useState(null);
  const [tvaLoading, setTvaLoading] = useState(false);
  const [tvaError, setTvaError] = useState(null);
  
  // Previous period comparison state
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [previousPeriodLoading, setPreviousPeriodLoading] = useState(false);
  
  // Export state
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Fetch financial data from API
  const fetchFinancialData = async (start, end) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      
      const url = `/api/finance/overview${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.error?.message || "Erreur lors du chargement des données");
      }
      
      setData(result.data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données financières");
      console.error("Finance Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch TVA monitoring data from API
  const fetchTVAMonitoring = async (start, end) => {
    setTvaLoading(true);
    setTvaError(null);
    
    try {
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      
      const url = `/api/finance/tva-monitoring${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.error?.message || "Erreur lors du chargement des données TVA");
      }
      
      setTvaData(result.data);
    } catch (err) {
      setTvaError(err.message || "Erreur lors du chargement des données TVA");
      console.error("TVA Monitoring Error:", err);
    } finally {
      setTvaLoading(false);
    }
  };

  // Fetch previous period data for comparison
  const fetchPreviousPeriodData = async (start, end) => {
    setPreviousPeriodLoading(true);
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysDiff = differenceInDays(endDate, startDate);
      
      // Calculate previous period dates
      let prevStart, prevEnd;
      if (daysDiff <= 1) {
        // Same day - compare to previous day
        prevStart = startOfDay(subDays(startDate, 1));
        prevEnd = endOfDay(subDays(endDate, 1));
      } else if (daysDiff <= 31) {
        // Month range - compare to previous month
        prevStart = startOfMonth(subMonths(startDate, 1));
        prevEnd = endOfMonth(subMonths(endDate, 1));
      } else {
        // Custom range - compare to same length previous period
        prevStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
        prevEnd = new Date(startDate.getTime() - 1);
        prevStart = startOfDay(prevStart);
        prevEnd = endOfDay(prevEnd);
      }
      
      const params = new URLSearchParams();
      params.set("startDate", prevStart.toISOString());
      params.set("endDate", prevEnd.toISOString());
      
      const url = `/api/finance/overview?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.status === "error") {
        // Silently fail - comparison is optional
        setPreviousPeriodData(null);
      } else {
        setPreviousPeriodData(result.data);
      }
    } catch (err) {
      // Silently fail - comparison is optional
      console.error("Previous Period Data Error:", err);
      setPreviousPeriodData(null);
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  // Handle date range button click
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setError(null);
    
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
    
    // Fetch financial overview, TVA monitoring, and previous period data
    fetchFinancialData(start.toISOString(), end.toISOString());
    fetchTVAMonitoring(start.toISOString(), end.toISOString());
    fetchPreviousPeriodData(start.toISOString(), end.toISOString());
  };

  // Handle custom date range change
  useEffect(() => {
    if (dateRange === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate date range
      if (start > end) {
        setError("La date de début doit être antérieure à la date de fin");
        return;
      }
      
      // Fetch financial overview, TVA monitoring, and previous period data
      fetchFinancialData(start.toISOString(), end.toISOString());
      fetchTVAMonitoring(start.toISOString(), end.toISOString());
      fetchPreviousPeriodData(start.toISOString(), end.toISOString());
    }
  }, [dateRange, startDate, endDate]);

  // Fetch TVA monitoring data on mount (using current date range)
  useEffect(() => {
    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);
    fetchTVAMonitoring(start.toISOString(), end.toISOString());
  }, []); // Only on mount

  // Get current date range for export
  const getCurrentDateRange = () => {
    const now = new Date();
    let start, end;
    
    if (dateRange === "today") {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (dateRange === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (dateRange === "custom" && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to today
      start = startOfDay(now);
      end = endOfDay(now);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    setExportingPDF(true);
    setError(null);
    
    try {
      const { start, end } = getCurrentDateRange();
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      
      const url = `/api/finance/export/pdf?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erreur lors de l'export PDF");
      }
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "rapport-financier.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Download file
      const blob = await response.blob();
      const url_obj = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_obj;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_obj);
    } catch (err) {
      setError(err.message || "Erreur lors de l'export PDF");
      console.error("PDF Export Error:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    setExportingExcel(true);
    setError(null);
    
    try {
      const { start, end } = getCurrentDateRange();
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      
      const url = `/api/finance/export/excel?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erreur lors de l'export Excel");
      }
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "rapport-financier.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Download file
      const blob = await response.blob();
      const url_obj = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_obj;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_obj);
    } catch (err) {
      setError(err.message || "Erreur lors de l'export Excel");
      console.error("Excel Export Error:", err);
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <DashboardContainer>
      <PageTitle>Finance Dashboard</PageTitle>

      {/* Export Section */}
      <ExportSection>
        <ExportLabel>Exporter le rapport:</ExportLabel>
        <ExportButtons>
          <ExportButton
            onClick={handleExportPDF}
            disabled={loading || exportingPDF || exportingExcel}
          >
            <AppIcon name="file" size="sm" />
            {exportingPDF ? "Génération..." : "Exporter PDF"}
          </ExportButton>
          <ExportButton
            onClick={handleExportExcel}
            disabled={loading || exportingPDF || exportingExcel}
          >
            <AppIcon name="file" size="sm" />
            {exportingExcel ? "Génération..." : "Exporter Excel"}
          </ExportButton>
        </ExportButtons>
      </ExportSection>

      {/* Date Range Selector */}
      <DateRangeSection>
        <DateRangeButtons>
          <DateRangeButton
            $active={dateRange === "today"}
            onClick={() => handleDateRangeChange("today")}
            disabled={loading}
          >
            Aujourd'hui
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === "month"}
            onClick={() => handleDateRangeChange("month")}
            disabled={loading}
          >
            Ce mois
          </DateRangeButton>
          <DateRangeButton
            $active={dateRange === "custom"}
            onClick={() => handleDateRangeChange("custom")}
            disabled={loading}
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
                disabled={loading}
              />
            </DateInputGroup>
            <DateInputGroup>
              <DateLabel>Date de fin</DateLabel>
              <DatePicker
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Sélectionner la date de fin"
                disabled={loading}
              />
            </DateInputGroup>
          </CustomRangeSection>
        )}
      </DateRangeSection>

      {/* Loading State */}
      {loading && (
        <LoadingState>Chargement des données financières...</LoadingState>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState>
          ⚠️ {error}
        </ErrorState>
      )}

      {/* Period Comparison */}
      {!loading && !error && data && previousPeriodData && (
        <PeriodComparison
          comparisons={[
            {
              label: "Évolution du chiffre d'affaires HT",
              value:
                previousPeriodData.revenueHT > 0
                  ? ((data.revenueHT - previousPeriodData.revenueHT) /
                      previousPeriodData.revenueHT) *
                    100
                  : 0,
            },
            {
              label: "Évolution du profit",
              value:
                previousPeriodData.profit > 0
                  ? ((data.profit - previousPeriodData.profit) /
                      previousPeriodData.profit) *
                    100
                  : 0,
            },
            {
              label: "Évolution de la TVA collectée",
              value:
                previousPeriodData.tvaCollected > 0
                  ? ((data.tvaCollected - previousPeriodData.tvaCollected) /
                      previousPeriodData.tvaCollected) *
                    100
                  : 0,
            },
          ]}
        />
      )}

      {/* Financial Overview Cards */}
      {!loading && !error && data && (
        <StatsGrid>
          <KPICard
            title="Chiffre d'affaires HT"
            value={data.revenueHT || 0}
            unit="MAD"
            variant="primary"
            icon="trending-up"
            compact={false}
          />
          <KPICard
            title="Chiffre d'affaires TTC"
            value={data.revenueTTC || 0}
            unit="MAD"
            variant="info"
            icon="dollar-sign"
            compact={false}
          />
          <KPICard
            title="TVA collectée"
            value={data.tvaCollected || 0}
            unit="MAD"
            variant="warning"
            icon="receipt"
            compact={false}
          />
          <KPICard
            title="Profit"
            value={data.profit || 0}
            unit="MAD"
            variant="success"
            icon="pie-chart"
            compact={false}
          />
          <KPICard
            title="Marge bénéficiaire"
            value={data.profitMargin || 0}
            unit="%"
            variant="success"
            icon="percent"
            compact={false}
          />
        </StatsGrid>
      )}

      {/* TVA Monitoring Section */}
      <Section>
        <SectionTitle>Surveillance TVA</SectionTitle>

        {/* TVA Monitoring Loading State */}
        {tvaLoading && (
          <LoadingState>Chargement des données TVA...</LoadingState>
        )}

        {/* TVA Monitoring Error State */}
        {tvaError && !tvaLoading && (
          <ErrorState>
            ⚠️ {tvaError}
          </ErrorState>
        )}

        {/* TVA Monitoring Content */}
        {!tvaLoading && !tvaError && tvaData && (
          <>
            {/* TVA Summary Cards */}
            <TVAGrid>
              <KPICard
                title="TVA collectée (total)"
                value={tvaData.totalTvaCollected || 0}
                unit="MAD"
                variant="warning"
                icon="receipt"
                compact={false}
              />
              <KPICard
                title="Ventes avec TVA"
                value={tvaData.salesWithTVA || 0}
                unit="ventes"
                variant="info"
                icon="check-circle"
                compact={false}
              />
              <KPICard
                title="Ventes sans TVA"
                value={tvaData.salesWithoutTVA || 0}
                unit="ventes"
                variant="info"
                icon="x-circle"
                compact={false}
              />
            </TVAGrid>

            {/* TVA Breakdown by Rate */}
            {tvaData.breakdownByRate && tvaData.breakdownByRate.length > 0 ? (
              <TVABreakdownTable>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Taux TVA</TableHeaderCell>
                    <TableHeaderCell>Nombre de ventes</TableHeaderCell>
                    <TableHeaderCell>TVA collectée</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {tvaData.breakdownByRate.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.rate}%</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("fr-FR", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.tvaCollected || 0)}{" "}
                        MAD
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TVABreakdownTable>
            ) : (
              <EmptyState>
                Aucune donnée TVA disponible pour cette période.
              </EmptyState>
            )}
          </>
        )}
      </Section>

    </DashboardContainer>
  );
}

export { PageTitle, StatsGrid };

