import { PropertyCard }    from './PropertyCard';
import { EmptyProperties } from './EmptyProperties';

type Property = Parameters<typeof PropertyCard>[0]['property'];

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return <EmptyProperties />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}