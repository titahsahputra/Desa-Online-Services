import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, Download } from "lucide-react";

export default function Home() {
  const services = [
    "Akta Kelahiran Terlambat",
    "Akta Kelahiran Baru", 
    "Akta Kematian",
    "Kartu Keluarga",
    "Pindah Dalam Kabupaten",
    "Persyaratan Pernikahan N1 Perempuan",
    "SKCK",
    "SKU",
    "SKTM",
    "SKHT",
    "Jual Beli Tanah",
    "Mutasi/Perbaikan SPPT",
    "Persyaratan Surat Kuasa"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sistem Pelayanan Desa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pelayanan Administrasi Desa Terpadu
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ajukan permohonan layanan administrasi desa secara online dengan mudah dan cepat.
            Pantau status permohonan Anda dan unduh dokumen yang sudah selesai.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Mulai Sekarang
              </Button>
            </Link>
            <Link href="#layanan">
              <Button variant="outline" size="lg" className="px-8">
                Lihat Layanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Keunggulan Layanan Kami</h3>
            <p className="text-lg text-gray-600">
              Nikmati kemudahan mengurus administrasi desa dengan sistem online terintegrasi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-lg">Pengajuan Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ajukan permohonan layanan kapan saja dan di mana saja melalui sistem online
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-lg">Proses Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Permohonan Anda diproses secara cepat oleh admin desa yang profesional
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-lg">Aman & Terpercaya</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Data pribadi Anda terlindungi dengan sistem keamanan yang terjamin
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Download className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <CardTitle className="text-lg">Dokumen Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Unduh dokumen yang sudah selesai dalam format PDF secara langsung
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Layanan Tersedia</h3>
            <p className="text-lg text-gray-600">
              Berbagai layanan administrasi desa dapat Anda ajukan secara online
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{service}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap Mengajukan Layanan?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Daftar sekarang dan nikmati kemudahan pelayanan administrasi desa online
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8">
              Daftar Akun
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Sistem Pelayanan Desa. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}