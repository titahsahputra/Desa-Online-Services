"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, User, Calendar, CheckCircle, XCircle, Clock, Download } from "lucide-react"
import { toast } from "sonner"

interface Application {
  id: string
  trackingNumber: string
  status: string
  data: any
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    id: string
    name: string
    code: string
  }
  documents: Array<{
    id: string
    filename: string
    createdAt: string
  }>
}

export default function ApplicationDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/user/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && session.user.role === "ADMIN" && params.id) {
      fetchApplication()
    }
  }, [session, params.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data.application)
        setNotes(data.application.notes || "")
      }
    } catch (error) {
      toast.error("Gagal memuat data permohonan")
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
        }),
      })

      if (response.ok) {
        setApplication(prev => prev ? { ...prev, status: newStatus, notes } : null)
        toast.success(`Status permohonan berhasil diperbarui`)
      }
    } catch (error) {
      toast.error("Gagal memperbarui status permohonan")
    } finally {
      setUpdating(false)
    }
  }

  const generateDocument = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/generate-document`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Dokumen berhasil dibuat")
        fetchApplication() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal membuat dokumen")
      }
    } catch (error) {
      toast.error("Gagal membuat dokumen")
    } finally {
      setGenerating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Dokumen berhasil diunduh")
      }
    } catch (error) {
      toast.error("Gagal mengunduh dokumen")
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Menunggu"
      case "PROCESSING":
        return "Diproses"
      case "COMPLETED":
        return "Selesai"
      case "REJECTED":
        return "Ditolak"
      default:
        return status
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

  if (!session || session.user.role !== "ADMIN" || !application) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Permohonan</h1>
                <p className="text-gray-600">
                  No. Tracking: {application.trackingNumber}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {getStatusText(application.status)}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="data" className="space-y-4">
              <TabsList>
                <TabsTrigger value="data">Data Permohonan</TabsTrigger>
                <TabsTrigger value="documents">Dokumen</TabsTrigger>
                <TabsTrigger value="notes">Catatan</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Permohonan</CardTitle>
                    <CardDescription>
                      Informasi detail dari permohonan yang diajukan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Nama Pemohon</Label>
                          <p className="text-sm">{application.user.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email Pemohon</Label>
                          <p className="text-sm">{application.user.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Layanan</Label>
                          <p className="text-sm">{application.service.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Tanggal Pengajuan</Label>
                          <p className="text-sm">
                            {new Date(application.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Data Form</Label>
                        <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                          {JSON.stringify(application.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Dokumen</CardTitle>
                    <CardDescription>
                      Dokumen yang terkait dengan permohonan ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {application.documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Belum ada dokumen</p>
                        {(application.status === "PROCESSING" || application.status === "PENDING") && (
                          <Button 
                            onClick={generateDocument} 
                            className="mt-4"
                            disabled={generating}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {generating ? "Membuat..." : "Generate Dokumen"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {application.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{doc.filename}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadDocument(doc.id, doc.filename)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Unduh
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Catatan</CardTitle>
                    <CardDescription>
                      Catatan internal untuk permohonan ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Tambahkan catatan untuk permohonan ini..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.status === "PENDING" && (
                  <>
                    <Button
                      onClick={() => updateApplicationStatus("PROCESSING")}
                      disabled={updating}
                      className="w-full"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Proses Permohonan
                    </Button>
                    <Button
                      onClick={generateDocument}
                      disabled={generating}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {generating ? "Membuat Dokumen..." : "Generate Dokumen"}
                    </Button>
                  </>
                )}
                
                {application.status === "PROCESSING" && (
                  <>
                    <Button
                      onClick={() => updateApplicationStatus("COMPLETED")}
                      disabled={updating}
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selesaikan
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus("REJECTED")}
                      disabled={updating}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                    <Button
                      onClick={generateDocument}
                      disabled={generating}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {generating ? "Membuat..." : "Generate Dokumen"}
                    </Button>
                  </>
                )}
                
                {application.status === "COMPLETED" && (
                  <Button
                    onClick={() => updateApplicationStatus("PROCESSING")}
                    disabled={updating}
                    variant="outline"
                    className="w-full"
                  >
                    Kembali ke Proses
                  </Button>
                )}
                
                {application.status === "REJECTED" && (
                  <Button
                    onClick={() => updateApplicationStatus("PENDING")}
                    disabled={updating}
                    variant="outline"
                    className="w-full"
                  >
                    Kembalikan ke Menunggu
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Pemohon</p>
                    <p className="text-sm text-gray-500">{application.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Layanan</p>
                    <p className="text-sm text-gray-500">{application.service.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Tanggal</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}