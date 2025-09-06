"use client"

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface NotificationData {
  type: string
  data: {
    applicationId?: string
    trackingNumber?: string
    status?: string
    message?: string
    serviceName?: string
    documentName?: string
    timestamp?: string
  }
}

export const useSocket = () => {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!session) return

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Join user room or admin room
    if (session.user.role === 'ADMIN') {
      socket.emit('join-admin-room')
    } else {
      socket.emit('join-user-room', session.user.id)
    }

    // Listen for application updates (for users)
    socket.on('application-updated', (data: NotificationData) => {
      if (session.user.role === 'USER') {
        const statusText = getStatusText(data.data.status || '')
        toast.success(`Status permohonan ${data.data.trackingNumber} diperbarui menjadi ${statusText}`)
      }
    })

    // Listen for document ready notifications (for users)
    socket.on('document-ready', (data: NotificationData) => {
      if (session.user.role === 'USER') {
        toast.success(data.data.message || 'Dokumen Anda sudah siap!')
      }
    })

    // Listen for new applications (for admins)
    socket.on('new-application-received', (data: NotificationData) => {
      if (session.user.role === 'ADMIN') {
        toast.info(`Permohonan baru: ${data.data.serviceName} (${data.data.trackingNumber})`)
      }
    })

    // Listen for admin application updates (for admins)
    socket.on('admin-application-updated', (data: NotificationData) => {
      if (session.user.role === 'ADMIN') {
        const statusText = getStatusText(data.data.status || '')
        toast.info(`Permohonan ${data.data.trackingNumber} diperbarui menjadi ${statusText}`)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [session])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'PROCESSING':
        return 'Diproses'
      case 'COMPLETED':
        return 'Selesai'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return socketRef.current
}