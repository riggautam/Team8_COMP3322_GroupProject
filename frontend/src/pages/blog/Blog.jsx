import { useEffect, useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import requestJson from '../../hooks/requestJson.js'
import PostDetail from './PostDetail.jsx'
import PostForm from './PostForm.jsx'
import './Blog.css'

const ALL = 'All'
const EXCERPT_LENGTH = 120

function Blog() {
  const [posts, setPosts] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState('list') // 'list', 'read', 'create' or 'edit'
  const [selectedPost, setSelectedPost] = useState(null)

  async function loadPosts() {
    const result = await requestJson('/api/blog-posts')
    setLoadError(result.error)
    setPosts(result.error ? [] : result.data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // Unique category names, taken from the posts themselves.
  const categories = [...new Set(posts.map((post) => post.category))].sort()

  const query = searchQuery.trim().toLowerCase()
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === ALL || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  function showList() {
    setSelectedPost(null)
    setView('list')
  }

  function chooseCategory(name) {
    setSelectedCategory(name)
    showList()
  }

  function handleSaved(savedPost) {
    loadPosts()
    setSelectedPost(savedPost)
    setView('read')
  }

  function handleDeleted() {
    loadPosts()
    showList()
  }

  return (
    <div className="blog-page">
      <header className="blog-banner">
        <div>
          <h1>HKU Student Blog</h1>
          <p>Stories, guides, and campus tips from fellow students</p>
        </div>
        <div className="blog-skyline" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <div className="blog-layout">
        <section className="blog-main" aria-label="Blog posts">
          {view === 'read' && (
            <PostDetail
              post={selectedPost}
              onBack={showList}
              onEdit={() => setView('edit')}
              onDeleted={handleDeleted}
            />
          )}

          {view === 'create' && (
            <PostForm categories={categories} onSaved={handleSaved} onCancel={showList} />
          )}

          {view === 'edit' && (
            <PostForm
              post={selectedPost}
              categories={categories}
              onSaved={handleSaved}
              onCancel={() => setView('read')}
            />
          )}

          {view === 'list' && (
            <>
              <section className="blog-card" aria-label="Filter blog posts">
                <div className="blog-filter-header">
                  <div className="blog-categories" aria-label="Post categories">
                    {[ALL, ...categories].map((name) => (
                      <Button
                        key={name}
                        className={`blog-category-button${selectedCategory === name ? ' is-active' : ''}`}
                        aria-pressed={selectedCategory === name}
                        onClick={() => setSelectedCategory(name)}
                      >
                        {name}
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

              <div className="blog-posts">
                {isLoading && <p role="status">Loading posts…</p>}
                {loadError && (
                  <p className="status-message status-message--error" role="alert">
                    Could not load posts: {loadError}
                  </p>
                )}
                {!isLoading && !loadError && filteredPosts.length === 0 && (
                  <div className="blog-card blog-empty">
                    <p>No posts found matching your filter.</p>
                  </div>
                )}
                {filteredPosts.map((post) => (
                  <article key={post.id} className="blog-card">
                    <div className="blog-post-header">
                      <span className="blog-category-badge">{post.category}</span>
                      <span className="blog-post-meta">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="blog-post-title">{post.title}</h2>
                    <p className="blog-excerpt">
                      {post.content.slice(0, EXCERPT_LENGTH)}
                      {post.content.length > EXCERPT_LENGTH && '...'}
                    </p>
                    <div className="blog-post-footer">
                      <span>
                        Written by <strong>{post.author}</strong>
                      </span>
                      <Button
                        className="blog-read-button"
                        onClick={() => {
                          setSelectedPost(post)
                          setView('read')
                        }}
                      >
                        Read post →
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="blog-sidebar">
          <section className="blog-card">
            <h2>Share your story</h2>
            <p>
              Have tips for incoming students or a story about campus life?
              Write for the HKU Blog!
            </p>
            <Button
              className="blog-create-button"
              onClick={() => {
                setSelectedPost(null)
                setView('create')
              }}
            >
              + Create New Post
            </Button>
          </section>

          <section className="blog-card">
            <h2>Categories</h2>
            <ul className="blog-topic-list">
              {categories.map((name) => (
                <li key={name}>
                  <button type="button" onClick={() => chooseCategory(name)}>
                    # {name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="blog-card blog-guidelines">
            <h2>Blog Guidelines</h2>
            <p>Keep discussions respectful and relevant to student life at HKU.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Blog