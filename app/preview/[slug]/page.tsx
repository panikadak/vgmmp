import { Metadata } from "next"
import { getGameBySlug } from "@/lib/supabase/games"
import { notFound } from "next/navigation"
import PreviewPage from "./PreviewPage"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  
  if (!game) {
    return {
      title: "Game Preview - Bario Entertainment System",
    }
  }

  return {
    title: `${game.title} Preview - Bario Entertainment System`,
    description: `Preview ${game.title} - ${game.description || ""}`,
  }
}

export default async function GamePreviewPage({ params }: PageProps) {
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
    contract_address: game.contract_address || undefined,
    opensea_url: game.opensea_url || undefined,
    storage_path: game.storage_path || undefined,
    cartridge: game.cartridge || undefined,
    date: game.created_at || "",
  }

  return <PreviewPage game={gameData} />
} 