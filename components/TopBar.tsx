import React from 'react';
import { Bell, Search, Settings, Menu } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface TopBarProps {
  onMobileMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMobileMenuClick }) => {
  return (
    <div className="h-16 w-full bg-charcoal-950 border-b border-charcoal-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMobileMenuClick} 
          className="text-slate-400 hover:text-white md:hidden p-1 rounded-lg hover:bg-charcoal-800 transition-colors"
        >
            <Menu className="w-6 h-6" />
        </button>
        
        {/* Breadcrumbs or Title */}
        <div className="flex items-center text-sm">
           <span className="text-slate-400 hidden sm:inline hover:text-white cursor-pointer transition-colors">Workspace</span>
           <span className="mx-2 text-slate-600 hidden sm:inline">/</span>
           <span className="text-white font-medium truncate max-w-[150px] sm:max-w-none">Quadro Principal</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search - Desktop */}
        <div className="hidden md:flex relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-neon-blue transition-colors" />
           <input 
             type="text" 
             placeholder="Pesquisa Global (Cmd+K)" 
             className="bg-charcoal-900 border border-charcoal-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-neon-blue w-64 transition-all placeholder:text-slate-600"
           />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
           {/* Search Icon Mobile */}
           <button className="md:hidden text-slate-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
           </button>

           <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-neon-purple rounded-full animate-pulse"></span>
           </button>
           <button className="hidden sm:block text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
           </button>
        </div>

        {/* Profile */}
        <div className="h-6 w-[1px] bg-charcoal-800"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
           <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">{CURRENT_USER.name}</p>
              <p className="text-xs text-slate-500">{CURRENT_USER.role}</p>
           </div>
           <div className="relative">
              <img 
                src={CURRENT_USER.avatar} 
                alt="Perfil" 
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-charcoal-700 group-hover:border-neon-cyan transition-colors object-cover" 
              />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-charcoal-950 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;