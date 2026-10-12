import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const STATUSES = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [filter, setFilter] = useState('All candidates');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', notes: '' });

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'All candidates') params.set('status', filter);
      if (query.trim()) params.set('q', query.trim());
      const [result, allResult] = await Promise.all([
        request(`/api/applications?${params}`),
        request('/api/applications'),
      ]);
      setApplications(result.data);
      setAllApplications(allResult.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const totals = useMemo(() => STATUSES.reduce((counts, status) => {
    counts[status] = allApplications.filter((application) => application.status === status).length;
    return counts;
  }, {}), [allApplications]);

  async function addApplication(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await request('/api/applications', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', role: '', notes: '' });
      setShowForm(false);
      setNotice('Candidate added to your pipeline.');
      await loadApplications();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id, status) {
    setError('');
    try {
      await request(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setNotice('Candidate status updated.');
      await loadApplications();
    } catch (err) { setError(err.message); }
  }

  async function removeApplication(id) {
    if (!window.confirm('Remove this candidate from the pipeline?')) return;
    setError('');
    try {
      await request(`/api/applications/${id}`, { method: 'DELETE' });
      setNotice('Candidate removed.');
      await loadApplications();
    } catch (err) { setError(err.message); }
  }

  const filters = ['All candidates', ...STATUSES];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="TGHS home"><span className="brand-mark">t</span><span>TGHS<span className="brand-dot">.</span><small>PEOPLE & CULTURE</small></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><span className="nav-icon">▦</span> Hiring overview</button>
        <button className="nav-item" onClick={() => setFilter('All candidates')}><span className="nav-icon">♙</span> Candidates <span className="nav-count">{applications.length}</span></button>
        <div className="sidebar-rule" />
        <div className="workspace-label">PIPELINE</div>
        {STATUSES.slice(0, 5).map((status) => <button key={status} className={`nav-item ${filter === status ? 'sub-active' : ''}`} onClick={() => setFilter(status)}><span className={`status-dot ${status.toLowerCase()}`} />{status}<span className="nav-count">{totals[status] || 0}</span></button>)}
        <div className="sidebar-bottom"><div className="help-card"><div className="help-spark">✳</div><strong>Need a hand?</strong><span>Keep your hiring team moving together.</span><a href="mailto:people@tghs.example">Contact the team <span>↗</span></a></div><div className="profile"><div className="profile-avatar">AY</div><div><strong>Ayush</strong><span>Hiring team</span></div><button aria-label="Profile menu">···</button></div></div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Hiring overview</div><div className="top-actions"><span className="today-label">Your talent, at a glance</span><div className="top-avatar">AY</div></div></header>
        <section className="page-content">
          <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> TALENT ACQUISITION</div><h1>Hiring overview<span className="heading-period">.</span></h1><p className="intro">A thoughtful process makes great teams. Here’s where yours stands.</p></div><button className="primary-button" onClick={() => { setShowForm((value) => !value); setNotice(''); }}><span>＋</span> Add candidate</button></div>

          <div className="stats-grid">
            <div className="stat-card"><span className="stat-label">IN THE PIPELINE</span><div className="stat-value">{applications.length.toString().padStart(2, '0')}<span className="stat-symbol">↗</span></div><span className="stat-foot">Across all open roles</span></div>
            <div className="stat-card"><span className="stat-label">IN REVIEW</span><div className="stat-value">{((totals.Screening || 0) + (totals.Interview || 0)).toString().padStart(2, '0')}<span className="stat-symbol green">◎</span></div><span className="stat-foot">Screening & interviews</span></div>
            <div className="stat-card"><span className="stat-label">OFFERS EXTENDED</span><div className="stat-value">{(totals.Offer || 0).toString().padStart(2, '0')}<span className="stat-symbol gold">✳</span></div><span className="stat-foot">Ready for the next chapter</span></div>
            <div className="stat-card stat-highlight"><span className="stat-label">HIRED</span><div className="stat-value">{(totals.Hired || 0).toString().padStart(2, '0')}<span className="stat-symbol">✦</span></div><span className="stat-foot">New teammates welcomed</span></div>
          </div>

          <section className="pipeline-section">
            <div className="section-heading"><div><div className="eyebrow">YOUR PEOPLE</div><h2>Candidate pipeline</h2><p>Every conversation is a chance to find the right fit.</p></div><button className="text-button" onClick={loadApplications}>↻ <span>Refresh</span></button></div>
            <div className="toolbar"><label className="search-box"><span>⌕</span><input aria-label="Search candidates" placeholder="Search candidates or roles…" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label><div className="filter-pills" aria-label="Filter by status">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'selected' : ''}>{item === 'All candidates' ? 'All' : item}</button>)}</div></div>

            {error && <div className="feedback error" role="alert"><span>!</span><div><strong>We couldn’t complete that.</strong><p>{error}{error.toLowerCase().includes('fetch') ? ' Check that the API is running and MongoDB is connected.' : ''}</p></div><button onClick={loadApplications}>Try again</button></div>}
            {notice && !error && <div className="feedback success" role="status"><span>✓</span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}

            <div className="table-wrap"><table><thead><tr><th>CANDIDATE</th><th>ROLE</th><th>APPLIED</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>
              {loading ? <tr><td className="table-message" colSpan="5"><span className="spinner" /> Loading your candidates…</td></tr> : applications.length === 0 ? <tr><td className="table-message empty-state" colSpan="5"><span className="empty-icon">✳</span><strong>{query || filter !== 'All candidates' ? 'No candidates match this view' : 'Your pipeline starts here'}</strong><span>{query || filter !== 'All candidates' ? 'Try another search or status filter.' : 'Add your first candidate to get the conversation started.'}</span>{!query && filter === 'All candidates' && <button className="small-add" onClick={() => setShowForm(true)}>＋ Add a candidate</button>}</td></tr> : applications.map((candidate) => <tr key={candidate._id}><td><div className="candidate-cell"><div className="candidate-avatar" style={{ '--avatar-hue': (candidate.name.charCodeAt(0) * 19) % 360 }}>{initials(candidate.name)}</div><div><strong>{candidate.name}</strong><span>{candidate.email}</span></div></div></td><td><span className="role-name">{candidate.role}</span></td><td><span className="date-value">{new Date(candidate.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></td><td><select className={`status-select ${candidate.status.toLowerCase()}`} aria-label={`Status for ${candidate.name}`} value={candidate.status} onChange={(event) => updateStatus(candidate._id, event.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td><button className="more-button" aria-label={`Remove ${candidate.name}`} onClick={() => removeApplication(candidate._id)}>···</button></td></tr>)}
            </tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{applications.length}</strong> {applications.length === 1 ? 'candidate' : 'candidates'}</span><span>Made with care <span className="footer-heart">♥</span> by TGHS</span></div>
          </section>
        </section>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="candidate-modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="modal-heading"><div><div className="eyebrow">A NEW CONVERSATION</div><h2 id="form-title">Add a candidate</h2><p>Start with the details you have. You can update them later.</p></div><button className="close-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><form onSubmit={addApplication}><label>Full name<input required maxLength="100" autoFocus placeholder="e.g. Samira Patel" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email address<input required type="email" maxLength="254" placeholder="samira@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Role they’re applying for<input required maxLength="120" placeholder="e.g. Product Designer" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label><label>Notes <span className="optional">OPTIONAL</span><textarea maxLength="2000" rows="3" placeholder="A few notes for your hiring team…" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Adding…' : 'Add to pipeline'}</button></div></form></section></div>}
    </div>
  );
}
