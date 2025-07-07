const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getCSRFToken() {
  try {
    const response = await fetch(`${BASE_URL}/get-csrf-token/`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      return data.csrf_token
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

  const response = await fetch(`${BASE_URL}${url}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    return apiRequest('/login/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async logout() {
    return apiRequest('/logout/', {
      method: 'POST',
    })
  },

  async registerUser(userData: {
    email: string
    password: string
    nama: string
    gender: string
    tempat_lahir: string
    tanggal_lahir: string
    kota_asal: string
    role?: string[]
  }) {
    const formData = new FormData()
    Object.entries(userData).forEach(([key, value]) => {
      if (key === 'role' && Array.isArray(value)) {
        value.forEach(role => formData.append('role', role))
      } else {
        formData.append(key, value as string)
      }
    })

    return apiRequest('/register/pengguna/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async registerLabel(labelData: {
    email: string
    password: string
    nama: string
    kontak: string
  }) {
    const formData = new FormData()
    Object.entries(labelData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return apiRequest('/register/label/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async getCurrentUser() {
    return apiRequest('/dashboard/pengguna/')
  },
}

// Dashboard API
export const dashboardAPI = {
  async getUserProfile() {
    return apiRequest('/dashboard/pengguna/')
  },

  async getLabelProfile() {
    return apiRequest('/dashboard/label/')
  },
}

// Playlist API
export const playlistAPI = {
  async getUserPlaylists() {
    return apiRequest('/user-playlist/')
  },

  async createPlaylist(playlistData: { judul: string; deskripsi: string }) {
    const formData = new FormData()
    Object.entries(playlistData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return apiRequest('/user-playlist/tambah-playlist/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async updatePlaylist(playlistId: string, playlistData: { judul: string; deskripsi: string }) {
    const formData = new FormData()
    Object.entries(playlistData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return apiRequest(`/user-playlist/ubah-playlist/${playlistId}/`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async deletePlaylist(playlistId: string) {
    return apiRequest(`/user-playlist/hapus-playlist/${playlistId}/`, {
      method: 'POST',
    })
  },

  async getPlaylistSongs(playlistId: string) {
    return apiRequest(`/user-playlist/detail-playlist/${playlistId}/`)
  },

  async addSongToPlaylist(playlistId: string, songId: string) {
    const formData = new FormData()
    formData.append('id_song', songId)

    return apiRequest(`/user-playlist/tambah-lagu/${playlistId}/`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    return apiRequest(`/user-playlist/hapus-lagu/${playlistId}/${songId}/`, {
      method: 'POST',
    })
  },

  async playPlaylist(playlistId: string, creatorEmail: string) {
    const formData = new FormData()
    formData.append('id_user_playlist', playlistId)
    formData.append('email_pembuat', creatorEmail)

    return apiRequest(`/play-user-playlist/${playlistId}`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
}

// Album API
export const albumAPI = {
  async getUserAlbums() {
    return apiRequest('/daftar-album-song/list-album/')
  },

  async createAlbum(albumData: { judul: string; label: string }) {
    const formData = new FormData()
    Object.entries(albumData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return apiRequest('/daftar-album-song/create-album/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async deleteAlbum(albumId: string) {
    const formData = new FormData()
    formData.append('id_album', albumId)

    return apiRequest('/daftar-album-song/list-album/delete-album/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async addSong(albumId: string, songData: { judul: string; durasi: number }) {
    const formData = new FormData()
    formData.append('id_album', albumId)
    Object.entries(songData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    return apiRequest('/daftar-album-song/list-album/create-song/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async getAlbumSongs(albumId: string) {
    return apiRequest(`/daftar-album-song/list-album/list-song/?id_album=${albumId}`)
  },

  async getLabelAlbums() {
    return apiRequest('/daftar-album-song/list-album/label/')
  },
}

// Podcast API
export const podcastAPI = {
  async getUserPodcasts() {
    return apiRequest('/podcast/')
  },

  async createPodcast(podcastData: { judul: string; genre: string[] }) {
    const formData = new FormData()
    formData.append('judul', podcastData.judul)
    podcastData.genre.forEach(g => formData.append('genre', g))

    return apiRequest('/podcast/add-podcast/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async deletePodcast(podcastId: string) {
    const formData = new FormData()
    formData.append('podcast_id', podcastId)

    return apiRequest('/podcast/remove-podcast/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async getPodcastEpisodes(podcastId: string) {
    return apiRequest(`/podcast/daftar-episode/?podcast_id=${podcastId}`)
  },

  async createEpisode(episodeData: { 
    id_konten_podcast: string
    judul: string
    deskripsi: string
    durasi: number 
  }) {
    const formData = new FormData()
    Object.entries(episodeData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    return apiRequest('/podcast/add-episode/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async deleteEpisode(episodeId: string) {
    const formData = new FormData()
    formData.append('episode_id', episodeId)

    return apiRequest('/podcast/remove-episode/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async getPodcastDetail(podcastId: string) {
    return apiRequest(`/play-podcast/?podcast_id=${podcastId}`)
  },
}

// Chart API
export const chartAPI = {
  async getCharts() {
    return apiRequest('/lihat-chart/')
  },

  async getChartSongs(chartType: string) {
    return apiRequest(`/lihat-chart/isi-chart/?tipe=${encodeURIComponent(chartType)}`)
  },
}

// Downloaded Songs API
export const downloadedSongsAPI = {
  async getDownloadedSongs() {
    return apiRequest('/downloaded-songs/api/get_downloaded_songs/')
  },

  async removeDownloadedSong(songId: string) {
    return apiRequest(`/downloaded-songs/delete-song/${songId}/`, {
      method: 'POST',
    })
  },
}

// Royalty API
export const royaltyAPI = {
  async getRoyalties() {
    return apiRequest('/cek-royalti/')
  },

  async getLabelRoyalties() {
    return apiRequest('/cek-royalti/label/')
  },
}

// Search API
export const searchAPI = {
  async search(query: string) {
    return apiRequest(`/search-bar/?query=${encodeURIComponent(query)}`)
  },

  async getItemDetail(itemId: string) {
    return apiRequest(`/search-bar/detail/${itemId}/`)
  },
}

// Song API
export const songAPI = {
  async getSong(songId: string) {
    return apiRequest(`/play-song/${songId}/`)
  },

  async playSong(songId: string, progress: number) {
    const formData = new FormData()
    formData.append('progress', progress.toString())

    return apiRequest(`/play-song/${songId}/`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async downloadSong(songId: string) {
    return apiRequest(`/play-song/download_song/${songId}/`, {
      method: 'POST',
    })
  },

  async addToPlaylist(songId: string, playlistId: string) {
    const formData = new FormData()
    formData.append('id_user_playlist', playlistId)

    return apiRequest(`/play-song/add_song_to_user_playlist/${songId}/`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
}

// Subscription API
export const subscriptionAPI = {
  async getSubscriptions() {
    return apiRequest('/langganan-paket/')
  },

  async subscribe(packageData: { 
    jenis_paket: string
    metode_bayar: string 
  }) {
    const formData = new FormData()
    Object.entries(packageData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return apiRequest('/langganan-paket/beli-paket/', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },

  async getTransactionHistory() {
    return apiRequest('/langganan-paket/riwayat-transaksi/')
  },
} 