import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Tanzania real estate data...')

  const passwordHash = await bcrypt.hash('password', 10)

  // ============ ADMIN USER ============
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oweru.co.tz' },
    update: {},
    create: {
      email: 'admin@oweru.co.tz',
      phone: '+255762000001',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('✓ Admin user created')

  // ============ OWNERS ============
  const owners = await Promise.all([
    prisma.user.upsert({
      where: { email: 'juma@hamisi.co.tz' },
      update: {},
      create: {
        email: 'juma@hamisi.co.tz',
        phone: '+255762100001',
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'amira@zanzibar.estate' },
      update: {},
      create: {
        email: 'amira@zanzibar.estate',
        phone: '+255762100002',
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'moses@tanga.properties' },
      update: {},
      create: {
        email: 'moses@tanga.properties',
        phone: '+255762100003',
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    }),
  ])

  const ownerProfiles = await Promise.all([
    prisma.ownerProfile.upsert({
      where: { userId: owners[0].id },
      update: {},
      create: { userId: owners[0].id, firstName: 'Juma', lastName: 'Hamisi' },
    }),
    prisma.ownerProfile.upsert({
      where: { userId: owners[1].id },
      update: {},
      create: { userId: owners[1].id, firstName: 'Amira', lastName: 'Said' },
    }),
    prisma.ownerProfile.upsert({
      where: { userId: owners[2].id },
      update: {},
      create: { userId: owners[2].id, firstName: 'Moses', lastName: 'Kahigi' },
    }),
  ])
  console.log('✓ 3 owners created')

  // ============ PROVIDERS ============
  const providers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'cleanpro@dar.co.tz' },
      update: {},
      create: {
        email: 'cleanpro@dar.co.tz',
        phone: '+255762200001',
        passwordHash,
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'safarihome@arusha.co.tz' },
      update: {},
      create: {
        email: 'safarihome@arusha.co.tz',
        phone: '+255762200002',
        passwordHash,
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'zanziclean@zanzibar.co.tz' },
      update: {},
      create: {
        email: 'zanziclean@zanzibar.co.tz',
        phone: '+255762200003',
        passwordHash,
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mwanzaprops@mwanzaclean.co.tz' },
      update: {},
      create: {
        email: 'mwanzaprops@mwanzaclean.co.tz',
        phone: '+255762200004',
        passwordHash,
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
  ])

  const providerProfiles = await Promise.all([
    prisma.providerProfile.upsert({
      where: { userId: providers[0].id },
      update: {},
      create: {
        userId: providers[0].id,
        businessName: 'CleanPro Tanzania',
        serviceCategories: ['CLEANING', 'MAINTENANCE'],
        operationalZones: ['Kibaha', 'Kinondoni', 'Ilala'],
      },
    }),
    prisma.providerProfile.upsert({
      where: { userId: providers[1].id },
      update: {},
      create: {
        userId: providers[1].id,
        businessName: 'Safari Home Services',
        serviceCategories: ['LANDSCAPING', 'MAINTENANCE', 'SECURITY'],
        operationalZones: ['Arusha', 'Moshi', 'Monduli'],
      },
    }),
    prisma.providerProfile.upsert({
      where: { userId: providers[2].id },
      update: {},
      create: {
        userId: providers[2].id,
        businessName: 'ZanziClean Services',
        serviceCategories: ['CLEANING', 'PLUMBING', 'ELECTRICAL'],
        operationalZones: ['Zanzibar Central', 'Zanzibar North', 'Zanzibar South'],
      },
    }),
    prisma.providerProfile.upsert({
      where: { userId: providers[3].id },
      update: {},
      create: {
        userId: providers[3].id,
        businessName: 'Mwanza Property Care',
        serviceCategories: ['CLEANING', 'MAINTENANCE', 'SECURITY'],
        operationalZones: ['Mwanza', 'Shinyanga', 'Geita'],
      },
    }),
  ])
  console.log('✓ 4 providers created')

  // ============ SERVICE TYPES ============
  const serviceTypes = await Promise.all([
    prisma.serviceType.upsert({
      where: { name: 'Standard Cleaning' },
      update: {},
      create: {
        name: 'Standard Cleaning',
        description: 'Regular cleaning services including vacuuming, mopping, dusting',
        basePrice: 50000,
        pricingRules: { hourly: 15000, minimumHours: 2 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Deep Cleaning' },
      update: {},
      create: {
        name: 'Deep Cleaning',
        description: 'Comprehensive cleaning including appliances, windows, detailed areas',
        basePrice: 150000,
        pricingRules: { hourly: 50000, minimumHours: 3 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Move-in/out Cleaning' },
      update: {},
      create: {
        name: 'Move-in/out Cleaning',
        description: 'Complete cleaning for property turnover',
        basePrice: 250000,
        pricingRules: { hourly: 75000, minimumHours: 4 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Garden Maintenance' },
      update: {},
      create: {
        name: 'Garden Maintenance',
        description: 'Landscaping, lawn care, and outdoor maintenance',
        basePrice: 80000,
        pricingRules: { hourly: 25000, minimumHours: 2 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Pest Control' },
      update: {},
      create: {
        name: 'Pest Control',
        description: 'Professional pest elimination services',
        basePrice: 120000,
        pricingRules: { hourly: 40000, minimumHours: 2 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Plumbing Services' },
      update: {},
      create: {
        name: 'Plumbing Services',
        description: 'Pipe repair, installation, and emergency plumbing',
        basePrice: 100000,
        pricingRules: { hourly: 35000, minimumHours: 1 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Electrical Services' },
      update: {},
      create: {
        name: 'Electrical Services',
        description: 'Wiring, installations, and electrical repairs',
        basePrice: 120000,
        pricingRules: { hourly: 45000, minimumHours: 1 },
      },
    }),
    prisma.serviceType.upsert({
      where: { name: 'Security Services' },
      update: {},
      create: {
        name: 'Security Services',
        description: 'On-site security personnel and monitoring',
        basePrice: 150000,
        pricingRules: { daily: 150000, minimumDays: 1 },
      },
    }),
  ])
  console.log('✓ 8 service types created')

  // ============ PROPERTIES IN TANZANIA ============
  const properties = await Promise.all([
    // Dar es Salaam Properties
    prisma.property.create({
      data: {
        name: 'Kibaha Gardens Apartment',
        ownerId: ownerProfiles[0].id,
        encryptedAddress: 'Kibaha Road, Plot 45, Dar es Salaam',
        zone: 'Kibaha',
        latitude: -6.9084,
        longitude: 39.2491,
        imageUrls: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa393d8?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        name: 'Oyster Bay Luxury Villa',
        ownerId: ownerProfiles[0].id,
        encryptedAddress: 'Oyster Drive, Oyster Bay, Dar es Salaam',
        zone: 'Kinondoni',
        latitude: -6.7295,
        longitude: 39.2750,
        imageUrls: [
          'https://images.unsplash.com/photo-1600596542415-9a4d133d2ef5?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        name: 'Mikocheni Business Center',
        ownerId: ownerProfiles[0].id,
        encryptedAddress: 'Nyerere Road, Mikocheni, Dar es Salaam',
        zone: 'Ilala',
        latitude: -6.7955,
        longitude: 39.2150,
        imageUrls: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          'https://images.unsplash.com/photo-1497366216548-37526070297c4?w=800',
          'https://images.unsplash.com/photo-1497366811353-6870664ff5ba?w=800',
        ],
      },
    }),
    // Zanzibar Properties
    prisma.property.create({
      data: {
        name: 'Stone Town Heritage House',
        ownerId: ownerProfiles[1].id,
        encryptedAddress: 'Kenyata Street, Stone Town, Zanzibar',
        zone: 'Zanzibar Central',
        latitude: -6.1659,
        longitude: 39.2026,
        imageUrls: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1578683010233-8a7cbd55ae8a?w=800',
          'https://images.unsplash.com/photo-1560185007-b5e30015c9e1?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        name: 'Nungwi Beach Resort',
        ownerId: ownerProfiles[1].id,
        encryptedAddress: 'Nungwi Road, Nungwi, Zanzibar',
        zone: 'Zanzibar North',
        latitude: -5.9700,
        longitude: 39.2996,
        imageUrls: [
          'https://images.unsplash.com/photo-1573052907238-4883a0c91d7e?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a850609a7f5?w=800',
        ],
      },
    }),
    // Tanga Properties
    prisma.property.create({
      data: {
        name: 'Tanga Harbor Complex',
        ownerId: ownerProfiles[2].id,
        encryptedAddress: 'Harbor Road, Tanga',
        zone: 'Tanga',
        latitude: -5.0900,
        longitude: 39.1067,
        imageUrls: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          'https://images.unsplash.com/photo-1551801319-86a10011baec?w=800',
          'https://images.unsplash.com/photo-1522708323590-d24dbb0b8d83?w=800',
        ],
      },
    }),
    // Arusha Properties
    prisma.property.create({
      data: {
        name: 'Arusha Safari Lodge',
        ownerId: ownerProfiles[2].id,
        encryptedAddress: 'Serengeti Road, Arusha',
        zone: 'Arusha',
        latitude: -3.3667,
        longitude: 36.6833,
        imageUrls: [
          'https://images.unsplash.com/photo-1566073771259-6a850609a7f5?w=800',
          'https://images.unsplash.com/photo-1582719508461-905eb5cff2c8?w=800',
          'https://images.unsplash.com/photo-1571896349840-33c9bd8b23e1?w=800',
        ],
      },
    }),
    // Mwanza Properties
    prisma.property.create({
      data: {
        name: 'Lake Victoria Apartments',
        ownerId: ownerProfiles[2].id,
        encryptedAddress: 'Iseja Road, Mwanza',
        zone: 'Mwanza',
        latitude: -2.5167,
        longitude: 32.9000,
        imageUrls: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa393d8?w=800',
          'https://images.unsplash.com/photo-1512917526895-57db36630204?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ],
      },
    }),
  ])
  console.log('✓ 8 properties created across Tanzania')

  // ============ UNITS ============
  const units = await Promise.all([
    // Units for Kibaha Gardens
    prisma.unit.create({ data: { propertyId: properties[0].id, unitName: 'Unit 101', unitType: 'APARTMENT', squareFootage: 85 } }),
    prisma.unit.create({ data: { propertyId: properties[0].id, unitName: 'Unit 102', unitType: 'APARTMENT', squareFootage: 85 } }),
    prisma.unit.create({ data: { propertyId: properties[0].id, unitName: 'Unit 201', unitType: 'APARTMENT', squareFootage: 100 } }),
    prisma.unit.create({ data: { propertyId: properties[0].id, unitName: 'Villa A', unitType: 'HOUSE', squareFootage: 200 } }),
    // Units for Oyster Bay
    prisma.unit.create({ data: { propertyId: properties[1].id, unitName: 'Main Villa', unitType: 'HOUSE', squareFootage: 350 } }),
    prisma.unit.create({ data: { propertyId: properties[1].id, unitName: 'Guest House', unitType: 'HOUSE', squareFootage: 120 } }),
    // Units for Stone Town
    prisma.unit.create({ data: { propertyId: properties[3].id, unitName: 'Heritage Suite', unitType: 'HOUSE', squareFootage: 150 } }),
    // Units for Nungwi Beach
    prisma.unit.create({ data: { propertyId: properties[4].id, unitName: 'Beach Villa 1', unitType: 'HOUSE', squareFootage: 180 } }),
    prisma.unit.create({ data: { propertyId: properties[4].id, unitName: 'Beach Villa 2', unitType: 'HOUSE', squareFootage: 180 } }),
    prisma.unit.create({ data: { propertyId: properties[4].id, unitName: 'Standard Room 1', unitType: 'APARTMENT', squareFootage: 45 } }),
    // Units for Tanga Harbor
    prisma.unit.create({ data: { propertyId: properties[5].id, unitName: 'Office Suite A', unitType: 'COMMERCIAL', squareFootage: 250 } }),
    prisma.unit.create({ data: { propertyId: properties[5].id, unitName: 'Office Suite B', unitType: 'COMMERCIAL', squareFootage: 250 } }),
    // Units for Safari Lodge
    prisma.unit.create({ data: { propertyId: properties[6].id, unitName: 'Tent 1', unitType: 'HOUSE', squareFootage: 40 } }),
    prisma.unit.create({ data: { propertyId: properties[6].id, unitName: 'Tent 2', unitType: 'HOUSE', squareFootage: 40 } }),
    prisma.unit.create({ data: { propertyId: properties[6].id, unitName: 'Main Lodge', unitType: 'HOUSE', squareFootage: 200 } }),
  ])
  console.log('✓ 15 units created')

  // ============ WALLETS FOR PROVIDERS ============
  const wallets = await Promise.all([
    prisma.wallet.upsert({
      where: { providerId: providerProfiles[0].id },
      update: {},
      create: { providerId: providerProfiles[0].id },
    }),
    prisma.wallet.upsert({
      where: { providerId: providerProfiles[1].id },
      update: {},
      create: { providerId: providerProfiles[1].id },
    }),
    prisma.wallet.upsert({
      where: { providerId: providerProfiles[2].id },
      update: {},
      create: { providerId: providerProfiles[2].id },
    }),
    prisma.wallet.upsert({
      where: { providerId: providerProfiles[3].id },
      update: {},
      create: { providerId: providerProfiles[3].id },
    }),
  ])
  console.log('✓ 4 wallets created')

  // ============ QUOTES → AGREEMENTS → ASSIGNMENTS → INVOICES ============
  // Property index → owner User id mapping (matches seed order above)
  const propertyOwnerUserId: Record<number, string> = {
    0: owners[0].id,
    1: owners[0].id,
    2: owners[0].id,
    3: owners[1].id,
    4: owners[1].id,
    5: owners[2].id,
    6: owners[2].id,
    7: owners[2].id,
  };

  const seedConfigs = [
    { propIdx: 0, svcIdx: 0, providerIdx: 0, status: 'PENDING_ACCEPTANCE' as const, price: 150000 },
    { propIdx: 1, svcIdx: 1, providerIdx: 0, status: 'ACCEPTED' as const, price: 250000, acceptedHoursAgo: 2 },
    { propIdx: 4, svcIdx: 0, providerIdx: 2, status: 'PENDING_ACCEPTANCE' as const, price: 180000 },
    { propIdx: 6, svcIdx: 3, providerIdx: 1, status: 'PENDING_ACCEPTANCE' as const, price: 220000 },
    { propIdx: 3, svcIdx: 2, providerIdx: 2, status: 'COMPLETED' as const, price: 200000, acceptedHoursAgo: 48 },
  ];

  const assignments: Awaited<ReturnType<typeof prisma.assignment.create>>[] = [];
  for (const cfg of seedConfigs) {
    const ownerId = propertyOwnerUserId[cfg.propIdx];

    const quote = await prisma.quote.create({
      data: {
        ownerId,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        quotedPrice: cfg.price,
        priceLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        frequency: 'ONE_TIME',
        status: 'ACCEPTED',
      },
    });

    const agreement = await prisma.agreement.create({
      data: {
        quoteId: quote.id,
        ownerId,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        quotedPrice: cfg.price,
        frequency: 'ONE_TIME',
        status: cfg.status === 'COMPLETED' ? 'ACTIVE' : 'PENDING_ASSIGNMENT',
      },
    });

    const total = cfg.price;
    const providerPayout = total * 0.8;
    const platformFee = total * 0.2;

    const assignment = await prisma.assignment.create({
      data: {
        agreementId: agreement.id,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        providerId: providerProfiles[cfg.providerIdx].id,
        status: cfg.status,
        totalAmount: total,
        providerPayout,
        platformFee,
        acceptedAt:
          cfg.acceptedHoursAgo !== undefined
            ? new Date(Date.now() - cfg.acceptedHoursAgo * 60 * 60 * 1000)
            : undefined,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    await prisma.invoice.create({
      data: {
        agreementId: agreement.id,
        amount: total,
        status: cfg.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidAt: cfg.status === 'COMPLETED' ? new Date(Date.now() - 24 * 60 * 60 * 1000) : null,
      },
    });

    assignments.push(assignment);
  }
  console.log('✓ Quotes, agreements, assignments, invoices seeded');

  // ============ TASKS ============
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        assignmentId: assignments[1].id,
        scheduledFor: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        checkInLatitude: -6.7298,
        checkInLongitude: 39.2745,
      },
    }),
    prisma.task.create({
      data: {
        assignmentId: assignments[4].id,
        scheduledFor: new Date(Date.now() - 30 * 60 * 60 * 1000),
        status: 'COMPLETED',
        checkInLatitude: -6.1655,
        checkInLongitude: 39.2030,
        checkOutTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        evidenceImages: [
          'https://images.unsplash.com/photo-1581578731548-cdea95ad99ae?w=800',
          'https://images.unsplash.com/photo-1581578779238-8b26c9c2ace2?w=800',
          'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd0?w=800',
        ],
      },
    }),
  ])
  console.log('✓ 2 tasks created')

  // ============ WALLET TRANSACTIONS ============
  await Promise.all([
    prisma.walletTransaction.create({
      data: {
        walletId: wallets[2].id,
        type: 'EARNING',
        amount: 200000,
        reference: assignments[4].id,
        status: 'SETTLED',
        runningBalance: 200000,
      },
    }),
  ])
  console.log('✓ Wallet transactions created')

  // ============ ACTIVATE PROPERTIES ============
  await prisma.property.updateMany({ data: { status: 'ACTIVE' } });
  console.log('✓ All properties set to ACTIVE')

  // ============ ADDITIONAL STANDALONE QUOTES ============
  const extraQuotes = [
    { ownerId: owners[0].id, propIdx: 0, svcIdx: 4, price: 120000, status: 'QUOTED' as const, lockedForHours: 24 },
    { ownerId: owners[0].id, propIdx: 1, svcIdx: 5, price: 100000, status: 'EXPIRED' as const, lockedForHours: -48 },
    { ownerId: owners[1].id, propIdx: 3, svcIdx: 6, price: 120000, status: 'QUOTED' as const, lockedForHours: 24 },
    { ownerId: owners[2].id, propIdx: 5, svcIdx: 1, price: 150000, status: 'QUOTED' as const, lockedForHours: 24 },
    { ownerId: owners[2].id, propIdx: 7, svcIdx: 0, price: 50000, status: 'EXPIRED' as const, lockedForHours: -48 },
  ];

  for (const q of extraQuotes) {
    await prisma.quote.create({
      data: {
        ownerId: q.ownerId,
        propertyId: properties[q.propIdx].id,
        serviceTypeId: serviceTypes[q.svcIdx].id,
        quotedPrice: q.price,
        priceLockedUntil: new Date(Date.now() + q.lockedForHours * 60 * 60 * 1000),
        frequency: 'ONE_TIME',
        unitCount: 1,
        status: q.status,
      },
    });
  }
  console.log('✓ 5 standalone quotes created')

  // ============ ADDITIONAL WORK ORDERS WITH VARIED STATUSES ============
  const extraConfigs = [
    { propIdx: 1, svcIdx: 0, providerIdx: 0, ownerIdx: 0, status: 'SCHEDULED' as const, price: 150000, acceptedHoursAgo: 24, agreedStatus: 'ACTIVE' as const },
    { propIdx: 6, svcIdx: 3, providerIdx: 1, ownerIdx: 2, status: 'VERIFIED' as const, price: 200000, acceptedHoursAgo: 72, agreedStatus: 'COMPLETED' as const },
    { propIdx: 4, svcIdx: 4, providerIdx: 2, ownerIdx: 1, status: 'DISPUTED' as const, price: 120000, acceptedHoursAgo: 48, agreedStatus: 'ACTIVE' as const },
    { propIdx: 5, svcIdx: 0, providerIdx: 3, ownerIdx: 2, status: 'COMPLETED' as const, price: 50000, acceptedHoursAgo: 96, agreedStatus: 'ACTIVE' as const },
  ];

  for (const cfg of extraConfigs) {
    const ownerId = owners[cfg.ownerIdx].id;

    const quote = await prisma.quote.create({
      data: {
        ownerId,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        quotedPrice: cfg.price,
        priceLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        frequency: 'ONE_TIME',
        status: 'ACCEPTED',
      },
    });

    const agreement = await prisma.agreement.create({
      data: {
        quoteId: quote.id,
        ownerId,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        quotedPrice: cfg.price,
        frequency: 'ONE_TIME',
        status: cfg.agreedStatus,
      },
    });

    const total = cfg.price;
    const providerPayout = Math.round(total * 0.8);
    const platformFee = total - providerPayout;

    const acceptedAt = new Date(Date.now() - cfg.acceptedHoursAgo * 60 * 60 * 1000);
    const completedAt = cfg.status === 'VERIFIED' || cfg.status === 'COMPLETED'
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : undefined;
    const verifiedAt = cfg.status === 'VERIFIED'
      ? new Date(Date.now() - 12 * 60 * 60 * 1000)
      : undefined;
    const disputedAt = cfg.status === 'DISPUTED'
      ? new Date(Date.now() - 6 * 60 * 60 * 1000)
      : undefined;

    const assignment = await prisma.assignment.create({
      data: {
        agreementId: agreement.id,
        propertyId: properties[cfg.propIdx].id,
        serviceTypeId: serviceTypes[cfg.svcIdx].id,
        providerId: providerProfiles[cfg.providerIdx].id,
        status: cfg.status,
        totalAmount: total,
        providerPayout,
        platformFee,
        acceptedAt,
        completedAt,
        verifiedAt,
        disputedAt,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    await prisma.invoice.create({
      data: {
        agreementId: agreement.id,
        amount: total,
        status: cfg.status === 'VERIFIED' || cfg.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidAt: cfg.status === 'VERIFIED' || cfg.status === 'COMPLETED'
          ? new Date(Date.now() - 24 * 60 * 60 * 1000)
          : null,
      },
    });

    await prisma.task.create({
      data: {
        assignmentId: assignment.id,
        scheduledFor: cfg.status === 'SCHEDULED'
          ? new Date(Date.now() + 2 * 60 * 60 * 1000)
          : new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: cfg.status,
        checkOutTime: cfg.status !== 'SCHEDULED' ? new Date(Date.now() - 20 * 60 * 60 * 1000) : undefined,
        evidenceImages: cfg.status !== 'SCHEDULED'
          ? ['https://images.unsplash.com/photo-1581578731548-cdea95ad99ae?w=800']
          : [],
      },
    });

    if (cfg.status === 'DISPUTED') {
      const disputeTask = await prisma.task.findFirst({
        where: { assignmentId: assignment.id },
      });
      if (disputeTask) {
        await prisma.dispute.create({
          data: {
            taskId: disputeTask.id,
            reason: 'Service was not completed to the agreed standard. Areas were left uncleaned and items were damaged during the cleaning process.',
            status: 'OPEN',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }
  console.log('✓ 4 additional work orders created with varied statuses')

  // ============ AGED PAID INVOICES FOR REPORTS CHARTS ============
  const agedInvoiceConfigs = [
    { ownerIdx: 0, propIdx: 0, svcIdx: 0, price: 50000, monthsAgo: 2 },
    { ownerIdx: 1, propIdx: 3, svcIdx: 2, price: 250000, monthsAgo: 4 },
    { ownerIdx: 2, propIdx: 5, svcIdx: 7, price: 150000, monthsAgo: 5 },
  ];

  for (const acfg of agedInvoiceConfigs) {
    const ownerId = owners[acfg.ownerIdx].id;

    const agedQuote = await prisma.quote.create({
      data: {
        ownerId,
        propertyId: properties[acfg.propIdx].id,
        serviceTypeId: serviceTypes[acfg.svcIdx].id,
        quotedPrice: acfg.price,
        priceLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        frequency: 'ONE_TIME',
        status: 'ACCEPTED',
      },
    });

    const agedAgreement = await prisma.agreement.create({
      data: {
        quoteId: agedQuote.id,
        ownerId,
        propertyId: properties[acfg.propIdx].id,
        serviceTypeId: serviceTypes[acfg.svcIdx].id,
        quotedPrice: acfg.price,
        frequency: 'ONE_TIME',
        status: 'COMPLETED',
      },
    });

    const paidAt = new Date();
    paidAt.setMonth(paidAt.getMonth() - acfg.monthsAgo);
    paidAt.setDate(15);

    const dueAt = new Date(paidAt);
    dueAt.setDate(dueAt.getDate() + 30);

    await prisma.invoice.create({
      data: {
        agreementId: agedAgreement.id,
        amount: acfg.price,
        status: 'PAID',
        dueAt,
        paidAt,
      },
    });
  }
  console.log('✓ 3 aged paid invoices created for reports charts')

  // ============ UTILITY BILLS ============
  const utilityBills = [
    { propIdx: 0, type: 'WATER' as const, amount: 450000, period: 'March 2026' },
    { propIdx: 0, type: 'ELECTRICITY' as const, amount: 850000, period: 'March 2026' },
    { propIdx: 1, type: 'WATER' as const, amount: 600000, period: 'March 2026' },
    { propIdx: 1, type: 'ELECTRICITY' as const, amount: 1200000, period: 'March 2026' },
    { propIdx: 1, type: 'WASTE' as const, amount: 150000, period: 'March 2026' },
    { propIdx: 3, type: 'WATER' as const, amount: 300000, period: 'March 2026' },
    { propIdx: 3, type: 'ELECTRICITY' as const, amount: 700000, period: 'March 2026' },
    { propIdx: 6, type: 'ELECTRICITY' as const, amount: 950000, period: 'March 2026' },
  ];

  for (const ub of utilityBills) {
    await prisma.utilityBill.create({
      data: {
        propertyId: properties[ub.propIdx].id,
        type: ub.type,
        amount: ub.amount,
        billingPeriod: ub.period,
        allocationMethod: 'PER_UNIT',
      },
    });
  }
  console.log('✓ 8 utility bills created')

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Email: admin@oweru.co.tz | Password: password | Role: ADMIN')
  console.log('   Email: juma@hamisi.co.tz | Password: password | Role: OWNER')
  console.log('   Email: amira@zanzibar.estate | Password: password | Role: OWNER')
  console.log('   Email: moses@tanga.properties | Password: password | Role: OWNER')
  console.log('   Email: cleanpro@dar.co.tz | Password: password | Role: PROVIDER')
  console.log('   Email: safarihome@arusha.co.tz | Password: password | Role: PROVIDER')
  console.log('   Email: zanziclean@zanzibar.co.tz | Password: password | Role: PROVIDER')
  console.log('   Email: mwanzaprops@mwanzaclean.co.tz | Password: password | Role: PROVIDER')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })