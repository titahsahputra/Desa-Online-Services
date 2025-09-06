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

function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TRX-${timestamp}-${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { serviceId, data } = await request.json()

    // Validate required fields
    if (!serviceId || !data) {
      return NextResponse.json(
        { error: "Service ID and data are required" },
        { status: 400 }
      )
    }

    // Check if service exists
    const service = await db.service.findUnique({
      where: {
        id: serviceId,
        isActive: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Create application
    const application = await db.application.create({
      data: {
        trackingNumber: generateTrackingNumber(),
        status: "PENDING",
        data: data,
        userId: session.user.id,
        serviceId: serviceId
      },
      include: {
        service: {
          select: {
            name: true,
            code: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Emit socket notification for new application
    const socketIo = getSocketServer()
    socketIo.emit('new-application', {
      applicationId: application.id,
      trackingNumber: application.trackingNumber,
      userId: application.userId,
      serviceName: application.service.name
    })

    return NextResponse.json({
      application,
      message: "Application created successfully"
    })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}