import axios from "axios";

export async function jinaRead(url: string): Promise<string> {
  const apiUrl = `https://r.jina.ai/${url}`;

  const headers: Record<string, string> = {
    Accept: "text/markdown",
    "X-Return-Format": "markdown",
  };

  // Optional: API key gives higher rate limits on r.jina.ai
  if (process.env.JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const res = await axios.get(apiUrl, { headers, timeout: 45000 });
  return res.data;
}
