const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getCSRFToken() {
  try {
    const response = await fetch(`${BASE_URL}/get-csrf-token/`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      return data.csrfToken
    }
  } catch (error) {
    console.warn('Failed to get CSRF token:', error)
  }
  return null
}

async function apiRequest(url: string, options: RequestInit = {}) {
  const csrfToken = await getCSRFToken()
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
  }

  const config = {
    credentials: 'include' as RequestCredentials,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  }

  const fullUrl = `${BASE_URL}${url}`

  const response = await fetch(fullUrl, config)
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.detail || errorMessage
    } catch {
      // If response is not JSON, use default message
    }
    
    // Handle specific status codes
    if (response.status === 401) {
      errorMessage = 'Incorrect email or password. Please enter the correct credentials.'
    } else if (response.status === 403) {
      errorMessage = 'Access denied. You do not have permission to perform this action.'
    } else if (response.status === 404) {
      errorMessage = 'Resource not found.'
    } else if (response.status === 400) {
      errorMessage = 'Bad request. Please check your input.'
    }
    
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const responseData = await response.json()
    return responseData
  }
  return response.text()
}

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    return apiRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async logout() {
    return apiRequest('/api/auth/logout/', {
      method: 'POST',
    })
  },

  async registerUser(userData: {
    email: string
    password: string
    nama: string
    gender: number
    tempat_lahir: string
    tanggal_lahir: string
    kota_asal: string
    roles?: string[]
  }) {
    return apiRequest('/api/auth/register/user/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async registerLabel(labelData: {
    email: string
    password: string
    nama: string
    kontak: string
  }) {
    return apiRequest('/api/auth/register/label/', {
      method: 'POST',
      body: JSON.stringify(labelData),
    })
  },

  async getCurrentUser() {
    return apiRequest('/api/auth/me/')
  },
}

// Dashboard API
export const dashboardAPI = {
  async getUserProfile() {
    return apiRequest('/api/dashboard/')
  },

  async getLabelProfile() {
    return apiRequest('/api/dashboard/')
  },

  async getUserStats() {
    return apiRequest('/api/dashboard/stats/')
  },
}

