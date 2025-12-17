/**
 * Inventory Add Page Component
 *
 * Client Component wrapper for styled-components theme.
 * Provides layout structure for Add Inventory Entry Page.
 */

"use client";

import styled from "styled-components";
import Link from "next/link";
import { Button, AppIcon } from "@/components/ui";
import InventoryStockInFormClient from "@/app/dashboard/inventory/InventoryStockInFormClient";

const PageContainer = styled.div`
  max-width: ${(props) => props.theme.container.page};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl} 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
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
    font-size: ${(props) => props.theme.typography.fontSize.xl};
  }
`;

const FormSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

/**
 * InventoryAddPage Component
 * @param {Object} props
 * @param {Array} props.products - Products array [{ id, name, purchasePrice }]
 * @param {string} [props.initialProductId] - Initial product ID from URL query parameter
 */
export default function InventoryAddPage({ products = [], initialProductId = null }) {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Ajouter au stock</PageTitle>
        <Button variant="secondary" size="md" as={Link} href="/dashboard/inventory">
          <AppIcon name="chevronLeft" size="sm" color="foreground" />
          Retour
        </Button>
      </PageHeader>

      <FormSection>
        <InventoryStockInFormClient 
          products={products} 
          initialProductId={initialProductId}
        />
      </FormSection>
    </PageContainer>
  );
}

