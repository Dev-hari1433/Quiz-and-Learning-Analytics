import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: string;
  label: string;
  path: string;
}

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItemProps[] = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '🧠', label: 'Generate Quiz', path: '/generate-quiz' },
    { icon: '🔍', label: 'Smart Research', path: '/research' },
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '📋', label: 'History', path: '/history' },
    { icon: '🏆', label: 'Achievements', path: '/achievements' },
  ];

  return (
    <nav className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center space-x-8 h-16">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              {...item} 
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-primary/20 text-primary border border-primary/30' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export { Navigation };