import { useId } from 'react'
import { Link } from 'react-router'
import SectionHeading from '../ui/SectionHeading.jsx'

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

function LatestPosts({ posts = [] }) {
  const titleId = useId()

  return (
    <section className="dash-card" aria-labelledby={titleId}>
      <SectionHeading id={titleId} icon="pen">Latest blog posts</SectionHeading>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to write one!</p>
      ) : (
        <ul className="dash-list">
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <p className="dash-meta">
                {post.author} · <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/blog">View all posts</Link>
    </section>
  )
}

export default LatestPosts
