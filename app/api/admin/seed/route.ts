import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/models/User"
import { SubscriptionPlan } from "@/models/SubscriptionPlan"
import { BlogCategory } from "@/models/BlogCategory"

// Environment variable for seed security key
// This should be set in your environment variables
const SEED_SECRET_KEY = process.env.SEED_SECRET_KEY

/**
 * API Route to seed the database with initial data
 * This is a protected route that requires a secret key
 *
 * @route GET /api/seed
 * @query key - Secret key for authorization
 * @returns {object} Status and details of the seeding operation
 */
export async function GET(request: NextRequest) {
  // Security check - require a secret key
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (!SEED_SECRET_KEY || key !== SEED_SECRET_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
  }

  try {

    // Track what was seeded
    const seededData = {
      users: 0,
      subscriptionPlans: 0,
      categories: 0,
    }

    // Create default subscription plans if they don't exist
    const subscriptionPlans = [
      {
        name: "رایگان",
        price: 0,
        durationDays: 7,
        durationHours: 0,
        features: ["دسترسی به مقالات پایه", "امکان مشاهده تحلیل‌های عمومی"],
        isFree: true,
        isActive: true,
      },
      {
        name: "پایه",
        price: 99000,
        durationDays: 30,
        durationHours: 0,
        features: ["دسترسی به تمام مقالات", "امکان مشاهده تحلیل‌های اختصاصی", "پشتیبانی ایمیلی"],
        isFree: false,
        isActive: true,
      },
      {
        name: "حرفه‌ای",
        price: 299000,
        durationDays: 30,
        durationHours: 0,
        features: [
          "دسترسی به تمام مقالات",
          "امکان مشاهده تحلیل‌های اختصاصی",
          "پشتیبانی تلفنی",
          "دسترسی به وبینارهای آموزشی",
        ],
        isFree: false,
        isActive: true,
      },
    ]

    // Create subscription plans
    for (const planData of subscriptionPlans) {
      const existingPlan = await SubscriptionPlan.findOne({
        name: planData.name,
      })

      if (!existingPlan) {
        await SubscriptionPlan.create(planData)
        console.log(`Created subscription plan: ${planData.name}`)
      }
    }

    seededData.subscriptionPlans = 3

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ phone: "09123456789", role: "admin" })

    if (!adminExists) {
      await User.create({
        phone: "09123456789",
        fullName: "Admin User",
        role: "admin",
        subscriptionPlan: subscriptionPlans[2]._id, // Assign the "حرفه‌ای" plan
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      })
      seededData.users++
    }

    // Create default blog categories
    const defaultCategories = ["Market Analysis", "Technical Analysis", "Fundamental Analysis", "News"]

    for (const categoryName of defaultCategories) {
      const categoryExists = await BlogCategory.findOne({ name: categoryName })

      if (!categoryExists) {
        await BlogCategory.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          description: `Articles about ${categoryName}`,
        })
        seededData.categories++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      seeded: seededData,
    })
  } catch (error) {
    console.error("Seeding error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * Helper function to seed a subscription plan
 * Uses findOneAndUpdate with upsert to ensure idempotency
 */
async function seedSubscriptionPlan(planData: {
  name: string
  price: number
  durationDays: number
  features: string[]
  isDefault: boolean
}) {
  return await SubscriptionPlan.findOneAndUpdate(
    { name: planData.name },
    {
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  )
}
