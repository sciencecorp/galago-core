import { InventoryManager } from "@/components/inventory/InventoryManager";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Inventory";
  }, []);

  return <InventoryManager />;
}