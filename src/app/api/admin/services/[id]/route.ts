import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
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

    // Check if service exists
    const service = await db.service.findUnique({
      where: {
        id: params.id
      },
      include: {
        applications: {
          select: {
            id: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Check if service has applications
    if (service.applications.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with existing applications" },
        { status: 400 }
      )
    }

    // Delete service
    await db.service.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      message: "Service deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}