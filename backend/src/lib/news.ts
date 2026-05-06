// Temporary free data source for Phase 5.5.
// Phase 7 replaces this with the x402-paid call to x402-api.
// The interface stays the same so the swap is one line.

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
}

/** Fetch research data for a topic. Currently returns canned data. */
export async function fetchNews(topic: string): Promise<NewsArticle[]> {
  // In Phase 7 this becomes:
  //   return x402Fetch(`${X402_API_URL}/premium-news?topic=${topic}`)
  return [
    {
      title: `${topic} — Market Overview 2026`,
      summary: `The ${topic} sector has seen significant growth in 2026, with major players investing heavily in R&D. Key trends include autonomous systems, improved human-robot interaction, and cost reduction through mass production.`,
      source: "TaskVault Research (canned data)",
      publishedAt: new Date().toISOString(),
    },
    {
      title: `Top Companies in ${topic}`,
      summary: `Leading companies include established players and well-funded startups. The competitive landscape is evolving rapidly with new entrants from both technology and manufacturing backgrounds.`,
      source: "TaskVault Research (canned data)",
      publishedAt: new Date().toISOString(),
    },
    {
      title: `${topic} — Investment Trends`,
      summary: `Venture capital investment in this sector exceeded expectations in early 2026. Several companies achieved unicorn status, and public markets showed strong interest in IPO candidates.`,
      source: "TaskVault Research (canned data)",
      publishedAt: new Date().toISOString(),
    },
  ];
}
