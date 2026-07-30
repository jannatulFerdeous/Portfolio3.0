import { useState } from 'react'
import Loader from './components/Loader/Loader'
import Navbar from './components/Navbar/Navbar'
import Message from './sections/Message/Message'
import Work from './sections/Work/Work'
import Experience from './sections/Experience/Experience'
import Skills from './sections/Skills/Skills'
import Contact from './sections/Contact/Contact'
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
        <Work />
        <Experience />
        <Skills />
        <Contact />
      </main>
    </>
  )
}

export default App
