import { Forms } from "@/components/forms/";
import React, { useState } from "react";

function FormsPage() {
  const [selectedFormId, setSelectedFormId] = useState(null);

  return <Forms />;
}

export default FormsPage;
