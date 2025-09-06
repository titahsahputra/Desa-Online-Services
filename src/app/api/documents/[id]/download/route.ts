import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const document = await db.document.findUnique({
      where: {
        id: params.id
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to download this document
    if (session.user.role !== "ADMIN" && document.application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Create a simple text file for demo purposes
    // In production, you would generate a proper PDF
    const blob = new Blob([document.content], { type: 'text/plain' })
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${document.filename}"`
      }
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}