# macOS Photoshop Setup

## 初期テスト

1. Photoshopで対象PSDを開きます。
2. 対象PSDを保存済みの状態にします。
3. Photoshopで以下を選びます。

```text
ファイル > スクリプト > 参照...
```

4. このリポジトリの `scripts/add_hp_copyright.jsx` を選択します。
5. 初回実行時は、クレジット用テンプレートPSDを選択します。

## テンプレートPSD

テンプレートPSDはGit管理外に置いてください。

テンプレートPSD内には、名前が完全一致する以下のレイヤーグループを作成しておきます。

```text
クレジット白
```

スクリプトはこのグループだけを対象PSDへ複製します。

## 設定ファイル

テンプレートPSDのパスは、ExtendScriptのユーザー領域に保存されます。

スクリプト内では以下のような場所を使います。

```text
Folder.userData + "/PhotoshopHpCopyright/config.txt"
```

保存内容はテンプレートPSDの絶対パスだけです。

テンプレートPSDを移動した場合は、設定ファイルを削除するか、正しいパスに書き換えてから再実行してください。

## スクリプトメニューに置く運用

安定後は、Photoshopの `Presets/Scripts` に `scripts/add_hp_copyright.jsx` へのシンボリックリンクを作ると、Photoshopのスクリプトメニューから直接実行できます。

Photoshopのバージョンやインストール場所により `Presets/Scripts` の場所は異なるため、使用中のPhotoshopのアプリケーションフォルダを確認してください。

