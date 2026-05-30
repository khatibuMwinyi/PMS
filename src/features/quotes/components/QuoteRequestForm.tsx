'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Decimal } from 'decimal.js';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { requestQuote } from '../actions';

interface Property {
  id: string;
  name: string;
  zone: string;
}

interface ServiceType {
  id: string;
  name: string;
  basePrice: number;
}

interface QuoteRequestFormProps {
  ownerId: string;
  properties: Property[];
  serviceTypes: ServiceType[];
  onSuccess?: (quoteId: string) => void;
}

export function QuoteRequestForm({ ownerId, properties, serviceTypes, onSuccess }: QuoteRequestFormProps) {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState('');
  const [locationFactor, setLocationFactor] = useState(1.0);
  const [frequencyMultiplier, setFrequencyMultiplier] = useState(1.0);
  const [unitCount, setUnitCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<Decimal | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const serviceType = serviceTypes.find(s => s.id === selectedServiceTypeId);
      if (!serviceType) {
        throw new Error('Please select a service type');
      }

      const result = await requestQuote({
        ownerId,
        propertyId: selectedPropertyId,
        serviceTypeId: selectedServiceTypeId,
        basePrice: serviceType.basePrice,
        locationFactor,
        frequencyMultiplier,
        unitCount,
      });

      setQuotedPrice(result.quotedPrice);
      
      if (onSuccess) {
        onSuccess(result.id);
      } else {
        router.push(`/owner/quotes/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request quote');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = serviceTypes.find(s => s.id === selectedServiceTypeId);
  const calculatedPrice = selectedService
    ? new Decimal(selectedService.basePrice)
        .times(locationFactor)
        .times(frequencyMultiplier)
        .times(unitCount)
    : null;

  return (
    <motion.div
      className="max-w-2xl mx-auto bg-[var(--surface-card)] p-6 rounded-2xl shadow-card border border-[var(--border-default)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        Request a Quote
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-[var(--surface-overlay)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
            required
          >
            <option value="">Select a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.zone}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Service Type
          </label>
          <select
            value={selectedServiceTypeId}
            onChange={(e) => setSelectedServiceTypeId(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-[var(--surface-overlay)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
            required
          >
            <option value="">Select a service...</option>
            {serviceTypes.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.basePrice}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Location Factor
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={locationFactor.toString()}
              onChange={(e) => setLocationFactor(parseFloat(e.target.value) || 1.0)}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              1.0 = city center, 0.8 = suburbs
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Frequency Multiplier
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="5"
              value={frequencyMultiplier.toString()}
              onChange={(e) => setFrequencyMultiplier(parseFloat(e.target.value) || 1.0)}
              className="w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              1.0 = one-time, 0.9 = weekly
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Unit Count
            </label>
            <Input
              type="number"
              min="1"
              value={unitCount.toString()}
              onChange={(e) => setUnitCount(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
        </div>

        {/* Price Preview */}
        {calculatedPrice && (
          <motion.div
            className="bg-[var(--surface-overlay)] p-4 rounded-xl border border-[var(--border-default)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-[var(--text-muted)] mb-1">Estimated Quote:</p>
            <p className="text-2xl font-bold text-[var(--brand-primary)] tabular-nums">
              ${calculatedPrice.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Includes 24-hour price lock
            </p>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-[var(--state-error)]/10 text-[var(--state-error)] p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
        >
          Request Quote
        </Button>
      </form>
    </motion.div>
  );
}
