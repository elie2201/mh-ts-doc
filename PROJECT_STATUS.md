# mh TypeScript 移轉｜目前狀態

## 專案核心目標

將既有 mh Tampermonkey 使用者腳本逐步移轉至 TypeScript 開發，以取得靜態型別檢查、可靠的 IntelliSense，以及清楚可維護的模組相依性；最終仍產生單一、可整合至現有環境的 `my-mh-aid.js`。

主線原始碼留在本機 `Z:\share`，不存放於本文件庫。

## 開發與輸出要求

- 一個 class 一個檔案，使用 TypeScript 的 `import`／`export` 管理模組相依性。
- 按照既定用途分目錄，例如 `data`、`dao`、`cmd`、`core`、`utils`、`chk`、`addon`。
- 保留 `strict: true` 的靜態型別檢查，不以放寬型別或 `any` 掩蓋尚未釐清的契約。
- 最終輸出為單一 JavaScript 使用者腳本，不依賴發布環境中的 ES Module 載入。
- 轉換後類別及其參照須符合既有 `mh.<path>.ClassName` 結構，並保留既有 `mh` 根物件。
- 以可重複的型別檢查、建置、輸出檢查及必要的實際執行驗證確認結果。

## 原型階段狀態

**語法轉換器原型階段已正式結案。** 本階段的成果、最後一次已回報的驗證結果、診斷腳本用途、完成範圍與不可推論的事項，統一記錄於 [語法轉換器原型階段結案紀錄](records/08-converter-prototype-milestone.md)。

原型最後一次已回報的驗證結果為：`npm ci` 成功、`node --test` 17 項通過且 0 項失敗、`npx tsc --noEmit` 沒有診斷輸出。此為原型結果，不代表主線已完成型別檢查或建置整合；本次文件更新沒有重新執行測試。

## 當前主線狀態

**主線 M1 尚未完成。** 下一步回到本機 `Z:\share`，以最新實際檔案及命令結果確認主線現況。舊紀錄中的診斷只可當作歷史快照，不可直接假定目前仍存在。

### 下一步

1. 核對 `ts-src` 的實際目錄、檔案及目前實作進度。
2. 執行並記錄主線 TypeScript 型別檢查結果。
3. 確認現有模組的匯入、匯出、類別引用及命名空間映射規則。
4. 建立最小端到端驗證：TypeScript 原始碼 → 型別檢查／建置與轉換 → JavaScript 輸出 → 檢查 `mh` 結構及符號引用。
5. 確認建置輸出如何整合至既有 `my-mh-aid.js` 工作流程，並建立可重複執行的驗證。
6. 在取得主線型別檢查、建置及輸出驗證的實際證據前，不宣告主線 M1 完成。

### 主線型別檢查歷史快照

先前回報的 `npx tsc --noEmit --pretty false` 曾有四項診斷：

| 檔案／位置 | 診斷 | 待確認方向 |
|---|---|---|
| `ts-src/dao/AjaxProvider.ts(44,23)` | TS2304：Cannot find name `user` | 遊戲環境提供的物件／API 型別 |
| `ts-src/dao/AjaxProvider.ts(50,17)` | TS2339：Property `mh_BASE_URL` does not exist on type `{ core: {}; }` | 根層 `mh` 型別設計 |
| `ts-src/dao/AjaxProvider.ts(54,11)` | TS2304：Cannot find name `eventRegistry` | 遊戲環境提供的物件／API 型別 |
| `ts-src/dao/AjaxProvider.ts(63,29)` | TS2304：Cannot find name `jsDialog` | 遊戲環境提供的物件／API 型別 |

這是歷史快照，尚未重新確認是否仍有相同診斷。不可只為消除診斷就任意使用 `any`。

### 工具版本紀錄

| 項目 | 先前回報 |
|---|---|
| TypeScript（主線） | `7.0.2`，歷史回報，未於本次重新確認 |
| esbuild | `0.28.2`，歷史回報，未於本次重新確認 |
| TypeScript（原型） | `7.1.0-beta`，見原型驗證紀錄 |

## 正式紀錄索引

1. [專案目標](records/01-project-goals.md)
2. [專案基準與已定案決策](records/02-baseline-decisions.md)
3. [目前技術基準與驗證狀態](records/03-technical-baseline.md)
4. [實作進度與下一個里程碑](records/04-implementation-progress.md)
5. [語法轉換器階段性成果](records/05-converter-stage-results.md)
6. [語法轉換器階段性驗證結果](records/06-converter-validation.md)
7. [主線回歸與 M1 工作基準](records/07-mainline-return-and-m1.md)
8. [語法轉換器原型階段結案紀錄](records/08-converter-prototype-milestone.md)

## 更新原則

- 本檔案只維持目前狀態、當前工作及下一步；已結案階段的成果與歷史細節歸檔至 `records/`。
- 每次確認重要結論、排除問題或調整工作順序後，更新相關紀錄，避免後續反覆詢問或重新確認已回答的事項。
- 明確區分已實作、已通過測試、已通過型別檢查、已完成整合及已通過實際執行驗證等不同層級。
- 不把設計預期當成測試證據，也不因原型測試通過就推定主線整合完成。
