import UpdatePost from 'app/pages/postUpdate'
import type { Metadata } from 'next'
import getPost from 'utils/functions/getPost'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { name } = await getPost(params.id)

  return {
    title: 'Update ' + name + ' - PostIt',
  }
}

export default async function Page({ params }: { params: Params }) {
  const post = await getPost(params.id)

  return <UpdatePost post={post} />
}
