import TabPanel from './TabPanel'
import { IUserPost } from '../types/common'
import Link from './Link'
import Image from 'next/image'
import ChevronRight from '../public/static/images/chevron-right.svg'

interface ProfilePostsTabPanel {
  posts: IUserPost[]
}

const ProfilePostsTabPanel = ({ posts }: ProfilePostsTabPanel) => {
  return (
    <TabPanel value="post">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Link
            key={post.id}
            href="/"
            className="flex flex-row flex-nowrap mb-8 last:mb-0 bg-fuchsia-200 rounded-8 overflow-hidden hover:no-underline hover:bg-fuchsia-300 transition-colors duration-200 group md:mb-16 md:max-w-[700px] md:mx-auto"
          >
            <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
              <Image
                src={post.images[0]}
                alt=""
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex flex-row flex-nowrap w-full p-8 justify-between items-center text-fuchsia-600 md:p-16">
              <div className="font-bold">{post.name}</div>
              <div>
                <ChevronRight className="w-24 h-24 relative left-0 group-hover:left-8 transition-[left] duration-200" />
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center">You have not created any posts yet.</div>
      )}
    </TabPanel>
  )
}

export default ProfilePostsTabPanel
