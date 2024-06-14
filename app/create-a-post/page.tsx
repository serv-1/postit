import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import CreatePostForm from 'components/CreatePostForm'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import styles from 'styles/invisibleScrollbar.module.css'

export const metadata: Metadata = {
  title: 'Create a post - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  return (
    <main className="mb-auto md:bg-linear-wrapper md:rounded-16 md:shadow-wrapper md:p-32">
      <div
        className={
          'flex flex-col h-[518px] p-32 max-w-[450px] rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass mx-auto md:backdrop-blur-none md:shadow-shape md:bg-fuchsia-200 overflow-y-auto ' +
          styles.invisibleScrollbar
        }
      >
        <CreatePostForm />
      </div>
    </main>
  )
}
