
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Layers,
  X,
  CheckSquare,
  DollarSign
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  collapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  collapsed, 
  toggleCollapse, 
  mobileOpen, 
  setMobileOpen 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads CRM', icon: Users },
    { id: 'projects', label: 'Projetos', icon: Layers },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          h-full bg-charcoal-900 border-r border-charcoal-800 flex flex-col 
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          w-72 md:w-auto
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between md:justify-center px-4 md:px-0 border-b border-charcoal-800 shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={toggleCollapse}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20 shrink-0">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 ${collapsed ? 'md:hidden' : ''}`}>
                Muirakitã
              </span>
            )}
          </div>
          
          {/* Close button for mobile */}
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            // @ts-ignore
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id as ViewState); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-neon-blue/10 text-neon-cyan border border-neon-blue/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                    : 'text-slate-400 hover:bg-charcoal-800 hover:text-slate-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-neon-cyan' : 'group-hover:text-white'}`} />
                {(!collapsed || mobileOpen) && (
                  <span className={`font-medium text-sm whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
                    {item.label}
                  </span>
                )}
                
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-neon-cyan rounded-r-full blur-[1px]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-charcoal-800 shrink-0">
           <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5 shrink-0" />
              {(!collapsed || mobileOpen) && (
                <span className={`font-medium text-sm whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
                  Sair
                </span>
              )}
           </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
