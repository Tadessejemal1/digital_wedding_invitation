"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GUEST_PHOTO_LIMIT } from "@/lib/guest-photos";

interface GuestPhotoMeta {
  id: string;
  guestName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminGuestPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<GuestPhotoMeta[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/guest-photos");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (!res.ok) {
        setError("Could not load guest photos");
        return;
      }
      const data = await res.json();
      setPhotos(data.photos || []);
      setCount(data.count ?? 0);
    } catch {
      setError("Could not load guest photos");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  const handleDownload = (photo: GuestPhotoMeta) => {
    window.open(`/api/guest-photos/${photo.id}/download`, "_blank");
  };

  const handleDelete = async (photo: GuestPhotoMeta) => {
    if (!window.confirm(`Delete photo from ${photo.guestName}?`)) return;
    setBusyId(photo.id);
    try {
      const res = await fetch(`/api/guest-photos/${photo.id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setCount((c) => Math.max(0, c - 1));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/20 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h1 className="font-display text-2xl text-wine">Guest Photos</h1>
          </div>
          <p className="text-sm text-gray-500">
            {count} / {GUEST_PHOTO_LIMIT} photos
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Shared by guests (admin only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Loading…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && photos.length === 0 && (
              <p className="text-sm text-gray-500">No guest photos uploaded yet.</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-gold/20 bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/guest-photos/${photo.id}`}
                    alt={`Photo from ${photo.guestName}`}
                    className="aspect-[4/3] w-full object-cover bg-wine/5"
                  />
                  <div className="space-y-2 p-3">
                    <p className="font-medium text-wine">{photo.guestName}</p>
                    <p className="truncate text-xs text-gray-500">{photo.fileName}</p>
                    <p className="text-xs text-gray-400">
                      {formatSize(photo.sizeBytes)} ·{" "}
                      {new Date(photo.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="gold"
                        className="flex-1"
                        onClick={() => handleDownload(photo)}
                      >
                        <Download className="mr-1 h-4 w-4" /> Download
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={busyId === photo.id}
                        onClick={() => void handleDelete(photo)}
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
