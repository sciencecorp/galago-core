import { FormsList, CreateFormModal, FormManagement, FormImportExport } from "@/components/forms";

export default function Page() {
  return (
    <div className="forms-page">
      <h1>Forms Management</h1>
      <FormsList />
      <CreateFormModal />
      <FormImportExport />
    </div>
  );
}