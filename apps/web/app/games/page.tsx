import Link from "next/link";

type GameStatus = "available" | "coming-soon";

type Game = {
  title: string;
  description: string;
  href: string;
  category: "Maths" | "Words" | "Memory" | "Just for fun";
  reward: number;
  duration: string;
  status: GameStatus;
  icon: React.ComponentType;
  background: string;
  iconBackground: string;
  featured?: boolean;
};

const games: Game[] = [
  {
    title: "Maths Meadow",
    description:
      "Solve addition and subtraction questions, build streaks and progress through increasingly challenging levels.",
    href: "/games/maths-meadow",
    category: "Maths",
    reward: 2,
    duration: "3–5 mins",
    status: "available",
    icon: CalculatorIcon,
    background: "bg-[#fff0bd]",
    iconBackground: "bg-[#ffd86f]",
    featured: true,
  },
  {
    title: "Colour Critter Catch",
    description:
      "Find the critters matching the target colour while practising visual recognition and concentration.",
    href: "/games/colour-critter-catch",
    category: "Memory",
    reward: 2,
    duration: "2–4 mins",
    status: "available",
    icon: CritterIcon,
    background: "bg-[#e3dcff]",
    iconBackground: "bg-[#bda7ff]",
    featured: true,
  },
  {
    title: "Pop & Bloom",
    description:
      "Pop floating bubbles, catch butterflies and grow a colourful flower garden with every successful tap.",
    href: "/games/pop-and-bloom",
    category: "Just for fun",
    reward: 1,
    duration: "2–5 mins",
    status: "available",
    icon: FlowerIcon,
    background: "bg-[#ddf7e7]",
    iconBackground: "bg-[#8bdbab]",
  },
  {
    title: "Memory Match",
    description:
      "Turn over cards, remember their positions and find every matching pair using as few moves as possible.",
    href: "/games/memory-match",
    category: "Memory",
    reward: 2,
    duration: "3–6 mins",
    status: "available",
    icon: MemoryIcon,
    background: "bg-[#dcecff]",
    iconBackground: "bg-[#9ac9ff]",
  },
  {
    title: "Spelling Garden",
    description:
      "Build words from letters, practise common spellings and help a small garden grow with every correct answer.",
    href: "/games/spelling-garden",
    category: "Words",
    reward: 2,
    duration: "3–5 mins",
    status: "available",
    icon: LettersIcon,
    background: "bg-[#ffe0ea]",
    iconBackground: "bg-[#ff9dbb]",
  },
  {
    title: "Number Hunt",
    description:
      "Search a playful scene for numbers that answer simple counting and number-recognition challenges.",
    href: "/games/number-hunt",
    category: "Maths",
    reward: 2,
    duration: "3–5 mins",
    status: "coming-soon",
    icon: NumberSearchIcon,
    background: "bg-[#ffe8cf]",
    iconBackground: "bg-[#ffbd78]",
  },
  {
    title: "Sound It Out",
    description:
      "Listen to letter sounds and choose the picture or word that begins with the correct sound.",
    href: "/games/sound-it-out",
    category: "Words",
    reward: 2,
    duration: "3–5 mins",
    status: "coming-soon",
    icon: SoundIcon,
    background: "bg-[#dff3f4]",
    iconBackground: "bg-[#8fd5d8]",
  },
  {
    title: "Pattern Parade",
    description:
      "Complete visual and number patterns by choosing what should appear next in the sequence.",
    href: "/games/pattern-parade",
    category: "Memory",
    reward: 2,
    duration: "3–5 mins",
    status: "coming-soon",
    icon: PatternIcon,
    background: "bg-[#eee4ff]",
    iconBackground: "bg-[#c5a8f8]",
  },
];

const featuredGames = games.filter(
  (game) => game.featured && game.status === "available",
);

const availableGames = games.filter((game) => game.status === "available");

const upcomingGames = games.filter((game) => game.status === "coming-soon");

