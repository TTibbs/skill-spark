import Link from "next/link";
import { TactileButton } from "@/components/ui/tactile-button";

const games = [
  {
    title: "Maths Meadow",
    description:
      "Build confidence with addition, subtraction and number challenges that adapt as children progress.",
    href: "/games/maths-meadow",
    icon: CalculatorIcon,
    accent: "bg-[#fff0bd]",
    iconBackground: "bg-[#ffd86f]",
  },
  {
    title: "Spelling Garden",
    description:
      "Practise letters, sounds and spelling through short, colourful word-building activities.",
    href: "/games/spelling-garden",
    icon: LettersIcon,
    accent: "bg-[#dcecff]",
    iconBackground: "bg-[#9ac9ff]",
  },
  {
    title: "Memory Match",
    description:
      "Strengthen memory and concentration by matching characters, objects, words and numbers.",
    href: "/games/memory-match",
    icon: MemoryIcon,
    accent: "bg-[#eadfff]",
    iconBackground: "bg-[#c4a3ff]",
  },
  {
    title: "Pop & Bloom",
    description:
      "A gentle reaction game where children pop floating bubbles and grow a colourful flower garden.",
    href: "/games/pop-and-bloom",
    icon: FlowerIcon,
    accent: "bg-[#ddf7e7]",
    iconBackground: "bg-[#8bdbab]",
  },
];

const rewardSteps = [
  {
    number: "01",
    title: "Play and learn",
    description:
      "Children complete short games, practise skills and build consistent learning habits.",
  },
  {
    number: "02",
    title: "Complete real-world quests",
    description:
      "Parents can add chores such as tidying toys, brushing teeth or helping with dinner.",
  },
  {
    number: "03",
    title: "Earn stars and tokens",
    description:
      "Learning streaks, milestones and approved chores contribute towards visible progress.",
  },
  {
    number: "04",
    title: "Unlock meaningful rewards",
    description:
      "Parents choose rewards their child genuinely values, rather than generic digital badges alone.",
  },
];

const childRewards = [
  {
    value: "80",
    unit: "stars",
    title: "Choose tonight’s film",
    icon: FilmIcon,
  },
  {
    value: "120",
    unit: "stars",
    title: "Extra 20 minutes of playtime",
    icon: GamepadIcon,
  },
  {
    value: "160",
    unit: "stars",
    title: "Pick a weekend activity",
    icon: AdventureIcon,
  },
];

