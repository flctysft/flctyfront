import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import Footer from './Footer.jsx'
import CompactFooter from './CompactFooter.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout({ children }) {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      {user ? <CompactFooter /> : <Footer />}
    </div>
  )
}
