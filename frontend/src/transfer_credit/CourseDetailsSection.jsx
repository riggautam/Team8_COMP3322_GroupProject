import TextField from '../global/TextField.jsx'

function CourseDetailsSection({ id, value, onChange, invalid = false }) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="university-course-details"
    >
      <h3 id={`${id}-title`}>Course details</h3>
      <TextField
        id={`${id}-text`}
        invalid={invalid}
        label="Review and edit fetched course information"
        onChange={onChange}
        placeholder="Fetched course information will appear here."
        value={value}
      />
    </section>
  )
}

export default CourseDetailsSection
