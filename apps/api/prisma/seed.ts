import { PrismaClient, AvailabilityStatus, SkillCategory, SkillLevel, JobStatus, UrgencyLevel, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertSkills() {
  const skills = [
    { name: 'Plumbing - Pipe Repair', category: SkillCategory.PLUMBING },
    { name: 'Plumbing - Leak Fix', category: SkillCategory.PLUMBING },
    { name: 'Electrical - Wiring', category: SkillCategory.ELECTRICAL },
    { name: 'Electrical - Appliance Repair', category: SkillCategory.ELECTRICAL },
    { name: 'Carpentry - Furniture', category: SkillCategory.CARPENTRY },
    { name: 'Cleaning - Deep Clean', category: SkillCategory.CLEANING },
    { name: 'Delivery - Local Courier', category: SkillCategory.DELIVERY },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
}

async function createUsersAndWorkers() {
  // Create one client
  const client = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      name: 'Homeowner One',
      email: 'client1@example.com',
      phone: '+10000000001',
      role: 'CLIENT',
    },
  });

  // Workers in a city (example: Hyderabad coordinates)
  const workersData = [
    {
      user: { name: 'Ravi Kumar', email: 'ravi.plumber@example.com', phone: '+10000000011' },
      hourlyRate: 20,
      bio: 'Expert plumber specializing in leak fixes and pipe repairs.',
      availability: AvailabilityStatus.AVAILABLE,
      coords: { lat: 17.3850, lng: 78.4867 },
      skills: [
        { name: 'Plumbing - Leak Fix', level: SkillLevel.EXPERT },
        { name: 'Plumbing - Pipe Repair', level: SkillLevel.INTERMEDIATE },
      ],
    },
    {
      user: { name: 'Sumanth Reddy', email: 'sumanth.elec@example.com', phone: '+10000000012' },
      hourlyRate: 25,
      bio: 'Licensed electrician available for wiring and appliance repair.',
      availability: AvailabilityStatus.AVAILABLE,
      coords: { lat: 17.4401, lng: 78.3489 },
      skills: [
        { name: 'Electrical - Wiring', level: SkillLevel.EXPERT },
        { name: 'Electrical - Appliance Repair', level: SkillLevel.INTERMEDIATE },
      ],
    },
    {
      user: { name: 'Aditya Verma', email: 'aditya.carp@example.com', phone: '+10000000013' },
      hourlyRate: 18,
      bio: 'Carpenter focusing on furniture assembly and repair.',
      availability: AvailabilityStatus.BUSY,
      coords: { lat: 17.4239, lng: 78.4738 },
      skills: [
        { name: 'Carpentry - Furniture', level: SkillLevel.INTERMEDIATE },
      ],
    },
  ];

  for (const w of workersData) {
    const user = await prisma.user.upsert({
      where: { email: w.user.email },
      update: {},
      create: {
        name: w.user.name,
        email: w.user.email,
        phone: w.user.phone,
        role: 'WORKER',
      },
    });

    const worker = await prisma.worker.upsert({
      where: { userId: user.id },
      update: {
        hourlyRate: w.hourlyRate,
        bio: w.bio,
        availability: w.availability,
      },
      create: {
        userId: user.id,
        hourlyRate: w.hourlyRate,
        bio: w.bio,
        availability: w.availability,
      },
    });

    // Location
    await prisma.workerLocation.upsert({
      where: { workerId: worker.id },
      update: {
        latitude: w.coords.lat,
        longitude: w.coords.lng,
        address: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      },
      create: {
        workerId: worker.id,
        latitude: w.coords.lat,
        longitude: w.coords.lng,
        address: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      },
    });

    // Skills
    for (const s of w.skills) {
      const skill = await prisma.skill.findUnique({ where: { name: s.name } });
      if (skill) {
        await prisma.workerSkill.upsert({
          where: { workerId_skillId: { workerId: worker.id, skillId: skill.id } },
          update: { level: s.level, verified: true },
          create: { workerId: worker.id, skillId: skill.id, level: s.level, verified: true },
        });
      }
    }
  }

  return { client };
}

async function createJobs(clientId: string) {
  const jobs = [
    {
      title: 'Fix kitchen sink leak',
      description: 'Water leaking under the sink, need urgent fix',
      category: SkillCategory.PLUMBING,
      price: 1200,
      status: JobStatus.PENDING,
      urgency: UrgencyLevel.URGENT,
      location: { lat: 17.385, lng: 78.4867, address: 'Banjara Hills, Hyderabad' },
    },
    {
      title: 'Install ceiling fan',
      description: 'Require wiring and installation for a ceiling fan',
      category: SkillCategory.ELECTRICAL,
      price: 900,
      status: JobStatus.PENDING,
      urgency: UrgencyLevel.MEDIUM,
      location: { lat: 17.44, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
    },
    {
      title: 'Repair wooden chair',
      description: 'One leg is loose, needs fixing',
      category: SkillCategory.CARPENTRY,
      price: 500,
      status: JobStatus.PENDING,
      urgency: UrgencyLevel.LOW,
      location: { lat: 17.4239, lng: 78.4738, address: 'Hitech City, Hyderabad' },
    },
  ];

  for (const j of jobs) {
    const job = await prisma.job.create({
      data: {
        clientId,
        title: j.title,
        description: j.description,
        category: j.category,
        price: j.price,
        status: j.status,
        urgency: j.urgency,
      },
    });

    await prisma.jobLocation.create({
      data: {
        jobId: job.id,
        latitude: j.location.lat,
        longitude: j.location.lng,
        address: j.location.address,
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding database with sample data...');
  await upsertSkills();
  const { client } = await createUsersAndWorkers();
  await createJobs(client.id);
  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


