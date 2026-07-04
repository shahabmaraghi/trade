import type { Metadata } from "next"
import { connectDB } from "@/lib/db"
import { BlogPost } from "@/models/BlogPost"
import { BlogCategory } from "@/models/BlogCategory"
import BlogClientPage from "./BlogClientPage"

// Define the post type
export interface Post {
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

// Define the category type
export interface Category {
  _id: string
  name: string
  slug: string
}

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "وبلاگ | پلاس چارت",
  description: "آخرین مقالات و اخبار بازار سرمایه، تحلیل‌های تکنیکال و بنیادی",
  openGraph: {
    title: "وبلاگ | پلاس چارت",
    description: "آخرین مقالات و اخبار بازار سرمایه، تحلیل‌های تکنیکال و بنیادی",
    type: "website",
    locale: "fa_IR",
    siteName: "پلاس چارت",
  },
}

// Check if we are in build/prerendering environment
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Server component that fetches data
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await connectDB()

  const currentPage = Number((await searchParams).page) || 1
  const postsPerPage = 6
  const skip = (currentPage - 1) * postsPerPage

  let totalPostsCount = 0;
  let totalPages = 0;
  let posts: any[] = [];
  let categories: any[] = [];
  let popularPosts: any[] = [];

  // Skip actual data fetching during build time
  if (!isBuildTime) {
    // Fetch total post count for pagination
    totalPostsCount = await BlogPost.countDocuments({ status: "published" })
    totalPages = Math.ceil(totalPostsCount / postsPerPage)

    // Fetch published posts with pagination
    posts = await BlogPost.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(postsPerPage)
      .populate("categoryId", "name slug")
      .lean()

    // Fetch categories
    categories = await BlogCategory.find().sort({ name: 1 }).lean()

    // Fetch popular posts for sidebar
    popularPosts = await BlogPost.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .populate("categoryId", "name slug")
      .lean()
  }

  // Convert MongoDB documents to plain objects and ensure proper date serialization
  const serializedPosts = JSON.parse(JSON.stringify(posts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))
  const serializedPopularPosts = JSON.parse(JSON.stringify(popularPosts))

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "وبلاگ پلاس چارت",
    description: "آخرین مقالات و اخبار بازار سرمایه، تحلیل‌های تکنیکال و بنیادی",
    url: `https://hirmandtrade.ir/blog${currentPage > 1 ? `?page=${currentPage}` : ""}`,
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
      <BlogClientPage
        posts={serializedPosts}
        categories={serializedCategories}
        popularPosts={serializedPopularPosts}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  )
}
