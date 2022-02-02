# color
讀取圖片並將各像素點之數值取平均

---

## 第一版 (基本)
[網頁程式](https://color.hijimmy.tk/basic)&emsp;[原始碼](js/basic.js)

輸入圖片之後，透過 cavnas 取得圖片的像素資訊，將各像素點的RGB值取算術平均數後藉由 [Color.js](https://colorjs.io/) 傳換至其他色彩空間。

## 第二版 (進階)
[網頁程式](https://color.hijimmy.tk/advanced)&emsp;[原始碼](js/advanced.js)

基於第一版，增加了以下功能：
  - 可以查看各 channel 的詳細數據，如極值、四分位數、標準差等
  - 利用 [Chart.js](https://www.chartjs.org/) 生成各數值對出現數量的散佈圖
  - 更多可調整的選項，像是圖片大小縮放、要使用什麼設採空間、需要捨棄多少極端值等

## 第三版 (OpenCV)
[網頁程式](https://color.hijimmy.tk/opencv)&emsp;[原始碼](js/opencv.js)

為了解決人工裁減圖片仍然會有布塊的問題，嘗試使用 [OpenCV](https://opencv.org/) 函式庫來過濾布塊，保留污漬部分，同時也增快了運算速度，不過也取消了計算平均值以外的其他統計功能。

## 第四版 (Python)
[原始碼](py/process.py)

由於先前的方法都是透過瀏覽器來執行 JavaScript，需要人工的輸入圖片，以及紀錄數據，有些繁瑣。所以嘗試使用 Python 來實現自動載入圖片、記錄數據(`.csv` 檔)，色彩空間轉換則是使用 [Color Math](https://python-colormath.readthedocs.io/)</a> 實現。