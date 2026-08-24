import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen" style={{ background: '#0A0A0A' }}>
      <Sidebar />
      <main className="flex-1 ml-60 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}
