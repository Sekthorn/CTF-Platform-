import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  Copy,
  Trash2,
  RefreshCw,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  invitedBy?: { username: string; email: string } | null;
}

interface Invitation {
  id: string;
  email: string;
  expiresAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  invitedBy: { username: string; email: string };
}

interface AuditLogRecord {
  id: string;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { username: string; email: string } | null;
}

export const AdminManagementPage: React.FC = () => {
  const { admin: currentAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'admins' | 'invitations' | 'audit'>('admins');
  const [adminsList, setAdminsList] = useState<AdminAccount[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await apiClient.get('/admins');
      const data = res.data?.data || res.data || [];
      setAdminsList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrators.');
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await apiClient.get('/admins/invitations');
      const data = res.data?.data || res.data || [];
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Failed to load invitations:', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await apiClient.get('/admins/audit-logs?limit=50');
      const items = res.data?.data?.data || res.data?.data?.items || res.data?.data || [];
      setAuditLogs(Array.isArray(items) ? items : []);
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchAdmins(), fetchInvitations(), fetchAuditLogs()]);
    setIsLoading(false);
  }, [fetchAdmins, fetchInvitations, fetchAuditLogs]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);

    try {
      const res = await apiClient.post('/admins/invitations', { email: inviteEmail });
      const payload = res.data?.data || res.data;
      const rawToken = payload?.token;
      const fullUrl = `${window.location.origin}/admin/accept-invitation?token=${rawToken}`;
      setGeneratedInviteLink(fullUrl);
      setSuccess(`Invitation created for ${inviteEmail}`);
      setInviteEmail('');
      await fetchInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to create administrator invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await apiClient.delete(`/admins/invitations/${id}`);
      setSuccess('Invitation successfully revoked.');
      await fetchInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invitation.');
    }
  };

  const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
    const actionName = currentStatus ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionName} this administrator account?`)) return;

    try {
      await apiClient.patch(`/admins/${adminId}/status`, { isActive: !currentStatus });
      setSuccess(`Administrator account ${actionName}d successfully.`);
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message || `Failed to ${actionName} administrator.`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-[1720px] mx-auto font-sans pb-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-cyber-border/70">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-400" />
            Administrator Management
          </h1>
          <p className="text-xs md:text-sm text-cyber-muted mt-0.5">
            Manage administrator accounts, invitations, and review the security audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="p-2 rounded-lg bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setGeneratedInviteLink(null);
              setIsInviteModalOpen(true);
            }}
            className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-1.5 cursor-pointer h-8"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Administrator</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            &times;
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-cyber-border/70 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-2 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'admins'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Administrators ({adminsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-2 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'invitations'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Pending Invitations ({invitations.filter((i) => !i.usedAt && !i.revokedAt).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: Administrators Table */}
      {activeTab === 'admins' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyber-border bg-cyber-elevated/60 text-cyber-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3.5">Admin Username</th>
                  <th className="py-2.5 px-3.5">Email</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Last Login</th>
                  <th className="py-2.5 px-3.5">Created Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {adminsList.map((a) => (
                  <tr key={a.id} className="hover:bg-cyber-elevated/20 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={a.avatarUrl}
                          alt={a.username}
                          size="xs"
                          role="ADMIN"
                        />
                        <div>
                          <span className="font-semibold text-cyber-text font-mono">{a.username}</span>
                          {currentAdmin?.id === a.id && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-cyber-muted">{a.email}</td>
                    <td className="py-2.5 px-3.5">
                      {a.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-muted font-mono text-[11px]">
                      {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-muted font-mono text-[11px]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      {currentAdmin?.id !== a.id && (
                        <button
                          onClick={() => handleToggleStatus(a.id, a.isActive)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                            a.isActive
                              ? 'border-rose-800/40 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40'
                              : 'border-emerald-800/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                        >
                          {a.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Invitations Table */}
      {activeTab === 'invitations' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyber-border bg-cyber-elevated/60 text-cyber-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3.5">Invited Email</th>
                  <th className="py-2.5 px-3.5">Invited By</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Expires At</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-cyber-muted font-mono">
                      No invitations have been generated yet.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const isUsed = !!inv.usedAt;
                    const isRevoked = !!inv.revokedAt;
                    const isExpired = !isUsed && !isRevoked && new Date(inv.expiresAt) < new Date();
                    const isPending = !isUsed && !isRevoked && !isExpired;

                    return (
                      <tr key={inv.id} className="hover:bg-cyber-elevated/20 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono font-semibold text-cyber-text">{inv.email}</td>
                        <td className="py-2.5 px-3.5 font-mono text-cyber-muted">{inv.invitedBy?.username}</td>
                        <td className="py-2.5 px-3.5">
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-400 font-mono text-[10px]">
                              PENDING
                            </span>
                          )}
                          {isUsed && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-mono text-[10px]">
                              ACCEPTED
                            </span>
                          )}
                          {isRevoked && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[10px]">
                              REVOKED
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 font-mono text-[10px]">
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-cyber-muted font-mono text-[11px]">
                          {new Date(inv.expiresAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {isPending && (
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-rose-800/40 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyber-border bg-cyber-elevated/60 text-cyber-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3.5">Action</th>
                  <th className="py-2.5 px-3.5">Actor</th>
                  <th className="py-2.5 px-3.5">IP Address</th>
                  <th className="py-2.5 px-3.5">Details</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cyber-elevated/20 transition-colors font-mono">
                    <td className="py-2.5 px-3.5">
                      <span className="font-semibold text-emerald-400">{log.action}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-text">
                      {log.user ? log.user.username : 'Anonymous / System'}
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-muted">{log.ipAddress || '—'}</td>
                    <td className="py-2.5 px-3.5 text-cyber-muted text-[11px] max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-cyber-muted text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Administrator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101614] border border-[#1E2925] rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="font-bold text-sm text-cyber-text flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Invite Administrator
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-cyber-muted hover:text-cyber-text"
              >
                &times;
              </button>
            </div>

            {generatedInviteLink ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2 text-xs text-emerald-300">
                  <p className="font-semibold text-emerald-200">
                    Single-Use Invitation Generated!
                  </p>
                  <p className="text-[11px] text-emerald-400/80">
                    Share this unique link with the invited administrator. It will expire in 48 hours.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full p-2 bg-black/50 border border-emerald-900 rounded-lg text-xs font-mono text-emerald-300 select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedInviteLink)}
                      className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="w-full py-2 bg-cyber-card border border-cyber-border rounded-xl text-xs font-semibold text-cyber-text hover:bg-cyber-elevated transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-cyber-muted">
                    Administrator Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="analyst@websec.ctf"
                    required
                    className="w-full px-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-cyber-muted/60">
                    A single-use token will be generated to complete provisioning.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="py-2 px-3 rounded-xl border border-cyber-border text-xs text-cyber-muted hover:text-cyber-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isInviting ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;
