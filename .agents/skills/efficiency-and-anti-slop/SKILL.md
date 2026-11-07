---
name: efficiency-and-anti-slop
description: Директива эффективности и борьбы с нейрослопом (miqdadbadjuber/anti-slop, A-x6/anti-slop). Экономия токенов, отсутствие лишних слов и вводных фраз, минимальные точные правки, отказ от шаблонных решений и избыточных комментариев.
---

# Efficiency & Anti-Slop Directive

## 1. Token Economy (Zero Fluff)
- Be concise. Skip pleasantries, affirmations, and introductory phrases (e.g., "Sure, I can help with that", "Here is the code:").
- Do not repeat or explain code that was unchanged.
- Give only unified diffs or minimal surgical edits instead of rewriting whole files unless explicitly asked.
- Avoid repetitive disclaimers at the end of responses.

## 2. Anti-Slop Code Standards
- Write clean, native, production-grade code. Do not add speculative layers, unnecessary abstractions, or factory wrappers for simple logic.
- Avoid obvious comments like `// increment counter` or `// import libraries`. Comment only non-obvious business logic or workarounds.
- Do not hallucinate or install new packages if the task can be solved using built-in standard libraries or existing dependencies.

## 3. Execution Strategy
- Think through edge cases silently; do not output verbose chains of thought into the response unless debugging is requested.
- If an error occurs, pinpoint the exact line, state the root cause in 1-2 bullet points, and provide the fix.

