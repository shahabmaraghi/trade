import { connectToDatabase } from "@/lib/db"
import { BlogPost } from "@/models/BlogPost"
import { BlogCategory } from "@/models/BlogCategory"
import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from "next"
import BlogPostClientPage from "./BlogPostClientPage"

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
  author?: {
    _id: string
    name: string
    email: string
  }
}

// Check if we are in build/prerendering environment
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  await connectToDatabase()

  // Default metadata for build time or if post not found
  if (isBuildTime) {
    return {
      title: "بلاگ پلاس چارت",
      description: "مقالات و محتوای مفید در حوزه بازار سرمایه",
    }
  }

  // Find the post by slug
  const post = await BlogPost.findOne({ slug: params.slug, status: "published" })
    .populate("categoryId", "name slug")
    .lean()

  if (!post) {
    return {
      title: "مقاله یافت نشد | پلاس چارت",
      description: "متاسفانه مقاله مورد نظر یافت نشد.",
    }
  }

  // Extract a clean description from the content
  const description = post.content
    .replace(/<[^>]*>/g, " ")
    .substring(0, 160)
    .trim()

  return {
    title: `${post.title} | پلاس چارت`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: "article",
      url: `https://hirmandtrade.ir/blog/${post.slug}`,
      images: [
        {
          url: post.image || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "fa_IR",
      siteName: "پلاس چارت",
    },
  }
}

// Server component that fetches data
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase()

  // Handle build time with placeholder data
  if (isBuildTime) {
    // Return placeholder data during build
    const placeholderPost = {
      _id: "placeholder",
      title: "مقاله نمونه",
      slug: (await params).slug,
      content: "<p>این یک مقاله نمونه است.</p>",
      categoryId: {
        _id: "placeholder",
        name: "دسته بندی",
        slug: "category",
      },
      image: "/placeholder.svg",
      status: "published",
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };

    return (
      <BlogPostClientPage
        post={placeholderPost}
        relatedPosts={[]}
        recentPosts={[]}
        categories={[]}
      />
    )
  }

  // Find the post by slug
  const post = await BlogPost.findOne({ slug: (await params).slug, status: "published" })
    .populate("categoryId", "name slug")
    .populate("author", "name email")
    .lean()

  if (!post) {
    notFound()
  }

  // Increment view count
  await BlogPost.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } })

  // Find related posts in the same category
  const relatedPosts = await BlogPost.find({
    categoryId: post.categoryId._id,
    _id: { $ne: post._id },
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate("categoryId", "name slug")
    .lean()

  // Find recent posts for sidebar
  const recentPosts = await BlogPost.find({
    _id: { $ne: post._id },
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(5)
    .populate("categoryId", "name slug")
    .lean()

  // Find categories for sidebar
  const categories = await BlogCategory.find().sort({ name: 1 }).lean()

  // Convert MongoDB documents to plain objects and ensure proper date serialization
  const serializedPost = JSON.parse(JSON.stringify(post))
  const serializedRelatedPosts = JSON.parse(JSON.stringify(relatedPosts))
  const serializedRecentPosts = JSON.parse(JSON.stringify(recentPosts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: serializedPost.title,
    image: serializedPost.image || "https://hirmandtrade.ir/placeholder.svg",
    datePublished: serializedPost.publishedAt || serializedPost.createdAt,
    dateModified: serializedPost.updatedAt || serializedPost.createdAt,
    author: {
      "@type": "Person",
      name: serializedPost.author?.name || "پلاس چارت",
    },
    publisher: {
      "@type": "Organization",
      name: "پلاس چارت",
      logo: {
        "@type": "ImageObject",
        url: "https://hirmandtrade.ir/logo.png",
      },
    },
    description: serializedPost.content
      .replace(/<[^>]*>/g, " ")
      .substring(0, 160)
      .trim(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hirmandtrade.ir/blog/${serializedPost.slug}`,
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
      <BlogPostClientPage
        post={serializedPost}
        relatedPosts={serializedRelatedPosts}
        recentPosts={serializedRecentPosts}
        categories={serializedCategories}
      />
    </>
  )
}
