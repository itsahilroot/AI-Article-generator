import axios from "axios";

export async function jinaSearch(keyword: string): Promise<string> {
  const url = `https://s.jina.ai/${encodeURIComponent(keyword)}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Respond-With": "no-content",
  };

  // Jina Search requires an API key (free at jina.ai)
  if (process.env.JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const res = await axios.get(url, { headers, timeout: 30000 });
  return res.data;
}
