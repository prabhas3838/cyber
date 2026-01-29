import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Check, X, AlertTriangle, Bell, UserX, Unlock } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [pending, setPending] = useState([]);
    const [logs, setLogs] = useState([]);
    const [msgUserId, setMsgUserId] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [freezeUserId, setFreezeUserId] = useState('');

    const fetchData = () => {
        api.get('/admin/pending-transactions').then(res => setPending(res.data)).catch(console.error);
        api.get('/admin/audit-logs').then(res => setLogs(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/approve-transaction/${id}`);
            fetchData();
            alert('Transaction Approved');
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`/admin/reject-transaction/${id}`);
            fetchData();
            alert('Transaction Rejected');
        } catch (err) {
            alert('Failed to reject');
        }
    };

    const handleFreeze = async (action) => {
        const targetId = freezeUserId.trim();
        try {
            if (action === 'freeze') await api.post(`/admin/freeze-account/${targetId}`);
            else await api.post(`/admin/unfreeze-account/${targetId}`);
            alert(`Account ${action}d`);
            setFreezeUserId('');
        } catch (err) {
            alert(`Failed to ${action}`);
        }
    }

    const handleNotify = async () => {
        try {
            await api.post(`/admin/notify/${msgUserId}`, { message: msgContent });
            alert('Notification Sent');
            setMsgUserId('');
            setMsgContent('');
        } catch (err) {
            alert('Failed to send');
        }
    }

    return (
        <div className="layout-container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient">Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Security Level: HIGH</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Pending Transactions */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle color="var(--warning)" /> Pending Approvals
                    </h2>
                    {pending.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending transactions</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pending.map(tx => (
                                <div key={tx._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>${tx.amount}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From: {tx.from}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleApprove(tx._id)} className="btn-primary" style={{ padding: '0.5rem', flex: 1, backgroundColor: 'var(--success)' }}>
                                            <Check size={16} /> Approve
                                        </button>
                                        <button onClick={() => handleReject(tx._id)} className="btn-secondary" style={{ padding: '0.5rem', flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Management */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield color="var(--primary)" /> User Controls
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Freeze/Unfreeze Account</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="glass-input"
                                placeholder="User ID"
                                value={freezeUserId}
                                onChange={e => setFreezeUserId(e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem' }}
                            />
                            <button onClick={() => handleFreeze('freeze')} className="btn-secondary" title="Freeze"><UserX size={16} /></button>
                            <button onClick={() => handleFreeze('unfreeze')} className="btn-secondary" title="Unfreeze"><Unlock size={16} /></button>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Send Secure Notification</h3>
                        <input
                            className="glass-input"
                            placeholder="User ID"
                            value={msgUserId}
                            onChange={e => setMsgUserId(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '0.5rem' }}
                        />
                        <textarea
                            className="glass-input"
                            placeholder="Message content..."
                            value={msgContent}
                            onChange={e => setMsgContent(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '0.5rem', minHeight: '80px' }}
                        />
                        <button onClick={handleNotify} className="btn-primary" style={{ width: '100%' }}>
                            <Bell size={16} style={{ marginRight: '0.5rem' }} /> Send
                        </button>
                    </div>
                </div>

            </div>

            {/* Audit Logs */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Audit Logs</h2>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
