// Example usage in your Next.js components

import { useState } from "react";
import { FormCreate, Form } from "@/types/api";
import { trpc } from "@/utils/trpc";

// Example 1: Get all forms
export function FormsList() {
  const { data: forms, isLoading, error } = trpc.form.getAll.useQuery();
  const { data: stats } = trpc.form.getStats.useQuery();

  if (isLoading) return <div>Loading forms...</div>;
  if (error) return <div>Error loading forms: {error.message}</div>;

  return (
    <div>
      <h2>Forms ({stats?.total || 0})</h2>
      <div className="stats">
        <span>Locked: {stats?.locked}</span>
        <span>Unlocked: {stats?.unlocked}</span>
      </div>
      <div className="forms-grid">
        {forms?.map((form) => (
          <div key={form.id} className="form-card">
            <h3>{form.name}</h3>
            <p>{form.description}</p>
            <span className={`status ${form.is_locked ? 'locked' : 'unlocked'}`}>
              {form.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
            </span>
            <span className="field-count">{form.fields.length} fields</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 2: Create a new form
export function CreateFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const createForm = trpc.form.add.useMutation();

  const handleSubmit = async (formData: FormCreate) => {
    try {
      await createForm.mutateAsync(formData);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create form:", error);
    }
  };

  const sampleForm: FormCreate = {
    name: "Contact Form",
    description: "Simple contact form",
    fields: [
      {
        type: "text",
        name: "name",
        label: "Full Name",
        required: true,
        placeholder: "Enter your name"
      },
      {
        type: "email",
        name: "email",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email"
      },
      {
        type: "select",
        name: "subject",
        label: "Subject",
        required: true,
        options: [
          { value: "general", label: "General Inquiry" },
          { value: "support", label: "Support Request" },
          { value: "sales", label: "Sales Question" }
        ]
      },
      {
        type: "textarea",
        name: "message",
        label: "Message",
        required: true,
        placeholder: "Enter your message"
      }
    ],
    size: "medium"
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Create New Form</button>
      {isOpen && (
        <div className="modal">
          <button onClick={() => handleSubmit(sampleForm)}>
            {createForm.isLoading ? "Creating..." : "Create Sample Form"}
          </button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}


// Example 3: Form management with actions
export function FormManagement({ formId }: { formId: number }) {
  const { data: form } = trpc.form.get.useQuery(formId);
  const lockForm = trpc.form.lock.useMutation();
  const unlockForm = trpc.form.unlock.useMutation();
  const deleteForm = trpc.form.delete.useMutation();
  const duplicateForm = trpc.form.duplicate.useMutation();

  const handleLockToggle = async () => {
    try {
      if (form?.is_locked) {
        await unlockForm.mutateAsync(formId);
      } else {
        await lockForm.mutateAsync(formId);
      }
    } catch (error) {
      console.error("Failed to toggle lock:", error);
    }
  };

  const handleDuplicate = async () => {
    const newName = prompt("Enter name for the duplicate form:");
    if (newName) {
      try {
        await duplicateForm.mutateAsync({ id: formId, newName });
      } catch (error) {
        console.error("Failed to duplicate form:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteForm.mutateAsync(formId);
      } catch (error) {
        console.error("Failed to delete form:", error);
      }
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="form-management">
      <h2>{form.name}</h2>
      <p>{form.description}</p>
      
      <div className="actions">
        <button onClick={handleLockToggle}>
          {form.is_locked ? "🔓 Unlock" : "🔒 Lock"}
        </button>
        
        <button onClick={handleDuplicate}>
          📋 Duplicate
        </button>
        
        <button onClick={handleDelete} className="danger">
          🗑️ Delete
        </button>
      </div>

      <div className="form-preview">
        <h3>Form Fields ({form.fields.length})</h3>
        {form.fields.map((field, index) => (
          <div key={index} className="field-preview">
            <strong>{field.label}</strong>
            <span className="field-type">{field.type}</span>
            {field.required && <span className="required">*</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Form import/export
export function FormImportExport() {
  const exportForm = trpc.form.exportConfig.useMutation();
  const importForm = trpc.form.importConfig.useMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async (formId: number) => {
    try {
      const formData = await exportForm.mutateAsync(formId);
      
      // Create download link
      const dataStr = JSON.stringify(formData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.name.replace(/\s+/g, '_')}-form.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    try {
      await importForm.mutateAsync({ file: selectedFile });
      setSelectedFile(null);
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  return (
    <div className="import-export">
      <div className="export-section">
        <h3>Export Form</h3>
        <button onClick={() => handleExport(1)}>
          📤 Export Form #1
        </button>
      </div>

      <div className="import-section">
        <h3>Import Form</h3>
        <input
          type="file"
          accept=".json"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button 
          onClick={handleImport}
          disabled={!selectedFile || importForm.isLoading}
        >
          {importForm.isLoading ? "Importing..." : "📥 Import Form"}
        </button>
      </div>
    </div>
  );
}

// Example 5: Filtered forms search
export function FormsSearch() {
  const [filters, setFilters] = useState({
    size: undefined as "small" | "medium" | "large" | undefined,
    isLocked: undefined as boolean | undefined,
    searchTerm: "",
  });

  const { data: filteredForms } = trpc.form.getFiltered.useQuery(filters);

  return (
    <div className="forms-search">
      <div className="filters">
        <input
          type="text"
          placeholder="Search forms..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
        
        <select
          value={filters.size || ""}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            size: e.target.value as any || undefined 
          }))}
        >
          <option value="">All Sizes</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        
        <select
          value={filters.isLocked === undefined ? "" : filters.isLocked.toString()}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            isLocked: e.target.value === "" ? undefined : e.target.value === "true"
          }))}
        >
          <option value="">All Forms</option>
          <option value="false">Unlocked Only</option>
          <option value="true">Locked Only</option>
        </select>
      </div>

      <div className="results">
        {filteredForms?.map((form) => (
          <div key={form.id} className="form-result">
            <h3>{form.name}</h3>
            <p>{form.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}