import { useState } from 'react'
import Loader from './components/Loader/Loader'
import Navbar from './components/Navbar/Navbar'
import Message from './sections/Message/Message'
import SplashCursor from './components/SplashCursor/SplashCursor'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <Navbar />
      <SplashCursor />
      <main className="app">
        {/* Message wraps the hero: it shrinks into the centre card on scroll */}
        <Message />
      </main>
    </>
  )
}

export default App
