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
    
    // Snip off any accidental spaces at the beginning or end
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    
    // Check the cleaned strings instead of the raw input
    if (cleanUsername === 'emp' && cleanPassword === 'pass') {
      login('JS Rangi', 'Employee');
      navigate('/employee');
    } else if (cleanUsername === 'mgr' && cleanPassword === 'pass') {
      login('ND Modi', 'Manager');
      navigate('/manager');
    } else if (cleanUsername === 'admin' && cleanPassword === 'pass') {
      login('N Raman', 'Admin');
      navigate('/admin');
    } else {
      alert('Invalid credentials! Try emp/pass, mgr/pass, or admin/pass');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h2>AtomQuest Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Username (emp, mgr, admin)" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password (pass)" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{ background: '#0056b3' }}>Login</button>
        </form>
      </div>
    </div>
  );
}