import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding workforce types...');

  // 1. Create or update Blue Collar workforce type
  const blueCollar = await prisma.workforceType.upsert({
    where: { name: 'BLUE_COLLAR' },
    update: { displayName: 'Blue Collar', isActive: true },
    create: { name: 'BLUE_COLLAR', displayName: 'Blue Collar', isActive: true },
  });

  // 2. Create or update White Collar workforce type
  const whiteCollar = await prisma.workforceType.upsert({
    where: { name: 'WHITE_COLLAR' },
    update: { displayName: 'White Collar', isActive: true },
    create: { name: 'WHITE_COLLAR', displayName: 'White Collar', isActive: true },
  });

  console.log('Workforce types seeded successfully:', { blueCollar, whiteCollar });

  // 3. Map existing categories to workforce types
  console.log('Migrating existing service categories to workforce types...');
  
  const categories = await prisma.serviceCategory.findMany();
  let migratedCount = 0;

  for (const cat of categories) {
    let targetWorkforceId = '';
    if (cat.categoryType === 'BLUE_COLLAR') {
      targetWorkforceId = blueCollar.id;
    } else if (cat.categoryType === 'WHITE_COLLAR') {
      targetWorkforceId = whiteCollar.id;
    }

    if (targetWorkforceId) {
      await prisma.serviceCategory.update({
        where: { id: cat.id },
        data: { workforceTypeId: targetWorkforceId },
      });
      migratedCount++;
    }
  }

  console.log(`Successfully mapped ${migratedCount} service categories to workforce types.`);
}

main()
  .catch((e) => {
    console.error('Error seeding workforce classification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
