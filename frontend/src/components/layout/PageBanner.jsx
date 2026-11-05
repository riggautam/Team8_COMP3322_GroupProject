import './PageBanner.css'

function PageBanner({ title, description }) {
  return (
    <header className="page-banner">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <svg className="page-banner-skyline" viewBox="0 0 200 60" aria-hidden="true">
        <path d="M0 60V38h14V24h10v14h10V12h12v26h10V30h14v8h10V18h12v20h12V28h14v10h12V22h10v38z" />
        <path className="page-banner-skyline-wave" d="M0 52q12-6 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0v8H0z" />
      </svg>
    </header>
  )
}

export default PageBanner
