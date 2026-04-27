import type { Artwork, ListItem, DataSourceAdapter } from '@app-types/index'
import apiClient from '@config/axios.config'
import { ARTIC } from '@config/constants'
import {
  parseMediumCategory,
  buildAccentColor,
  buildImageUrl,
  parseArtistName,
} from '@utils/artworkUtils'

interface ArticApiResponse {
  data: Artwork[]
  pagination: { total: number; total_pages: number }
}

export const artworkAdapter: DataSourceAdapter<Artwork> = {
  async fetchItems(page: number, limit: number): Promise<Artwork[]> {
    const { data } = await apiClient.get<ArticApiResponse>('/artworks', {
      params: { page, limit, fields: ARTIC.FIELDS },
    })
    return data.data
  },

  normalize(artwork: Artwork): ListItem {
    const artistName = parseArtistName(artwork.artist_display)
    const mediumCategory = parseMediumCategory(artwork.medium_display)
    const imageUrl = buildImageUrl(artwork.image_id, ARTIC.IMAGE_WIDTH)
    const accentColor = buildAccentColor(artwork.color, artwork.colorfulness)

    const metaParts = [artwork.date_display, artwork.place_of_origin].filter(Boolean)

    return {
      id: artwork.id,
      title: artwork.title,
      subtitle: artistName,
      imageUrl,
      lqip: artwork.thumbnail?.lqip,
      imageAlt: artwork.thumbnail?.alt_text ?? artwork.title,
      badge: mediumCategory,
      meta: metaParts.join(' · '),
      mediumCategory,
      origin: artwork.place_of_origin ?? undefined,
      accentColor,
      mediumDisplay: artwork.medium_display,
      artworkType: artwork.artwork_type_title ?? undefined,
    }
  },
}
