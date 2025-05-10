// Simple test API endpoint
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
  ok: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'API Test', ok: true });
} 