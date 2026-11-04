import { useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import requestJson from '../../hooks/requestJson.js'

// One form for both jobs: with a post it edits, without one it creates.
function PostForm({ post, categories, onSaved, onCancel }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const result = await requestJson(post ? `/api/blog-posts/${post.id}` : '/api/blog-posts', {
      method: post ? 'PUT' : 'POST',
      body: { title, category, content },
    })

    setIsSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onSaved(result.data)
  }

  return (
    <section className="blog-card" aria-label={post ? 'Edit post' : 'Create new post'}>
      <h2>{post ? 'Edit Post' : 'Create a New Post'}</h2>
      <form className="blog-form" onSubmit={handleSubmit}>
        <div className="blog-field">
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            maxLength={255}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter post title..."
            required
            value={title}
          />
        </div>
        <div className="blog-field">
          <label htmlFor="post-category">Category</label>
          {/* A datalist suggests existing categories but still allows a new one. */}
          <input
            id="post-category"
            list="post-category-options"
            maxLength={50}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="General"
            value={category}
          />
          <datalist id="post-category-options">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="blog-field">
          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your story here..."
            required
            rows="8"
            value={content}
          />
        </div>

        {error && (
          <p className="status-message status-message--error blog-error" role="alert">
            {error}
          </p>
        )}

        <div className="blog-form-actions">
          <Button type="submit" className="blog-submit-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : post ? 'Save Changes' : 'Publish Post'}
          </Button>
          <Button className="blog-secondary-button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}

export default PostForm