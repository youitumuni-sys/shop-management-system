"use client";

import { AlertTriangle, Shield, Phone, FileText, Users, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmergencyManualPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">緊急対応マニュアル</h1>
          <p className="text-muted-foreground">
            トラブル発生時の対応手順
          </p>
        </div>
      </div>

      {/* 性被害・盗撮トラブル対応マニュアル */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800 dark:text-red-400">
              【店舗運営用】性被害・盗撮トラブル対応マニュアル（改訂版）
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {/* 1. 現場での初動 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive" className="text-lg px-3 py-1">1</Badge>
              <h2 className="text-xl font-bold">現場での初動（スタッフの動き）</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              トラブルの報告を受けたら、現場を混乱させないよう迅速に動きます。
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-blue-500 h-fit">隔離</Badge>
                <p>キャストと客を即座に別室へ。直接の接触を断ちます。</p>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-blue-500 h-fit">確保</Badge>
                <p>客の身分証（免許証等）を預かるか写真に撮り、スマホ内の証拠（隠しフォルダや削除済み項目）を確認します。</p>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-blue-500 h-fit">肯定</Badge>
                <p>キャストに「店が対応するから大丈夫」と伝え、安心させます。</p>
              </div>
            </div>
          </section>

          {/* 2. 対応の判断フロー */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive" className="text-lg px-3 py-1">2</Badge>
              <h2 className="text-xl font-bold">対応の判断フロー（重要）</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              スタッフが独断で動かず、組織として対応します。
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-orange-500 h-fit">上長連絡</Badge>
                <p>直ちに現場責任者・オーナーへ状況を詳細に報告する。</p>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-orange-500 h-fit">示談交渉の準備</Badge>
                <div>
                  <p>客に対し、事実関係を認めさせた上で「示談（金銭解決）」の意思があるか確認する。</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    ※店側から法外な金額をふっかけると「恐喝」になるため、客側の提示を待つか「相応の解決金」という表現に留める。
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-orange-500 h-fit">警察・弁護士の検討</Badge>
                <p>客が否認し続ける、反省の色がない、またはキャストの被害感情が極めて強いなど、示談が困難な場合は速やかに警察へ通報し、法的措置へ切り替える。</p>
              </div>
            </div>
          </section>

          {/* 3. 解決とケア */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive" className="text-lg px-3 py-1">3</Badge>
              <h2 className="text-xl font-bold">解決とケア（事後処理）</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-green-500 h-fit">処理</Badge>
                <div>
                  <p className="font-medium">示談成立時：</p>
                  <p className="text-muted-foreground">後日のトラブルを防ぐため、示談書を取り交わす。</p>
                  <p className="font-medium mt-2">決裂時：</p>
                  <p className="text-muted-foreground">警察に引き継ぎ、店側は証拠（動画・身分証コピー）を提供する。</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-green-500 h-fit">ケア</Badge>
                <p>キャストの病院手配（アフターピル、検査、診断書作成）を最優先で行う。</p>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Badge className="bg-green-500 h-fit">共有</Badge>
                <p>グループ店舗および近隣店へ「ブラックリスト（NG客）」として情報を共有し、再発を防止する。</p>
              </div>
            </div>
          </section>

          {/* 4. スタッフの禁止事項 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive" className="text-lg px-3 py-1">4</Badge>
              <h2 className="text-xl font-bold">スタッフの禁止事項（再確認）</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <Ban className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">「キャストを責める」</p>
                  <p className="text-sm text-muted-foreground">（自責念を抱かせない）</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <Ban className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">「独断で客を逃がす」</p>
                  <p className="text-sm text-muted-foreground">（必ず上長の指示を仰ぐ）</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <Ban className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">「示談金の着服」</p>
                  <p className="text-sm text-muted-foreground">（キャストへ渡すべき金を店が勝手に抜かない）</p>
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
