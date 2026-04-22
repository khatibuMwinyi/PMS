import { prisma } from '@/core/database/client';

/**
 * Basic site statistics for the landing page.
 * Returns total number of properties and total number of owners.
 */
export async function getSiteStats() {
  const [totalProperties, totalOwners] = await Promise.all([
    prisma.property.count(),
    prisma.ownerProfile.count(),
  ]);
  return { totalProperties, totalOwners };
}

/**
 * Placeholder for featured properties.
 * In a real implementation this would return a curated list with images.
 */
export async function getFeaturedProperties(limit = 5) {
  const props = await prisma.property.findMany({
    take: limit,
    select: { id: true, name: true, zone: true },
  });
  return props;
}

/**
 * Recent blog posts – placeholder returning static data.
 * Replace with a real CMS query when available.
 */
export async function getRecentBlogPosts(limit = 3) {
  // Mock data – in production fetch from a blog table or external API.
  return Array.from({ length: limit }, (_, i) => ({
    id: `post-${i + 1}`,
    title: `Blog post ${i + 1}`,
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    url: `/blog/post-${i + 1}`,
  }));
}

/**
 * Customer testimonials – placeholder static list.
 */
export async function getTestimonials(limit = 4) {
  return Array.from({ length: limit }, (_, i) => ({
    id: `t-${i + 1}`,
    author: `Customer ${i + 1}`,
    quote: 'Excellent service, highly recommended!',
  }));
}
