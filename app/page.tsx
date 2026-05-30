import type { Metadata } from 'next'
import searchPosts from 'functions/searchPosts'
import type { SearchParams } from 'types'
import searchParamsToString from 'functions/searchParamsToString'
import SearchPostForm from 'components/SearchPostForm'
import PostList from 'components/PostList'
import Pagination from 'components/Pagination'
import BlobSvg from 'components/BlobSvg'

export const metadata: Metadata = {
  title: 'Home - PostIt',
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const str = searchParamsToString(await searchParams)
  const searchResult = str ? await searchPosts(str) : null

  return (
    <main className="grow flex flex-col mb-32 lg:flex-row lg:items-start lg:gap-x-24">
      <div className="bg-linear-72 from-fuchsia-300 to-fuchsia-200 p-16 rounded-2xl shadow-[-4px_4px_8px_#F5D0FE] lg:sticky lg:top-16 mb-32 lg:w-sm lg:shrink-0">
        <h1 className="mb-16">Search</h1>
        <SearchPostForm />
      </div>
      {searchResult?.totalPosts ? (
        <div>
          <div className="mb-16" role="status">
            {searchResult.totalPosts} post
            {searchResult.totalPosts > 1 ? 's' : ''} found
          </div>
          <PostList posts={searchResult.posts} />
          <Pagination totalPages={searchResult.totalPages} />
        </div>
      ) : (
        <div className="grow self-stretch relative" role="status">
          <BlobSvg className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 text-fuchsia-100" />
          <span className="text-m-4xl md:text-t-4xl w-full text-center absolute top-1/2 -translate-y-1/2">
            {searchResult ? 'No posts found' : 'Search something'}
          </span>
        </div>
      )}
    </main>
  )
}
