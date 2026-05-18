import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    
    if (cleanUsername === 'emp' && cleanPassword === 'pass') {
      login('John Doe', 'Employee');
      navigate('/employee');
    } else if (cleanUsername === 'mgr' && cleanPassword === 'pass') {
      login('Jane Smith', 'Manager');
      navigate('/manager');
    } else if (cleanUsername === 'admin' && cleanPassword === 'pass') {
      login('HR Admin', 'Admin');
      navigate('/admin');
    } else {
      alert('Invalid credentials! Try emp/pass, mgr/pass, or admin/pass');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0f172a' 
    }}>
      
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px', 
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' 
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚛️</div>
        <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>AlignTrack</h2>
        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Sign in to continue to your dashboard.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter the username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              style={{ marginTop: '6px' }} 
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter the password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ marginTop: '6px' }} 
            />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
            Sign In
          </button>
        </form>
      </div>
      
    </div>
  );
}