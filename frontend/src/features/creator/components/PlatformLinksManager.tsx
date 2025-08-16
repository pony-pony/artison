import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PlatformLink, CreatePlatformLinkData } from '../types';

const platformLinkSchema = z.object({
  platform_name: z.string().min(1, 'Platform name is required').max(50),
  platform_url: z.string().url('Invalid URL'),
});

type PlatformLinkFormData = z.infer<typeof platformLinkSchema>;

interface PlatformLinksManagerProps {
  links: PlatformLink[];
  onAdd: (data: CreatePlatformLinkData) => Promise<void>;
  onUpdate: (linkId: string, data: CreatePlatformLinkData) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onReorder?: (linkIds: string[]) => Promise<void>;
  error?: string | null;
}

const PLATFORM_SUGGESTIONS = [
  { name: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', icon: '📺' },
  { name: 'Twitter / X', placeholder: 'https://twitter.com/yourusername', icon: '🐦' },
  { name: 'Instagram', placeholder: 'https://instagram.com/yourusername', icon: '📷' },
  { name: 'TikTok', placeholder: 'https://tiktok.com/@yourusername', icon: '🎵' },
  { name: 'Twitch', placeholder: 'https://twitch.tv/yourusername', icon: '🎮' },
  { name: 'Discord', placeholder: 'https://discord.gg/yourserver', icon: '💬' },
  { name: 'note', placeholder: 'https://note.com/yourusername', icon: '📝' },
  { name: 'GitHub', placeholder: 'https://github.com/yourusername', icon: '💻' },
  { name: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourusername', icon: '💼' },
  { name: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: '👥' },
  { name: 'Spotify', placeholder: 'https://open.spotify.com/artist/...', icon: '🎧' },
  { name: 'Website', placeholder: 'https://yourwebsite.com', icon: '🌐' },
  { name: 'Blog', placeholder: 'https://yourblog.com', icon: '📰' },
  { name: 'Email', placeholder: 'mailto:you@example.com', icon: '✉️' },
  { name: 'Other', placeholder: 'https://...', icon: '🔗' },
];

export const PlatformLinksManager = ({
  links,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  error,
}: PlatformLinksManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof PLATFORM_SUGGESTIONS[0] | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PlatformLinkFormData>({
    resolver: zodResolver(platformLinkSchema),
  });

  const handleAdd = async (data: PlatformLinkFormData) => {
    try {
      await onAdd({ ...data, display_order: links.length });
      reset();
      setIsAdding(false);
      setSelectedPlatform(null);
    } catch (error) {
      // Error is handled by parent
    }
  };

  const handleEdit = async (linkId: string, data: PlatformLinkFormData) => {
    try {
      await onUpdate(linkId, data);
      setEditingId(null);
    } catch (error) {
      // Error is handled by parent
    }
  };

  const handlePlatformSelect = (platform: typeof PLATFORM_SUGGESTIONS[0]) => {
    setSelectedPlatform(platform);
    setValue('platform_name', platform.name);
  };

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    if (!onReorder) return;
    
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= links.length) return;
    
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    
    const newLinkIds = newLinks.map(link => link.id);
    await onReorder(newLinkIds);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Platform Links</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add all your social media and platform links. There's no limit!
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Link
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Platform selection grid - shown when adding */}
      {isAdding && !selectedPlatform && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Choose a platform</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {PLATFORM_SUGGESTIONS.map((platform) => (
              <button
                key={platform.name}
                type="button"
                onClick={() => handlePlatformSelect(platform)}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-1">{platform.icon}</div>
                <div className="text-xs text-gray-700">{platform.name}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="mt-3 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add new link form - shown after platform selection */}
      {isAdding && selectedPlatform && (
        <form onSubmit={handleSubmit(handleAdd)} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">{selectedPlatform.icon}</span>
            <h4 className="font-medium text-gray-900">{selectedPlatform.name}</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              {...register('platform_name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={`e.g., ${selectedPlatform.name}`}
            />
            {errors.platform_name && (
              <p className="mt-1 text-sm text-red-600">{errors.platform_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              {...register('platform_url')}
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={selectedPlatform.placeholder}
            />
            {errors.platform_url && (
              <p className="mt-1 text-sm text-red-600">{errors.platform_url.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Link
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setSelectedPlatform(null);
                reset();
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Links list */}
      <div className="space-y-2">
        {links.length === 0 && !isAdding && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No links added yet. Start by adding your first link!</p>
          </div>
        )}
        
        {links
          .sort((a, b) => a.display_order - b.display_order)
          .map((link, index) => (
            <div key={link.id} className="bg-white p-4 rounded-lg border border-gray-200">
              {editingId === link.id ? (
                <form
                  onSubmit={handleSubmit((data) => handleEdit(link.id, data))}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      {...register('platform_name')}
                      defaultValue={link.platform_name}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                      {...register('platform_url')}
                      defaultValue={link.platform_url}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{link.platform_name}</p>
                    <a
                      href={link.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900 break-all"
                    >
                      {link.platform_url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Reorder buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveLink(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => setEditingId(link.id)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(link.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Links page preview */}
      {links.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-700 font-medium">
            Your links are live at:{' '}
            <a
              href={`/links/${links[0]?.creator_profile?.username || ''}`}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/links/username
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
