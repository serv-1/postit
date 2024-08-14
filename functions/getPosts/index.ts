import getPost from 'functions/getPost'

export default async function getPosts(postIds: string[]) {
  return Promise.all(postIds.map(getPost))
}
