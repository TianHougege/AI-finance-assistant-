import Image from 'next/image';
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background layer */}
      <div className="absolute inset-0">
        {/* subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(1000px_circle_at_50%_90%,rgba(245,158,11,0.12),transparent_60%)]" />

        {/* blue blob (left/top-mid) */}
        <div className="absolute -bottom-24 left-24 h-[520px] w-[520px] rounded-full bg-blue-600/25 blur-3xl" />

        {/* green blob (right/top) */}
        <div className="absolute -top-24 right-[25px] h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-3xl" />

        {/* warm blob (bottom/center) */}
        <div className="absolute -bottom-20 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />

        {/* darker edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/60" />
      </div>

      {/* Content placeholder (keeps background behind) */}
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          {/* Container content */}
          <div className="flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between pt-10">
              {/* Left: logo */}
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  <Image
                    src="/logo.svg"
                    alt="Sidekick logo"
                    width={58}
                    height={58}
                    className="opacity-90"
                    priority
                  />
                </div>
                <span className="text-sm font-medium tracking-wide text-zinc-100/90">
                  sidekick
                </span>
              </div>

              {/* Middle: nav */}
              <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-200/60">
                <span className="cursor-default select-none hover:text-zinc-100">
                  introduce
                </span>
                <span className="cursor-default select-none hover:text-zinc-100">
                  features
                </span>
                <span className="cursor-default select-none hover:text-zinc-100">
                  contact
                </span>
                {/* Right: sign in/up */}
                <a
                  href="/auth"
                  className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Sign in/up
                </a>
              </nav>
            </header>

            {/* Hero */}
            <section id="introduce" className="mt-16">
              <div className="max-w-[560px]">
                <p className="text-xs font-semibold tracking-widest text-blue-400/90">
                  AI INVESTING COPILOT
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Make Better Investment Decisions—
                  <br />
                  Consistently
                </h1>

                <p className="mt-5 text-sm leading-6 text-zinc-200/60">
                  Sidekick helps you log decisions, get AI guidance, and see
                  your portfolio in one place—so you stay aligned with your
                  strategy even when emotions spike.
                </p>
              </div>
            </section>

            {/* Cards */}
            <section id="features" className="mt-12 h-[220px]">
              <div className="grid h-full grid-cols-1 gap-[30px] md:grid-cols-3 items-stretch">
                {/* Card 1 */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-200 ease-out hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
                  <div className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl text-zinc-100/80">
                    <Image
                      src="/ai-icon.svg"
                      alt="ai logo"
                      width={60}
                      height={60}
                      className="opacity-90"
                      priority
                    />
                  </div>
                  <h3 className="text-[20px] font-medium text-zinc-100/90">
                    AI-assistant
                  </h3>
                  <p className="mt-10 text-[20px] leading-7 text-zinc-200/60">
                    generate consistent guidance based on your own strategy
                  </p>
                </div>

                {/* Card 2 */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-200 ease-out hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
                  <div className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl text-zinc-100/80">
                    <Image
                      src="/decision-icon.svg"
                      alt="decision logo"
                      width={60}
                      height={60}
                      className="opacity-90"
                      priority
                    />
                  </div>
                  <h3 className="text-[20px] font-medium text-zinc-100/90">
                    Decision-Journal
                  </h3>
                  <p className="mt-10 text-[20px] leading-7 text-zinc-200/60">
                    log every decision, review patterns to stay consistent
                  </p>
                </div>

                {/* Card 3 */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-200 ease-out hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
                  <div className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl text-zinc-100/80">
                    <Image
                      src="/dash-icon.svg"
                      alt="dash logo"
                      width={60}
                      height={60}
                      className="opacity-90"
                      priority
                    />
                  </div>
                  <h3 className="text-[20px] font-medium text-zinc-100/90">
                    Portfolio-Dashboard
                  </h3>
                  <p className="mt-10 text-[20px] leading-7 text-zinc-200/60">
                    track your holdings and targets in one view
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="mt-12">
              <div className="relative flex h-[157px] flex-col rounded-2xl border border-white/10 bg-white/5 px-8 py-2 backdrop-blur-md">
                {/* Top row */}
                <div className="flex w-full flex-col gap-8 md:flex-row md:items-stretch md:justify-between md:gap-0">
                  {/* Brand block */}
                  <div className="flex w-[258px] flex-col gap-2.5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full ">
                        <Image
                          src="/logo.svg"
                          alt="Sidekick logo"
                          width={22}
                          height={22}
                          className="opacity-90"
                        />
                      </div>
                      <span className="text-sm font-medium text-zinc-100/80">
                        sidekick
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-zinc-200/50">
                      Build better investment decisions with clarity.
                    </p>
                  </div>

                  {/* Nav block */}
                  <div className="flex w-[368px] items-start gap-12">
                    <div className="w-40">
                      <p className="text-xs font-semibold text-zinc-100/60">
                        Product
                      </p>
                      <div className="mt-3 space-y-2 text-xs text-zinc-200/50">
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Overview
                        </span>
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Features
                        </span>
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Sign in
                        </span>
                      </div>
                    </div>

                    <div className="w-40">
                      <p className="text-xs font-semibold text-zinc-100/60">
                        Company
                      </p>
                      <div className="mt-3 space-y-2 text-xs text-zinc-200/50">
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Contact
                        </span>
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Privacy
                        </span>
                        <span className="block cursor-default select-none hover:text-zinc-200/80">
                          Terms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meta block */}
                  <div className="flex self-stretch items-center justify-end gap-4">
                    <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-zinc-100/70 transition hover:bg-white/10 hover:text-zinc-100/90">
                      <Image
                        src="/mail-icon.svg"
                        alt="mail icon"
                        width={24}
                        height={24}
                        className="opacity-90"
                        priority
                      />
                    </button>
                    <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-zinc-100/70 transition hover:bg-white/10 hover:text-zinc-100/90">
                      <Image
                        src="/github-icon.svg"
                        alt="github icon"
                        width={24}
                        height={24}
                        className="opacity-90"
                        priority
                      />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-3 h-px w-full bg-white/10" />

                {/* Bottom row */}
                <div className="mt-auto flex flex-col gap-2 text-xs text-zinc-200/40 md:flex-row md:items-center md:justify-between">
                  <p>© 2026 Sidekick. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <span className="cursor-default select-none hover:text-zinc-200/70">
                      Privacy
                    </span>
                    <span className="cursor-default select-none hover:text-zinc-200/70">
                      Terms
                    </span>
                    <span className="cursor-default select-none hover:text-zinc-200/70">
                      Privacy
                    </span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
