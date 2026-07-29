import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  EyeOff,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  Sparkles,
  BarChart3,
  Bell
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { adminMetrics, reports } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'reports' | 'broadcast'>('metrics');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [reviewedReports, setReviewedReports] = useState<Record<string, 'actioned' | 'dismissed'>>({});

  const handleSendBroadcast = () => {
    if (broadcastTitle && broadcastBody) {
      setBroadcastSent(true);
      setTimeout(() => {
        setBroadcastSent(false);
        setBroadcastTitle('');
        setBroadcastBody('');
      }, 3000);
    }
  };

  const handleReportAction = (reportId: string, action: 'actioned' | 'dismissed') => {
    setReviewedReports(prev => ({ ...prev, [reportId]: action }));
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 pb-28 space-y-6 text-left">
      {/* Admin Header */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-[#D4AF37]/30 p-6 space-y-4 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-black border border-[#D4AF37] text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif italic text-white leading-none">NOBADY Admin</h1>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider mt-0.5">Console & Safety Architecture</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-black border border-[#D4AF37]/40 text-[#D4AF37] text-[9px] font-mono font-bold uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-black p-1 rounded-full text-xs font-mono uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 rounded-full transition ${
              activeTab === 'metrics' ? 'bg-[#D4AF37] text-black font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 rounded-full transition ${
              activeTab === 'reports' ? 'bg-[#D4AF37] text-black font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-2 rounded-full transition ${
              activeTab === 'broadcast' ? 'bg-[#D4AF37] text-black font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            Broadcast
          </button>
        </div>
      </div>

      {/* Metrics View */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0f] p-5 rounded-3xl border border-white/10 space-y-1">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-2xl font-serif italic text-white block">{adminMetrics.totalUsers.toLocaleString()}</span>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Total Registered</p>
            </div>

            <div className="bg-[#0a0a0f] p-5 rounded-3xl border border-white/10 space-y-1">
              <BarChart3 className="w-5 h-5 text-[#FF4E00]" />
              <span className="text-2xl font-serif italic text-white block">{adminMetrics.activeMatchesToday.toLocaleString()}</span>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Matches Today</p>
            </div>

            <div className="bg-[#0a0a0f] p-5 rounded-3xl border border-white/10 space-y-1">
              <EyeOff className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-serif italic text-white block">{adminMetrics.incognitoUsersCount.toLocaleString()}</span>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Ghost Mode Users</p>
            </div>

            <div className="bg-[#0a0a0f] p-5 rounded-3xl border border-white/10 space-y-1">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-2xl font-serif italic text-white block">{adminMetrics.aiModerationScans.toLocaleString()}</span>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">AI Safety Scans</p>
            </div>
          </div>

          <div className="bg-[#0a0a0f] p-5 rounded-3xl border border-white/10 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00FF85] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>System Health & Free Guarantee</span>
            </h3>
            <p className="text-xs text-white/70 font-sans">
              100% Free Core Architecture operating seamlessly. Zero subscription paywalls, zero ads injected.
            </p>
          </div>
        </div>
      )}

      {/* Safety Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF4E00] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Community Safety Queue ({reports.length})</span>
          </h2>

          {reports.length === 0 ? (
            <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-6 text-center text-white/40 text-xs font-mono">
              No pending user reports in the moderation queue.
            </div>
          ) : (
            reports.map(r => {
              const status = reviewedReports[r.id];

              return (
                <div key={r.id} className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif italic text-sm text-white">Reported: {r.targetUserName}</span>
                    <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-black text-[#FF4E00] border border-[#FF4E00]/40 uppercase font-bold">
                      {r.reason}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 font-serif italic bg-black/60 p-3 rounded-2xl border border-white/5">
                    "{r.comment || 'No comment provided'}"
                  </p>

                  {status ? (
                    <div className="text-[11px] font-mono font-bold text-[#00FF85] pt-1 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Actioned: {status.toUpperCase()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                      <button
                        onClick={() => handleReportAction(r.id, 'dismissed')}
                        className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReportAction(r.id, 'actioned')}
                        className="flex-1 py-2 bg-[#FF4E00] text-white font-bold rounded-full hover:opacity-90 transition"
                      >
                        Suspend User
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Broadcast Dispatcher */}
      {activeTab === 'broadcast' && (
        <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            <span>Push Notification Dispatcher</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-white/60 font-mono block mb-1">Notification Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Weekend Feature Update!"
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-white/60 font-mono block mb-1">Notification Body</label>
              <textarea
                value={broadcastBody}
                onChange={e => setBroadcastBody(e.target.value)}
                placeholder="Message sent to all active users..."
                rows={3}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={handleSendBroadcast}
              className="w-full py-3 rounded-full bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Notification</span>
            </button>

            {broadcastSent && (
              <div className="p-3 rounded-2xl bg-[#00FF85]/10 border border-[#00FF85]/30 text-xs text-[#00FF85] text-center font-mono">
                ✨ Notification broadcasted to all active NOBADY devices!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
