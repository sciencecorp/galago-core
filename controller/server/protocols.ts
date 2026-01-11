import { db } from "@/db/client";
import { protocols } from "@/db/schema";
import { eq } from "drizzle-orm";
export interface ProtocolPreview {
  id: number;
  name: string;
  category: string;
  workcellId: number | null;
  description: string | null;
  commands: any[];
  createdAt: string;
  updatedAt: string;
}

// Load database protocols
async function loadDatabaseProtocols(): Promise<ProtocolPreview[]> {
  try {
    const allProtocols = await db.select().from(protocols);
    return allProtocols;
  } catch (error) {
    console.error("Failed to load database protocols:", error);
    return [];
  }
}

// Export protocols array
export let Protocols: ProtocolPreview[] = [];

// Load database protocols and update the Protocols array
loadDatabaseProtocols()
  .then((dbProtocols) => {
    Protocols = [...dbProtocols];
  })
  .catch((error) => {
    console.error("Failed to initialize database protocols:", error);
  });

// Function to reload protocols (useful when protocols are added/updated in the database)
export async function reloadProtocols(): Promise<void> {
  const dbProtocols = await loadDatabaseProtocols();
  Protocols = [...dbProtocols];
}

// Helper function to get protocol by ID
export async function getProtocolById(protocolId: number): Promise<ProtocolPreview | null> {
  try {
    const result = await db.select().from(protocols).where(eq(protocols.id, protocolId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Failed to load protocol ${protocolId}:`, error);
    return null;
  }
}

// Helper function to find protocol by name or ID
export function findProtocol(identifier: string | number): ProtocolPreview | undefined {
  if (typeof identifier === "number") {
    return Protocols.find((p) => p.id === identifier);
  }

  // Try to parse as number first
  const id = parseInt(identifier);
  if (!isNaN(id)) {
    return Protocols.find((p) => p.id === id);
  }

  // Fall back to name search
  return Protocols.find((p) => p.name === identifier);
}
