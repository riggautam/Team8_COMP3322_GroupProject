import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Button from '../../components/forms/Button.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'

function PostDetail({ post, onBack, onEdit, onDeleted }) {
  const { user } = useAuth()
  const isOwner = user?.id === post.author_id
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    async function loadComments() {
      const result = await requestJson(`/api/blog-posts/${post.id}/comments`)
      if (result.error) {
        setCommentError(result.error)
        return
      }
      setComments(result.data)
    }
    loadComments()
  }, [post.id])

  async function handleDelete() {
    if (!window.confirm(`Delete "${post.title}"? This also deletes its comments.`)) return

    setDeleteError(null)
    const result = await requestJson(`/api/blog-posts/${post.id}`, { method: 'DELETE' })
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    onDeleted()
  }

  async function handleAddComment(event) {
    event.preventDefault()
    setIsPosting(true)
    setCommentError(null)

    const result = await requestJson(`/api/blog-posts/${post.id}/comments`, {
      method: 'POST',
      body: { content: commentText },
    })

    setIsPosting(false)
    if (result.error) {
      setCommentError(result.error)
      return
    }
    setComments([...comments, result.data])
    setCommentText('')
  }

  return (
    <article className="blog-card">
      <div className="blog-post-toolbar">
        <Button className="blog-secondary-button" onClick={onBack}>
          ← Back to all posts
        </Button>
        {isOwner && (
          <div className="blog-post-actions">
            <Button className="blog-secondary-button" onClick={onEdit}>
              Edit
            </Button>
            <Button className="blog-danger-button" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
        {!user && (
          <span className="blog-post-meta">
            <Link to="/login">Log in</Link> to edit or delete your own posts
          </span>
        )}
      </div>

      {deleteError && (
        <p className="status-message status-message--error blog-error" role="alert">
          {deleteError}
        </p>
      )}

      <div className="blog-post-header">
        <span className="blog-category-badge">{post.category}</span>
        <span className="blog-post-meta">{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <h1 className="blog-full-title">{post.title}</h1>
      <p className="blog-post-meta blog-full-author">
        Written by <strong>{post.author}</strong>
      </p>
      <div className="blog-full-content">{post.content}</div>

      <hr className="blog-divider" />

      <section aria-label="Comments section">
        <h3>Comments ({comments.length})</h3>

        <form className="blog-comment-form blog-field" onSubmit={handleAddComment}>
          <label htmlFor="comment-text">Add a comment</label>
          <textarea
            id="comment-text"
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write a comment..."
            required
            rows="3"
            value={commentText}
          />
          {commentError && (
            <p className="status-message status-message--error blog-error" role="alert">
              {commentError}
            </p>
          )}
          <Button type="submit" className="blog-submit-button" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>

        <div className="blog-comments">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="blog-comment">
                <div className="blog-comment-header">
                  <strong>{comment.author}</strong>
                  <span className="blog-post-meta">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="blog-post-meta">No comments yet. Be the first to join the conversation!</p>
          )}
        </div>
      </section>
    </article>
  )
}

export default PostDetail