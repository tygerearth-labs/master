import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/admin/users — List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          outlet: { select: { id: true, name: true, accountType: true, planExpiresAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        outlet: u.outlet,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users — Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, outletId } = body

    // Validate required fields
    if (!name || !email || !password || !outletId) {
      return NextResponse.json(
        { error: 'Name, email, password, and outletId are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Verify outlet exists
    const outlet = await db.outlet.findUnique({ where: { id: outletId } })
    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Validate role
    const userRole = role || 'CREW'
    if (userRole !== 'OWNER' && userRole !== 'CREW') {
      return NextResponse.json(
        { error: 'Role must be OWNER or CREW' },
        { status: 400 }
      )
    }

    // Create user — catch unique constraint violation on email+outletId
    let user
    try {
      user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: userRole,
          outletId,
        },
      })
    } catch (err: unknown) {
      // Prisma unique constraint error
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        return NextResponse.json(
          { error: 'A user with this email already exists in this outlet' },
          { status: 409 }
        )
      }
      throw err
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        outletId,
        details: JSON.stringify({ name: user.name, email: user.email, role: userRole }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/users]', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
