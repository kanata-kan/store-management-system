/**
 * Finance Settings Client Component
 *
 * Client Component for Finance Settings with form handling.
 * Handles user interactions and data updates.
 */

"use client";

import { useState } from "react";
import styled from "styled-components";
import Input from "@/components/ui/input/Input.js";
import Button from "@/components/ui/button/Button.js";
import { AppIcon } from "@/components/ui";
import { smoothTransition } from "@/components/motion";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
  max-width: 900px;
  margin: 0 auto;
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

const Section = styled.section`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const ActionsSection = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 2px solid ${(props) => props.theme.colors.border};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SuccessMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.successLight};
  border: 1px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.success};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

/**
 * Finance Settings Client Component
 * @param {Object} props
 * @param {Object} props.initialSettings - Initial finance settings from server
 * @param {string} [props.initialError] - Initial error message if data fetch failed
 */
export default function FinanceSettingsClient({ initialSettings, initialError }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || null);
  const [success, setSuccess] = useState(null);

  // Handle input change
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/finance/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.error?.message || "Erreur lors de la sauvegarde");
      }

      setSettings(result.data);
      setSuccess("Paramètres sauvegardés avec succès");
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde des paramètres");
      console.error("Finance Settings Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSettings(initialSettings);
    setError(null);
    setSuccess(null);
  };

  return (
    <DashboardContainer>
      <PageTitle>Paramètres Financiers</PageTitle>

      {/* Success Message */}
      {success && (
        <SuccessMessage>
          <AppIcon name="success" size="sm" />
          {success}
        </SuccessMessage>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage>
          <AppIcon name="warning" size="sm" />
          {error}
        </ErrorMessage>
      )}

      {/* Company Information Section */}
      <Section>
        <SectionTitle>
          <AppIcon name="package" size="md" />
          Informations de l'entreprise
        </SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Nom de l'entreprise</Label>
            <Input
              value={settings.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Nom de l'entreprise"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Raison sociale</Label>
            <Input
              value={settings.legalName || ""}
              onChange={(e) => handleChange("legalName", e.target.value)}
              placeholder="Raison sociale"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Adresse</Label>
            <Input
              value={settings.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Adresse"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Ville</Label>
            <Input
              value={settings.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Ville"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Pays</Label>
            <Input
              value={settings.country || ""}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Pays"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Téléphone</Label>
            <Input
              value={settings.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Téléphone"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={settings.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email"
              disabled={loading}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Legal & Tax Information Section */}
      <Section>
        <SectionTitle>
          <AppIcon name="shield" size="md" />
          Informations légales et fiscales
        </SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>ICE</Label>
            <Input
              value={settings.ice || ""}
              onChange={(e) => handleChange("ice", e.target.value)}
              placeholder="ICE"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>RC</Label>
            <Input
              value={settings.rc || ""}
              onChange={(e) => handleChange("rc", e.target.value)}
              placeholder="RC"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>IF</Label>
            <Input
              value={settings.if || ""}
              onChange={(e) => handleChange("if", e.target.value)}
              placeholder="IF"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Patente</Label>
            <Input
              value={settings.patente || ""}
              onChange={(e) => handleChange("patente", e.target.value)}
              placeholder="Patente"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Numéro TVA</Label>
            <Input
              value={settings.vatNumber || ""}
              onChange={(e) => handleChange("vatNumber", e.target.value)}
              placeholder="Numéro TVA"
              disabled={loading}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Display Preferences Section */}
      <Section>
        <SectionTitle>
          <AppIcon name="filter" size="md" />
          Préférences d'affichage
        </SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Devise</Label>
            <Input
              value={settings.currency || "MAD"}
              onChange={(e) => handleChange("currency", e.target.value)}
              placeholder="MAD"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Locale</Label>
            <Input
              value={settings.locale || "fr-MA"}
              onChange={(e) => handleChange("locale", e.target.value)}
              placeholder="fr-MA"
              disabled={loading}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Actions Section */}
      <ActionsSection>
        <Button
          $variant="secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Réinitialiser
        </Button>
        <Button
          $variant="primary"
          onClick={handleSave}
          disabled={loading}
        >
          <AppIcon name="check-circle" size="sm" />
          {loading ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </ActionsSection>
    </DashboardContainer>
  );
}

