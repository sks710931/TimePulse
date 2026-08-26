import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/authSlice'
import { increment, decrement, reset } from '../store/slices/counterSlice'

interface WeatherItem {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string
}

interface UserItem {
  id: string
  email: string
  fullName: string
  createdAtUtc: string
  roles: string[]
}

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const counter = useAppSelector((state) => state.counter.value)

  const [forecasts, setForecasts] = useState<WeatherItem[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const isAdmin = user?.roles.includes('Admin')

  const fetchWeather = async () => {
    setForecastLoading(true)
    setForecastError(null)
    try {
      const res = await fetch('/weatherforecast', { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      setForecasts(data)
    } catch (err: unknown) {
      setForecastError(err instanceof Error ? err.message : 'Error loading forecast')
    } finally {
      setForecastLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!isAdmin) return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`)
      }
      const data = await res.json()
      setUsers(data)
    } catch (err: unknown) {
      setUsersError(err instanceof Error ? err.message : 'Error loading users')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.brand}>
          <span style={styles.logo}>⚡ TimePulse</span>
          <span style={styles.tag}>Dashboard</span>
        </div>

        <div style={styles.navUser}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userEmail}>{user?.email}</span>
          </div>

          <div style={styles.roleBadges}>
            {user?.roles.map((r) => (
              <span key={r} style={styles.roleBadge}>
                {r}
              </span>
            ))}
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Welcome Card */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Welcome back, {user?.name}!</h2>
          <p style={styles.cardText}>
            You are securely authenticated using <strong>JWT in httpOnly cookies</strong> with 1-minute access token lifetime and automatic refresh token rotation.
          </p>
        </section>

        {/* Admin Section */}
        {isAdmin && (
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>👥 User Management (Admin Only)</h3>
              <button onClick={fetchUsers} style={styles.refreshBtn} disabled={usersLoading}>
                {usersLoading ? 'Refreshing...' : 'Refresh Users'}
              </button>
            </div>

            {usersError && <p style={styles.errorText}>{usersError}</p>}

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Roles</th>
                    <th style={styles.th}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>{u.fullName}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        {u.roles.map((r) => (
                          <span key={r} style={styles.miniRoleBadge}>
                            {r}
                          </span>
                        ))}
                      </td>
                      <td style={styles.td}>{new Date(u.createdAtUtc).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Protected API Test Card */}
        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔒 Protected API Test: Weather Forecast</h3>
            <button onClick={fetchWeather} style={styles.refreshBtn} disabled={forecastLoading}>
              {forecastLoading ? 'Loading...' : 'Fetch Forecast'}
            </button>
          </div>

          <p style={styles.hintText}>
            Endpoint <code>/weatherforecast</code> requires <code>[Authorize]</code>. Requests succeed via cookie credentials.
          </p>

          {forecastError && <p style={styles.errorText}>{forecastError}</p>}

          <div style={styles.forecastGrid}>
            {forecasts.map((f, i) => (
              <div key={i} style={styles.forecastCard}>
                <div style={styles.forecastDate}>{f.date}</div>
                <div style={styles.forecastTemp}>{f.temperatureC}°C ({f.temperatureF}°F)</div>
                <div style={styles.forecastSummary}>{f.summary}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Redux State Demo */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>🎛️ Redux State Demo (Counter)</h3>
          <div style={styles.counterRow}>
            <button onClick={() => dispatch(decrement())} style={styles.counterBtn}>-</button>
            <span style={styles.counterVal}>{counter}</span>
            <button onClick={() => dispatch(increment())} style={styles.counterBtn}>+</button>
            <button onClick={() => dispatch(reset())} style={styles.resetBtn}>Reset</button>
          </div>
        </section>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    textAlign: 'left',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-h)',
  },
  tag: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '12px',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  navUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-h)',
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text)',
  },
  roleBadges: {
    display: 'flex',
    gap: '6px',
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: 600,
    background: 'var(--accent)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  miniRoleBadge: {
    fontSize: '11px',
    fontWeight: 600,
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    padding: '2px 6px',
    borderRadius: '4px',
    marginRight: '4px',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-h)',
    cursor: 'pointer',
    fontWeight: 500,
  },
  main: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
  },
  cardText: {
    color: 'var(--text)',
    fontSize: '15px',
    lineHeight: '150%',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    color: 'var(--text-h)',
  },
  refreshBtn: {
    padding: '6px 14px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  hintText: {
    fontSize: '13px',
    color: 'var(--text)',
    marginBottom: '16px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '8px 0',
  },
  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  forecastCard: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--social-bg)',
  },
  forecastDate: {
    fontSize: '12px',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  forecastTemp: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-h)',
    marginBottom: '4px',
  },
  forecastSummary: {
    fontSize: '13px',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-h)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '10px 12px',
    color: 'var(--text)',
  },
  counterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '14px',
  },
  counterBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
  },
  counterVal: {
    fontSize: '20px',
    fontWeight: 700,
    minWidth: '40px',
    textAlign: 'center',
  },
  resetBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
  },
}
