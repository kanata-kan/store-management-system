/**
 * Edit Category Page
 *
 * Server Component that renders CategoryEditPage.
 */

import { CategoryEditPage } from "@/components/domain/category";

export default function EditCategoryPage({ params }) {
  const categoryId = params.id;

  return <CategoryEditPage categoryId={categoryId} />;
}

