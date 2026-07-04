import { connectToDatabase } from "@/lib/db"
import { BlogPost } from "@/models/BlogPost"
import { BlogCategory } from "@/models/BlogCategory"
import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from "next"
import CategoryPageClient from "./CategoryPageClient"

// Define types
interface Post {
  _id: string
  title: string
  slug: string
  content: string
  categoryId: {
    _id: string
    name: string
    slug: string
  }
  image: string
  status: string
  viewCount: number
  createdAt: string
  publishedAt?: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

// Check if we are in build/prerendering environment
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  await connectToDatabase()

  // Return default metadata during build time
  if (isBuildTime) {
    return {
      title: "دسته‌بندی‌های بلاگ | پلاس چارت",
      description: "مقالات و محتوای مفید در حوزه بازار سرمایه",
    }
  }

  // Find the category by slug
  const category = await BlogCategory.findOne({ slug: params.slug }).lean()

  if (!category) {
    return {
      title: "دسته‌بندی یافت نشد | پلاس چارت",
      description: "متاسفانه دسته‌بندی مورد نظر یافت نشد.",
    }
  }

  return {
    title: `${category.name} | وبلاگ پلاس چارت`,
    description: `مقالات دسته‌بندی ${category.name} در وبلاگ پلاس چارت`,
    openGraph: {
      title: `${category.name} | وبلاگ پلاس چارت`,
      description: `مقالات دسته‌بندی ${category.name} در وبلاگ پلاس چارت`,
      type: "website",
      locale: "fa_IR",
      siteName: "پلاس چارت",
    },
  }
}

// Server component that fetches data
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  await connectToDatabase()

  // Return placeholder data during build time
  if (isBuildTime) {
    const placeholderCategory = {
      _id: "placeholder",
      name: `دسته‌بندی ${params.slug}`,
      slug: params.slug,
    };

    return (
      <CategoryPageClient
        category={placeholderCategory}
        posts={[]}
        categories={[]}
        popularPosts={[]}
        currentPage={1}
        totalPages={0}
      />
    )
  }

  // Find the category by slug
  const category = await BlogCategory.findOne({ slug: params.slug }).lean()

  if (!category) {
    notFound()
  }

  const currentPage = Number(searchParams.page) || 1
  const postsPerPage = 6
  const skip = (currentPage - 1) * postsPerPage

  // Fetch total post count for pagination
  const totalPostsCount = await BlogPost.countDocuments({
    categoryId: category._id,
    status: "published",
  })
  const totalPages = Math.ceil(totalPostsCount / postsPerPage)

  // Fetch published posts in this category with pagination
  const posts = await BlogPost.find({
    categoryId: category._id,
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(postsPerPage)
    .populate("categoryId", "name slug")
    .lean()

  // Fetch all categories for sidebar
  const categories = await BlogCategory.find().sort({ name: 1 }).lean()

  // Fetch popular posts for sidebar
  const popularPosts = await BlogPost.find({ status: "published" })
    .sort({ viewCount: -1 })
    .limit(5)
    .populate("categoryId", "name slug")
    .lean()

  // Convert MongoDB documents to plain objects and ensure proper date serialization
  const serializedCategory = JSON.parse(JSON.stringify(category))
  const serializedPosts = JSON.parse(JSON.stringify(posts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))
  const serializedPopularPosts = JSON.parse(JSON.stringify(popularPosts))

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${serializedCategory.name} | وبلاگ پلاس چارت`,
    description: `مقالات دسته‌بندی ${serializedCategory.name} در وبلاگ پلاس چارت`,
    url: `https://hirmandtrade.ir/blog/category/${serializedCategory.slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    isPartOf: {
      "@type": "WebSite",
      name: "پلاس چارت",
      url: "https://hirmandtrade.ir",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: serializedPosts.map((post: Post, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://hirmandtrade.ir/blog/${post.slug}`,
      })),
    },
  }

  return (
    <>
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Render the client component with server-fetched data */}
      <CategoryPageClient
        category={serializedCategory}
        posts={serializedPosts}
        categories={serializedCategories}
        popularPosts={serializedPopularPosts}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  )
}
