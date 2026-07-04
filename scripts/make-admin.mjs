import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"

/**
 * Promote (or create) a user as an admin by phone number.
 *
 * Usage:
 *   MONGODB_URI="..." ADMIN_PHONE="09301274715" [ADMIN_PASSWORD="secret123"] node scripts/make-admin.mjs
 *
 * - If ADMIN_PASSWORD is provided, the admin can log in via the /admin/login page.
 * - If omitted, the admin logs in via SMS OTP only (schema password requirement is
 *   bypassed here since we write through the native driver).
 */

const uri = process.env.MONGODB_URI
const phone = (process.env.ADMIN_PHONE || "09301274715").trim()
const password = process.env.ADMIN_PASSWORD?.trim()
const fullName = process.env.ADMIN_NAME?.trim() || "Admin"

if (!uri) {
  console.error("Missing MONGODB_URI environment variable.")
  process.exit(1)
}

if (!/^09\d{9}$/.test(phone)) {
  console.error(`Invalid phone number: ${phone}`)
  process.exit(1)
}

if (password !== undefined && password.length < 6) {
  console.error("ADMIN_PASSWORD must be at least 6 characters.")
  process.exit(1)
}

try {
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`)

  const users = db.collection("users")
  const plans = db.collection("subscriptionplans")

  // Pick a subscription plan (required on the User schema)
  let plan = (await plans.findOne({ isFree: true })) || (await plans.findOne({}))
  if (!plan) {
    const insertedPlan = await plans.insertOne({
      name: "رایگان",
      title: "رایگان",
      price: 0,
      durationDays: 365,
      durationHours: 0,
      features: [],
      isFree: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    plan = { _id: insertedPlan.insertedId }
    console.log("No subscription plan found — created a fallback free plan.")
  }

  const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  const hashed = password ? await bcrypt.hash(password, 10) : undefined

  const existing = await users.findOne({ phone })

  if (existing) {
    const set = {
      role: "admin",
      subscriptionPlan: existing.subscriptionPlan || plan._id,
      subscriptionExpiry: existing.subscriptionExpiry || oneYear,
      referralCode: existing.referralCode || crypto.randomBytes(10).toString("hex"),
      updatedAt: new Date(),
    }
    if (hashed) set.password = hashed

    await users.updateOne({ _id: existing._id }, { $set: set })
    console.log(`Promoted existing user ${phone} to admin.`)
  } else {
    await users.insertOne({
      phone,
      fullName,
      role: "admin",
      ...(hashed ? { password: hashed } : {}),
      subscriptionPlan: plan._id,
      subscriptionExpiry: oneYear,
      referralCode: crypto.randomBytes(10).toString("hex"),
      wallet: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`Created new admin user ${phone}.`)
  }

  console.log(
    password
      ? "Admin can log in via SMS OTP or the /admin/login page (with the password)."
      : "Admin can log in via SMS OTP (no password set)."
  )

  await mongoose.disconnect()
  process.exit(0)
} catch (error) {
  console.error("Failed to set admin:", error instanceof Error ? error.message : error)
  process.exit(1)
}
