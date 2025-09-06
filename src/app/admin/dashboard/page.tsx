"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, Settings, Eye, CheckCircle, XCircle, Clock, LogOut, Bell } from "lucide-react"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"

interface Application {
  id: string
  trackingNumber: string
  status: string
  createdAt: string
  data: any
  notes?: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    name: string
    code: string
  }
  documents: Array<{
    id: string
    filename: string
    createdAt: string
  }>
}

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  processingApplications: number
  completedApplications: number
  totalUsers: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    processingApplications: 0,
    completedApplications: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/user/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && session.user.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [session])

  // Setup real-time notifications for admin
  useSocket()

  const fetchDashboardData = async () => {
    try {
      const [applicationsResponse, statsResponse] = await Promise.all([
        fetch("/api/applications/admin"),
        fetch("/api/admin/stats")
      ])

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.applications)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      toast.error("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
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

  const handleViewApplication = (applicationId: string) => {
    router.push(`/admin/applications/${applicationId}`)
  }

  const handleLogout = async () => {
    await router.push("/auth/login")
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

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const pendingApplications = applications.filter(app => app.status === "PENDING")
  const processingApplications = applications.filter(app => app.status === "PROCESSING")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, {session.user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </div>
              <Link href="/admin/services">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Kelola Layanan
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permohonan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diproses</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Menunggu ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Diproses ({processingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Semua ({applications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Permohonan Menunggu Proses</CardTitle>
                <CardDescription>
                  Permohonan yang perlu segera diproses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tracking</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada permohonan menunggu</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.trackingNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.user.name}</div>
                              <div className="text-sm text-gray-500">{application.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{application.service.name}</TableCell>
                          <TableCell>
                            {new Date(application.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(application.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Proses
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing">
            <Card>
              <CardHeader>
                <CardTitle>Permohonan Sedang Diproses</CardTitle>
                <CardDescription>
                  Permohonan yang sedang dalam proses penyelesaian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tracking</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processingApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada permohonan diproses</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      processingApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.trackingNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.user.name}</div>
                              <div className="text-sm text-gray-500">{application.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{application.service.name}</TableCell>
                          <TableCell>
                            {new Date(application.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(application.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Semua Permohonan</CardTitle>
                <CardDescription>
                  Daftar semua permohonan yang masuk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tracking</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada permohonan</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.trackingNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.user.name}</div>
                              <div className="text-sm text-gray-500">{application.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{application.service.name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(application.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(application.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}