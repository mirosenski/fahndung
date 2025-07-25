import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createServerComponentClient({ cookies });

  // Fetch latest published articles
  const { data: articles } = await supabase
    .from("investigations")
    .select(`
      id,
      title,
      article_slug,
      short_description,
      article_published_at,
      category,
      article_meta
    `)
    .eq("published_as_article", true)
    .eq("status", "published")
    .not("article_slug", "is", null)
    .order("article_published_at", { ascending: false })
    .limit(20);

  // Build RSS XML
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fahndung.lka-bw.de";
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LKA Baden-Württemberg - Fahndungsberichte</title>
    <description>Aktuelle Fahndungsberichte und Artikel des Landeskriminalamts Baden-Württemberg</description>
    <link>${baseUrl}/artikel</link>
    <language>de-DE</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${(articles || []).map(article => {
      const meta = article.article_meta as any;
      const pubDate = new Date(article.article_published_at).toUTCString();
      const link = `${baseUrl}/artikel/${article.article_slug}`;
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.short_description}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${getCategoryLabel(article.category)}</category>
      ${meta?.author ? `<author>${meta.author}</author>` : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    WANTED_PERSON: "Gesuchte Person",
    MISSING_PERSON: "Vermisste Person",
    UNKNOWN_DEAD: "Unbekannte Tote",
    STOLEN_GOODS: "Gestohlene Gegenstände",
  };
  return labels[category] || category;
} 