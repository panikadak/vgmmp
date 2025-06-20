import { Metadata } from "next"
import { getGameBySlug } from "@/lib/supabase/games"
import { notFound } from "next/navigation"
import GameDetailPage from "./GameDetailPage"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const game = await getGameBySlug(slug)
    
    if (!game) {
      return {
        title: "Game Not Found - Bario Entertainment System",
      }
    }

    return {
      title: `${game.title} - Bario Entertainment System`,
      description: game.description || "",
      openGraph: {
        title: game.title,
        description: game.description || "",
        images: game.images?.[0] ? [game.images[0]] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: game.title,
        description: game.description || "",
        images: game.images?.[0] ? [game.images[0]] : [],
      },
    }
  } catch (error) {
    // Silently handle metadata generation errors
    return {
      title: "Game Not Found - Bario Entertainment System",
    }
  }
}

export default async function GamePage({ params }: PageProps) {
  try {
    const { slug } = await params
    const game = await getGameBySlug(slug)
    
    if (!game) {
      notFound()
    }

    // Transform the game data to match the expected interface
    const gameData = {
      id: game.id,
      title: game.title,
      description: game.description || "",
      source: game.source || "",
      slug: game.slug,
      images: game.images || [],
      category: game.category,
      contract_address: game.contract_address || "",
      opensea_url: game.opensea_url || "",
      storage_path: game.storage_path || "",
      cartridge: game.cartridge || "",
      date: game.created_at || "",
      plays: game.plays || 0,
      average_rating: game.average_rating || 0,
      total_ratings: game.total_ratings || 0,
    }

    return <GameDetailPage game={gameData} />
  } catch (error) {
    // Handle any unexpected errors
    notFound()
  }
} 