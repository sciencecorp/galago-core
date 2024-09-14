import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';

interface Variable {
    id:number;
    name:string;
    value:string;
    type:string;
}

const domain = 'http://localhost:8000';

async function getHandler(req: NextApiRequest, res: NextApiResponse<Variable[] | string>) {
    try {
        console.log("GET request"); 
        console.log("Query is" + JSON.stringify(req.query));
        
        const response = await axios.get(`${domain}/variables`, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        res.status(200).json(response.data);
    } catch (error: any) {
        console.log("Error is" + error);
    }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse<Variable| { message: string }>) {
    console.log("POST request");    
    try {
        const varPayload = req.body;
        console.log("Payload is" + JSON.stringify(varPayload));
        console.log("Domain is" + domain); 
        const response = await axios.post(`${domain}/variables`, varPayload, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log("Response is" + JSON.stringify(response.data));
        res.status(200).json(response.data);
    } catch (error: any) {
        // Handle specific error cases if necessary
        if (axios.isAxiosError(error)) {
            if (error.response) {
                res.status(error.response.status).json({ message: error.response.data.message || 'Error Creating variable' });
            } else if (error.request) {
                res.status(500).json({ message: 'No response received from the backend' });
            } else {
                res.status(500).json({ message: 'Request failed' });
            }
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case "GET":
      await getHandler(req, res);
      break;
    case "POST":
      await postHandler(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
