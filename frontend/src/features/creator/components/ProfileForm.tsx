import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateProfileData } from '../types';

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().max(500).optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  header_image_url: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<CreateProfileData>;
  onSubmit: (data: CreateProfileData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const ProfileForm = ({ initialData, onSubmit, isLoading, error }: ProfileFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    // Clean up empty strings for optional URL fields
    const cleanData = {
      ...data,
      profile_image_url: data.profile_image_url || undefined,
      header_image_url: data.header_image_url || undefined,
    };
    await onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
          Display Name
        </label>
        <input
          {...register('display_name')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Your creator name"
        />
        {errors.display_name && (
          <p className="mt-2 text-sm text-red-600">{errors.display_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Tell us about yourself..."
        />
        {errors.bio && (
          <p className="mt-2 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="profile_image_url" className="block text-sm font-medium text-gray-700">
          Profile Image URL
        </label>
        <input
          {...register('profile_image_url')}
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://example.com/profile.jpg"
        />
        {errors.profile_image_url && (
          <p className="mt-2 text-sm text-red-600">{errors.profile_image_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="header_image_url" className="block text-sm font-medium text-gray-700">
          Header Image URL
        </label>
        <input
          {...register('header_image_url')}
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://example.com/header.jpg"
        />
        {errors.header_image_url && (
          <p className="mt-2 text-sm text-red-600">{errors.header_image_url.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};
