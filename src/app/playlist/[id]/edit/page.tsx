'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { playlistAPI } from '@/lib/api';
import { Music, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Playlist {
  id: string;
  judul: string;
  deskripsi: string;
  jumlah_lagu: number;
  total_durasi: number;
}

interface Song {
  id: string;
  judul: string;
  artist: string;
  album: string;
  durasi: number;
}

export default function EditPlaylistPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId, user, router]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistAPI.getPlaylistDetail(playlistId);
      const playlistData = response.playlist;
      setPlaylist(playlistData);
      setSongs(response.songs || []);
      setFormData({
        judul: playlistData.judul,
        deskripsi: playlistData.deskripsi
      });
    } catch (error) {
      showToast('Failed to load playlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!playlist) return;
    
    setSaving(true);
    try {
      await playlistAPI.updatePlaylist(playlistId, formData);
      showToast('Playlist updated successfully!', 'success');
      router.push(`/playlist/${playlistId}`);
    } catch (error) {
      showToast('Failed to update playlist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await playlistAPI.removeSongFromPlaylist(playlistId, songId);
      setSongs(prev => prev.filter(song => song.id !== songId));
      showToast('Song removed from playlist successfully!', 'success');
    } catch (error) {
      showToast('Failed to remove song from playlist', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (songToDelete) {
      await handleRemoveSong(songToDelete.id);
      setSongToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Playlist Not Found</h1>
          <p className="text-gray-400 mb-4">The playlist you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/playlist')}
            className="btn-spotify"
          >
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/playlist/${playlistId}`)}
            className="text-white hover:bg-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Edit className="w-6 h-6 text-green-400" />
            Edit Playlist
          </h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
              onClick={() => router.push(`/playlist/${playlistId}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-spotify"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Playlist Details */}
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Playlist Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <Input
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  placeholder="Playlist title"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Playlist description"
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                />
              </div>
              <div className="text-sm text-gray-400">
                <p>Total songs: {playlist.jumlah_lagu}</p>
                <p>Duration: {playlist.total_durasi}</p>
              </div>
            </CardContent>
          </Card>

          {/* Songs List */}
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Songs ({songs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {songs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Songs Yet</h3>
                  <p className="text-gray-400">This playlist doesn't have any songs yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{song.judul}</div>
                        <div className="text-sm text-gray-400">
                          {song.artist} • {song.album}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {song.durasi}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() => {
                            setSongToDelete(song);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSongToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Remove Song"
          message={`Are you sure you want to remove "${songToDelete?.judul}" from this playlist?`}
          type="delete"
          confirmText="Remove"
        />
      </div>
    </div>
  );
} 