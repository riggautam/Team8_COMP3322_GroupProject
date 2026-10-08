const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

function LatestPosts({ posts }) {
  return (
    <section className="dash-card" aria-labelledby="posts-title">
      <h2 id="posts-title">Latest blog posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to write one!</p>
      ) : (
        <ul className="dash-list">
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/blog/${post.id}`}>{post.title}</a>
              <p className="dash-meta">
                {post.author} · <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
      <a href="/blog">View all posts</a>
    </section>
  )
}

export default LatestPosts
