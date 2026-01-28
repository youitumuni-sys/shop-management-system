"use client";

import { useState, useCallback, useMemo } from 'react';
import { PhotoDiaryEntry, mockPhotoDiaryEntries } from '@/lib/mock-data/photo-diary';

export function usePhotoDiary() {
  const [entries, setEntries] = useState<PhotoDiaryEntry[]>(mockPhotoDiaryEntries);

  const togglePost = useCallback((entryId: string, postNum: 1 | 2 | 3) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry;
      const postKey = `post${postNum}` as keyof typeof entry.posts;
      const newPosts = { ...entry.posts, [postKey]: !entry.posts[postKey] };
      const isComplete = newPosts.post1 && newPosts.post2 && newPosts.post3;
      return { ...entry, posts: newPosts, isComplete };
    }));
  }, []);

  const stats = useMemo(() => {
    const total = entries.length;
    const completed = entries.filter(e => e.isComplete).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPosts = total * 3;
    const postedCount = entries.reduce((acc, e) => 
      acc + (e.posts.post1 ? 1 : 0) + (e.posts.post2 ? 1 : 0) + (e.posts.post3 ? 1 : 0), 0
    );
    return { total, completed, percentage, totalPosts, postedCount };
  }, [entries]);

  return {
    entries,
    togglePost,
    stats,
  };
}
