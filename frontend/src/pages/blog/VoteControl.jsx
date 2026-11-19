import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../components/forms/Button.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'

// ▲ score ▼ for one post. Clicking your current vote again removes it.
function VoteControl({ post, onVoted }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  // direction is 1 for ▲ or -1 for ▼.
  async function vote(direction) {
    // Voting needs an account, so logged-out visitors go to the login page.
    if (!user) {
      navigate('/login')
      return
    }

    // Same button as your current vote: remove it (0). Otherwise set the new vote.
    const value = post.my_vote === direction ? 0 : direction

    setIsSaving(true)
    setError(null)
    const result = await requestJson(`/api/blog-posts/${post.id}/vote`, {
      method: 'PUT',
      body: { value },
    })
    setIsSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }
    // The server sends back { score, my_vote }. The parent updates its copy of the post.
    onVoted(post.id, result.data)
  }

  return (
    <div className="blog-vote" role="group" aria-label={`Votes for ${post.title}`}>
      <Button
        variant="custom"
        type="button"
        className={`blog-vote-button${post.my_vote === 1 ? ' is-active' : ''}`}
        aria-label="Upvote"
        aria-pressed={post.my_vote === 1}
        disabled={isSaving}
        onClick={() => vote(1)}
      >
        ▲
      </Button>
      <span className="blog-vote-score">{post.score}</span>
      <Button
        variant="custom"
        type="button"
        className={`blog-vote-button blog-vote-button--down${post.my_vote === -1 ? ' is-active' : ''}`}
        aria-label="Downvote"
        aria-pressed={post.my_vote === -1}
        disabled={isSaving}
        onClick={() => vote(-1)}
      >
        ▼
      </Button>
      {error && (
        <span className="status-message status-message--error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default VoteControl