// Playlist API
export const playlistAPI = {
  async getUserPlaylists() {
    return apiRequest('/api/user-playlist/')
  },

  async createPlaylist(playlistData: { judul: string; deskripsi: string }) {
    return apiRequest('/api/user-playlist/create/', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    })
  },

  async getPlaylistDetail(playlistId: string) {
    return apiRequest(`/api/user-playlist/${playlistId}/`)
  },

  async updatePlaylist(playlistId: string, playlistData: { judul: string; deskripsi: string }) {
    return apiRequest(`/api/user-playlist/${playlistId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(playlistData),
    })
  },

  async deletePlaylist(playlistId: string) {
    return apiRequest(`/api/user-playlist/${playlistId}/delete/`, {
      method: 'DELETE',
    })
  },

  async getPlaylistSongs(playlistId: string) {
    return apiRequest(`/api/user-playlist/${playlistId}/`)
  },

  async addSongToPlaylist(playlistId: string, songId: string) {
    return apiRequest(`/api/user-playlist/${playlistId}/add-song/`, {
      method: 'POST',
      body: JSON.stringify({ song_id: songId }),
    })
  },

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    return apiRequest(`/api/user-playlist/${playlistId}/remove-song/${songId}/`, {
      method: 'DELETE',
    })
  },

  async playPlaylist(playlistId: string) {
    return apiRequest(`/api/play-user-playlist/${playlistId}/`, {
      method: 'POST',
    })
  },

  async getAvailableSongs() {
    return apiRequest('/api/album-song/songs/')
  },

  async playSongFromPlaylist(playlistId: string, songId: string) {
    return apiRequest(`/api/play-user-playlist/${playlistId}/song/${songId}/`, {
      method: 'POST',
    })
  },
}

// Album API
export const albumAPI = {
  async getUserAlbums() {
    return apiRequest('/api/album-song/user-albums/')
  },

  async getUserSongs() {
    return apiRequest('/api/album-song/user-songs/')
  },

  async getAlbumDetail(albumId: string) {
    return apiRequest(`/api/album-song/albums/${albumId}/`)
  },

  async createAlbum(albumData: { judul_album: string; label_id: string }) {
    return apiRequest('/api/album-song/create-album/', {
      method: 'POST',
      body: JSON.stringify(albumData),
    })
  },

  async deleteAlbum(albumId: string) {
    return apiRequest(`/api/album-song/albums/${albumId}/`, {
      method: 'DELETE',
    })
  },

  async getAlbumSongs(albumId: string) {
    return apiRequest(`/api/album-song/albums/${albumId}/`)
  },

  async addSongToAlbum(albumId: string, songData: { judul: string; durasi: number }) {
    return apiRequest(`/api/album-song/albums/${albumId}/songs/`, {
      method: 'POST',
      body: JSON.stringify(songData),
    })
  },

  async addSong(albumId: string, songData: { judul: string; durasi: number; artist_id: string; songwriter_ids: string[]; genres: string[]; album_id: string }) {
    // The backend expects judul_lagu, not judul
    const payload = {
      album_id: albumId,
      judul_lagu: songData.judul,
      durasi: songData.durasi,
      artist_id: songData.artist_id,
      songwriter_ids: songData.songwriter_ids,
      genres: songData.genres,
    }
    
    return apiRequest(`/api/album-song/create-song/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async deleteSong(songId: string) {
    return apiRequest(`/api/album-song/songs/${songId}/`, {
      method: 'DELETE',
    })
  },

  async getPopularSongs() {
    return apiRequest('/api/album-song/songs/popular/')
  },

  async getNewReleases() {
    return apiRequest('/api/album-song/songs/new/')
  },

  async getAllSongs() {
    return apiRequest('/api/album-song/songs/')
  },

  async getAllAlbums() {
    return apiRequest('/api/album-song/albums/')
  },

  async getLabelAlbums() {
    return apiRequest('/api/album-song/label-albums/')
  },

  async getAllLabels() {
    return apiRequest('/api/album-song/labels/')
  },

  async getAllArtists() {
    return apiRequest('/api/album-song/artists/')
  },

  async getAllSongwriters() {
    return apiRequest('/api/album-song/songwriters/')
  },

  async getAllGenres() {
    return apiRequest('/api/album-song/genres/')
  },
}

// Podcast API
export const podcastAPI = {
  async getUserPodcasts() {
    return apiRequest('/api/podcast/')
  },

  async createPodcast(podcastData: { judul: string; deskripsi: string; genres: string[] }) {
    return apiRequest('/api/podcast/create/', {
      method: 'POST',
      body: JSON.stringify(podcastData),
    })
  },

  async getPodcastDetail(podcastId: string) {
    return apiRequest(`/api/podcast/${podcastId}/`)
  },

  async updatePodcast(podcastId: string, podcastData: { judul: string; genres: string[] }) {
    return apiRequest(`/api/podcast/${podcastId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(podcastData),
    })
  },

  async deletePodcast(podcastId: string) {
    return apiRequest(`/api/podcast/${podcastId}/delete/`, {
      method: 'DELETE',
    })
  },

  async getPodcastEpisodes(podcastId: string) {
    return apiRequest(`/api/podcast/${podcastId}/episodes/`)
  },

  async createEpisode(episodeData: { id_konten_podcast: string; judul: string; deskripsi: string; durasi: number }) {
    // Extract podcast ID from episode data
    const podcastId = episodeData.id_konten_podcast
    // Map frontend fields to backend expected fields
    return apiRequest(`/api/podcast/${podcastId}/episodes/create/`, {
      method: 'POST',
      body: JSON.stringify({
        title: episodeData.judul,
        description: episodeData.deskripsi,
        duration: episodeData.durasi
      }),
    })
  },

  async deleteEpisode(podcastId: string, episodeId: string) {
    return apiRequest(`/api/podcast/${podcastId}/episodes/${episodeId}/delete/`, {
      method: 'DELETE',
    })
  },



  async getAllPodcasts() {
    return apiRequest('/api/play-podcast/')
  },

  async playPodcastEpisode(podcastId: string, episodeId: string) {
    return apiRequest(`/api/play-podcast/${podcastId}/episodes/${episodeId}/play/`, {
      method: 'POST',
    })
  },

  async getAvailableGenres() {
    return apiRequest('/api/podcast/genres/')
  },
}

// Chart API
export const chartAPI = {
  async getCharts() {
    return apiRequest('/api/chart/')
  },

  async getChartDetail(chartType: string) {
    return apiRequest(`/api/chart/${encodeURIComponent(chartType)}/`)
  },

  async getTrendingSongs() {
    return apiRequest('/api/chart/trending/songs/')
  },

  async getTopDownloads() {
    return apiRequest('/api/chart/top/downloads/')
  },

  async getChartSongs(chartType: string) {
    return apiRequest(`/api/chart/${encodeURIComponent(chartType)}/`)
  },
}

// Downloaded Songs API
export const downloadedSongsAPI = {
  async getDownloadedSongs() {
    return apiRequest('/api/downloads/')
  },

  async removeDownloadedSong(songId: string) {
    return apiRequest(`/api/downloads/${songId}/remove/`, {
      method: 'DELETE',
    })
  },

  async getDownloadStats() {
    return apiRequest('/api/downloads/stats/')
  },
}

// Royalty API
export const royaltyAPI = {
  async getRoyalties() {
    return apiRequest('/api/royalty/')
  },

  async getLabelRoyalties() {
    return apiRequest('/api/royalty/label/')
  },

  async updateRoyalties() {
    return apiRequest('/api/royalty/update/', {
      method: 'POST',
    })
  },
}

// Search API
export const searchAPI = {
  async search(query: string) {
    return apiRequest(`/api/search/?q=${encodeURIComponent(query)}`)
  },

  async searchSongs(query: string) {
    return apiRequest(`/api/search/songs/?q=${encodeURIComponent(query)}`)
  },

  async searchPodcasts(query: string) {
    return apiRequest(`/api/search/podcasts/?q=${encodeURIComponent(query)}`)
  },

  async searchPlaylists(query: string) {
    return apiRequest(`/api/search/playlists/?q=${encodeURIComponent(query)}`)
  },

  async getItemDetail(itemId: string, type: string = 'song') {
    return apiRequest(`/api/search/item/${itemId}/?type=${type}`)
  },
}

// Song API
export const songAPI = {
  async getSong(songId: string) {
    return apiRequest(`/api/play-song/${songId}/`)
  },

  async playSong(songId: string, progress: number = 0) {
    return apiRequest(`/api/play-song/${songId}/play/`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    })
  },

  async downloadSong(songId: string) {
    return apiRequest(`/api/play-song/${songId}/download/`, {
      method: 'POST',
    })
  },

  async addToPlaylist(songId: string, playlistId: string) {
    return apiRequest(`/api/play-song/${songId}/add-to-playlist/`, {
      method: 'POST',
      body: JSON.stringify({ playlist_id: playlistId }),
    })
  },

  async getUserPlaylistsForSong() {
    return apiRequest('/api/play-song/playlists/')
  },
}

// Subscription API
export const subscriptionAPI = {
  async getPackages() {
    return apiRequest('/api/subscription/packages/')
  },

  async getCurrentSubscription() {
    return apiRequest('/api/subscription/')
  },

  async subscribe(packageData: { 
    jenis_paket: string
    metode_bayar: string 
  }) {
    return apiRequest('/api/subscription/subscribe/', {
      method: 'POST',
      body: JSON.stringify(packageData),
    })
  },

  async cancelSubscription() {
    return apiRequest('/api/subscription/cancel/', {
      method: 'POST',
    })
  },

  async getTransactionHistory() {
    return apiRequest('/api/subscription/history/')
  },
} 