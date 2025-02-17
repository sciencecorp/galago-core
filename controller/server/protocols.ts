import Protocol from "@/protocols/protocol";
import { DatabaseProtocol } from "@/protocols/database_protocol";

import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// Load database protocols
async function loadDatabaseProtocols(): Promise<Protocol[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/protocols`, {
      params: { is_active: true },
    });

    const dbProtocols = await Promise.all(
      response.data.map(async (protocolData: any) => {
        try {
          return new DatabaseProtocol(protocolData);
        } catch (error) {
          console.error(`Failed to load protocol ${protocolData.id}:`, error);
          return null;
        }
      }),
    );

    return dbProtocols.filter((p): p is Protocol => p !== null);
  } catch (error) {
    console.error("Failed to load database protocols:", error);
    return [];
  }
}

export let Protocols: Protocol[] = [];

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
