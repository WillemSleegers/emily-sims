import Link from "next/link"

const Home = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 prose dark:prose-invert">
      <h1>Emily Sims</h1>
      <nav className="space-y-4 sm:space-y-6">
        <ul className="space-y-3 sm:space-y-4">
          <li>
            <Link href="/sand-sim">Sand Sim</Link>
          </li>
          <li>
            <Link href="/rain-sim">Rain Sim</Link>
          </li>
          <li>
            <Link href="/flock-sim">Flock Sim</Link>
          </li>
          <li>
            <Link href="/game-of-life">Game of Life</Link>
          </li>
          <li>
            <Link href="/test">Test</Link>
          </li>
          <li>
            <Link href="/random">Random</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Home
