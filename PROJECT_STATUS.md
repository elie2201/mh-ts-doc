# MouseHunt TypeScript 移轉｜目前狀態

## 專案核心目標

將既有 MouseHunt Tampermonkey 使用者腳本逐步移轉至 TypeScript 開發，以取得靜態型別檢查、可靠的 IntelliSense，以及清楚可維護的模組相依性；最終仍產生單一、可整合至現有環境的 `my-mh-aid.js`。

原始碼留在本機，不存放於本文件庫。

### 開發階段的要求

- 一個 class 一個檔案。
- 使用 TypeScript 的 `import`／`export` 管理模組相依性。
- 按照既定用途分目錄，例如 `data`、`dao`、`cmd`、`core`、`utils`、`chk`、`addon`。
- 以靜態型別檢查及 IntelliSense 儘早發現錯誤，不以放寬型別或 `any` 來掩蓋尚未釐清的契約。

### 最終產物的要求

- 最終輸出為單一 `my-mh-aid.js`。
- 不依賴最終使用環境中的 ES Module 載入。
- 類別及其參照需轉換成既有腳本所需的 `mh.<path>.ClassName` 結構；目標形式例如 `mh.dao.Provider = class Provider {}`。
- 必須保留正確的類別相依性、繼承、符號引用與既有 `mh` 根物件的使用方式。
- 以可重複的測試、型別檢查、建置與輸出檢查驗證結果，不能只憑設計推論宣告完成。

## 設計原則

**從需求與可驗證的輸出結果決定架構，不從目前已建立的檔案反推需求。**

先前做到一半的 `index.ts`、`registry.ts`、`mh-global.d.ts` 不再視為既定架構或必須完成的前提。後續應先完成 `ts-mh-prototype` 的驗證，再依實際需求重新決定：

- 是否需要獨立的 registry 或整合入口。
- 類別如何映射到既有的 `mh` 命名空間。
- 全域 `mh` 與根層常數如何提供適當的開發期型別。
- 遊戲環境提供的全域物件／API（例如 `user`、`eventRegistry`、`jsDialog`）如何取得或定義型別。

以上設計尚未定案。任何額外檔案或抽象層都必須有清楚的實際用途；不能只因它已存在就沿用，也不應在尚未驗證 prototype 前先行補完。

### 轉換器的範圍原則

**本專案不是要開發通用語法解析器；解析器／AST 工具只是達成 TypeScript 移轉目標的手段。**

- 轉換器的成功標準是能可靠地把本專案實際使用、且為最終輸出所需的 TypeScript／模組結構，轉成符合 MouseHunt 腳本要求的單一 JavaScript。
- 不追求支援所有合法 TypeScript 語法、所有 JavaScript 語言情境或任意專案；不為通用性而擴大範圍。
- 以本專案的真實程式碼、既定目錄與相依模式界定必要功能，對每項轉換需求建立對應測試。
- 遇到尚未使用或不在本專案需求內的語法，先判斷是否真的需要；若不需要，應明確列為不支援／範圍外，而不是自動擴充成通用解析器。
- 可以使用 TypeScript Compiler API、AST 或其他現成工具，但工具選擇與實作複雜度都應服務於可靠產生目標輸出；不能把「做出通用解析器」當成獨立目標。

## 已記錄的成果

- 已建立語法轉換器原型，位置記錄為 `Z:\\share\\ts-mh-prototype`。
- 原型曾執行 `node --test`，19 項測試通過。此結果只代表當時測試案例範圍內的原型結果，不代表轉換器已涵蓋所有實際語法，也不代表主線整合完成。
- 原型的目標輸出形式已明確為 `mh.<path>.ClassName = class ClassName {}`，並以 TypeScript AST／語意資訊辨識模組與符號引用。
- 已將正式階段紀錄拆分為獨立文件，集中於 `records/`。
- 主線 M1 尚未完成。

## 當前工作狀況

目前工作應先回到 `ts-mh-prototype`，確認原型目前已完成的功能、測試涵蓋範圍及尚未處理的案例。先前主線中的部分型別宣告與整合檔案是在原型工作期間暫停的，不應讓它們改變目前的優先順序。

### 工具版本紀錄

| 項目 | 先前回報 |
|---|---|
| TypeScript | `7.0.2`（`npx tsc --version`） |
| esbuild | `0.28.2` |

以上為先前回報的版本，並非本次重新檢查的結果。

### 主線型別檢查快照

先前使用者提供的 `npx tsc --noEmit --pretty false` 結果有 4 項診斷：

| 檔案／位置 | 診斷 | 後續處理方向 |
|---|---|---|
| `ts-src/dao/AjaxProvider.ts(44,23)` | TS2304：Cannot find name `user` | 遊戲環境提供的物件／API；型別策略待定 |
| `ts-src/dao/AjaxProvider.ts(50,17)` | TS2339：Property `MOUSEHUNT_BASE_URL` does not exist on type `{ core: {}; }` | 根層 `mh` 型別設計待重新決定 |
| `ts-src/dao/AjaxProvider.ts(54,11)` | TS2304：Cannot find name `eventRegistry` | 遊戲環境提供的物件／API；型別策略待定 |
| `ts-src/dao/AjaxProvider.ts(63,29)` | TS2304：Cannot find name `jsDialog` | 遊戲環境提供的物件／API；型別策略待定 |

這是先前主線型別檢查的結果快照，不代表目前重新執行後仍是相同結果，也不是當前工作的第一優先事項。不可只為消除診斷就任意使用 `any`。

## 下一步

1. 回到 `Z:\\share\\ts-mh-prototype`，盤點目前轉換器實作與 19 項測試實際涵蓋的範圍。
2. 找出 prototype 尚未完成的工作與風險，尤其是模組解析、符號／別名辨識、類別宣告與引用轉換、繼承關係，以及最終輸出格式。
3. 以具體測試驗證 prototype 的轉換能力；不要只因既有測試通過就推定所有必要情境都已涵蓋。
4. 根據驗證結果決定正式建置方式，先做最小可行的端到端驗證：TypeScript 原始碼 → 型別檢查／轉換建置 → 單一 JavaScript → 檢查輸出中的 `mh` 結構及符號引用。
5. prototype 的轉換策略清楚後，再回到主線重新設計整合方式及型別宣告；屆時再處理遊戲 API 的開發期型別。
6. 在取得可重複的型別檢查、建置及輸出驗證證據前，不宣告主線 M1 完成。

## 正式紀錄索引

1. [專案目標](records/01-project-goals.md)
2. [專案基準與已定案決策](records/02-baseline-decisions.md)
3. [目前技術基準與驗證狀態](records/03-technical-baseline.md)
4. [實作進度與下一個里程碑](records/04-implementation-progress.md)
5. [語法轉換器階段性成果](records/05-converter-stage-results.md)
6. [語法轉換器階段性驗證結果](records/06-converter-validation.md)
7. [主線回歸與 M1 工作基準（含 M1 里程碑紀錄）](records/07-mainline-return-and-m1.md)

## 更新原則

- 本檔案維持目前狀態、當前工作及下一步；詳細歷史與里程碑成果另記錄於 `records/`。
- 每次確認重要結論、排除問題或調整工作順序後，可更新本檔案，避免後續反覆詢問或重新確認已回答的事項。
- 明確區分已實作、已通過測試、已通過型別檢查、已完成整合及已通過實際執行驗證等不同層級。
- 不把設計預期當成測試證據，也不因原型測試通過就推定主線整合完成。
