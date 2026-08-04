const fs = require("fs");
const https = require("https");

const SOURCE_URL = "https://openrouter.ai/api/v1/models?sort=pricing-low-to-high";
const OUTPUT_PATH = "cost/pricing.json";
const PROVIDER_LABELS = {
  anthropic: "Anthropic",
  cerebras: "Cerebras",
  deepseek: "DeepSeek",
  google: "Google",
  groq: "Groq",
  meta: "Meta",
  mistralai: "Mistral",
  openai: "OpenAI",
  qwen: "Qwen",
  xai: "xAI",
  zai: "Z.ai"
};

function normalizeContextLength(value) {
  const num = Number(value) || 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + "M";
  }
  if (num >= 1000) {
    return Math.round(num / 1000) + "K";
  }
  return String(num || "-");
}

function inferProvider(id) {
  const raw = (id || "").split("/")[0] || "Unknown";
  if (PROVIDER_LABELS[raw]) {
    return PROVIDER_LABELS[raw];
  }
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/-/g, " ");
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error("Request failed: HTTP " + res.statusCode));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const payload = await fetchJson(SOURCE_URL);
  const models = (payload.data || [])
    .filter((model) => !model.architecture || /text/.test(model.architecture.modality || ""))
    .map((model) => {
      const promptPrice = Number(model.pricing && model.pricing.prompt) || 0;
      const completionPrice = Number(model.pricing && model.pricing.completion) || 0;
      const cachedRaw = Number(model.pricing && model.pricing.input_cache_read);
      return {
        id: model.id,
        provider: inferProvider(model.id),
        input: promptPrice * 1e6,
        output: completionPrice * 1e6,
        cached: Number.isFinite(cachedRaw) ? cachedRaw * 1e6 : promptPrice * 1e6,
        ctx: normalizeContextLength(model.context_length || (model.top_provider && model.top_provider.context_length)),
        free: promptPrice === 0 && completionPrice === 0,
        limit: null
      };
    });

  const output = {
    _note: "本文件由 GitHub Actions 自动更新。页面只读取本地 pricing.json，不在用户访问时请求远端价格接口。数据源为 OpenRouter 公共 Models API，使用前仍建议核对官网。",
    updated: new Date().toISOString().slice(0, 10),
    source: "OpenRouter Public Models API",
    sourceUrl: SOURCE_URL,
    count: models.length,
    models
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log("Updated pricing snapshot:", OUTPUT_PATH, "models =", models.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
