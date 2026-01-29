import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Wallet, Send, History as HistoryIcon, Mail } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        api.get('/bank/balance')
            .then(res => setBalance(res.data.balance))
            .catch(err => console.error("Failed to fetch balance", err));
    }, []);

    return (
        <div className="layout-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Welcome, {user?.username || 'User'}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure Banking Dashboard</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '2rem', border: '1px solid var(--glass-border)' }}>
                    User ID: <span style={{ fontFamily: 'monospace' }}>{user?.id}</span>
                </div>
            </header>

            {/* Balance Card */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Wallet size={32} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '500' }}>Available Balance</h2>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: '700' }}>
                    ${balance?.toLocaleString()}
                </div>
            </div>

            {/* Quick Actions */}
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

                <Link to="/transfer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                            <Send size={24} color="var(--primary)" />
                        </div>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Transfer Money</span>
                    </div>
                </Link>

                <Link to="/history" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                            <HistoryIcon size={24} color="var(--success)" />
                        </div>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Transaction History</span>
                    </div>
                </Link>

                <Link to="/inbox" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%' }}>
                            <Mail size={24} color="var(--accent)" />
                        </div>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Secure Inbox</span>
                    </div>
                </Link>

            </div>
        </div>
    );
}
