import React from 'react';
import Button from '@/components/ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="bg-gray-100 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Oweru Property Management</h1>
      <p className="text-lg mb-6">
        Manage your properties with ease, track assignments, and stay on top of payments.
      </p>
      <Button variant="primary" onClick={() => (window.location.href = '/signup')}>
        Get Started
      </Button>
    </section>
  );
};

export default Hero;
