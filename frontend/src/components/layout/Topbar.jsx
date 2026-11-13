import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useApp } from '../../context/App';
import { useTheme } from '../../context/Theme';

function Topbar({ onMenu }) {
  const navigate = useNavigate();
  const { openTxForm } = useApp();
  const { resolved, toggle } = useTheme();
  const [query, setQuery] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/transactions?q=${encodeURIComponent(q)}` : '/transactions');
  };

  return (
    <header className="topbar">
      <button className="btn icon ghost menu-btn" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className="topbar-logo">
        <Logo />
      </div>
      <form className="search" role="search" onSubmit={submit}>
        <Icon name="search" size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions"
          aria-label="Search transactions"
        />
      </form>
      <div className="spacer" />
      <button
        className="btn icon ghost"
        onClick={toggle}
        aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`}
      >
        <Icon name={resolved === 'dark' ? 'sun' : 'moon'} />
      </button>
      <Button variant="primary" icon="plus" onClick={() => openTxForm()} aria-label="Add transaction">
        <span className="btn-label">Add transaction</span>
      </Button>
    </header>
  );
}

export default Topbar;
