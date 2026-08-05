# c8-fit-coast

一个纯静态站点：根域名首页用于品牌展示，LLM Token 成本计算器部署后通过 `https://www.c8.fit/coast` 访问。

当前实现支持两种更新方式：
- 自动：GitHub Actions 定时从 OpenRouter 公共 Models API 拉取价格并更新仓库内的 `cost/pricing.json`
- 手动：本地执行更新脚本后提交仓库

页面本身只读取本地静态快照，不会在用户访问时请求远端价格接口。

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
git commit -m "Add Coast static site and calculator"
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
3. 添加域名 `www.c8.fit`
4. 在 DNS 提供商中按 Vercel 提示配置 NS 或 CNAME
5. 等待 DNS 生效后访问：
   - 首页：`https://www.c8.fit/`
   - 计算器：`https://www.c8.fit/coast`

## 说明

- 页面优先使用 `https://openrouter.ai/api/v1/models` 作为公开价格源，无需 API key
- `cost/pricing.json` 由 workflow 自动更新，页面访问时不会再请求远端价格接口
- 页面所有计算都在前端本地完成，不上传 prompt 内容
- 免费层只作为提示，不代表允许转售 key 或商业中转
- 中文 token 数通常低于 `4 chars / token`，所以页面金额估算偏保守
- 根路径 `/` 为科技风首页，计算器入口位于 `/coast`

## 自动更新价格

```bash
npm run update:pricing
```

- 脚本位于 `scripts/update-pricing.js`
- GitHub Actions 会在每天定时和手动触发时更新 `cost/pricing.json`
- 若价格快照发生变化，workflow 会自动提交回仓库

## 手动更新价格

如果当前仓库无法启用 GitHub Actions，可以直接本地执行：

```bash
npm run refresh:pricing
git add cost/pricing.json
git commit -m "chore: refresh pricing snapshot"
git push
```

- `npm run refresh:pricing` 会先更新快照，再显示 `cost/pricing.json` 的变更状态
- 页面部署后依然只读取仓库里的静态 `pricing.json`
- 即使没有 Actions，这套流程也能正常维护线上价格数据

## 后续维护建议

- 后续若要扩展工具能力，建议继续沿用 `/coast/*` 路径组织，如 `/coast/models`、`/coast/compare`
