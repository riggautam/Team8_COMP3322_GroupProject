import { useState } from 'react'
import { Link } from 'react-router'
import Button from '../../components/forms/Button.jsx'

const DEFAULT_CREDITS = 6 // a standard HKU course

// One suggested course, with its own credits box and Send to plan button.
function CandidateItem({ candidate, index, pair, canSave, isInPlan, onSave }) {
  const [credits, setCredits] = useState(DEFAULT_CREDITS)
  const [isSaving, setIsSaving] = useState(false)
  const percentage = Math.min(100, Math.max(0, candidate.matchPercentage))
  const titleId = `course-match-title-${index}`
  const rationaleId = `course-match-rationale-${index}`

  async function handleSave() {
    setIsSaving(true)
    await onSave(pair, credits)
    setIsSaving(false)
  }

  return (
    <li className="course-match-item">
      <div className="course-match-heading">
        <h3 id={titleId}>
          {candidate.courseCode && `${candidate.courseCode} — `}
          {candidate.courseName || 'Course suggestion'}
        </h3>
        <span className="course-match-percentage">{percentage}% match</span>
      </div>
      <div
        aria-labelledby={titleId}
        aria-describedby={rationaleId}
        aria-valuemax="100"
        aria-valuemin="0"
        aria-valuenow={percentage}
        className="course-match-track"
        role="progressbar"
      >
        <span className="course-match-bar" style={{ width: `${percentage}%` }} />
      </div>
      <p className="course-match-rationale" id={rationaleId}>
        {candidate.matchRationale}
      </p>
      {candidate.courseUrl && (
        <a className="course-match-link" href={candidate.courseUrl} rel="noreferrer" target="_blank">
          Course page (suggested by AI)
        </a>
      )}

      <div className="course-match-save">
        {!pair ? (
          <p className="course-match-note">No course code was suggested, so this can't be saved.</p>
        ) : isInPlan ? (
          <p className="course-match-note course-match-note--saved">In your plan ✓</p>
        ) : !canSave ? (
          <p className="course-match-note">
            <Link to="/login">Log in</Link> to save this to your study plan.
          </p>
        ) : (
          <>
            <label className="course-match-credits">
              Credits
              <input
                max={30}
                min={0.5}
                onChange={(event) => setCredits(event.target.value)}
                step={0.5}
                type="number"
                value={credits}
              />
            </label>
            <Button size="small" disabled={isSaving} onClick={handleSave}>
              {isSaving ? 'Saving…' : 'Send to plan'}
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

function CourseCandidatesSection({ matchingData, getPair, canSave, isInPlan, onSave, saveError }) {
  const { candidates } = matchingData

  return (
    <>
      <p className="course-match-source">
        Matches for{' '}
        <strong>
          {[matchingData.sourceCourseCode, matchingData.sourceCourseName].filter(Boolean).join(' — ')}
        </strong>
      </p>

      {candidates.length ? (
        <ol className="course-match-list">
          {candidates.map((candidate, index) => {
            const pair = getPair(candidate)
            return (
              <CandidateItem
                key={`${candidate.courseCode}-${index}`}
                candidate={candidate}
                index={index}
                pair={pair}
                canSave={canSave}
                isInPlan={pair ? isInPlan(pair) : false}
                onSave={onSave}
              />
            )
          })}
        </ol>
      ) : (
        <p className="course-match-empty">No matching courses were suggested.</p>
      )}

      {saveError && (
        <p className="status-message status-message--error course-match-error" role="alert">
          {saveError}
        </p>
      )}
      {candidates.length > 0 && (
        <p className="course-match-disclaimer">
          Matches, percentages and links are AI suggestions, not confirmed equivalencies.
          Check them with your home university.
        </p>
      )}
    </>
  )
}

export default CourseCandidatesSection