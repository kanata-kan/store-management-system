/**
 * Edit Brand Page
 *
 * Server Component that renders BrandEditPage with brand ID.
 */

import BrandEditPage from "@/components/domain/brand/BrandEditPage";

export default function EditBrandPage({ params }) {
  const { id } = params;

  return <BrandEditPage brandId={id} />;
}


