import Link from "next/link"

const Home = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 prose dark:prose-invert">
      <h1>Emily Sims</h1>
      <h2>Sims</h2>
      <ul className="space-y-3 sm:space-y-4">
        <li>
          <Link href="/sand-sim">Sand Sim</Link>
        </li>
        <li>
          <Link href="/rain-sim">Rain Sim</Link>
        </li>
        <li>
          <Link href="/boid-sim">Boid Sim</Link>
        </li>
        <li>
          <Link href="/flock-sim">Flock Sim</Link>
        </li>
        <li>
          <Link href="/game-of-life">Game of Life</Link>
        </li>
        <li>
          <Link href="/walker-linear">Walker (linear)</Link>
        </li>
        <li>
          <Link href="/attraction">Attraction</Link>
        </li>
      </ul>
      <h2>Testing</h2>
      <ul className="space-y-3 sm:space-y-4">
        <li>
          <Link href="/tests/test">Test</Link>
        </li>
        <li>
          <Link href="/tests/grid">Grid Test</Link>
        </li>
        <li>
          <Link href="/tests/quadtree">Quadtree Test</Link>
        </li>
        <li>
          <Link href="/tests/resize-test">Resize Test</Link>
        </li>
      </ul>
    </div>
  )
}

export default Home
