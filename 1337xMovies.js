export default class X1337xMovies {
    name = "1337xMovies";
    description = "Searches 1337x for movie torrents";
    version = "1.0.0";
    domains = ["1337x.to"];

    async search1337x(query) {
        const response = await fetch(`https://corsproxy.io/?https://1337x.to/search/${encodeURIComponent(query)}/1/`, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });
        const html = await response.text();
        const rows = [...html.matchAll(/<a href="\/torrent\/([^"]+)"[^>]*>([^<]+)<\/a><\/td>\s*<td class="coll-2 seeds">(\d+)<\/td>\s*<td class="coll-3 leeches">(\d+)/g)];

        const torrents = await Promise.all(rows.slice(0, 10).map(async ([_, linkPath, title, seeders, leechers]) => {
            const pageUrl = `https://1337x.to/torrent/${linkPath}`;
            const detailPage = await fetch(`https://corsproxy.io/?${pageUrl}`);
            const detailHtml = await detailPage.text();

            const magnetMatch = detailHtml.match(/href="(magnet:\?xt=urn:btih:[^"]+)"/);
            const sizeMatch = detailHtml.match(/Size<\/td>\s*<td colspan="2">([^<]+)<\/td>/);
            const hashMatch = detailHtml.match(/>Info Hash<\/td>\s*<td colspan="2">([a-fA-F0-9]+)<\/td>/);
            const dateMatch = detailHtml.match(/Date uploaded<\/td>\s*<td colspan="2">([^<]+)<\/td>/);

            const size = sizeMatch ? parseSize(sizeMatch[1]) : 0;
            const hash = hashMatch ? hashMatch[1] : "";
            const date = dateMatch ? new Date(dateMatch[1]) : new Date();

            return {
                title,
                link: magnetMatch ? magnetMatch[1] : "",
                seeders: parseInt(seeders),
                leechers: parseInt(leechers),
                downloads: 0,
                hash,
                size,
                verified: false,
                date,
                type: "best"
            };
        }));

        return torrents.filter(t => t.link && t.hash);
    }

    async movie({ titles, resolution }) {
        for (const title of titles) {
            let query = title;
            if (resolution) query += ` ${resolution}p`;
            const results = await this.search1337x(query);
            if (results.length > 0) return results;
        }
        return [];
    }

    // Not needed for movies
    async single() { return []; }
    async batch() { return []; }
}

function parseSize(sizeStr) {
    const [value, unit] = sizeStr.split(" ");
    const num = parseFloat(value.replace(",", ""));
    const units = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9 };
    return num * (units[unit] || 1);
}
