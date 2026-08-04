# c8-fit-cost

一个纯静态的 LLM Token 成本计算器，部署后可通过 `https://c8.fit/cost` 访问。

当前实现优先从 OpenRouter 公共 Models API 拉取实时价格与上下文窗口；若远端不可用，则自动回退到仓库内的 `cost/pricing.json` 全量快照。

## 目录结构

```text
c8-fit-cost/
├── vercel.json
├── package.json
├── README.md
├── cost/
│   ├── index.html
│   └── pricing.json
└── skills/
    └── c8-cost/
        └── SKILL.md
```

## 本地预览

```bash
npm install
npm run dev
```

默认会在本地启动一个静态文件服务，用浏览器打开对应地址即可预览。

## 部署步骤

### 1. 推到 GitHub

```bash
git init
git add .
git commit -m "c8.fit/cost LLM pricing calculator"
gh repo create c8-fit-cost --public --source=. --push
```

### 2. 导入 Vercel

1. 在 Vercel 中导入该 GitHub 仓库
2. Framework 选择 `Other` / `Static`
3. 预览部署可用：

```bash
vercel login
vercel
vercel --prod
```

### 3. 绑定 c8.fit

1. 打开 Vercel 项目设置
2. 进入 `Settings -> Domains`
3. 添加域名 `c8.fit`
4. 在 DNS 提供商中按 Vercel 提示配置 NS 或 CNAME
5. 等待 DNS 生效后访问 `https://c8.fit/cost`

## 说明

- 页面优先使用 `https://openrouter.ai/api/v1/models` 作为公开价格源，无需 API key
- `cost/pricing.json` 作为远端失败时的兜底全量快照，覆盖当前公开文本模型目录
- 页面所有计算都在前端本地完成，不上传 prompt 内容
- 免费层只作为提示，不代表允许转售 key 或商业中转
- 中文 token 数通常低于 `4 chars / token`，所以页面金额估算偏保守

## 后续维护建议

- 如果希望完全避免前端依赖外部接口，可以后续增加 GitHub Actions，定期同步公开价格目录并自动发 PR
- 如果根域名 `c8.fit` 未来要作为首页使用，可删掉 `vercel.json` 中最后一条全量回退路由，仅保留 `/cost`