export default function GamesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcf7] text-[#24352f]">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dfe8df]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#dcecff] blur-3xl" />
            <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#ffe4b5] blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[#dff2e5] blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-10 lg:py-24">
            <div className="max-w-3xl">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#587067] transition hover:text-[#29483b]"
              >
                <ArrowLeftIcon />
                Back to home
              </Link>

              <h1 className="mt-7 text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[#20322c] sm:text-6xl lg:text-7xl">
                Pick a game and start your next quest.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#61726b] sm:text-xl">
                Practise maths, spelling, memory and concentration through short
                activities designed to feel more like play than a lesson.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <InfoPill icon={<GamepadIcon />} label="5 games available" />
                <InfoPill icon={<ClockIcon />} label="Short activities" />
                <InfoPill icon={<StarIcon />} label="Earn family rewards" />
              </div>
            </div>

            <DailyQuestPreview />
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.035em] text-[#23372f] sm:text-4xl">
                Continue your adventure
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#687871]">
                These activities are ready to play now. Completing a game can
                contribute towards daily goals and parent-created rewards.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-[#63776e]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0bd]">
                <StarIcon />
              </span>
              Earn stars as you play
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {featuredGames.map((game, index) => (
              <FeaturedGameCard key={game.title} game={game} index={index} />
            ))}
          </div>
        </section>

        <section className="border-y border-[#dce7df] bg-[#edf4ef]">
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:gap-14">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.035em] text-[#23372f] sm:text-4xl">
                  Today’s star goal
                </h2>

                <p className="mt-4 max-w-lg leading-7 text-[#64756d]">
                  Complete a mixture of games rather than repeating the easiest
                  activity. Variety helps children practise different skills.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#29463a] p-6 text-white sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b9d7c8]">
                      Daily progress
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      Earn 10 learning stars
                    </p>

                    <p className="mt-2 text-[#c9ded4]">
                      Try one maths game, one word game and one game of your
                      choice.
                    </p>
                  </div>

                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-[9px] border-[#ffd86f] bg-white/10">
                    <span className="text-2xl font-black">4</span>
                    <span className="text-xs font-bold text-[#c8ded3]">
                      of 10
                    </span>
                  </div>
                </div>

                <div className="mt-7 h-4 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[40%] rounded-full bg-[#ffd86f]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="all-games"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        >
          <div>
            <h2 className="text-3xl font-black tracking-[-0.035em] text-[#23372f] sm:text-4xl">
              All games
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-[#687871]">
              Choose a short activity based on the skill you want to practise.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {availableGames.map((game) => (
              <GameCard key={game.title} game={game} />
            ))}
          </div>
        </section>

        <section className="bg-[#fff3d7]">
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.035em] text-[#2c3d35] sm:text-4xl">
                  More games are on the way.
                </h2>

                <p className="mt-4 max-w-md leading-7 text-[#706f63]">
                  The library can grow over time without overwhelming children
                  with too many choices at once.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {upcomingGames.map((game) => (
                  <UpcomingGameCard key={game.title} game={game} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2.5rem] bg-[#263f35] px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                Finished playing?
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#c6ddd2]">
                Check your quests, complete a chore or see how close you are to
                the next family reward.
              </p>
            </div>

            <Link
              href="/rewards"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#ffd86f] px-7 font-bold text-[#2c4037] shadow-[0_7px_0_#cfae4e] transition hover:-translate-y-1 hover:shadow-[0_10px_0_#cfae4e] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View my rewards
              <ArrowRightIcon />
            </Link>
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
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
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
            href="/games"
            aria-current="page"
            className="font-bold text-[#29483b]"
          >
            Games
          </Link>

          <Link
            href="/#rewards"
            className="font-semibold text-[#596c64] transition hover:text-[#263f35]"
          >
            Rewards
          </Link>

          <Link
            href="/#parents"
            className="font-semibold text-[#596c64] transition hover:text-[#263f35]"
          >
            For parents
          </Link>
        </nav>

        <Link
          href="/parents"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2b463a] px-4 text-sm font-bold text-white transition hover:bg-[#38584a] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9fc5b0] sm:px-5"
        >
          Parent area
        </Link>
      </div>
    </header>
  );
}

function DailyQuestPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute z-20 -right-3 -top-5 hidden rotate-3 rounded-2xl bg-[#ffe1eb] px-4 py-3 shadow-[0_12px_30px_rgba(48,69,60,0.12)] sm:block">
        <p className="text-sm font-black text-[#765365]">5 day streak 🔥</p>
      </div>

      <div className="rounded-[2.2rem] border border-white/75 bg-white/72 p-5 shadow-[0_28px_70px_rgba(50,76,65,0.16)] backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#75827c]">
              Today’s adventure
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.025em] text-[#2b4037]">
              Collect 10 stars
            </h2>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd86f] text-[#35473f]">
            <StarIcon />
          </div>
        </div>

        <div className="mt-7 h-4 overflow-hidden rounded-full bg-[#e3ebe6]">
          <div className="h-full w-[40%] rounded-full bg-[#78ad91]" />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm font-bold text-[#697971]">
          <span>4 stars earned</span>
          <span>6 to go</span>
        </div>

        <div className="mt-7 space-y-3">
          <QuestRow
            icon={<CalculatorIcon />}
            title="Complete a maths game"
            reward="+2"
            completed
          />

          <QuestRow
            icon={<LettersIcon />}
            title="Complete a word game"
            reward="+2"
          />

          <QuestRow
            icon={<GamepadIcon />}
            title="Play any other game"
            reward="+2"
          />
        </div>
      </div>
    </div>
  );
}

function QuestRow({
  icon,
  title,
  reward,
  completed = false,
}: {
  icon: React.ReactNode;
  title: string;
  reward: string;
  completed?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3.5 ${
        completed ? "bg-[#e3f4e8]" : "bg-[#f3f6f3]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          completed ? "bg-[#9bd5ad]" : "bg-white"
        }`}
      >
        {completed ? <CheckIcon /> : icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black text-[#35483f]">{title}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#77847d]">
          {completed ? "Completed" : "Ready to play"}
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-[#fff0bd] px-3 py-1 text-sm font-black text-[#695d3f]">
        {reward}
      </span>
    </div>
  );
}

function FeaturedGameCard({ game, index }: { game: Game; index: number }) {
  const Icon = game.icon;

  return (
    <Link
      href={game.href}
      className={`${game.background} group relative min-h-[25rem] overflow-hidden rounded-[2.2rem] border border-black/5 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(47,72,61,0.14)] sm:p-8`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[30px] border-white/55" />
        <div className="absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-white/55" />
      </div>

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`${game.iconBackground} flex h-16 w-16 items-center justify-center rounded-[1.35rem] text-[#30463d]`}
          >
            <Icon />
          </div>

          <span className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#55675f]">
            {index === 0 ? "Recommended" : "Popular"}
          </span>
        </div>

        <div className="mt-auto pt-16">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#68776f]">
            {game.category}
          </p>

          <h3 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#293e35] sm:text-4xl">
            {game.title}
          </h3>

          <p className="mt-4 max-w-xl leading-7 text-[#5d7068]">
            {game.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-sm font-bold text-[#54665e]">
              <ClockIcon />
              {game.duration}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-sm font-bold text-[#54665e]">
              <StarIcon />
              Up to {game.reward} stars
            </span>
          </div>

          <span className="mt-7 inline-flex items-center gap-2 font-black text-[#315b49]">
            Start playing
            <span className="transition-transform group-hover:translate-x-1.5">
              <ArrowRightIcon />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function GameCard({ game }: { game: Game }) {
  const Icon = game.icon;

  return (
    <Link
      href={game.href}
      className={`${game.background} group flex min-h-[21rem] flex-col rounded-[2rem] border border-black/5 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(47,72,61,0.12)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`${game.iconBackground} flex h-14 w-14 items-center justify-center rounded-2xl text-[#30463d]`}
        >
          <Icon />
        </div>

        <span className="rounded-full bg-white/55 px-3 py-1.5 text-xs font-black text-[#5c6e66]">
          {game.category}
        </span>
      </div>

      <div className="mt-auto pt-10">
        <h3 className="text-2xl font-black tracking-[-0.025em] text-[#293e35]">
          {game.title}
        </h3>

        <p className="mt-3 line-clamp-3 leading-7 text-[#607169]">
          {game.description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[#64756d]">
            <ClockIcon />
            {game.duration}
          </span>

          <span className="flex items-center gap-1.5 text-sm font-bold text-[#64756d]">
            <StarIcon />
            {game.reward}
          </span>
        </div>

        <span className="mt-6 inline-flex items-center gap-2 font-black text-[#315b49]">
          Play
          <span className="transition-transform group-hover:translate-x-1">
            <ArrowRightIcon />
          </span>
        </span>
      </div>
    </Link>
  );
}

function UpcomingGameCard({ game }: { game: Game }) {
  const Icon = game.icon;

  return (
    <article
      className={`${game.background} flex min-h-72 flex-col rounded-[1.8rem] border border-black/5 p-5 opacity-90`}
    >
      <div
        className={`${game.iconBackground} flex h-12 w-12 items-center justify-center rounded-xl text-[#374a42]`}
      >
        <Icon />
      </div>

      <div className="mt-auto pt-8">
        <span className="text-xs font-black uppercase tracking-[0.13em] text-[#6a776f]">
          Coming soon
        </span>

        <h3 className="mt-2 text-xl font-black tracking-[-0.025em] text-[#30423a]">
          {game.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#69756e]">
          {game.description}
        </p>
      </div>
    </article>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm font-bold text-[#596d64] shadow-sm backdrop-blur">
      {icon}
      {label}
    </span>
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

        <nav
          aria-label="Footer navigation"
          className="flex gap-5 text-sm font-bold text-[#5d7068]"
        >
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

function ArrowLeftIcon() {
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
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
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
      className="h-5 w-5"
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
      className="h-5 w-5"
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

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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

function CritterIcon() {
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
      <path d="M7 7 5 4M17 7l2-3" />
      <circle cx="12" cy="13" r="8" />
      <path d="M9 12h.01M15 12h.01" />
      <path d="M9.5 16c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

function NumberSearchIcon() {
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
      <circle cx="10" cy="10" r="6" />
      <path d="m14.5 14.5 5 5" />
      <path d="M8 8.5c.5-1 1.5-1.5 2.5-1.5 1.4 0 2.5.8 2.5 2 0 1.7-2 2-2 3.5" />
      <path d="M11 15h.01" />
    </svg>
  );
}

function SoundIcon() {
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
      <path d="M5 10v4h4l5 4V6l-5 4H5Z" />
      <path d="M17 9c1.4 1.7 1.4 4.3 0 6" />
      <path d="M19.5 6.5c3 3 3 8 0 11" />
    </svg>
  );
}

function PatternIcon() {
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
      <circle cx="5" cy="12" r="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="m20 9 3 5h-6l3-5Z" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
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
