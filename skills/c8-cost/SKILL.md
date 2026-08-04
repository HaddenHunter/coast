---
name: "c8-cost"
description: "Estimate LLM API token costs and compare free vs paid pricing. Invoke when users ask how much a prompt costs, which provider is cheaper, or whether a free tier is enough."
license: "MIT"
metadata:
  author: "c8-fit"
  version: "1.0"
---

# c8-cost · LLM Token 成本估算

通过 `https://c8.fit/cost` 的定价表（与 `cost/pricing.json` 同源）做估算与对比。

## 何时使用
- 用户给出 prompt 文本、调用量、模型名，要算钱
- 用户要对比多家 provider 单价或免费层是否够用
- 用户需要提醒计费陷阱：CoT 隐藏 token、cache 命中率、Batch -50%、长上下文计费

## 步骤
1. 若用户贴了文本，先估算 input token 数：
   - 英文可按约 `4 字符 / token`
   - 中文更接近 `1.5~2 字符 / token`，需要给出修正提示
2. 输出 token 默认按用户给定值；若是推理模型（如 `R1`、`Opus`、`Sonnet`、`o-series`、`reasoning` 类），按 `2~5x` 估入隐藏 thinking token，默认保守用 `3x`
3. 套用对应模型 input/output/cached 单价（USD / 1M tokens），公式：

```text
cost = (uncached_in * in_px + cached_in * cache_px + out * out_px) / 1e6
```

4. 若给了月度调用次数，则继续计算：
   - 月成本 = 单次成本 × 月调用次数
   - 年成本 = 月成本 × 12
5. 若 Batch 适用且用户要求估算，则按 `0.5x` 计算输入与输出成本
6. 返回单次、月度、年度结果，同时附带：
   - 免费层限额说明
   - Prompt cache 是否会显著降本
   - ToS 红线：禁止转售 key、禁止中转免费层

## 红线
- 不替用户转发、聚合或倒卖第三方 API key；`c8.fit/cost` 仅做静态估算
- 免费层数据来自公开定价页，使用前必须提醒用户核对官网最新限制
- `free: true` 仅表示存在公开免费层，不代表允许商业转售
- 价格表见 `https://c8.fit/cost/pricing.json`

## 输出建议
- 先给出单次成本，再给月度和年度成本
- 有免费层时，明确写清“若在免费额度内则为 $0.00，否则超额部分按官方计费”
- 对推理模型要主动提醒 CoT/Thinking token 可能是账单主要来源
- 当缓存命中率未知时，提醒用户结果偏保守
