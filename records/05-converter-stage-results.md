# mh TypeScript 移轉｜語法轉換器階段性成果紀錄

## 一、紀錄目的

本紀錄整理 TypeScript 移轉過程中，曾經暫時轉向開發的語法轉換器。

本階段的成果是建立轉換器及相關測試案例，並針對模組化 TypeScript 與既有 `mh` 全域命名空間的整合問題進行驗證。

本紀錄保存原型的技術成果與測試範圍。原型階段已正式結案；結案狀態、最後一次驗證結果與不可推論的範圍，統一見 [原型階段結案紀錄](08-converter-prototype-milestone.md)。

## 二、原型專案

- 專案位置：`Z:\share\ts-mh-prototype`
- 轉換器主要入口：`build-mh.mjs`
- 測試目錄：`tests`
- 測試案例目錄：`tests\fixtures`
- 專案採用 ESM 模組形式。

本紀錄所列檔案均以原型專案中的名稱為準。

## 三、主要檔案及用途

| 檔案                                | 用途                                                               |
| --------------------------------- | ---------------------------------------------------------------- |
| `build-mh.mjs`                    | 語法轉換器主要入口，負責處理編譯後的 JavaScript，轉換成符合既有 `mh` 全域命名空間架構的輸出。          |
| `tests\regression.test.mjs`       | 回歸測試，驗證既有轉換行為，避免後續修改破壞原有功能。                                      |
| `tests\snapshot.test.mjs`         | 輸出快照測試，逐檔比較實際轉換結果與預期輸出。                                          |
| `tests\import-shadowing.test.mjs` | 驗證 import 名稱與區域變數同名時的轉換正確性。                                      |
| `test-shorthand-symbol.mjs`       | 獨立研究 TypeScript Compiler API 對 shorthand property 的 symbol 解析能力。 |
| `test-symbol.mjs`                 | 獨立研究 TypeScript Compiler API 的 symbol 解析及 declaration 資訊。        |

## 四、已涵蓋的轉換情境

以下依據原型專案的測試案例整理。

### 4.1 模組匯入與命名空間轉換

目前測試涵蓋：

- named import 的移除及轉換。
- 匯入類別的引用轉換為 `mh` 全域命名空間成員。
- 同一個類別在不同子命名空間中的引用。
- import alias 的解析及轉換。
- 匯入名稱與區域變數同名時，正確辨識引用來源。

### 4.2 區域變數與 import shadowing

目前測試涵蓋：

- 一般函式參數與 import 同名。
- 箭頭函式參數與 import 同名。
- 巢狀函式及巢狀 callback 中的同名參數。
- 解構參數與 import 同名。
- `catch` 參數與 import 同名。
- `for...of` 迴圈變數與 import 同名。
- `for...in` 迴圈變數與 import 同名。

核心驗證目標是：區域作用域中的同名變數應保留原有語意，不應被誤轉換為 `mh` 成員；真正引用 import 的位置則應正確轉換。

### 4.3 Object property 轉換

目前測試涵蓋：

- Object shorthand property。
- 一般 object property 的 value 引用。
- 保留 property key，同時轉換其 value。
- 匯入類別在 object literal 中的引用。

### 4.4 類別引用與名稱保留

目前測試涵蓋：

- 匯入類別的引用轉換。
- 類別名稱相關的輸出情境。
- 區域變數與匯入類別同名時的引用辨識。

## 五、測試案例與 Fixture

### 5.1 `tests\fixtures\shorthand-property`

用途：驗證 object shorthand property 中的匯入類別引用。

主要檔案：

| 檔案                     | 用途                          |
| ---------------------- | --------------------------- |
| `src\Base.ts`          | 提供匯入類別的來源。                  |
| `src\Consumer.ts`      | 建立 shorthand property 測試案例。 |
| `build\Base.js`        | TypeScript 編譯後的來源。          |
| `build\Consumer.js`    | TypeScript 編譯後的測試輸入。        |
| `expected\Consumer.js` | 預期的轉換結果。                    |
| `output\Base.js`       | 轉換器實際輸出的來源類別檔案。             |
| `output\Consumer.js`   | 轉換器實際輸出的測試結果。               |
| `tsconfig.json`        | Fixture 專用 TypeScript 編譯設定。 |

### 5.2 `tests\fixtures\import-shadowing`

用途：驗證 import 名稱與區域變數同名時的正確轉換。

主要測試案例：

| 檔案                    | 測試目的                        |
| --------------------- | --------------------------- |
| `Base.ts`             | 提供匯入類別來源。                   |
| `Consumer.ts`         | 解構參數與 import 同名。            |
| `OrdinaryConsumer.ts` | 一般函式參數與 import 同名。          |
| `NestedConsumer.ts`   | 巢狀 callback 中的同名參數。         |
| `CatchConsumer.ts`    | `catch` 參數與 import 同名。      |
| `ForConsumer.ts`      | `for...of` 迴圈變數與 import 同名。 |
| `ForInConsumer.ts`    | `for...in` 迴圈變數與 import 同名。 |
| `AliasConsumer.ts`    | import alias 的引用轉換。         |

此 Fixture 包含 `src`、`build` 及 `output` 目錄，分別保存測試來源、編譯後輸入及轉換結果。

## 六、測試狀態與證據邊界

目前可從所提供的專案資料確認：

- 存在回歸測試。
- 存在輸出快照測試。
- 存在 import shadowing 測試。
- 存在 shorthand property 測試。
- 存在 TypeScript Compiler API 的 symbol 研究程式。

但本紀錄所依據的資料並未提供完整、可核對的最新測試執行結果。

因此：

- 測試案例的存在，不等於測試已通過。
- 預期輸出與實際輸出檔案的存在，不等於兩者已經一致。
- 獨立研究程式的存在，不等於相關 API 已經完整整合到轉換器。

後續若需要確認測試通過狀態，應以實際執行結果為依據。

## 七、階段性決策

### 7.1 暫停通用化

目前不以完成通用語法轉換器為前提。

保留現有成果，將轉換器視為 TypeScript 移轉主線的支援工具。

### 7.2 回到 TypeScript 移轉主線

先繼續實際的 TypeScript 移轉工作，不因轉換器尚未支援所有可能情境而停滯。

### 7.3 依實際需求補充

當主線遇到新的語法或輸出情境時：

1. 確認目前轉換器是否已能處理。
2. 若無法處理，再針對該情境補充能力。
3. 增加相應測試案例。
4. 記錄新增能力及驗證結果。

### 7.4 最後再評估通用化

待主線累積足夠實際案例，且時間允許時，再評估是否將轉換器完善為通用工具。

通用化不是目前主線的必要前置條件。

## 八、原型階段結案狀態\n\n原型階段已結案。最後一次已回報的驗證為 17 項自動化測試通過、0 項失敗，且 `npx tsc --noEmit` 沒有診斷輸出。這些結果的具體日期背景、測試數量變化及適用限制，請以 [原型階段結案紀錄](08-converter-prototype-milestone.md) 為準。早期 19 項測試是歷史結果，不應視為目前測試數量。\n\n## 九、本紀錄的定位

本紀錄保存語法轉換器的階段性成果、檔案用途、測試範圍及工作順序決策。

程式碼及完整測試實作仍保留在原型專案中，不複製至本紀錄。

後續若新增轉換能力，應依實際需求增補紀錄，不應將尚未實作或尚未驗證的情境直接列為已完成。

【紀錄結束】
