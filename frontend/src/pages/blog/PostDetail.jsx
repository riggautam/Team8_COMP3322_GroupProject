import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Button from '../../components/forms/Button.jsx'
import ReportButton from '../../components/moderation/ReportButton.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'
import VoteControl from './VoteControl.jsx'

function PostDetail({ post, onBack, onEdit, onDeleted, onHidden, onVoted }) {
  const { user } = useAuth()
  const isOwner = user?.id === post.author_id
  // The server checks the role again on every request; this only decides which buttons to show.
  const isAdmin = user?.role === 'admin'
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState(null)
  const [commentNotice, setCommentNotice] = useState(null)
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

  // The comment's author or an admin can delete it (the server checks this too).
  async function handleDeleteComment(comment) {
    if (!window.confirm('Delete this comment?')) return

    setCommentError(null)
    const result = await requestJson(`/api/blog-posts/${post.id}/comments/${comment.id}`, {
      method: 'DELETE',
    })
    if (result.error) {
      setCommentError(result.error)
      return
    }
    setComments(comments.filter((item) => item.id !== comment.id))
  }

  // A report hid this comment (it was the third one), so take it off the screen.
  function handleCommentHidden(comment) {
    setComments(comments.filter((item) => item.id !== comment.id))
    setCommentNotice('Thanks. That comment is now hidden until an admin reviews it.')
  }

  return (
    <article className="blog-card">
      <div className="blog-post-toolbar">
        <Button className="blog-secondary-button" onClick={onBack}>
          ← Back to all posts
        </Button>
        {(isOwner || isAdmin) && (
          <div className="blog-post-actions">
            {isOwner && (
              <Button className="blog-secondary-button" onClick={onEdit}>
                Edit
              </Button>
            )}
            <Button className="blog-danger-button" onClick={handleDelete}>
              {isOwner ? 'Delete' : 'Delete (admin)'}
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

      <div className="blog-post-bottom">
        <VoteControl post={post} onVoted={onVoted} />
        {!isOwner && <ReportButton targetType="post" targetId={post.id} onHidden={onHidden} />}
      </div>

      <hr className="blog-divider" />

      <section aria-label="Comments section">
        <h3>Comments ({comments.length})</h3>

        <form className="blog-comment-form blog-field" onSubmit={handleAddComment}>
          <label htmlFor="comment-text">Add a comment</label>
          <textarea
            id="comment-text"
            maxLength={5000}
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

        {commentNotice && (
          <p className="report-message blog-comment-notice" role="status">
            {commentNotice}
          </p>
        )}

        <div className="blog-comments">
          {comments.length > 0 ? (
            comments.map((comment) => {
              // Anonymous comments have no author, so only an admin can delete them.
              const canDelete = isAdmin || (user && user.id === comment.author_id)
              return (
                <div key={comment.id} className="blog-comment">
                  <div className="blog-comment-header">
                    <strong>{comment.author}</strong>
                    <span className="blog-post-meta">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                  <div className="blog-comment-actions">
                    {canDelete ? (
                      <button
                        type="button"
                        className="report-link"
                        onClick={() => handleDeleteComment(comment)}
                      >
                        {isAdmin && user.id !== comment.author_id ? 'Delete (admin)' : 'Delete'}
                      </button>
                    ) : (
                      <ReportButton
                        targetType="comment"
                        targetId={comment.id}
                        onHidden={() => handleCommentHidden(comment)}
                      />
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="blog-post-meta">No comments yet. Be the first to join the conversation!</p>
          )}
        </div>
      </section>
    </article>
  )
}

export default PostDetail
