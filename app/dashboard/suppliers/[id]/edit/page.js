import SupplierEditPage from "@/components/domain/supplier/SupplierEditPage";

export default function EditSupplierPage({ params }) {
  const { id } = params;
  return <SupplierEditPage supplierId={id} />;
}


