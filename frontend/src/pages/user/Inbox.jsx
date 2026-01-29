import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Inbox() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/secure/inbox')
            .then(res => {
                setMessages(res.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div className="layout-container">
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                    ← Back to Dashboard
                </button>
            </div>

            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Secure Inbox</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No secure messages.
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {new Date(msg.date).toLocaleString()}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {msg.verified === 'From Bank' ? (
                                        <>
                                            <ShieldCheck size={16} color="var(--success)" />
                                            <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Verified: From Bank</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldAlert size={16} color="var(--danger)" />
                                            <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{msg.verified}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p style={{ fontSize: '1.1rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                                {msg.message}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
