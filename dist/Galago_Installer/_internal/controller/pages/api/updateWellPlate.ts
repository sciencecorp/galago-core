// pages/api/updateWellPlate.ts

import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    try {
      // Retrieve the location_id and wellPlateID from the request body
      const { location_id, wellPlateID } = req.body;

      if (!location_id || !wellPlateID) {
        res.status(400).json({ error: "Both location_id and wellPlateID are required." });
        return;
      }

      // Your PUT request logic here
      const response = await axios.put(`https://app.science.xyz/api/well_plates/${wellPlateID}`, {
        well_plate: {
          location_id: location_id,
        },
      });

      // Handle the response as needed
      res.status(response.status).json(response.data);
    } catch (error) {
      // Handle any errors that occur during the request
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
