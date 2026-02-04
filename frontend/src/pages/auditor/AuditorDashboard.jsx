import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, List, CheckCircle, Search } from 'lucide-react';

export default function AuditorDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [verifyId, setVerifyId] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = () => {
        api.get('/admin/audit-logs').then(res => setLogs(res.data)).catch(console.error);
    };

    const fetchTransactions = () => {
        api.get('/admin/all-transactions').then(res => setTransactions(res.data)).catch(console.error);
    };

    const handleVerify = async () => {
        try {
            const res = await api.get(`/admin/transaction/${verifyId}`);
            setVerifyResult(res.data);
        } catch (err) {
            console.error("Verification failed:", err);
            const errorMessage = err.response?.data || err.message || 'Transaction not found or access denied';
            setVerifyResult({ error: errorMessage });
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab]);

    return (
        <div className="layout-container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient">Auditor Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Role: {user?.role}</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
                >
                    <Shield size={16} style={{ marginRight: '0.5rem' }} /> Audit Logs
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}
                >
                    <List size={16} style={{ marginRight: '0.5rem' }} /> All Transactions
                </button>
                <button
                    onClick={() => setActiveTab('verify')}
                    className={activeTab === 'verify' ? 'btn-primary' : 'btn-secondary'}
                >
                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> Verify Transaction
                </button>
            </div>

            {activeTab === 'logs' && (
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Audit Logs</h2>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.5rem' }}>Action</th>
                                    <th style={{ padding: '0.5rem' }}>User</th>
                                    <th style={{ padding: '0.5rem' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.5rem' }}>{log.action}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.userId}</td>
                                        <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Global Transaction History</h2>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.5rem' }}>TX ID</th>
                                    <th style={{ padding: '0.5rem' }}>From</th>
                                    <th style={{ padding: '0.5rem' }}>To</th>
                                    <th style={{ padding: '0.5rem' }}>Amount</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{tx._id}</td>
                                        <td style={{ padding: '0.5rem' }}>{tx.from}</td>
                                        <td style={{ padding: '0.5rem' }}>{tx.to}</td>
                                        <td style={{ padding: '0.5rem' }}>${tx.amount}</td>
                                        <td style={{ padding: '0.5rem' }}>{tx.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'verify' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Transaction Integrity Check</h2>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                        Cryptographically verify any transaction using its unique ID.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input
                            className="glass-input"
                            placeholder="Paste Transaction ID"
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem' }}
                            value={verifyId}
                            onChange={(e) => setVerifyId(e.target.value)}
                        />
                        <button onClick={handleVerify} className="btn-primary">
                            <Search size={18} /> Verify
                        </button>
                    </div>

                    {verifyResult && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: verifyResult.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${verifyResult.error ? 'var(--danger)' : 'var(--success)'}`
                        }}>
                            {verifyResult.error ? (
                                <p style={{ color: 'var(--danger)' }}>{verifyResult.error}</p>
                            ) : (
                                <div>
                                    <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={20} /> Integrity: {verifyResult.integrity}
                                    </h3>

                                    {verifyResult.diagnostics && (
                                        <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Field Diagnostics</h4>
                                            <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Encrypted Data:</span>
                                                    <span style={{ color: verifyResult.diagnostics.encryptedDataPresent ? 'var(--success)' : 'var(--danger)' }}>
                                                        {verifyResult.diagnostics.encryptedDataPresent ? 'Present' : 'Missing'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>AES Key:</span>
                                                    <span style={{ color: verifyResult.diagnostics.encryptedAESKeyPresent ? 'var(--success)' : 'var(--danger)' }}>
                                                        {verifyResult.diagnostics.encryptedAESKeyPresent ? 'Present' : 'Missing'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Signature:</span>
                                                    <span style={{ color: verifyResult.diagnostics.signaturePresent ? 'var(--success)' : 'var(--danger)' }}>
                                                        {verifyResult.diagnostics.signaturePresent ? 'Present' : 'Missing'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '0.25rem', overflowX: 'auto' }}>
                                        {JSON.stringify(verifyResult.decryptedTransaction, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
