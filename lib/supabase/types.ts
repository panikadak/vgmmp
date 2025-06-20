export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      authorized_admins: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          wallet_address?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          game_id: string
          id: string
          is_edited: boolean | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id: string
          id?: string
          is_edited?: boolean | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string
          id?: string
          is_edited?: boolean | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          average_rating: number | null
          cartridge: string | null
          category: string
          contract_address: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          opensea_url: string | null
          plays: number | null
          slug: string
          source: string | null
          storage_path: string | null
          title: string
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          cartridge?: string | null
          category: string
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          opensea_url?: string | null
          plays?: number | null
          slug: string
          source?: string | null
          storage_path?: string | null
          title: string
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          cartridge?: string | null
          category?: string
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          opensea_url?: string | null
          plays?: number | null
          slug?: string
          source?: string | null
          storage_path?: string | null
          title?: string
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rating_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          ip_address: unknown | null
          rating: number
          session_id: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          ip_address?: unknown | null
          rating: number
          session_id: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          ip_address?: unknown | null
          rating?: number
          session_id?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_game_plays: {
        Args: { game_id: string }
        Returns: undefined
      }
      is_authorized_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authorized_admin_v2: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authorized_admin_v3: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      submit_game_rating: {
        Args: {
          p_game_id: string
          p_rating: number
          p_session_id: string
          p_user_agent?: string
        }
        Returns: Json
      }
      update_game_rating: {
        Args: { game_id: string; new_rating: number }
        Returns: undefined
      }
      update_game_rating_stats: {
        Args: { game_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Convenience types
export type Game = Tables<'games'>
export type GameInsert = TablesInsert<'games'>
export type GameUpdate = TablesUpdate<'games'>

export type Comment = Tables<'comments'>
export type CommentInsert = TablesInsert<'comments'>
export type CommentUpdate = TablesUpdate<'comments'>

export type Rating = Tables<'ratings'>
export type RatingInsert = TablesInsert<'ratings'>
export type RatingUpdate = TablesUpdate<'ratings'>

// Legacy compatibility with existing GameItem interface
export interface GameItem {
  images: string[]
  title: string
  description: string
  source: string
  category: string
  slug: string
  id: string
  contractAddress: string
  isActive: boolean
  openseaUrl: string
  storagePath: string
  date: string
  plays?: number
  averageRating?: number
  totalRatings?: number
}

// Conversion functions between database and legacy formats
export function gameToGameItem(game: Game): GameItem {
  return {
    id: game.id,
    title: game.title,
    slug: game.slug,
    description: game.description || '',
    source: game.source || '',
    category: game.category,
    images: game.images || [],
    contractAddress: game.contract_address || '',
    isActive: game.is_active ?? true,
    openseaUrl: game.opensea_url || '',
    storagePath: game.storage_path || '',
    date: game.created_at || '',
  }
}

export function gameItemToGame(gameItem: GameItem): GameInsert {
  return {
    id: gameItem.id,
    title: gameItem.title,
    slug: gameItem.slug,
    description: gameItem.description,
    source: gameItem.source,
    category: gameItem.category,
    images: gameItem.images,
    contract_address: gameItem.contractAddress,
    is_active: gameItem.isActive,
    opensea_url: gameItem.openseaUrl,
    storage_path: gameItem.storagePath,
    // Note: created_at is automatically set by the database, so we don't include it in inserts
  }
} 