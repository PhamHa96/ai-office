import type { Agent } from '../types/agent'

const FAKE_OUTPUTS: Record<string, string[]> = {
  Engineering: [
    'Analyzed the codebase. Found 3 components that can be refactored into shared utilities. Estimated 40% reduction in duplication.',
    'Reviewed the PR. Left 5 comments. Core logic is sound but needs better error handling on the async paths.',
    'Implemented the feature using a hook-based approach. Tests written. Coverage at 87%. Ready for review.',
    'Identified a memory leak in the event listener setup. Fixed by returning a cleanup function in useEffect.',
    'Migrated the auth module to TypeScript. All 42 tests pass. Type coverage 100%.',
  ],
  Executive: [
    'Reviewed Q3 targets. We are on track for the revenue goal but behind on user retention. Proposing a new loyalty initiative.',
    'Signed off on the product roadmap. Engineering sprint 7 begins Monday. Top priority: payment gateway integration.',
    'Board presentation prepared. Key metrics: 32% MoM growth, NPS 74, churn down 8%. Strong story to tell.',
    'Aligned with the investor relations team. Series B deck updated with latest ARR figures.',
    'Decision made: we expand to Southeast Asia in Q1. Budget allocated, hiring plan approved.',
  ],
  General: [
    'After careful consideration, the optimal path balances speed and stability. I recommend a phased approach over 6 weeks.',
    'The patterns here suggest a recurring bottleneck in cross-team communication. A weekly sync ritual could resolve 70% of it.',
    'There are three possible futures. The wisest choice is the one that creates the most options, not the fastest outcome.',
    'Looking at the historical data and team dynamics, I foresee friction in week 3. Proactive alignment now prevents that.',
    'The question is not what to build — it is what not to build. Constraint clarifies purpose.',
  ],
  Product: [
    'User research complete. 23 interviews conducted. Top pain point: onboarding takes too long. Proposing a guided checklist.',
    'PRD v2 drafted for the notification system. Scope: 4 user stories, 2 edge cases, 1 analytics requirement.',
    'A/B test results in: variant B wins by 12% on conversion. Rolling out to 100% of users next Tuesday.',
    'Backlog groomed. 8 tickets re-prioritized. Cutting "social share" feature — low impact, high effort.',
    'Feature flag for dark mode is live. Monitoring metrics. Will flip to default in 2 sprints if engagement holds.',
  ],
}

function randomDelay(): number {
  return 1000 + Math.random() * 1500
}

function pickOutput(agent: Agent, prompt: string): string {
  const pool = FAKE_OUTPUTS[agent.department] ?? FAKE_OUTPUTS['General']
  const base = pool[Math.floor(Math.random() * pool.length)]
  const keyword = prompt.split(' ').slice(0, 4).join(' ')
  return `[Re: "${keyword}..."] ${base}`
}

export async function simulateTaskRun(
  agent: Agent,
  prompt: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()))
  return pickOutput(agent, prompt)
}
