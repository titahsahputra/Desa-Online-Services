import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createServer } from "http"
import { Server } from "socket.io"
import { setupSocket } from "@/lib/socket"

// Initialize Socket.IO server
let io: Server

function getSocketServer() {
  if (!io) {
    const server = createServer()
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    setupSocket(io)
    server.listen(3001) // Use different port for Socket.IO
  }
  return io
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status, notes } = await request.json()

    const application = await db.application.update({
      where: {
        id: params.id
      },
      data: {
        status,
        notes: notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    // Emit socket notification for status update
    const socketIo = getSocketServer()
    socketIo.emit('application-status-update', {
      applicationId: application.id,
      trackingNumber: application.trackingNumber,
      status: application.status,
      userId: application.user.id,
      message: `Status permohonan diperbarui menjadi ${application.status}`
    })

    return NextResponse.json({
      application
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}