const parentFeatures = [
  "Set age-appropriate learning goals",
  "Create custom chores and routines",
  "Choose rewards and required star totals",
  "Approve completed real-world tasks",
  "See progress across learning categories",
  "Adjust difficulty as confidence improves",
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcf7] text-[#24352f]">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dfe8df]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#dcecff] blur-3xl" />
            <div className="absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-[#f6dfb1] blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-[#d9f0de] blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-10 lg:py-28">
            <div className="max-w-2xl">
              <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[#20322c] sm:text-6xl lg:text-7xl">
                Learning feels better when it leads somewhere.
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5f706a] sm:text-xl">
                A playful learning space combining maths, spelling, memory games
                and family chores. Children earn progress towards rewards chosen
                by their parents.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <TactileButton
                  render={<Link href="/games" />}
                  effect="slam"
                  className="min-h-14 gap-2 rounded-2xl border-[#243f35] bg-[#243f35] px-7 py-0 text-base font-bold text-white [--tactile-shadow-color:#76aa8f] hover:bg-[#2e4c40] hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8ec6ab]"
                >
                  Explore the games
                  <ArrowRightIcon />
                </TactileButton>

                <Link
                  href="/parents"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[#bfd0c6] bg-white/70 px-7 text-base font-bold text-[#2e473e] transition hover:border-[#93ad9f] hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#bfd7ca]"
                >
                  View parent features
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#60736b]">
                <span className="flex items-center gap-2">
                  <CheckIcon />
                  Short, child-friendly activities
                </span>
                <span className="flex items-center gap-2">
                  <CheckIcon />
                  Parent-controlled rewards
                </span>
                <span className="flex items-center gap-2">
                  <CheckIcon />
                  Mobile-first
                </span>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section
          id="games"
          className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <h2 className="max-w-md text-4xl font-black tracking-[-0.04em] text-[#23372f] sm:text-5xl">
                Small games with a clear purpose.
              </h2>

              <p className="mt-5 max-w-md text-lg leading-8 text-[#66766f]">
                Activities are designed to be quick enough for regular use
                without feeling like another long lesson.
              </p>

              <Link
                href="/games"
                className="mt-8 inline-flex items-center gap-2 font-bold text-[#315f4c] underline decoration-[#a9cbb9] decoration-2 underline-offset-4 transition hover:text-[#1d4133]"
              >
                View all activities
                <ArrowRightIcon />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {games.map((game) => {
                const Icon = game.icon;

                return (
                  <Link
                    key={game.title}
                    href={game.href}
                    className={`${game.accent} group flex min-h-72 flex-col rounded-[2rem] border border-black/5 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(47,72,61,0.12)] sm:p-7`}
                  >
                    <div
                      className={`${game.iconBackground} flex h-14 w-14 items-center justify-center rounded-2xl text-[#2c433a]`}
                    >
                      <Icon />
                    </div>

                    <div className="mt-auto pt-10">
                      <h3 className="text-2xl font-black tracking-[-0.025em] text-[#263a32]">
                        {game.title}
                      </h3>
                      <p className="mt-3 leading-7 text-[#5e7169]">
                        {game.description}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#345a4a]">
                        Play game
                        <span className="transition-transform group-hover:translate-x-1">
                          <ArrowRightIcon />
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="rewards"
          className="border-y border-[#d9e5dd] bg-[#eaf3ed]"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div className="lg:sticky lg:top-28">
                <h2 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-[#21372e] sm:text-5xl">
                  Rewards that matter outside the screen.
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#62746c]">
                  Children are more likely to care about progress when it leads
                  to something personally meaningful. Parents decide what can be
                  earned and how much effort it requires.
                </p>

                <div className="mt-9 rounded-[2rem] bg-[#263f35] p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b9d7c8]">
                        Current quest
                      </p>
                      <p className="mt-2 text-2xl font-black">
                        Choose Saturday’s adventure
                      </p>
                    </div>

                    <AdventureIcon />
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>112 stars earned</span>
                      <span>160 required</span>
                    </div>
                    <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[70%] rounded-full bg-[#ffd86f]" />
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[#cae0d5]">
                    Progress can combine educational activities, consistency
                    streaks and parent-approved chores.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {rewardSteps.map((step) => (
                  <article
                    key={step.number}
                    className="grid gap-4 border-b border-[#cbdcd2] py-6 sm:grid-cols-[72px_1fr] sm:gap-7"
                  >
                    <span className="text-2xl font-black text-[#72a38b]">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.025em] text-[#294138]">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-xl leading-7 text-[#63756d]">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-black tracking-[-0.04em] text-[#21362e] sm:text-5xl">
              The reward is chosen by the family, not the app.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#65776f]">
              Digital stars create visible progress, but the real motivation is
              a privilege, activity or experience the child genuinely wants.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {childRewards.map((reward, index) => {
              const Icon = reward.icon;

              return (
                <article
                  key={reward.title}
                  className={`rounded-[2rem] border border-black/5 p-7 ${
                    index === 0
                      ? "bg-[#fff0c7]"
                      : index === 1
                        ? "bg-[#e1ecff]"
                        : "bg-[#ecddff]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-4xl font-black tracking-[-0.04em] text-[#2c433a]">
                        {reward.value}
                      </span>
                      <span className="ml-2 font-bold text-[#66786f]">
                        {reward.unit}
                      </span>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65 text-[#30483e]">
                      <Icon />
                    </div>
                  </div>

                  <h3 className="mt-12 text-2xl font-black leading-tight tracking-[-0.025em] text-[#2a4037]">
                    {reward.title}
                  </h3>
                </article>
              );
            })}
          </div>
        </section>

        <section id="parents" className="bg-[#fff3d7]">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center lg:px-10">
            <ParentDashboardPreview />

            <div>
              <h2 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-[#293a33] sm:text-5xl">
                Parents stay in control of the system.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-[#6f7166]">
                The child sees simple goals and visible progress. The parent
                controls the learning targets, chores, approval process and
                rewards behind them.
              </p>

              <ul className="mt-9 grid gap-4 sm:grid-cols-2">
                {parentFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 font-semibold leading-6 text-[#4d5e56]"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#76aa8f] text-white">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <TactileButton
                render={<Link href="/parents" />}
                effect="press"
                className="mt-9 min-h-13 gap-2 rounded-2xl border-[#2d463b] bg-[#2d463b] px-6 py-0 font-bold text-white [--tactile-shadow-color:#76aa8f] hover:bg-[#3a574a] hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#afcbbb]"
              >
                Explore the parent dashboard
                <ArrowRightIcon />
              </TactileButton>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[#263f35] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Learn, help, progress and earn.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#c6ddd2]">
              Start with quick educational games, then build towards a complete
              family reward system as the platform grows.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <TactileButton
                render={<Link href="/games" />}
                effect="lift"
                className="min-h-14 gap-2 rounded-2xl border-[#ffd86f] bg-[#ffd86f] px-7 py-0 font-bold text-[#26372f] [--tactile-shadow-color:#cfae4e] hover:bg-[#ffe28d] hover:text-[#26372f]"
              >
                Start playing
                <ArrowRightIcon />
              </TactileButton>

              <Link
                href="/parents"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 font-bold text-white transition hover:bg-white/15"
              >
                Parent area
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dde7df] bg-[#fbfcf7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#b8d2c4]"
        >
          <BrandMark />
          <span className="text-xl font-black tracking-[-0.03em] text-[#263c33]">
            Questlings
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            href="#games"
            className="font-semibold text-[#596c64] transition hover:text-[#263f35]"
          >
            Games
          </Link>
          <Link
            href="#rewards"
            className="font-semibold text-[#596c64] transition hover:text-[#263f35]"
          >
            Rewards
          </Link>
          <Link
            href="#parents"
            className="font-semibold text-[#596c64] transition hover:text-[#263f35]"
          >
            For parents
          </Link>
        </nav>

        <Link
          href="/games"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2b463a] px-5 text-sm font-bold text-white transition hover:bg-[#38584a] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9fc5b0]"
        >
          Play now
        </Link>
      </div>
    </header>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="absolute z-20 -left-5 top-20 hidden rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(46,66,58,0.13)] sm:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7dcff]">
            <MemoryIcon />
          </div>
          <div>
            <p className="text-sm font-bold text-[#52655d]">Memory streak</p>
            <p className="text-xl font-black text-[#2c4037]">5 days</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 bottom-24 z-20 hidden rounded-2xl bg-[#fff0bd] p-4 shadow-[0_16px_40px_rgba(46,66,58,0.13)] sm:block">
        <p className="text-sm font-bold text-[#706341]">Reward progress</p>
        <p className="mt-1 text-2xl font-black text-[#3f463a]">112 / 160 ⭐</p>
      </div>

      <div className="relative rounded-[2.7rem] border-[8px] border-[#263f35] bg-[#ddebff] p-4 shadow-[0_35px_80px_rgba(45,69,59,0.2)]">
        <div className="overflow-hidden rounded-[2rem] bg-[#edf5ff]">
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="text-sm font-bold text-[#64756d]">Good afternoon</p>
              <p className="text-xl font-black text-[#263d34]">
                Ready to play?
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd86f] text-xl font-black text-[#3b493f]">
              A
            </div>
          </div>

          <div className="px-5">
            <div className="rounded-[1.75rem] bg-[#2e4d40] p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-[#bdd7cb]">
                    Today’s adventure
                  </p>
                  <p className="mt-1 text-2xl font-black">Earn 20 stars</p>
                </div>
                <StarIcon />
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[65%] rounded-full bg-[#ffd86f]" />
              </div>
              <p className="mt-2 text-sm font-semibold text-[#cce0d6]">
                13 of 20 collected
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5">
            <div className="rounded-3xl bg-[#fff0bd] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd86f]">
                <CalculatorIcon />
              </div>
              <p className="mt-7 font-black text-[#33463d]">Maths Meadow</p>
              <p className="mt-1 text-sm font-semibold text-[#69756f]">
                +2 stars
              </p>
            </div>

            <div className="rounded-3xl bg-[#e3dcff] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bda7ff]">
                <LettersIcon />
              </div>
              <p className="mt-7 font-black text-[#33463d]">Spell & Grow</p>
              <p className="mt-1 text-sm font-semibold text-[#69756f]">
                +2 stars
              </p>
            </div>

            <div className="col-span-2 flex items-center gap-4 rounded-3xl bg-white p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff2e5]">
                <ChoreIcon />
              </div>
              <div className="flex-1">
                <p className="font-black text-[#33463d]">Tidy away toys</p>
                <p className="text-sm font-semibold text-[#69756f]">
                  Ask a parent to approve
                </p>
              </div>
              <span className="rounded-full bg-[#fff0bd] px-3 py-1 text-sm font-black text-[#685d3f]">
                +5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDashboardPreview() {
  return (
    <div className="rounded-[2.2rem] border border-[#e3d5b5] bg-white p-4 shadow-[0_30px_70px_rgba(96,79,42,0.14)] sm:p-6">
      <div className="flex items-center justify-between border-b border-[#ece5d8] pb-5">
        <div>
          <p className="text-sm font-bold text-[#887b63]">Parent dashboard</p>
          <h3 className="mt-1 text-2xl font-black text-[#334239]">
            Alex’s progress
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcecff] font-black text-[#3b5263]">
          A
        </div>
      </div>

      <div className="grid gap-3 py-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#f3f7f2] p-4">
          <p className="text-sm font-bold text-[#748179]">Stars earned</p>
          <p className="mt-2 text-3xl font-black text-[#33453c]">112</p>
        </div>
        <div className="rounded-2xl bg-[#f3f7f2] p-4">
          <p className="text-sm font-bold text-[#748179]">Current streak</p>
          <p className="mt-2 text-3xl font-black text-[#33453c]">5 days</p>
        </div>
        <div className="rounded-2xl bg-[#f3f7f2] p-4">
          <p className="text-sm font-bold text-[#748179]">Tasks waiting</p>
          <p className="mt-2 text-3xl font-black text-[#33453c]">2</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e7e0d3] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-[#34443c]">Weekend adventure</p>
            <p className="text-sm font-semibold text-[#788079]">
              Custom family reward
            </p>
          </div>
          <span className="font-black text-[#486557]">70%</span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e4ebe6]">
          <div className="h-full w-[70%] rounded-full bg-[#72a68b]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-4 rounded-2xl bg-[#f8f6f0] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcecff]">
            <CalculatorIcon />
          </div>
          <div className="flex-1">
            <p className="font-black text-[#35463d]">Maths practice</p>
            <p className="text-sm font-semibold text-[#7a817b]">
              Completed 10 questions
            </p>
          </div>
          <span className="font-black text-[#4f765f]">+10</span>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-[#f8f6f0] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0bd]">
            <ChoreIcon />
          </div>
          <div className="flex-1">
            <p className="font-black text-[#35463d]">Put clothes away</p>
            <p className="text-sm font-semibold text-[#7a817b]">
              Waiting for approval
            </p>
          </div>
          <span className="rounded-full bg-[#fff0bd] px-3 py-1 text-xs font-black text-[#6e6140]">
            Review
          </span>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#dce7df] px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
          <span className="text-lg font-black text-[#2c4138]">Questlings</span>
        </Link>

        <p className="text-sm font-medium text-[#6a7a73]">
          Playful learning, useful routines and family-chosen rewards.
        </p>

        <nav className="flex gap-5 text-sm font-bold text-[#5d7068]">
          <Link href="/games" className="hover:text-[#2c463a]">
            Games
          </Link>
          <Link href="/parents" className="hover:text-[#2c463a]">
            Parents
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function BrandMark() {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#ffd86f] text-[#2f463d] shadow-[0_4px_0_#d7b657]">
      <StarIcon />
    </span>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8 7h8" />
      <path d="M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
    </svg>
  );
}

function LettersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 18 4.2-12h2.3L16 18" />
      <path d="M7 13h7" />
      <path d="M17 8h2v10h-2" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="8" height="8" rx="2" />
      <rect x="13" y="4" width="8" height="8" rx="2" />
      <rect x="3" y="14" width="8" height="7" rx="2" />
      <path d="M17 15v5M14.5 17.5h5" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="10" r="2.5" />
      <path d="M12 7c-1-4 3-5 4-2 .8 2-1 3-4 2Z" />
      <path d="M15 10c4-1 5 3 2 4-2 .8-3-1-2-4Z" />
      <path d="M12 13c1 4-3 5-4 2-.8-2 1-3 4-2Z" />
      <path d="M9 10c-4 1-5-3-2-4 2-.8 3 1 2 4Z" />
      <path d="M12 13v8" />
      <path d="M12 18c-3-2-5 0-5 2 2 .5 4 0 5-2Z" />
    </svg>
  );
}

function ChoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 5h8" />
      <path d="M9 3h6v4H9z" />
      <rect x="5" y="6" width="14" height="15" rx="3" />
      <path d="m8 12 2 2 5-5" />
      <path d="M8 17h7" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" />
      <path d="m11 10 4 2-4 2v-4Z" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 8h8c3 0 5 2 5 5v2c0 3-2 5-4 5-1.5 0-2.5-1-3.5-2h-3C9.5 19 8.5 20 7 20c-2 0-4-2-4-5v-2c0-3 2-5 5-5Z" />
      <path d="M8 12v4M6 14h4" />
      <path d="M16 13h.01M18 15h.01" />
    </svg>
  );
}

function AdventureIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 19 6-10 4 6 2-3 6 7H3Z" />
      <path d="M16 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>
  );
}
