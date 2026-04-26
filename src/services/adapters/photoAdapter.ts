import type { Photo, ListItem, DataSourceAdapter } from '@app-types/index'
import apiClient from '@config/axios.config'

const ITEM_LIMIT = 2000

export const photoAdapter: DataSourceAdapter<Photo> = {
  async fetchItems(limit: number = ITEM_LIMIT): Promise<Photo[]> {
    const { data } = await apiClient.get<Photo[]>('/photos', {
      params: { _limit: limit },
    })
    return data
  },

  normalize(photo: Photo): ListItem {
    return {
      id: photo.id,
      title: photo.title,
      thumbnailUrl: photo.thumbnailUrl,
      badge: `Album ${photo.albumId}`,
    }
  },
}
