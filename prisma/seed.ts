import { db } from '../src/lib/db'

async function main() {
  // Create demo users
  const adminUser = await db.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin Desa',
      role: 'ADMIN',
    },
  })

  const regularUser = await db.user.create({
    data: {
      email: 'user@example.com',
      name: 'User Demo',
      role: 'USER',
    },
  })

  // Create services
  const services = [
    { name: 'Akta Kelahiran Terlambat', code: 'AKT_LAHIR_TERLAMBAT', description: 'Pengurusan akta kelahiran yang terlambat' },
    { name: 'Akta Kelahiran Baru', code: 'AKT_LAHIR_BARU', description: 'Pengurusan akta kelahiran baru' },
    { name: 'Akta Kematian', code: 'AKT_KEMATIAN', description: 'Pengurusan akta kematian' },
    { name: 'Kartu Keluarga', code: 'KARTU_KELUARGA', description: 'Pengurusan kartu keluarga' },
    { name: 'Pindah Dalam Kabupaten', code: 'PINDAH_KABUPATEN', description: 'Surat pindah dalam kabupaten' },
    { name: 'Persyaratan Pernikahan N1 Perempuan', code: 'NIKAH_N1_PEREMPUAN', description: 'Persyaratan pernikahan N1 untuk perempuan' },
    { name: 'SKCK', code: 'SKCK', description: 'Surat Keterangan Catatan Kepolisian' },
    { name: 'SKU', code: 'SKU', description: 'Surat Keterangan Usaha' },
    { name: 'SKTM', code: 'SKTM', description: 'Surat Keterangan Tidak Mampu' },
    { name: 'SKHT', code: 'SKHT', description: 'Surat Keterangan Hubungan Keluarga' },
    { name: 'Jual Beli Tanah', code: 'JUAL_BELI_TANAH', description: 'Surat jual beli tanah' },
    { name: 'Mutasi/Perbaikan SPPT', code: 'MUTASI_SPPT', description: 'Mutasi atau perbaikan SPPT PBB' },
    { name: 'Persyaratan Surat Kuasa', code: 'SURAT_KUASA', description: 'Persyaratan pembuatan surat kuasa' },
  ]

  for (const service of services) {
    await db.service.create({
      data: service,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin user:', adminUser)
  console.log('Regular user:', regularUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })