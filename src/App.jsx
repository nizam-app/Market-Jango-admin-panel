import Asidebar from './components/Asidebar'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router'

function App() {
  return (
    <>
      <div className="flex min-h-screen">
        <Asidebar />

        <main className="flex-1 w-[75%]">
          <header className="fixed top-0 left-[20%] right-0 z-40">
            <Navbar />
          </header>

          <section className="bg-[#F5F7FA]  p-10 pt-30 min-h-screen ">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

export default App
