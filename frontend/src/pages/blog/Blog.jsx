import { useState, useEffect } from 'react'
import Button from '../../components/forms/Button.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import './Blog.css'

function Blog() {
  const [posts, setPosts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Inline creation states
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track full reader post
  const [selectedPost, setSelectedPost] = useState(null)

  const fetchPosts = () => {
    fetch('/api/blog-posts')
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const currentUser = JSON.parse(localStorage.getItem('west-user')) || null

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, 
          content: newContent,
          author_id: currentUser ? currentUser.id : null
        })
      })

      if (response.ok) {
        setNewTitle('')
        setNewContent('')
        setIsCreating(false) 
        fetchPosts() 
      }
    } catch (err) {
      console.error('Failed to save post:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const safePosts = Array.isArray(posts) ? posts : []
  const filteredPosts = safePosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All'
    const query = searchQuery.toLowerCase()
    return (
      matchesCategory &&
      (post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query))
    )
  })

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
          
          {/* VIEW 1: Full Post Reader */}
          {selectedPost ? (
            <article className="blog-card blog-full-view">
              <Button 
                type="button" 
                className="blog-secondary-button"
                onClick={() => setSelectedPost(null)}
                style={{ marginBottom: '1.25rem' }}
              >
                ← Back to all posts
              </Button>
              <div className="blog-post-header">
                <span className="blog-category-badge">Blog</span>
                <span className="blog-post-meta">
                  {new Date(selectedPost.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                {selectedPost.title}
              </h1>
              <p className="blog-post-meta" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Written by <strong style={{ color: '#111827' }}>{selectedPost.author || 'Anonymous'}</strong>
              </p>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#374151', fontSize: '1rem' }}>
                {selectedPost.content}
              </div>
            </article>

          /* VIEW 2: Create Post Form */
          ) : isCreating ? (
            <section className="blog-card" aria-label="Create new post">
              <h2>Create a New Post</h2>
              <form onSubmit={handleCreatePost} style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <TextInput
                    className="blog-search"
                    id="post-title"
                    label="Post Title"
                    onChange={setNewTitle}
                    placeholder="Enter post title..."
                    value={newTitle}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="post-content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                    Content
                  </label>
                  <textarea
                    id="post-content"
                    rows="6"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your story here..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit', color: '#1f2937' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button type="submit" className="blog-submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Post'}
                  </Button>
                  <Button 
                    type="button" 
                    className="blog-secondary-button"
                    onClick={() => setIsCreating(false)} 
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </section>

          /* VIEW 3: Feed List */
          ) : (
            <>
              <section className="blog-card" aria-label="Filter blog posts">
                <div className="blog-filter-header">
                  <div className="blog-categories" aria-label="Post categories">
                    <Button
                      className={`blog-category-button${selectedCategory === 'All' ? ' is-active' : ''}`}
                      aria-pressed={selectedCategory === 'All'}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All
                    </Button>
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

              <div className="blog-posts" style={{ marginTop: '1.5rem' }}>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <article key={post.id} className="blog-card">
                      <div className="blog-post-header">
                        <span className="blog-category-badge">Blog</span>
                        <span className="blog-post-meta">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="blog-post-title">{post.title}</h2>
                      <p className="blog-excerpt">{post.content?.slice(0, 120)}...</p>
                      <div className="blog-post-footer">
                        <span>
                          Written by <strong>{post.author || 'Anonymous'}</strong>
                        </span>
                        <Button 
                          className="blog-read-button" 
                          onClick={() => setSelectedPost(post)}
                        >
                          Read post →
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="blog-card blog-empty">
                    <p>No posts found matching your filter.</p>
                  </div>
                )}
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
            <Button className="blog-create-button" onClick={() => { setSelectedPost(null); setIsCreating(true); }}>
              + Create New Post
            </Button>
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
            <p>Keep discussions respectful and relevant to student life at HKU.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Blog