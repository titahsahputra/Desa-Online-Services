"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description: string
  code: string
}

interface FormData {
  fullName: string
  email: string
  phone: string
  address: string
  nik: string
  birthDate: string
  birthPlace: string
  gender: string
  occupation: string
  purpose: string
  additionalInfo: string
}

export default function ApplyService() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    nik: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    occupation: "",
    purpose: "",
    additionalInfo: ""
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchService()
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: session.user.name || "",
        email: session.user.email || ""
      }))
    }
  }, [session, params.id])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setService(data.service)
      }
    } catch (error) {
      toast.error("Gagal memuat data layanan")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: params.id,
          data: formData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Permohonan berhasil diajukan!")
        router.push("/user/dashboard")
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal mengajukan permohonan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
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

  if (!session || !service) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user/services">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ajukan Layanan</h1>
                <p className="text-gray-600">{service.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Formulir Permohonan</CardTitle>
                <CardDescription>
                  Isi formulir berikut untuk mengajukan permohonan layanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Pribadi</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nama Lengkap *</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">No. Telepon *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="nik">NIK *</Label>
                        <Input
                          id="nik"
                          type="text"
                          value={formData.nik}
                          onChange={(e) => handleInputChange("nik", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                        <Input
                          id="birthPlace"
                          type="text"
                          value={formData.birthPlace}
                          onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Alamat Lengkap *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Jenis Kelamin *</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="occupation">Pekerjaan *</Label>
                      <Input
                        id="occupation"
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tujuan Permohonan</h3>
                    
                    <div>
                      <Label htmlFor="purpose">Tujuan *</Label>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => handleInputChange("purpose", e.target.value)}
                        placeholder="Jelaskan tujuan pengajuan layanan ini..."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="additionalInfo">Informasi Tambahan</Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Informasi tambahan yang perlu disampaikan (opsional)"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengajukan...
                      </>
                    ) : (
                      "Ajukan Permohonan"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Informasi Layanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kode Layanan</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {service.code}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Petunjuk Pengisian</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Isi semua field yang bertanda *</li>
                  <li>• Pastikan data yang diisi sudah benar</li>
                  <li>• NIK harus 16 digit</li>
                  <li>• Email dan telepon harus valid</li>
                  <li>• Dokumen akan diproses dalam 1-3 hari kerja</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}