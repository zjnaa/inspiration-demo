# 摘要文案变化规则

本文档只描述 `ChatInput` 中这段摘要文案的变化规则：

```tsx
<span className="text-[12px] leading-[18px] text-[#8A9096]">
  {summary.allDone
    ? `已完成：${summary.done} / 点击查看结果`
    : `进行中：${summary.running} / 已完成：${summary.done}`}
</span>
```

对应代码：

- `src/components/ChatInput.tsx`

---

## 1. 规则概述

这段文案只有两种状态：

1. 未全部完成
2. 全部完成

判断条件只看：

- `summary.allDone`

---

## 2. 输出规则

### 未全部完成

条件：

```ts
summary.allDone === false
```

输出：

```text
进行中：{summary.running} / 已完成：{summary.done}
```

含义：

- 左边显示当前仍在执行的步骤数
- 右边显示已经完成的步骤数

示例：

- `进行中：1 / 已完成：0`
- `进行中：1 / 已完成：1`
- `进行中：1 / 已完成：2`

---

### 全部完成

条件：

```ts
summary.allDone === true
```

输出：

```text
已完成：{summary.done} / 点击查看结果
```

含义：

- 显示总完成数
- 同时给出下一步操作提示

示例：

- `已完成：3 / 点击查看结果`

---

## 3. 统计字段来源

`summary` 来自这组统计：

```ts
const done = steps.filter((step) => step.status === 'done').length;
const running = steps.filter((step) => step.status === 'running').length;
const queued = steps.filter((step) => step.status === 'queued').length;
const allDone = steps.length > 0 && done === steps.length;
```

其中这段文案实际只使用了：

- `summary.running`
- `summary.done`
- `summary.allDone`

`queued` 没有展示在文案里。

---

## 4. 判定逻辑

### 全部完成判定

```ts
allDone = steps.length > 0 && done === steps.length
```

这表示：

- 只要还有任何一步不是 `done`，就不算全部完成
- 必须所有步骤都完成，才切换到“点击查看结果”

---

## 5. 文案变化顺序

按当前实现，文案会这样变化：

1. 刚发送：
   - `进行中：1 / 已完成：0`
2. 第一步完成：
   - `进行中：1 / 已完成：1`
3. 第二步完成：
   - `进行中：1 / 已完成：2`
4. 全部完成：
   - `已完成：3 / 点击查看结果`

---

## 6. 复用模板

如果你要在别的模块里复用，直接套这个模板：

```ts
const summaryText = allDone
  ? `已完成：${done} / 点击查看结果`
  : `进行中：${running} / 已完成：${done}`;
```

---

## 7. 一句话版

这段摘要文案的规则就是：

**没做完时显示进度统计，全部做完后显示完成统计和查看结果引导。**
