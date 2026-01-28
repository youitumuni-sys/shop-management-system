"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DailyCheckCategory,
  DailyCheckItem,
  getTodayChecks,
  DEFAULT_CATEGORY_IDS,
  DEFAULT_ITEM_IDS
} from '@/lib/mock-data/daily-check';

const STORAGE_KEY = 'daily-check-custom-data';
const CHECK_STATE_KEY = 'daily-check-state';

interface CustomData {
  customItems: DailyCheckItem[];
  customCategories: DailyCheckCategory[];
}

interface CheckState {
  date: string;
  checkedItems: { [itemId: string]: { checked: boolean; checkedAt?: string } };
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadCustomData(): CustomData {
  if (typeof window === 'undefined') {
    return { customItems: [], customCategories: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load custom data:', e);
  }
  return { customItems: [], customCategories: [] };
}

function saveCustomData(data: CustomData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save custom data:', e);
  }
}

function loadCheckState(): CheckState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CHECK_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as CheckState;
      // 日付が今日でなければリセット
      if (state.date === getTodayDateString()) {
        return state;
      }
    }
  } catch (e) {
    console.error('Failed to load check state:', e);
  }
  return null;
}

function saveCheckState(state: CheckState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHECK_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save check state:', e);
  }
}

export function useDailyCheck() {
  const [categories, setCategories] = useState<DailyCheckCategory[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_customData, setCustomData] = useState<CustomData>({ customItems: [], customCategories: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化: デフォルトデータとカスタムデータをマージ
  useEffect(() => {
    const loadedCustomData = loadCustomData();
    const checkState = loadCheckState();

    // デフォルトカテゴリを取得
    const defaultCategories = getTodayChecks();

    // カスタムアイテムをデフォルトカテゴリに追加
    const mergedCategories = defaultCategories.map(cat => {
      const customItemsForCategory = loadedCustomData.customItems.filter(
        item => item.category === cat.id
      );
      return {
        ...cat,
        items: [...cat.items, ...customItemsForCategory],
      };
    });

    // カスタムカテゴリを追加
    const allCategories = [...mergedCategories, ...loadedCustomData.customCategories];

    // チェック状態を復元
    if (checkState) {
      const restoredCategories = allCategories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const savedState = checkState.checkedItems[item.id];
          if (savedState) {
            return { ...item, checked: savedState.checked, checkedAt: savedState.checkedAt };
          }
          return item;
        }),
      }));
      setCategories(restoredCategories);
    } else {
      setCategories(allCategories);
    }

    setCustomData(loadedCustomData);
    setIsInitialized(true);
  }, []);

  // チェック状態を保存
  const saveCurrentCheckState = useCallback((cats: DailyCheckCategory[]) => {
    const checkedItems: CheckState['checkedItems'] = {};
    cats.forEach(cat => {
      cat.items.forEach(item => {
        if (item.checked) {
          checkedItems[item.id] = { checked: true, checkedAt: item.checkedAt };
        }
      });
    });
    saveCheckState({ date: getTodayDateString(), checkedItems });
  }, []);

  const toggleCheck = useCallback((itemId: string) => {
    setCategories(prev => {
      const newCategories = prev.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId
            ? { ...item, checked: !item.checked, checkedAt: !item.checked ? new Date().toISOString() : undefined }
            : item
        ),
      }));
      saveCurrentCheckState(newCategories);
      return newCategories;
    });
  }, [saveCurrentCheckState]);

  const resetAll = useCallback(() => {
    const loadedCustomData = loadCustomData();
    const defaultCategories = getTodayChecks();

    const mergedCategories = defaultCategories.map(cat => {
      const customItemsForCategory = loadedCustomData.customItems
        .filter(item => item.category === cat.id)
        .map(item => ({ ...item, checked: false, checkedAt: undefined }));
      return {
        ...cat,
        items: [...cat.items, ...customItemsForCategory],
      };
    });

    const customCategoriesReset = loadedCustomData.customCategories.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, checked: false, checkedAt: undefined })),
    }));

    const allCategories = [...mergedCategories, ...customCategoriesReset];
    setCategories(allCategories);

    // チェック状態をクリア
    saveCheckState({ date: getTodayDateString(), checkedItems: {} });
  }, []);

  // タスク追加
  const addItem = useCallback((
    categoryId: string,
    item: Omit<DailyCheckItem, 'id' | 'category' | 'checked' | 'isCustom'>
  ) => {
    const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: DailyCheckItem = {
      ...item,
      id: newId,
      category: categoryId,
      checked: false,
      isCustom: true,
    };

    setCategories(prev => {
      return prev.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, items: [...cat.items, newItem] };
        }
        return cat;
      });
    });

    // カスタムデータを保存
    setCustomData(prev => {
      const newData = {
        ...prev,
        customItems: [...prev.customItems, newItem],
      };
      saveCustomData(newData);
      return newData;
    });
  }, []);

  // タスク編集
  const updateItem = useCallback((
    itemId: string,
    updates: Partial<Pick<DailyCheckItem, 'title' | 'description' | 'howTo'>>
  ) => {
    setCategories(prev => {
      return prev.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }));
    });

    // カスタムアイテムの場合は保存
    setCustomData(prev => {
      const isCustomItem = prev.customItems.some(item => item.id === itemId);
      if (isCustomItem) {
        const newData = {
          ...prev,
          customItems: prev.customItems.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        };
        saveCustomData(newData);
        return newData;
      }

      // カスタムカテゴリ内のアイテムをチェック
      const newData = {
        ...prev,
        customCategories: prev.customCategories.map(cat => ({
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        })),
      };
      saveCustomData(newData);
      return newData;
    });
  }, []);

  // タスク削除
  const deleteItem = useCallback((itemId: string) => {
    // デフォルトアイテムは削除不可
    if (DEFAULT_ITEM_IDS.includes(itemId)) {
      console.warn('Cannot delete default item');
      return false;
    }

    setCategories(prev => {
      return prev.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== itemId),
      }));
    });

    setCustomData(prev => {
      const newData = {
        customItems: prev.customItems.filter(item => item.id !== itemId),
        customCategories: prev.customCategories.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.id !== itemId),
        })),
      };
      saveCustomData(newData);
      return newData;
    });

    return true;
  }, []);

  // カテゴリ追加
  const addCategory = useCallback((name: string) => {
    const newId = `custom-cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCategory: DailyCheckCategory = {
      id: newId,
      name,
      items: [],
      isCustom: true,
    };

    setCategories(prev => [...prev, newCategory]);

    setCustomData(prev => {
      const newData = {
        ...prev,
        customCategories: [...prev.customCategories, newCategory],
      };
      saveCustomData(newData);
      return newData;
    });

    return newId;
  }, []);

  // カテゴリ編集
  const updateCategory = useCallback((categoryId: string, name: string) => {
    setCategories(prev => {
      return prev.map(cat =>
        cat.id === categoryId ? { ...cat, name } : cat
      );
    });

    setCustomData(prev => {
      const newData = {
        ...prev,
        customCategories: prev.customCategories.map(cat =>
          cat.id === categoryId ? { ...cat, name } : cat
        ),
      };
      saveCustomData(newData);
      return newData;
    });
  }, []);

  // カテゴリ削除
  const deleteCategory = useCallback((categoryId: string) => {
    // デフォルトカテゴリは削除不可
    if (DEFAULT_CATEGORY_IDS.includes(categoryId)) {
      console.warn('Cannot delete default category');
      return false;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));

    setCustomData(prev => {
      const newData = {
        ...prev,
        customCategories: prev.customCategories.filter(cat => cat.id !== categoryId),
      };
      saveCustomData(newData);
      return newData;
    });

    return true;
  }, []);

  // デフォルトアイテムかどうかを判定
  const isDefaultItem = useCallback((itemId: string) => {
    return DEFAULT_ITEM_IDS.includes(itemId);
  }, []);

  // デフォルトカテゴリかどうかを判定
  const isDefaultCategory = useCallback((categoryId: string) => {
    return DEFAULT_CATEGORY_IDS.includes(categoryId);
  }, []);

  const stats = useMemo(() => {
    const allItems = categories.flatMap(cat => cat.items);
    const total = allItems.length;
    const completed = allItems.filter(item => item.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [categories]);

  const getCategoryStats = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return { total: 0, completed: 0, percentage: 0 };
    const total = category.items.length;
    const completed = category.items.filter(item => item.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [categories]);

  return {
    categories,
    toggleCheck,
    resetAll,
    stats,
    getCategoryStats,
    // 新しい機能
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    isDefaultItem,
    isDefaultCategory,
    isInitialized,
  };
}
