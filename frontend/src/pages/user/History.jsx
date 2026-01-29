import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function History() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        api.get('/bank/history')
            .then(res => setTransactions(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="layout-container">
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                    ← Back to Dashboard
                </button>
            </div>

            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Transaction History</h2>

            <div className="card" style={{ padding: '0' }}>
                {transactions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Amount</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {tx.type === 'DEBIT' ? (
                                            <ArrowUpRight size={16} color="var(--danger)" />
                                        ) : (
                                            <ArrowDownLeft size={16} color="var(--success)" />
                                        )}
                                        {tx.type}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {tx.type === 'DEBIT' ? '-' : '+'}${tx.amount}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            backgroundColor: tx.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' :
                                                tx.status === 'INITIATED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: tx.status === 'SUCCESS' ? 'var(--success)' :
                                                tx.status === 'INITIATED' ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
