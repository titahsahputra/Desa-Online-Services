"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Search } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description: string
  code: string
  isActive: boolean
}

export default function UserServices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchServices()
    }
  }, [session])

  useEffect(() => {
    if (services.length > 0) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredServices(filtered)
    }
  }, [services, searchTerm])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
        setFilteredServices(data.services)
      }
    } catch (error) {
      toast.error("Gagal memuat data layanan")
    } finally {
      setLoading(false)
    }
  }

  const handleApplyService = (serviceId: string) => {
    router.push(`/user/services/${serviceId}/apply`)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Layanan Tersedia</h1>
                <p className="text-gray-600">Pilih layanan yang ingin Anda ajukan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description || "Tidak ada deskripsi"}
                    </CardDescription>
                  </div>
                  <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Aktif" : "Non-aktif"}
                  </Badge>
                  <Button
                    onClick={() => handleApplyService(service.id)}
                    disabled={!service.isActive}
                    size="sm"
                  >
                    Ajukan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Tidak ada layanan ditemukan" : "Tidak ada layanan tersedia"}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? "Coba kata kunci lain" : "Silakan kembali lagi nanti"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}