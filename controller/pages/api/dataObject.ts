import axios from 'axios';
import { NextApiRequest, NextApiResponse } from "next";

const domain = 'https://app.science.xyz';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
    const {dataObjectID} = req.query;
        const response = await axios.get(`${domain}/api/data_objects/${dataObjectID}`, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    }

    if (req.method === "PUT") {
        try {
            const dataObjectID = req.body.selectedDataObjectID;
            const dataObject = req.body.updatedObjectData;
            if (!dataObjectID || !dataObject) {
                res.status(400).json({ error: "Both dataObjectID and dataObject are required." });
                return;
            }
            const response = await axios.put(`${domain}/api/data_objects/${dataObjectID}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                object_data: dataObject
            });
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: "Error updating data object." });

        }
    } 


    else {
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
