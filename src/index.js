const SOURCES = [
  ["Reuters", "Reuters crude oil market"],
  ["Bloomberg", "Bloomberg crude oil market"],
  ["OilPrice.com", "site:oilprice.com oil"],
  ["Rigzone", "site:rigzone.com oil"],
  ["CNBC", "site:cnbc.com oil crude"],
  ["Financial Times", "site:ft.com oil crude"],
  ["EIA", "site:eia.gov oil"],
  ["IEA", "site:iea.org oil market"],
  ["OPEC", "site:opec.org oil market"],
  ["S&P Global", "site:spglobal.com oil crude"]
];

const decode = (s = "") => s
  .replace(/<!\[CDATA\[|\]\]>/g, "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const strip = (s = "") => decode(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const get = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? strip(m[1]) : "";
};
const tagTone = (text) => {
  const t = text.toLowerCase();
  const bull = ["cut", "disruption", "sanction", "attack", "draw", "shortage", "tight", "surge", "outage"];
  const bear = ["increase", "surplus", "ceasefire", "reopen", "build", "fall", "drop", "weak demand"];
  const score = bull.filter(k => t.includes(k)).length - bear.filter(k => t.includes(k)).length;
  return score > 0 ? "Bullish" : score < 0 ? "Bearish" : "Watch";
};

async function fetchFeed(source, query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:3d")}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(url, { headers: { "User-Agent": "OilPulse/2.0" } });
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
  const xml = await response.text();
  return (xml.match(/<item>[\s\S]*?<\/item>/gi) || []).slice(0, 4).map(item => {
    const title = get(item, "title");
    return {
      source,
      title,
      link: get(item, "link"),
      published: get(item, "pubDate"),
      tone: tagTone(title)
    };
  }).filter(x => x.title && x.link);
}

async function news() {
  return [{
    source: "Reuters",
    title: "TEST HEADLINE",
    link: "https://www.reuters.com",
    published: new Date().toISOString(),
    tone: "Watch"
  }];
}
``

} {
  const settled = await Promise.allSettled(SOURCES.map(([s, q]) => fetchFeed(s, q)));
  const items = settled.flatMap(x => x.status === "fulfilled" ? x.value : []);
  const seen = new Set();
  return items.filter(x => {
    const key = x.title.toLowerCase().replace(/\s+-\s+[^-]+$/, "");
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a, b) => new Date(b.published) - new Date(a.published)).slice(0, 10);
}

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#071723"><title>Oil Pulse V2</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui;color:#ecf7ff;background:#071723}*{box-sizing:border-box}body{margin:0;background:linear-gradient(160deg,#071723,#0b2940);min-height:100vh}.wrap{max-width:780px;margin:auto;padding:18px}.head{display:flex;align-items:center;justify-content:space-between;gap:14px}.brand{font-weight:850;font-size:24px}.sub,.time{color:#91abc0;font-size:12px}.btn,.filter{border:1px solid #2c5874;background:#12354c;color:#e7f7ff;border-radius:999px;padding:9px 13px;font-weight:750}.filters{display:flex;gap:8px;overflow:auto;padding:16px 0 10px}.filter.on{background:#38c6d9;color:#04212b}.list{display:grid;gap:12px}.card{display:block;text-decoration:none;color:inherit;background:#102c42;border:1px solid #214a64;border-radius:18px;padding:16px;box-shadow:0 10px 28px #0004}.meta{display:flex;align-items:center;justify-content:space-between;gap:12px}.source{color:#67d8e7;font-size:12px;font-weight:800}.tone{font-size:11px;border-radius:999px;padding:4px 8px;background:#294c61}.tone.Bullish{background:#176048}.tone.Bearish{background:#713343}.title{font-size:16px;font-weight:760;line-height:1.4;margin:9px 0}.status{margin:22px 0;background:#102c42;border-radius:16px;padding:16px;color:#a9bfd0}.foot{text-align:center;color:#819bae;font-size:11px;padding:26px 8px}@media(max-width:480px){.wrap{padding:14px}.title{font-size:15px}}
</style></head><body><main class="wrap"><header class="head"><div><div class="brand">Oil Pulse V2</div><div class="sub" id="updated">Loading live oil news...</div></div><button class="btn" id="refresh">Refresh</button></header><nav class="filters" id="filters"></nav><section class="list" id="list"><div class="status">Fetching recent headlines from 10 monitored sources.</div></section><footer class="foot">Updates when opened and every hour. Links are article-specific Google News URLs. Headline tone is keyword-based, not investment advice.</footer></main><script>
let DATA=[], active='All'; const sources=${JSON.stringify(SOURCES.map(x=>x[0]))};
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function draw(){const fs=['All',...sources];document.querySelector('#filters').innerHTML=fs.map(s=>'<button class="filter '+(s===active?'on':'')+'" data-s="'+esc(s)+'">'+esc(s)+'</button>').join('');document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{active=b.dataset.s;draw()});const rows=DATA.filter(x=>active==='All'||x.source===active);document.querySelector('#list').innerHTML=rows.length?rows.map(x=>'<a class="card" href="'+esc(x.link)+'" target="_blank" rel="noopener noreferrer"><div class="meta"><span class="source">'+esc(x.source)+'</span><span class="tone '+esc(x.tone)+'">'+esc(x.tone)+'</span></div><div class="title">'+esc(x.title)+'</div><div class="time">'+new Date(x.published).toLocaleString()+'</div></a>').join(''):'<div class="status">No recent matching headlines.</div>'}
async function load(){const b=document.querySelector('#refresh');b.disabled=true;try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();DATA=j.news||[];document.querySelector('#updated').textContent='Updated '+new Date(j.updatedAt).toLocaleString()+' · '+DATA.length+' headlines';draw()}catch(e){document.querySelector('#list').innerHTML='<div class="status">Unable to load live news: '+esc(e.message)+'</div>'}finally{b.disabled=false}}
document.querySelector('#refresh').onclick=load;load();setInterval(load,3600000);
</script></body></html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/debug") {
      const data = { updatedAt: new Date().toISOString(), news: await news() };
      return Response.json(data, { headers: { "Cache-Control": "public, max-age=300" } });
    }
    if (url.pathname === "/health") return Response.json({ ok: true, version: "2.0" });
    return new Response(page, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache" } });
  }
};
