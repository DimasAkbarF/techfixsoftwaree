// Ping semua URL dari sitemap.xml ke Bing / IndexNow setelah deploy selesai.
const SITE_HOST = "www.techfixsoftware.web.id";
const SITE_URL = `https://${SITE_HOST}`;
const KEY = "7c4e9b2a1f8d4e6c9a3b5d7f0e2a4c68";

const xml = await (await fetch(`${SITE_URL}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error("Tidak ada URL ditemukan di sitemap.xml");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: SITE_HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`IndexNow status: ${res.status} (${urlList.length} URL dikirim)`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
