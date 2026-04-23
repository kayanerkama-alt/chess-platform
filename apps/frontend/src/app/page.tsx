import Link from 'next/link';

export default function Home() {
  return (
    <section className="space-y-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Play chess. Anywhere. Free.</h1>
          <p className="text-neutral-300 text-lg">
            Real-time multiplayer, Stockfish AI with skill levels, post-game analysis with blunder detection,
            PGN import/export, and Elo ratings. 100% free and open source.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/play" className="btn">Play online</Link>
            <Link href="/play/ai" className="btn-outline">Play vs AI</Link>
            <Link href="/analysis" className="btn-outline">Analyze PGN</Link>
          </div>
        </div>
        <div className="card">
          <div className="aspect-square rounded bg-gradient-to-br from-neutral-800 to-neutral-950 grid place-items-center text-[8rem]">
            ♞
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-white">Real-time</h3>
          <p className="text-sm text-neutral-400 mt-1">WebSocket gameplay with clocks, premoves, and seamless reconnection.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white">Stockfish AI</h3>
          <p className="text-sm text-neutral-400 mt-1">21 skill levels (UCI_Elo 800–2700) plus an evaluation bar you can toggle.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white">Analysis</h3>
          <p className="text-sm text-neutral-400 mt-1">Paste a PGN, get blunder detection and engine lines move by move.</p>
        </div>
      </div>
    </section>
  );
}
