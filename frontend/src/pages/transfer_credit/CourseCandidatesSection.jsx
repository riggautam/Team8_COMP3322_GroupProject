function CourseCandidatesSection({ matchingData }) {
  return (
    <section
      aria-labelledby="course-candidates-title"
      className="university-course-candidates"
    >
      <h3 id="course-candidates-title">Potential matching courses</h3>
      {!matchingData ? (
        <p className="course-match-empty">
          Potential course matches will appear here after you select Transfer.
        </p>
      ) : (
        <>
          {(matchingData.exchangeCourseCode ||
            matchingData.exchangeCourseName) && (
            <p className="course-match-source">
              Matching for{' '}
              <strong>
                {[matchingData.exchangeCourseCode, matchingData.exchangeCourseName]
                  .filter(Boolean)
                  .join(' — ')}
              </strong>
            </p>
          )}
          {matchingData.candidates.length ? (
            <ol className="course-match-list">
              {matchingData.candidates.map((candidate, index) => {
                const percentage = Math.min(
                  100,
                  Math.max(0, candidate.matchPercentage),
                )
                const titleId = `course-match-title-${index}`
                const rationaleId = `course-match-rationale-${index}`

                return (
                  <li
                    className="course-match-item"
                    key={`${candidate.courseCode}-${index}`}
                  >
                    <div className="course-match-heading">
                      <h4 id={titleId}>
                        {candidate.courseCode && `${candidate.courseCode} — `}
                        {candidate.courseName || 'Course suggestion'}
                      </h4>
                      <span className="course-match-percentage">
                        {percentage}% match
                      </span>
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
                      <span
                        className="course-match-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div aria-hidden="true" className="course-match-scale">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                    <p className="course-match-rationale" id={rationaleId}>
                      {candidate.matchRationale}
                    </p>
                    {candidate.courseUrl && (
                      <a
                        className="course-match-link"
                        href={candidate.courseUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Course details
                      </a>
                    )}
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="course-match-empty">
              No potential matching courses were returned.
            </p>
          )}
          {matchingData.candidates.length > 0 && (
            <p className="course-match-disclaimer">
              Match percentages are AI estimates, not confirmed equivalencies.
            </p>
          )}
        </>
      )}
    </section>
  )
}

export default CourseCandidatesSection
