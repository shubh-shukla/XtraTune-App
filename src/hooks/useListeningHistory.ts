import { useEffect, useRef } from "react";
import { logListeningHistory } from "@/api";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";

const THRESHOLD_SEC = 30;

export function useListeningHistory(positionSec: number) {
  const { isAuthenticated } = useAuth();
  const currentIndex = useAppSelector((s) => s.player.currentSong);
  const playlist = useAppSelector((s) => s.player.playlist);
  const item = playlist[currentIndex];
  const loggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loggedRef.current && loggedRef.current !== item?.id) {
      loggedRef.current = null;
    }
  }, [item?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!item?.id) return;
    if (loggedRef.current === item.id) return;
    if (positionSec < THRESHOLD_SEC) return;

    loggedRef.current = item.id;
    logListeningHistory({
      songId: item.id,
      title: item.title ?? "",
      artist: item.artist ?? "",
      language: "",
    }).catch(() => {
      loggedRef.current = null;
    });
  }, [isAuthenticated, item?.id, item?.title, item?.artist, positionSec]);
}
