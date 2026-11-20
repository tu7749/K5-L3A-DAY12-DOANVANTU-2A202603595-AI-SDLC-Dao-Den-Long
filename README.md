# Đảo Đèn Lồng

**Video demo: chưa quay.** Bản triển khai Phase 1 theo PRD-0 / Test Contract v1.0. Mốc bàn giao hiện tại: `phase-1`. Chưa có ticket Phase 2–4 hay GitHub Release. README gốc được giữ tại [docs/LAB-README.md](docs/LAB-README.md).

Game 3D góc nhìn thứ ba: cùng Mây gom đom đóm, thắp năm chiếc đèn và tránh Bóng Mực trước bình minh.

## Cài đặt và chơi

Cần Node.js 24, npm, trình duyệt hỗ trợ WebGL trên macOS/Linux. Chạy tại gốc repo:

```sh
npm ci
npm run build
npm start
```

Mở **http://localhost:4173**. Sau cài đặt, không cần CDN. `dist/` là bản web tĩnh để đóng gói, cần phục vụ qua HTTP. Chưa kiểm tra hình ảnh trực tiếp bằng trình duyệt trong phiên này.

## Điều khiển

| Phím | Hành động |
| --- | --- |
| WASD | Di chuyển theo camera |
| Kéo chuột | Xoay camera |
| Space | Nhảy |
| E | Nạp đèn gần nhất |
| Q | Tỏa sáng, tốn 2 đom đóm |
| Escape / Tạm dừng | Tạm dừng và tiếp tục |

Mỗi đèn cần 5 đom đóm, mang tối đa 10. Thắp đủ 5 đèn để thắng. Hết 3 ngọn lửa hoặc hết 300 giây thì thua. Đèn sáng bảo vệ trong 6m. Bấm **Chơi lại Đêm 1** sau khi kết thúc.

Điểm: 10 mỗi lần nhặt, 100 mỗi đèn, 20 mỗi Bóng Mực trúng pulse. Thắng cộng phần nguyên giây còn lại và 50 mỗi ngọn lửa còn lại. Tuning tại [game.contract.json](game.contract.json) được browser và headless đọc chung. Không phạt rơi: mép đảo chặn người chơi, `fall_enabled=false`.

## Headless và kiểm chứng

Không cần Three.js, GPU hay cửa sổ, chỉ cần Node:

```sh
node src/headless.mjs --seed 42 --night 1 --ticks 600 --out /tmp/dao-den-long.jsonl --snapshot-every 10
```

Scenario chiến thắng một tick, đèn dựng sẵn không cộng điểm:

```sh
node src/headless.mjs --seed 42 --night 1 --scenario docs/proof/scenario.json --inputs docs/proof/inputs.json --ticks 60 --out /tmp/win.jsonl --snapshot-every 1
```

Test: `npm test`. Kiểm tra và build: `npm run verify`, build chỉ chạy khi test xanh. CI chạy lại khi push/PR. Bằng chứng tại [docs/proof](docs/proof), giả định và nhật ký tại [docs/notes/phase-1.md](docs/notes/phase-1.md).

Snapshot 0 trước input; sparse frames giữ giá trị; nút kích hoạt false→true; mỗi bước 1/60 giây; event dùng tick sau bước. JSONL kết thúc bằng dòng end. Dữ liệu sai mã 2, lỗi chạy/ghi output mã 1. Cùng seed/scenario/input cho cùng byte output.

## Sáng tạo của tôi

Đảo nổi giữa tầng mây, cây và đá procedural, vòng sáng quanh đèn, sương mỏng dần, vệt pulse và lời nhắc hành trình. Các chi tiết thuộc renderer, không thêm thực thể gameplay vào headless. Test kiểm tra tính tất định lõi dùng chung; chưa có ảnh bằng chứng đồ họa.

## Còn thiếu trước khi nộp cuối

- Ticket-02/03/04 và triển khai tương ứng.
- Chơi thử trực tiếp, reviewer độc lập, ảnh và video mp4 dưới 5 phút.
- Số liệu token/chi phí thực tế, hiệu năng theo ticket khi có.
- Commit/tag đúng mốc từng phase, push repo public, Release v1.0.0. Không dựng lịch sử phase giả.
- Tên repo theo SUBMISSION cần hậu tố `-Dao-Den-Long`, hiện chưa đổi tên.

Tài liệu lab: [CHECKPOINTS](CHECKPOINTS.md), [GUIDE](GUIDE.md), [SUBMISSION](SUBMISSION.md), [RULES](RULES.md), [RUBRIC](RUBRIC.md). Nguồn: [CREDITS](CREDITS.md), giấy phép: [LICENSE](LICENSE).
