import {
  Swords,
  Map,
  Gamepad2,
  Brain,
  Building2,
  Trophy,
  PuzzleIcon as PuzzlePiece,
  Car,
  Dumbbell,
  Target,
  Blocks,
  Tent,
  Skull,
  Globe,
  Users,
  Dice5,
  SquareStack,
  Crown,
  EyeOff,
  Boxes,
} from "lucide-react"

export const GAME_CATEGORIES = [
  { name: "Action", slug: "action", icon: Swords },
  { name: "Adventure", slug: "adventure", icon: Map },
  { name: "RPG", slug: "rpg", icon: Gamepad2 },
  { name: "Strategy", slug: "strategy", icon: Brain },
  { name: "Simulation", slug: "simulation", icon: Building2 },
  { name: "Sports", slug: "sports", icon: Trophy },
  { name: "Puzzle", slug: "puzzle", icon: PuzzlePiece },
  { name: "Racing", slug: "racing", icon: Car },
  { name: "Fighting", slug: "fighting", icon: Dumbbell },
  { name: "Shooter", slug: "shooter", icon: Target },
  { name: "Platformer", slug: "platformer", icon: Blocks },
  { name: "Survival", slug: "survival", icon: Tent },
  { name: "Horror", slug: "horror", icon: Skull },
  { name: "Open World", slug: "open-world", icon: Globe },
  { name: "MMORPG", slug: "mmorpg", icon: Users },
  { name: "Roguelike", slug: "roguelike", icon: Dice5 },
  { name: "Card Games", slug: "card-games", icon: SquareStack },
  { name: "Battle Royale", slug: "battle-royale", icon: Crown },
  { name: "Stealth", slug: "stealth", icon: EyeOff },
  { name: "Sandbox", slug: "sandbox", icon: Boxes },
] as const

// Export category names for backward compatibility
export const CATEGORY_NAMES = GAME_CATEGORIES.map(cat => cat.name)

// Helper function to get category by slug
export function getCategoryBySlug(slug: string) {
  return GAME_CATEGORIES.find(cat => cat.slug === slug)
}

// Helper function to get category by name
export function getCategoryByName(name: string) {
  return GAME_CATEGORIES.find(cat => cat.name === name)
} 