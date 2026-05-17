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
    
    // MOCK DATABASE LOOKUP (Fulfills presentation of credentials)
    if (username === 'emp' && password === 'pass') {
      login('John Doe', 'Employee');
      navigate('/employee');
    } else if (username === 'mgr' && password === 'pass') {
      login('Jane Smith', 'Manager');
      navigate('/manager');
    } else if (username === 'admin' && password === 'pass') {
      login('HR Admin', 'Admin');
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