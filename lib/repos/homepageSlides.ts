// app/lib/repos/homepageSlides.ts
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export type HomepageSlide = {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_label: string | null
  cta_href: string | null
  order_index: number
  is_active: boolean
}

export async function fetchActiveSlides(): Promise<HomepageSlide[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('homepage_slides')
    .select(
      'id, title, subtitle, image_url, cta_label, cta_href, order_index, is_active'
    )
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('fetchActiveSlides error:', error)
    return []
  }

  return data || []
}
