// Handle errors and send appropriate status code and message
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
import { useRouter } from 'next/router'
import { get } from "http";


interface Variable {
    id:number;
    name:string;
    value:string;
    type:string;
}

const domain = 'http://localhost:8000';

function handleAxiosError(error: any, res: NextApiResponse, defaultMessage: string) {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            res.status(error.response.status).json({ message: error.response.data.message || defaultMessage });
        } else if (error.request) {
            res.status(500).json({ message: 'No response received from the backend' });
        } else {
            res.status(500).json({ message: 'Request failed' });
        }
    } else {
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse<Variable| { message: string }>) {
    try {
        const {name} = req.query;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: "Missing or invalid 'name' query parameter" });
            return;
        }
        const response = await axios.get(`${domain}/variables/${name}`, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        res.status(200).json(response.data);
    } catch (error: any) {
        // Handle specific error cases if necessary
        if (axios.isAxiosError(error)) {
            if (error.response) {
                res.status(error.response.status).json({ message: error.response.data.message || 'Error fetching variable' });
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




//Update the variable
async function putHandler(req: NextApiRequest, res: NextApiResponse<Variable | { message: string }>) {
    try {
        const { name } = req.query;
        const variable = req.body;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: "Missing or invalid 'name' query parameter" });
            return;
        }
        const response = await axios.put(`${domain}/variables/${name}`, variable, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        res.status(200).json(response.data);
    } catch (error: any) {
        console.error("Error updating variable:", error);
        handleAxiosError(error, res, 'Error updating variable');
    }
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
    try {
        const { name } = req.query;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: "Missing or invalid 'name' query parameter" });
            return;
        }

        // First, get the variable to obtain its ID
        const getResponse = await axios.get(`${domain}/variables/${name}`, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const variableId = getResponse.data.id;

        // Now delete the variable by ID
        await axios.delete(`${domain}/variables/${variableId}`, {
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        res.status(200).json({ message: 'Variable deleted successfully' });
    } catch (error: any) {
        console.error("Error deleting variable:", error);
        handleAxiosError(error, res, 'Error deleting variable');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const method = req.method;

    switch (method) {
    case "GET":
        await getHandler(req, res);
        break;
    case "PUT":
        putHandler(req, res);
        break;
    case "DELETE":
        deleteHandler(req, res);
        break;
    default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
