import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import { supportService } from '../services/supportService';
import { useAuth } from '../../auth';

const supportSchema = z.object({
  amount: z
    .number()
    .min(150, 'Minimum support amount is ¥150')
    .max(1000000, 'Maximum support amount is ¥1,000,000'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type SupportFormData = z.infer<typeof supportSchema>;

interface SupportFormProps {
  creatorUsername: string;
  creatorDisplayName: string;
}

export const SupportForm = ({ creatorUsername, creatorDisplayName }: SupportFormProps) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      amount: 150,
      message: '',
    },
  });

  const onSubmit = async (data: SupportFormData) => {
    if (!isAuthenticated) {
      setError('Please log in to support creators');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get Stripe config
      const { publishable_key } = await supportService.getStripeConfig();
      const stripe = await loadStripe(publishable_key);

      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create checkout session
      const { checkout_url } = await supportService.createCheckoutSession(creatorUsername, {
        amount: data.amount,
        message: data.message,
        success_url: `${window.location.origin}/support/success?creator=${creatorUsername}`,
        cancel_url: window.location.href,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Support {creatorDisplayName}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Support Amount (¥)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">¥</span>
            </div>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              min="150"
              step="1"
              className="pl-8 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="150"
            />
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Minimum: ¥150</p>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message (Optional)
          </label>
          <textarea
            {...register('message')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Leave a supportive message..."
          />
          {errors.message && (
            <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Please <a href="/login" className="font-medium underline">log in</a> to support creators
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isAuthenticated}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You will be redirected to Stripe for secure payment processing
        </p>
      </form>
    </div>
  );
};
