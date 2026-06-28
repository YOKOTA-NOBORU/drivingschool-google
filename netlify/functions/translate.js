exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "POST only" }) };
    }

    const input = JSON.parse(event.body || "{}");
    const text = input.text || "";
    const targetRaw = input.target_lang || "vi";
    const sourceRaw = input.source_lang || "ja";

    if (!text) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "text is required" }) };
    }

    const map = {
      "VI": "vi", "vi": "vi",
      "EN-US": "en", "EN": "en", "en": "en",
      "ZH": "zh-CN", "ZH-CN": "zh-CN", "zh": "zh-CN", "zh-CN": "zh-CN",
      "PT-BR": "pt", "PT": "pt", "pt": "pt",
      "JA": "ja", "ja": "ja"
    };

    const target = map[targetRaw] || String(targetRaw).toLowerCase();
    const source = map[sourceRaw] || "ja";

    const url = "https://translate.googleapis.com/translate_a/single"
      + "?client=gtx"
      + "&sl=" + encodeURIComponent(source)
      + "&tl=" + encodeURIComponent(target)
      + "&dt=t"
      + "&q=" + encodeURIComponent(text);

    const response = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Google translation failed" }) };
    }

    const translated = Array.isArray(data) && Array.isArray(data[0])
      ? data[0].map(part => part[0]).join("")
      : "";

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: translated }) };
  } catch (error) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: error.message }) };
  }
};
