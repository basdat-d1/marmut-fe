'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { playlistAPI } from '@/lib/api';

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
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

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
      console.error('Error fetching playlist:', error);
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
      router.push(`/playlist/${playlistId}`);
    } catch (error) {
      console.error('Error updating playlist:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await playlistAPI.removeSongFromPlaylist(playlistId, songId);
      setSongs(prev => prev.filter(song => song.id !== songId));
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (songToDelete) {
      await handleRemoveSong(songToDelete.id);
      setSongToDelete(null);
    }
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Playlist</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/playlist/${playlistId}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Playlist Details */}
          <Card>
            <CardHeader>
              <CardTitle>Playlist Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  placeholder="Playlist title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Playlist description"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Total songs: {playlist.jumlah_lagu}</p>
                <p>Duration: {formatDuration(playlist.total_durasi)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Songs List */}
          <Card>
            <CardHeader>
              <CardTitle>Songs ({songs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {songs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No songs in this playlist</p>
              ) : (
                <div className="space-y-2">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{song.judul}</div>
                        <div className="text-sm text-gray-600">
                          {song.artist} • {song.album}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDuration(song.durasi)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSongToDelete(song);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          Remove
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