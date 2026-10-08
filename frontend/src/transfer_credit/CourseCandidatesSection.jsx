import TextField from '../global/TextField.jsx'

function CourseCandidatesSection({ value }) {
  return (
    <section
      aria-labelledby="course-candidates-title"
      className="university-course-candidates"
    >
      <h3 id="course-candidates-title">Potential matching courses</h3>
      <TextField
        id="course-candidates-text"
        label="AI suggestions (JSON)"
        placeholder="Potential course matches will appear here after you select Transfer."
        readOnly
        rows={12}
        value={value}
      />
    </section>
  )
}

export default CourseCandidatesSection
