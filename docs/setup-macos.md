# macOS Photoshop Setup

## ワンクリック実行にする

### 1. Photoshopのスクリプトメニューに登録する

Photoshopを終了します。

Photoshopの `Presets/Scripts` に `scripts/add_hp_copyright.jsx` へのシンボリックリンクを作ります。

例:

```sh
ln -s "/path/to/AddCopyrightToPSD/scripts/add_hp_copyright.jsx" "/Applications/Adobe Photoshop 2025/Presets/Scripts/HP Copyright PSD.jsx"
```

`/path/to/AddCopyrightToPSD` と `/Applications/Adobe Photoshop 2025` は、自分の環境に合わせて置き換えてください。

Photoshopを起動し、以下に `HP Copyright PSD` が表示されることを確認します。

```text
ファイル > スクリプト > HP Copyright PSD
```

表示されない場合は、リンク先のパスとPhotoshopのバージョン別フォルダを確認してからPhotoshopを再起動してください。

### 2. アクションボタンを作る

1. Photoshopで `ウィンドウ > アクション` を開きます。
2. アクションパネルで新規アクションを作成します。
3. 名前を `HP Copyright PSD` などにします。
4. 記録が始まったら、アクションパネルのメニューから `メニュー項目を挿入...` を選びます。
5. `ファイル > スクリプト > HP Copyright PSD` を選択します。
6. `OK` を押し、アクションの記録を停止します。
7. アクションパネルのメニューから `ボタンモード` を有効にします。

以後は、対象PSDを開いて保存済みの状態にしてから、アクションパネルの `HP Copyright PSD` ボタンをクリックするだけで実行できます。

必要であれば、新規アクション作成時にファンクションキーも割り当てられます。

## 登録後にスクリプトを更新する

上記のようにシンボリックリンクで登録している場合は、`scripts/add_hp_copyright.jsx` を更新すれば、Photoshopのメニュー項目やアクションはそのまま使えます。

通常は、更新後に同じ `HP Copyright PSD` ボタンをクリックするだけです。

メニュー名を変えた場合、リンク先の場所を変えた場合、または `ファイル > スクリプト` に表示されない場合は、Photoshopを再起動してください。

シンボリックリンクではなく `Presets/Scripts` にJSXファイルをコピーして登録した場合は、更新のたびにコピー先のJSXファイルも差し替える必要があります。

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

## 補足

Photoshopのバージョンやインストール場所により `Presets/Scripts` の場所は異なるため、使用中のPhotoshopのアプリケーションフォルダを確認してください。
