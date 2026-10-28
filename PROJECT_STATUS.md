# MouseHunt TypeScript 移轉｜目前狀態

## 專案目標

逐步將既有 MouseHunt Tampermonkey 使用者腳本移轉至 TypeScript，利用靜態型別檢查與明確的模組契約降低開發不確定性；維持多檔案、`import`／`export` 的開發方式，最終仍整合為單一 `my-mh-aid.js`。

原始碼留在本機，不存放於本文件庫。

## 已記錄的成果

- 已建立語法轉換器原型，位置記錄為 `Z:\\share\\ts-mh-prototype`。
- 原型曾執行 `node --test`，19 項測試通過；這只證明當時測試案例範圍內的原型結果，不代表主線整合完成。
- 原型的目標輸出形式已明確為 `mh.<path>.ClassName = class ClassName {}`，並以 TypeScript AST／語意資訊辨識模組與符號引用。
- 已將正式階段紀錄拆分為獨立文件，集中於 `records/`。
- 主線 M1（核對現況、型別檢查、模組／命名空間映射及單檔整合驗證）仍未完成。

## 當前工作狀況

目前已回到主線專案 `Z:\\share`，並執行 TypeScript 型別檢查。以下是使用者本次提供的實際命令結果：

### 工具版本

| 項目 | 目前回報 |
|---|---|
| TypeScript | `7.0.2`（`npx tsc --version`） |
| esbuild | `0.28.2` |
| TypeScript 套件 | `typescript@7.0.2` |

### 型別檢查

執行：

```powershell
npx tsc --noEmit --pretty false
```

目前回報 4 項診斷：

| 檔案／位置 | 診斷 | 現況說明 |
|---|---|---|
| `ts-src/dao/AjaxProvider.ts(44,23)` | TS2304：Cannot find name `user` | 尚待確認此全域符號的宣告與使用契約 |
| `ts-src/dao/AjaxProvider.ts(50,17)` | TS2339：Property `MOUSEHUNT_BASE_URL` does not exist on type `{ core: {}; }` | 目前 `mh` 型別結構未呈現此根層成員；需對照既定 registry／global 型別設計 |
| `ts-src/dao/AjaxProvider.ts(54,11)` | TS2304：Cannot find name `eventRegistry` | 尚待確認此全域符號的宣告與使用契約 |
| `ts-src/dao/AjaxProvider.ts(63,29)` | TS2304：Cannot find name `jsDialog` | 尚待確認此全域符號的宣告與使用契約 |

這些診斷是目前主線型別檢查的真實結果；尚未確認根因，也尚未修正。不可僅為消除診斷而放寬型別或把全域依賴任意塞入抽象層。

## 當前理解與待釐清事項

- 主線以多檔案 TypeScript 的 `import`／`export` 作為開發方式，最終轉換並整合至既有 `mh` 全域物件及單一使用者腳本。
- `registry.ts`、`index.ts` 的責任與全域命名空間映射，先前已在對話中討論；應回到既有決議與 `mh-ts-doc` 的紀錄核對，不應將目前診斷簡化成「缺少一般 global declaration」後另起一套設計。
- `mh` 的七個子命名空間為 `data`、`dao`、`cmd`、`core`、`utils`、`chk)、`addon`（請以專案 registry 的實際定義核對）；`MOUSEHUNT_BASE_URL` 是 `mh` 根層成員，不屬於上述子命名空間。
- `ts-mh-prototype` 的轉換器驗證與主線整合是不同階段。原型測試通過不等於主線的 `registry.ts`、`index.ts`、全域型別及建置流程已整合完成。

## 下一步：處理目前 M1 的具體缺口

1. 依 `mh-ts-doc` 中關於 `registry.ts`、`index.ts` 的既有說明與決議，核對主線目前的實作，確定 namespace registry、根層 `mh` 成員及入口整合的預期形狀。
2. 追查 `AjaxProvider.ts` 所用的 `user`、`eventRegistry`、`jsDialog` 與 `mh.MOUSEHUNT_BASE_URL`，釐清它們各自應由哪個宣告／契約提供，以及應在何層處理。
3. 依查明的契約修正型別或實作，再重跑 `npx tsc --noEmit --pretty false`，記錄新的實際結果。
4. 繼續核對轉換器如何將模組／類別／常數映射至既有 `mh` 全域結構，以及如何安全產生並整合單一 `my-mh-aid.js`。
5. 在取得可重複的型別檢查、建置及輸出驗證證據前，不宣告主線 M1 完成。

## 正式紀錄索引

1. [專案目標](records/01-project-goals.md)
2. [專案基準與已定案決策](records/02-baseline-decisions.md)
3. [目前技術基準與驗證狀態](records/03-technical-baseline.md)
4. [實作進度與下一個里程碑](records/04-implementation-progress.md)
5. [語法轉換器階段性成果](records/05-converter-stage-results.md)
6. [語法轉換器階段性驗證結果](records/06-converter-validation.md)
7. [主線回歸與 M1 工作基準（含 M1 里程碑紀錄）](records/07-mainline-return-and-m1.md)

## 更新原則

- 本檔案只維持目前狀態、當前工作及下一步，不作為詳細歷史紀錄的唯一存放處。
- 完成重要工作或 milestone 後，將已完成階段的決策、成果與驗證結果整理至 `records/`，再更新本檔案，使其持續反映現在的工作與待辦。
- 明確區分已實作、已通過型別檢查、已完成整合、已通過實際執行驗證等不同層級。
- 不把設計預期當成測試證據，也不因原型測試通過就推定主線整合完成。

