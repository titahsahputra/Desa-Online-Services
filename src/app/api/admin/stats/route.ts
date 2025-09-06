import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [totalApplications, pendingApplications, processingApplications, completedApplications, totalUsers] = await Promise.all([
      db.application.count(),
      db.application.count({ where: { status: "PENDING" } }),
      db.application.count({ where: { status: "PROCESSING" } }),
      db.application.count({ where: { status: "COMPLETED" } }),
      db.user.count({ where: { role: "USER" } })
    ])

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      processingApplications,
      completedApplications,
      totalUsers
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}