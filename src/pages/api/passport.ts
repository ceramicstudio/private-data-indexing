import { type NextApiRequest, type NextApiResponse } from "next";
import { passport } from "@/utils/passport";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | { error: string },
  ): void;
}

interface Request extends NextApiRequest {
  body: {
    address: string;
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const { address } = req.body;
    const data = await passport(address);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
