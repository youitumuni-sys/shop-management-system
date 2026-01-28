"use client";

import { useState } from "react";
import { Save, User, Bell, Palette, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    userName: "管理者",
    email: "admin@example.com",
    notifications: true,
    dailyReminder: true,
    soundEnabled: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // モック保存処理
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">
          システムの各種設定を管理します
        </p>
      </div>

      <div className="grid gap-6">
        {/* ユーザー情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>ユーザー情報</CardTitle>
            </div>
            <CardDescription>
              ログインユーザーの情報を設定します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">ユーザー名</Label>
              <Input
                id="userName"
                value={settings.userName}
                onChange={(e) =>
                  setSettings({ ...settings, userName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>通知設定</CardTitle>
            </div>
            <CardDescription>
              通知とリマインダーの設定を管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>通知を有効にする</Label>
                <p className="text-sm text-muted-foreground">
                  タスク完了やリマインダーの通知を受け取ります
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>毎日のリマインダー</Label>
                <p className="text-sm text-muted-foreground">
                  日次チェックのリマインダーを毎朝送信します
                </p>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, dailyReminder: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>通知音</Label>
                <p className="text-sm text-muted-foreground">
                  通知時にサウンドを再生します
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, soundEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>データ管理</CardTitle>
            </div>
            <CardDescription>
              データのエクスポートやリセット
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>データエクスポート</Label>
                <p className="text-sm text-muted-foreground">
                  全データをCSV形式でダウンロードします
                </p>
              </div>
              <Button variant="outline">エクスポート</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>日次チェックリセット</Label>
                <p className="text-sm text-muted-foreground">
                  本日の日次チェックをリセットします
                </p>
              </div>
              <Button variant="outline">リセット</Button>
            </div>
          </CardContent>
        </Card>

        {/* システム情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>システム情報</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">バージョン</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ビルド日</span>
                <span>2026-01-28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">環境</span>
                <span>Development</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          {saved ? "保存しました" : "保存"}
        </Button>
      </div>
    </div>
  );
}
