import 'dotenv/config';
import { prisma } from '../src/config/prisma';

async function main() {
  const villagesList = [
    { id: '0ad6217e-0999-47a0-acc2-e9378372b4b8', name: 'Thôn 1' },
    { id: '1be7328f-1aa0-58b1-bdd3-fa489483c5c9', name: 'Thôn 2' },
    { id: '2cf84390-2bb1-69c2-cee4-0b590594d6da', name: 'Thôn 3' },
    { id: '3da95401-3cc2-7ad3-dff5-1c601605e7eb', name: 'Thôn 4' },
    { id: '4eb06512-4dd3-8be4-eaa6-2d712716f8fc', name: 'Thôn Kon Trang Long Loi' },
    { id: '5fc17623-5ee4-9cf5-fbb7-3e823827a9ad', name: 'Thôn Kon Tu Dô 1' },
    { id: '6ad28734-6ff5-0da6-0cc8-4f934938b0be', name: 'Thôn Kon Tu Dô 2' },
  ];

  console.log('Seeding villages for QLNN...');
  for (const v of villagesList) {
    await prisma.villages.upsert({
      where: { id: v.id },
      update: { name: v.name },
      create: { id: v.id, name: v.name },
    });
    console.log(`  ✅ Synced village: ${v.name} (${v.id})`);
  }
  console.log('Village seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
