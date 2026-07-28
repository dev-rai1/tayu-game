import { useEffect, useState } from 'react'
import { adminAnalyticsData } from '../services/adminAnalytics.js'

export default function SiteTrafficSummary() {
  const [traffic, setTraffic] = useState(null)

  useEffect(() => {
    adminAnalyticsData()
      .then((data) => setTraffic(data.siteTraffic))
      .catch(() => setTraffic(null))
  }, [])

  if (!traffic) return null
  return (
    <section className="mx-auto mt-4 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:px-6" aria-label="Website traffic">
      <div className="rounded-2xl border-2 border-teal/40 bg-navy/95 p-4 shadow-xl">
        <div className="text-3xl font-extrabold text-teal">{traffic.totalPageViews.toLocaleString()}</div>
        <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/65">Total page views</div>
        <div className="mt-1 text-xs text-white/45">Every tracked page opened</div>
      </div>
      <div className="rounded-2xl border-2 border-teal/40 bg-navy/95 p-4 shadow-xl">
        <div className="text-3xl font-extrabold text-teal">{traffic.uniqueVisitors.toLocaleString()}</div>
        <div className="mt-1 text-xs font-extrabold uppercase tracking-wide text-white/65">Unique visitors</div>
        <div className="mt-1 text-xs text-white/45">Anonymous browsers since tracking began</div>
      </div>
    </section>
  )
}
