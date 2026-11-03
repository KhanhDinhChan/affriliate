# wtt-nine-comic-imagegen

多风格漫画 / 信息图 / 人像写真提示词生成技能。将概念、流程、产品创意、教学主题或人像创意转化为图片生成提示词（中文优先）。

## 五种风格

| 风格 | 名称 | 格式 | 一句话描述 |
|:---|:---|:---|:---|
| A | 9号漫画 | 竖版长图（~720x2800） | 手绘黑白人物+荒诞比喻+一本正经用最俗的日常解释最高深的概念 |
| B | 信息图 | 横版 16:9（~1920x1080） | 手绘卡通风格信息图，突出关键词与核心概念 |
| C | 四格漫画 | 竖版 3:4（~1080x1440） | Q版可爱多格学习漫画，温暖治愈，10-20 页 |
| D | 线条人 | 横版 16:9（~1920x1080） | 极简单线条人 + 克莱因蓝点缀，New Yorker 风格概念插图 |
| E | 生活感人像 | 竖版 3:4 / 4:5（~1080x1440） | vibe 抓拍摄影风格，10 张成组，韩国 INS 网红主体 |

## 快速触发

- **9号漫画**：说 "9号漫画" / "恶搞科普" / "竖版长图" / "nine-comic"
- **信息图**：说 "信息图" / "infographic" / "横版卡通" / "16:9 infographic"
- **四格漫画**：说 "四格漫画" / "Q版漫画" / "Chiikawa漫画" / "学习漫画"
- **线条人**：说 "线条人" / "线人" / "克莱因蓝" / "纽约客风格"
- **生活感人像**：说 "生活感人像" / "vibe" / "vibeshot" / "韩国INS" / "胶片人像" / "lifestyle portrait"

## 目录结构

```
wtt-nine-comic-imagegen/
├── SKILL.md                                    # 主技能定义（v2.1.0：263 行，按风格/机制路由）
├── README.md                                   # 本文件
├── CHANGELOG.md                                # 更新日志
├── assets/
│   └── nine-comic-character-ref.png            # 风格 A 角色参考图
└── references/                                  # 渐进式披露：详细内容按需加载
    ├── shared-mechanisms.md                     # 跨风格通用：N1-N7 + 主体一致性 + 比例锚定 + 文字渲染
    ├── style-a-nine-comic.md                    # 风格 A 完整参考
    ├── style-b-infographic.md                   # 风格 B 完整参考
    ├── style-c-four-panel.md                    # 风格 C 完整参考
    ├── style-d-line-figure.md                   # 风格 D 完整参考
    ├── style-e-vibe.md                          # 风格 E 完整参考
    ├── nine-comic-prompt-skeleton.md            # 风格 A 提示词骨架
    ├── nine-comic-metaphor-catalog.md           # 风格 A 比喻实战目录
    ├── infographic-prompt-skeleton.md           # 风格 B 提示词骨架
    ├── four-panel-prompt-skeleton.md            # 风格 C 提示词骨架 + 视觉风格指令块模板
    ├── four-panel-character-archetypes.md       # 风格 C 角色原型 + IP 映射预设
    ├── line-figure-prompt-skeleton.md           # 风格 D 提示词骨架
    ├── vibe-prompt-skeleton.md                  # 风格 E 提示词骨架（中文 / 英文 + 3 示例 + 自检清单）
    ├── vibe-variable-catalog.md                 # 风格 E 12 个变量池 + 组合禁忌 + 实战经验
    ├── multi-page-handling.md                   # 多页拆分策略（A/B/C 适用；D/E 不适用）
    └── feedback-by-style.md                     # A/B/C/D/E 各自的特有反馈处理
```

## 核心设计理念

- **抽奖，不是质检**：并行生成多个候选，让用户挑选，不做预筛选
- **确认后再生成**：先展示方案概要，用户确认后才写提示词
- **风格铁律不可违反**：每种风格有不可变的视觉身份规则
- **实战经验沉淀**：每种风格都有从实际生成中总结的硬经验
- **共享机制分层**（v2 新增）：跨风格的通用机制（N1-N7 框架 + 主体一致性 + 比例锚定 + 文字渲染）集中在 `shared-mechanisms.md`，每个 style 章节通过机制编号引用
- **渐进式披露**（v2.1 新增）：SKILL.md 精简到 263 行，详细内容按需加载到 references/
- **vibe 摄影 12 池**（v2 新增风格 E）：表情 / 服装 / 场景 / 瞬间状态 / 景别 / 焦段 / 机位 / 构图 / 前景 / 光线 / 色彩 / 摄影状态 —— 默认 10 张成组 + 批次差异强制规则

## 加载指引

- 命中触发词 → 加载 SKILL.md（约 263 行）
- 风格路由 → 加载对应的 **prompt-skeleton** 文件（取提示词模板）
- 实战经验 / 反馈处理 → 加载对应的 **style-X** 文件
- 跨风格通用规则 → 加载 `shared-mechanisms.md`

## 支持的 IP 预设（风格 C）

- Chiikawa（吉伊卡哇）
- Line Friends
- Sanrio（三丽鸥）
- WTT 原创角色：小九
- 自定义 IP（按模板映射）

## 版本

v2.1.0（2026-09-03）—— 渐进式披露重构：SKILL.md 从 1009 行降到 263 行，详细内容抽到 references/。详见 CHANGELOG.md。
