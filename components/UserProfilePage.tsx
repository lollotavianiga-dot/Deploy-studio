import React from 'react';
import { User, Mail, Calendar, Clock, Shield, UserCircle, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfilePageProps {
  user: UserType;
  onLogout: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onLogout }) => {
  return (
    <div className="flex-1 bg-[#0f0f0f] overflow-y-auto flex items-start justify-center p-8">
      <div className="w-full max-w-3xl bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-xl overflow-hidden mt-8">
        
        {/* Header Background */}
        <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
        </div>

        {/* Profile Avatar */}
        <div className="relative px-10 pb-10">
            <div className="absolute -top-16 left-10 w-32 h-32 rounded-full bg-[#1e1e1e] p-2">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-5xl font-bold text-gray-200 shadow-inner select-none pointer-events-none">
                    {user.username.slice(0, 2).toUpperCase()}
                </div>
            </div>

            <div className="mt-20 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        {user.firstName} {user.lastName}
                        {user.username === 'admin' && <Shield size={22} className="text-yellow-500" title="Administrator" />}
                    </h2>
                    <p className="text-blue-400 font-medium mt-1 text-lg">@{user.username}</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-medium transition-colors"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#252526] p-5 rounded-xl border border-gray-700/50 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email Address</div>
                        <div className="text-gray-200 text-base">{user.email || 'Not provided'}</div>
                    </div>
                </div>

                <div className="bg-[#252526] p-5 rounded-xl border border-gray-700/50 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <UserCircle size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Username</div>
                        <div className="text-gray-200 text-base">{user.username}</div>
                    </div>
                </div>

                <div className="bg-[#252526] p-5 rounded-xl border border-gray-700/50 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <User size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Full Name</div>
                        <div className="text-gray-200 text-base">{user.firstName} {user.lastName}</div>
                    </div>
                </div>

                <div className="bg-[#252526] p-5 rounded-xl border border-gray-700/50 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Last Login</div>
                        <div className="text-gray-200 text-base">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-600">
                Deploy Studio Account • ID: {user.username}-{Date.now().toString().slice(-4)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
