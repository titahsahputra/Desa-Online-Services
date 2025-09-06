import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // Get current service status
    const service = await db.service.findUnique({
      where: {
        id: params.id
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Toggle status
    const updatedService = await db.service.update({
      where: {
        id: params.id
      },
      data: {
        isActive: !service.isActive
      }
    })

    return NextResponse.json({
      service: updatedService,
      message: `Service ${!service.isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error("Error toggling service status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}