import PageBanner from '../../components/layout/PageBanner.jsx'
import './InfoPage.css'

// Shared layout for the Privacy, Terms and Credits pages: a banner, then one white card
// with a heading and paragraphs for each section.
function InfoPage({ title, description, updated, sections }) {
  return (
    <div className="info-page">
      <PageBanner title={title} description={description} />
      <article className="info-card">
        {updated && <p className="info-updated">Last updated: {updated}</p>}
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  )
}

export default InfoPage
