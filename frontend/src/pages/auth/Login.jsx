import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login() {
    const { login, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Creds, 2: OTP
    const [form, setForm] = useState({ username: '', password: '', otp: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (step === 1) {
                const res = await login(form.username, form.password);
                if (res === 'OTP Sent') {
                    setStep(2);
                } else {
                    setError(res);
                }
            } else {
                const role = await verifyOtp(form.otp);
                if (role) {
                    if (role === 'ADMIN') {
                        navigate('/admin');
                    } else if (role === 'AUDITOR') {
                        navigate('/auditor');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    setError('Invalid OTP');
                }
            }
        } catch (err) {
            setError('Login failed. Check credentials.');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>
                    Secure Bank
                </h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '0.5rem' }}
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        className="glass-input"
                                        style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '0.5rem' }}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enter OTP</label>
                            <input
                                type="text"
                                className="glass-input"
                                style={{ width: '100%', padding: '10px', borderRadius: '0.5rem', textAlign: 'center', letterSpacing: '2px' }}
                                value={form.otp}
                                onChange={e => setForm({ ...form, otp: e.target.value })}
                                placeholder="123456"
                                required
                            />
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                                Check your console for the OTP (Simulation)
                            </p>
                        </div>
                    )}

                    {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        {step === 1 ? 'Login' : 'Verify OTP'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#94a3b8' }}>
                    New user? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
}
