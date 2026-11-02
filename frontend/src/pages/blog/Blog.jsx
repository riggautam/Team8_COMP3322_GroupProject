import { useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import { BLOG_POSTS, CATEGORIES } from './mockdata.js'
import './Blog.css'

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query)

    return matchesCategory && matchesSearch
  })

  const featuredPost = BLOG_POSTS[0]

  return (
    <div className="blog-page">
      <header className="blog-banner">
        <div>
          <h1>HKU Student Blog</h1>
          <p>
            Thursday, 8 October 2026 · Stories, guides, and campus tips from
            fellow students
          </p>
        </div>
        <div className="blog-skyline" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <div className="blog-layout">
        <section className="blog-main" aria-label="Blog posts">
          <section className="blog-card" aria-label="Filter blog posts">
            <div className="blog-filter-header">
              <div className="blog-categories" aria-label="Post categories">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    className={`blog-category-button${selectedCategory === category ? ' is-active' : ''}`}
                    aria-pressed={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <TextInput
                className="blog-search"
                id="blog-search"
                label="Search blog posts"
                onChange={setSearchQuery}
                placeholder="Search blog posts..."
                value={searchQuery}
              />
            </div>
          </section>

          {selectedCategory === 'All' && !searchQuery && (
            <article className="blog-card blog-featured">
              <p className="blog-featured-badge">Featured Story</p>
              <h2>{featuredPost.title}</h2>
              <p className="blog-post-meta">
                By <strong>{featuredPost.author}</strong> · {featuredPost.date} ·{' '}
                {featuredPost.readTime}
              </p>
              <p className="blog-excerpt">{featuredPost.excerpt}</p>
              <div className="blog-tags">
                {featuredPost.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          )}

          <div className="blog-posts">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article key={post.id} className="blog-card">
                  <div className="blog-post-header">
                    <span className="blog-category-badge">{post.category}</span>
                    <span className="blog-post-meta">
                      {post.date} · {post.readTime}
                    </span>
                  </div>
                  <h2 className="blog-post-title">{post.title}</h2>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <div className="blog-post-footer">
                    <span>
                      Written by <strong>{post.author}</strong>
                    </span>
                    <Button className="blog-read-button">Read post →</Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="blog-card blog-empty">
                <p>No posts found matching your filter.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="blog-sidebar">
          <section className="blog-card">
            <h2>Share your story</h2>
            <p>
              Have tips for incoming students or a story about campus life?
              Write for the HKU Blog!
            </p>
            <Button className="blog-create-button">+ Create New Post</Button>
          </section>

          <section className="blog-card">
            <h2>Popular Topics</h2>
            <ul className="blog-topic-list">
              <li><a href="#orientation"># Exchange Orientation</a></li>
              <li><a href="#canteen"># Campus Dining Guides</a></li>
              <li><a href="#course-mapping"># Course Mapping Tips</a></li>
              <li><a href="#living"># Living in Hong Kong</a></li>
            </ul>
          </section>

          <section className="blog-card blog-guidelines">
            <h2>Blog Guidelines</h2>
            <p>
              Keep discussions respectful and relevant to student life at HKU.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Blog
