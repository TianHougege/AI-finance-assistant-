import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/sidekick_logo_whitebg_128.png"
            alt="SideKick logo"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-xl"
          />
          <span className="text-sm font-semibold tracking-tight">SideKick</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/auth"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            登录 / 注册
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            进入 Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              用一份投资价值观，
              <span className="block">让每次决策更稳、更一致。</span>
            </h1>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
              SideKick 是你的投资决策助手：记录计划、收集决策、并用 AI
              帮你复盘冲突与风险。 先把 V0 跑起来——从「Value Plan」到「Decision
              List」，你就能看到自己的行为模式。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/value-create"
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                开始建立 Value Plan
              </Link>
              <Link
                href="/dashboard/decision-list"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                去记录一条 Decision
              </Link>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              提示：你可以先不做完美设计，先把数据流跑通（保存 / 读取 / AI
              反馈）。
            </div>
          </div>

          {/* Preview card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Overview 预览</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Value Plan → AI Review → Dashboard
                </div>
              </div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                V0
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  目标
                </div>
                <div className="mt-1 text-sm font-medium">
                  年化 5–7% · 长期持有 · 规则优先
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  AI 反馈
                </div>
                <div className="mt-1 text-sm">
                  识别矛盾（如“单一持仓 100% vs 单仓上限 20%”）并给出修订建议。
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  决策记录
                </div>
                <div className="mt-1 text-sm">
                  每次买卖都留下原因、计划时间与金额，后续可回看你的偏差。
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold">V0 你能马上用到什么</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Value Plan</div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                用结构化表单写下目标、规则、持仓上限等，并保存到 Supabase。
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">AI Review</div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                一键生成评审文本（矛盾、风险、建议），并写入数据库用于持久化展示。
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Decision List</div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                记录每条行动（买/卖/加仓/减仓）并回看自己的执行质量。
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-200 py-8 text-xs text-zinc-500 dark:border-zinc-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} SideKick · V0</div>
            <div className="flex gap-3">
              <Link
                className="hover:text-zinc-700 dark:hover:text-zinc-200"
                href="/dashboard/value-create"
              >
                Value Plan
              </Link>
              <Link
                className="hover:text-zinc-700 dark:hover:text-zinc-200"
                href="/dashboard/decision-list"
              >
                Decisions
              </Link>
              <Link
                className="hover:text-zinc-700 dark:hover:text-zinc-200"
                href="/dashboard"
              >
                Overview
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
