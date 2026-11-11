import React, { useState } from 'react';
import { Grid } from 'lucide-react';
import { ANIME_AVATARS, getAvatarUrl } from '@/data/avatars';
import { AvatarSelectorModal } from './AvatarSelectorModal';
import { Button } from '@/components/ui/button';

interface AvatarPickerProps {
  value?: string | null;
  onChange: (avatarUrl: string) => void;
  label?: string;
  description?: string;
  isSaving?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  label = 'Anime Profile Avatar',
  description = 'Choose your cyber persona for the CTF platform and leaderboards.',
  isSaving = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUrl = getAvatarUrl(value);

  const currentAvatar =
    ANIME_AVATARS.find((a) => a.url === currentUrl) || ANIME_AVATARS[0];

  // Quick picks: 6 distinct popular avatars (3 featured + 3 specialists)
  const quickPicks = [
    ANIME_AVATARS[0], // Matrix Hacker
    ANIME_AVATARS[1], // Cyber Male
    ANIME_AVATARS[2], // Cyber Female
    ANIME_AVATARS[3], // Ren Cipher
    ANIME_AVATARS[15], // Hana Payload
    ANIME_AVATARS[26], // Kitsune Cyber Ninja
  ];

  return (
    <div className="space-y-3 font-sans">
      {label && (
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-mono font-bold text-cyber-text uppercase tracking-wider block">
              {label}
            </label>
            {description && (
              <p className="text-[11px] text-cyber-muted mt-0.5">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 h-8 gap-1.5"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Browse All ({ANIME_AVATARS.length})</span>
          </Button>
        </div>
      )}

      {/* Main Avatar Preview & Quick Select Strip */}
      <div className="p-3.5 rounded-xl border border-cyber-border bg-cyber-elevated/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Active Selected Card */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div
            onClick={() => setIsModalOpen(true)}
            className="relative cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] overflow-hidden bg-cyber-bg transition-transform group-hover:scale-105">
              <img
                src={currentUrl}
                alt={currentAvatar.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-mono text-white font-bold">
              Change
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-cyber-text font-mono">
                {currentAvatar.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-cyber-muted font-mono">{currentAvatar.role}</p>
          </div>
        </div>

        {/* Quick Picks Carousel */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto justify-start sm:justify-end">
          <span className="text-[10px] font-mono text-cyber-muted uppercase mr-1 hidden lg:inline">
            Quick Pick:
          </span>
          {quickPicks.map((pick) => {
            const isSelected = currentUrl === pick.url;
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => onChange(pick.url)}
                className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'border-cyber-border/70 hover:border-emerald-500/60 hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={`${pick.name} - ${pick.role}`}
              >
                <img
                  src={pick.url}
                  alt={pick.name}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Modal Selector */}
      <AvatarSelectorModal
        isOpen={isModalOpen}
        currentAvatar={currentUrl}
        onSelect={(newUrl) => {
          onChange(newUrl);
          setIsModalOpen(false);
        }}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AvatarPicker;
