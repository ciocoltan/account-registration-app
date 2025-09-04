import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button
      onClick={onLogout}
      className="absolute top-4 right-4 flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      title="Logout"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </button>
  );
}

export default LogoutButton;
