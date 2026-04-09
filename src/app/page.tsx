import Link from "next/link";

const games = [
  {
    id: "karols-farm",
    title: "Karol's Farm 3D",
    description: "Izometryczna gra farmerska z uprawami, drzewami, pogodą i pracownikami!",
    emoji: "🌾",
    color: "from-green-400 to-emerald-600",
    status: "playable" as const,
  },
  {
    id: null,
    title: "Wkrótce...",
    description: "Następna gra już w drodze!",
    emoji: "🎮",
    color: "from-gray-300 to-gray-400",
    status: "coming-soon" as const,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center font-sans">
      <header className="w-full py-6 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          🎮 Gry Brzezinka
        </h1>
        <nav>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            gry.brzezinka.eu
          </span>
        </nav>
      </header>

      <main className="flex flex-1 w-full max-w-5xl flex-col items-center px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Witaj w naszych grach!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gry stworzone z pasją. Wybierz grę i rozpocznij przygodę!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {games.map((game, i) => (
            <GameCard key={i} game={game} />
          ))}
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Brzezinka {new Date().getFullYear()} | Made with vibe coding
      </footer>
    </div>
  );
}

function GameCard({
  game,
}: {
  game: (typeof games)[number];
}) {
  const isPlayable = game.status === "playable" && game.id;

  const content = (
    <div
      className={`relative group rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
        isPlayable
          ? "hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
          : "opacity-60"
      }`}
    >
      <div
        className={`h-48 bg-gradient-to-br ${game.color} flex items-center justify-center`}
      >
        <span className="text-8xl drop-shadow-lg">{game.emoji}</span>
      </div>
      <div className="p-6 bg-white dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {game.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {game.description}
        </p>
        {isPlayable && (
          <div className="mt-4">
            <span className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold group-hover:bg-green-600 transition-colors">
              Graj teraz!
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isPlayable) {
    return <Link href={`/games/${game.id}`}>{content}</Link>;
  }

  return content;
}
