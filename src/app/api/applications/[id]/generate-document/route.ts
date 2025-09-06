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

export async function POST(
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

    // Get application with related data
    const application = await db.application.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: true,
        service: {
          include: {
            templates: {
              where: {
                isActive: true
              },
              take: 1
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Get template
    const template = application.service.templates[0]
    if (!template) {
      return NextResponse.json(
        { error: "Template not found for this service" },
        { status: 404 }
      )
    }

    // Generate document content using template
    const documentContent = generateDocumentFromTemplate(template.content, application)

    // Create document record
    const document = await db.document.create({
      data: {
        filename: `${application.service.name.replace(/\s+/g, '_')}_${application.trackingNumber}.txt`,
        content: documentContent,
        applicationId: application.id,
        templateId: template.id
      }
    })

    // Update application status to completed
    await db.application.update({
      where: {
        id: params.id
      },
      data: {
        status: "COMPLETED"
      }
    })

    // Emit socket notification for document generation
    const socketIo = getSocketServer()
    socketIo.emit('document-generated', {
      applicationId: application.id,
      trackingNumber: application.trackingNumber,
      userId: application.user.id,
      documentName: document.filename
    })

    // Also emit status update
    socketIo.emit('application-status-update', {
      applicationId: application.id,
      trackingNumber: application.trackingNumber,
      status: "COMPLETED",
      userId: application.user.id,
      message: "Dokumen sudah siap dan dapat diunduh"
    })

    return NextResponse.json({
      document,
      message: "Document generated successfully"
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateDocumentFromTemplate(templateContent: string, application: any): string {
  const data = application.data
  const currentDate = new Date().toLocaleDateString('id-ID')
  
  let content = templateContent

  // Replace placeholders with actual data
  const replacements = {
    '{{trackingNumber}}': application.trackingNumber,
    '{{currentDate}}': currentDate,
    '{{fullName}}': data.fullName || '',
    '{{email}}': data.email || '',
    '{{phone}}': data.phone || '',
    '{{address}}': data.address || '',
    '{{nik}}': data.nik || '',
    '{{birthPlace}}': data.birthPlace || '',
    '{{birthDate}}': data.birthDate || '',
    '{{gender}}': data.gender === 'L' ? 'Laki-laki' : (data.gender === 'P' ? 'Perempuan' : ''),
    '{{occupation}}': data.occupation || '',
    '{{purpose}}': data.purpose || '',
    '{{additionalInfo}}': data.additionalInfo || 'Tidak ada informasi tambahan'
  }

  // Apply all replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    content = content.replace(new RegExp(placeholder, 'g'), value.toString())
  })

  return content
}