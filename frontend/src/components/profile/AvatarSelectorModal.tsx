import React, { useState, useMemo } from 'react';
import { X, Check, Search, Sparkles } from 'lucide-react';
import { ANIME_AVATARS, AnimeAvatar, getAvatarUrl } from '@/data/avatars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  currentAvatar?: string | null;
  onSelect: (avatarUrl: string) => void;
  onClose: () => void;
  isSaving?: boolean;
}

type CategoryTab = 'all' | 'featured' | 'male' | 'female' | 'specialist';

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  currentAvatar,
  onSelect,
  onClose,
  isSaving = false,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(
    getAvatarUrl(currentAvatar)
  );
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected avatar object for rich live preview
  const previewAvatar = useMemo<AnimeAvatar>(() => {
    return (
      ANIME_AVATARS.find((a) => a.url === selectedUrl) ||
      ANIME_AVATARS[0]
    );
  }, [selectedUrl]);

  // Filtered avatars
  const filteredAvatars = useMemo(() => {
    return ANIME_AVATARS.filter((avatar) => {
      // Category filter
      if (activeTab !== 'all' && avatar.category !== activeTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = avatar.name.toLowerCase().includes(q);
        const matchesRole = avatar.role.toLowerCase().includes(q);
        const matchesTags = avatar.tags.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesRole || matchesTags;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selectedUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyber-border/70 flex items-center justify-between bg-cyber-elevated/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-cyber-text tracking-tight">
                Select Anime Profile Avatar
              </h2>
              <p className="text-xs text-cyber-muted">
                Choose an original cyber persona to represent your CTF researcher identity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Search & Category Tabs */}
        <div className="px-5 py-3 border-b border-cyber-border/60 bg-cyber-bg/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
            {[
              { id: 'all', label: `All (${ANIME_AVATARS.length})` },
              { id: 'featured', label: '⭐ Featured' },
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'specialist', label: 'Specialists' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CategoryTab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-cyber-elevated/60 text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyber-muted" />
            <Input
              type="text"
              placeholder="Search by role, name, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-cyber-elevated/80 border-cyber-border font-mono"
            />
          </div>
        </div>

        {/* Content Body: Grid & Live Preview Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Left / Center: Avatar Grid */}
          <div className="md:col-span-2 p-4 overflow-y-auto max-h-[50vh] md:max-h-[58vh] border-b md:border-b-0 md:border-r border-cyber-border/70">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedUrl(avatar.url)}
                    className={`group relative p-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-1.5 border text-center ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                        : 'border-cyber-border/80 bg-cyber-elevated/30 hover:border-emerald-500/50 hover:bg-cyber-elevated/70'
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md z-10">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Avatar Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:scale-105 transition-transform duration-200">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Name */}
                    <span className="text-[11px] font-mono font-semibold text-cyber-text truncate w-full">
                      {avatar.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredAvatars.length === 0 && (
              <div className="text-center py-12 text-cyber-muted font-mono text-xs">
                No avatars match your search criteria.
              </div>
            )}
          </div>

          {/* Right: Selected Avatar Rich Preview */}
          <div className="p-5 bg-cyber-elevated/20 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted font-bold block">
                Selected Persona Preview
              </span>

              {/* Large Avatar Display */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative w-28 h-28 rounded-full border-4 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] overflow-hidden bg-cyber-bg">
                  <img
                    src={previewAvatar.url}
                    alt={previewAvatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-cyber-text font-mono">
                    {previewAvatar.name}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">
                    {previewAvatar.role}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5 pt-2 border-t border-cyber-border/60">
                <span className="text-[10px] font-mono text-cyber-muted uppercase block">
                  Character Attributes
                </span>
                <div className="flex flex-wrap gap-1">
                  {previewAvatar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated border border-cyber-border text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="space-y-2 pt-4 border-t border-cyber-border/70">
              <Button
                onClick={handleConfirm}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2.5 shadow-lg shadow-emerald-950/40"
              >
                {isSaving ? 'Saving Profile...' : 'Confirm & Apply Avatar'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="w-full border-cyber-border text-cyber-muted hover:text-cyber-text text-xs font-mono"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectorModal;
