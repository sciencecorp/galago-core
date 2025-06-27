import { FormList, FormBuilder } from '@/components/forms';
import React, { useState } from 'react';

function FormsPage() {
  const [selectedFormId, setSelectedFormId] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <FormList
        selectedFormId={selectedFormId}
        onSelectForm={setSelectedFormId}
        onCreateForm={() => setSelectedFormId(null)}
      />
      <FormBuilder formId={selectedFormId} />
    </div>
  );
}

export default FormsPage;