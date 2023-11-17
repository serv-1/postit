import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import type { Post } from 'types'
import { POST_NOT_FOUND } from 'constants/errors'
import UpdatePostForm from 'components/UpdatePostForm'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const post = await getPost(params.id)

  return {
    title: 'Update ' + (post as Post).name + ' - PostIt',
  }
}

export default async function Page({ params }: { params: Params }) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  const post = await getPost(params.id)

  if (!post) {
    throw new Error(POST_NOT_FOUND)
  }

  return (
    <main className="md:bg-linear-wrapper md:rounded-16 md:shadow-wrapper md:p-32">
      <div className="flex flex-col p-32 max-w-[450px] rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass mx-auto md:backdrop-blur-none md:shadow-shape md:bg-fuchsia-200">
        <h1>Update the post</h1>
        <p className="my-16">Only fill the inputs you want to update.</p>
        <UpdatePostForm post={post} />
      </div>
    </main>
  )
}
