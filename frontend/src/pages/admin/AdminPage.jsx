import { useEffect, useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import PageBanner from '../../components/layout/PageBanner.jsx'
import { REPORT_REASONS } from '../../components/moderation/ReportButton.jsx'
import SectionHeading from '../../components/ui/SectionHeading.jsx'
import requestJson from '../../hooks/requestJson.js'
import './AdminPage.css'

const REASON_LABELS = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.value, reason.label]))
const TYPE_LABELS = { post: 'Blog post', comment: 'Comment' }
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

// What the admin sees of one reported or hidden item. item is null if it was deleted already.
function ItemPreview({ targetType, item }) {
  if (!item) {
    return <p className="admin-empty">This {TYPE_LABELS[targetType].toLowerCase()} was already deleted.</p>
  }
  return (
    <div className="admin-preview">
      {item.title && <h3>{item.title}</h3>}
      <p className="admin-excerpt">{item.excerpt}</p>
      <p className="admin-meta">
        By {item.author} · {dateFormat.format(new Date(item.created_at))}
        {targetType === 'comment' && ` · on post #${item.post_id}`}
        {item.hidden && <span className="admin-badge admin-badge--hidden">Hidden</span>}
      </p>
    </div>
  )
}

function AdminPage() {
  const [reports, setReports] = useState([])
  const [hiddenItems, setHiddenItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyKey, setBusyKey] = useState(null) // the item whose button is working, e.g. "post-4"

  // Loads both lists at the same time.
  async function loadAll() {
    const [reportResult, hiddenResult] = await Promise.all([
      requestJson('/api/admin/reports'),
      requestJson('/api/admin/hidden'),
    ])
    setError(reportResult.error || hiddenResult.error)
    if (!reportResult.error) setReports(reportResult.data.data)
    if (!hiddenResult.error) setHiddenItems(hiddenResult.data.data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  // keep / restore: show it again. hide: hide it. delete: remove for good.
  // close: the item is already gone, so just close its reports (the server does that on DELETE).
  // One action can change both lists, so both are reloaded afterwards.
  async function moderate(targetType, targetId, action) {
    const name = TYPE_LABELS[targetType].toLowerCase()
    if (action === 'delete' && !window.confirm(`Delete this ${name} for good? This can't be undone.`)) {
      return
    }

    setBusyKey(`${targetType}-${targetId}`)
    const url = `/api/admin/content/${targetType}/${targetId}`
    const result =
      action === 'delete' || action === 'close'
        ? await requestJson(url, { method: 'DELETE' })
        : await requestJson(url, { method: 'PATCH', body: { hidden: action === 'hide' } })

    // A 404 when deleting means it was already gone; the server still closed its reports.
    setError(result.error && result.status !== 404 ? result.error : null)
    await loadAll()
    setBusyKey(null)
  }

  return (
    <div className="admin-page">
      <PageBanner
        title="Moderation"
        description="Review reported posts and comments, and anything that is hidden."
      />

      {error && (
        <p className="status-message status-message--error admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="admin-card" aria-labelledby="admin-reports-title">
        <SectionHeading id="admin-reports-title" icon="check">
          Open reports ({reports.length})
        </SectionHeading>
        <p className="admin-empty">
          Three reports from different people hide an item automatically. Keep shows it again;
          Hide or Delete agrees with the reports.
        </p>

        {isLoading ? (
          <p role="status">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="admin-empty">No open reports.</p>
        ) : (
          <ul className="admin-list">
            {reports.map((report) => {
              const isBusy = busyKey === `${report.targetType}-${report.targetId}`
              return (
                <li key={`${report.targetType}-${report.targetId}`} className="admin-item">
                  <div className="admin-item-head">
                    <span className="admin-badge">{TYPE_LABELS[report.targetType]}</span>
                    <strong>
                      {report.reportCount} {report.reportCount === 1 ? 'report' : 'reports'}
                    </strong>
                    <span className="admin-meta">
                      {report.reasons.map((reason) => REASON_LABELS[reason] ?? reason).join(' · ')}
                    </span>
                  </div>

                  <ItemPreview targetType={report.targetType} item={report.item} />

                  {report.details.length > 0 && (
                    <ul className="admin-details">
                      {report.details.map((detail, index) => (
                        <li key={index}>“{detail}”</li>
                      ))}
                    </ul>
                  )}

                  <div className="admin-actions">
                    {report.item ? (
                      <>
                        <Button
                          size="small"
                          disabled={isBusy}
                          onClick={() => moderate(report.targetType, report.targetId, 'keep')}
                        >
                          Keep
                        </Button>
                        {!report.item.hidden && (
                          <Button
                            size="small"
                            className="admin-button--secondary"
                            disabled={isBusy}
                            onClick={() => moderate(report.targetType, report.targetId, 'hide')}
                          >
                            Hide
                          </Button>
                        )}
                        <Button
                          size="small"
                          className="admin-button--danger"
                          disabled={isBusy}
                          onClick={() => moderate(report.targetType, report.targetId, 'delete')}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        disabled={isBusy}
                        onClick={() => moderate(report.targetType, report.targetId, 'close')}
                      >
                        Close reports
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="admin-card" aria-labelledby="admin-hidden-title">
        <SectionHeading id="admin-hidden-title" icon="pen">
          Hidden content ({hiddenItems.length})
        </SectionHeading>

        {isLoading ? (
          <p role="status">Loading…</p>
        ) : hiddenItems.length === 0 ? (
          <p className="admin-empty">Nothing is hidden.</p>
        ) : (
          <ul className="admin-list">
            {hiddenItems.map((hidden) => {
              const isBusy = busyKey === `${hidden.targetType}-${hidden.targetId}`
              return (
                <li key={`${hidden.targetType}-${hidden.targetId}`} className="admin-item">
                  <div className="admin-item-head">
                    <span className="admin-badge">{TYPE_LABELS[hidden.targetType]}</span>
                  </div>
                  <ItemPreview targetType={hidden.targetType} item={hidden.item} />
                  <div className="admin-actions">
                    <Button
                      size="small"
                      disabled={isBusy}
                      onClick={() => moderate(hidden.targetType, hidden.targetId, 'keep')}
                    >
                      Restore
                    </Button>
                    <Button
                      size="small"
                      className="admin-button--danger"
                      disabled={isBusy}
                      onClick={() => moderate(hidden.targetType, hidden.targetId, 'delete')}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default AdminPage
