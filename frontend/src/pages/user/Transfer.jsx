import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Send, User, DollarSign, Key } from 'lucide-react';

export default function Transfer() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ to: '', amount: '', txnPin: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await api.post('/bank/transfer', {
                to: form.to,
                amount: Number(form.amount),
                txnPin: form.txnPin
            });
            setMessage(res.data); // "Transaction successful" or "Initiated..."
            if (res.data.includes("successful") || res.data.includes("initiated")) {
                setForm({ to: '', amount: '', txnPin: '' });
            }
        } catch (err) {
            setError(err.response?.data || "Transfer failed");
        }
    };

    return (
        <div className="layout-container">
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                    ← Back to Dashboard
                </button>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="text-gradient" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Transfer Money</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Recipient User ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="glass-input"
                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '0.5rem' }}
                                value={form.to}
                                onChange={e => setForm({ ...form, to: e.target.value })}
                                placeholder="Enter recipient ID"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="number"
                                className="glass-input"
                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '0.5rem' }}
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="0.00"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Transaction PIN</label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="password"
                                maxLength="4"
                                className="glass-input"
                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '0.5rem' }}
                                value={form.txnPin}
                                onChange={e => setForm({ ...form, txnPin: e.target.value })}
                                placeholder="****"
                                required
                            />
                        </div>
                    </div>

                    {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
                    {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem', marginBottom: '1rem' }}>{message}</div>}

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Send Money
                    </button>
                </form>
            </div>
        </div>
    );
}
