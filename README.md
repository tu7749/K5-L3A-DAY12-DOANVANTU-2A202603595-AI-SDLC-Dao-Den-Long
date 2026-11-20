# Đảo Đèn Lồng · Ba hòn đảo

**Video demo: chưa quay.** Phase 2 đã triển khai theo [Ticket-02](docs/Ticket-02.md), Contract **v1.1**. Phase 3/4 chưa phát hành. Tài liệu lab gốc ở [docs/LAB-README.md](docs/LAB-README.md).

Game 3D góc nhìn thứ ba: cùng Mây thắp đèn ở Đảo Bến, Đảo Cau và Đảo Chuông. Mỗi đèn cần 10 đom đóm; Bóng Mực làm mất Ngọn Lửa, Gió Lạc cướp đom đóm. Thắng đủ ba Đêm để đón Bình Minh.

## Cài và chơi (macOS/Linux)

Cần Node.js 24, npm và trình duyệt WebGL. Trong repo:

```sh
npm ci
npm run build
npm start
```

Mở **http://localhost:4173**. Nếu cổng đang dùng: `PORT=4174 npm start`. Bản web tĩnh ở `dist/`, không cần CDN sau cài đặt. Muốn nhận bản cập nhật, tải lại trang sau build.

## Điều khiển

| Phím | Hành động |
| --- | --- |
| WASD | Đi theo camera; A trái, D phải |
| Kéo chuột | Xoay camera |
| Space | Nhảy |
| Shift | Lướt theo hướng di chuyển hoặc hướng đang nhìn |
| E | Nạp đèn chưa sáng gần nhất trong 2m |
| Q | Tỏa Sáng, tốn 3 đom đóm |
| Esc / P | Tạm dừng: tiếp tục, chơi lại Đêm, cài đặt, về menu |

Bùa đỏ giúp chạy nhanh và lướt không hồi chiêu trong 10s. Bục vàng phóng Mây sang đảo/tầng khác. Đèn đã sáng tạo vùng an toàn 6m. Ngoài mép đảo có thể rơi; mất một lửa và toàn bộ đom đóm rồi hồi sinh sau 1s nếu còn lửa. Đêm 3 có gió báo trước bằng lá bay/âm thanh. Âm lượng và độ nhạy chuột được lưu trên trình duyệt.

Điểm chuẩn: +10 mỗi đom đóm **nạp**, +100 mỗi đèn thắp, +5 mỗi Bóng Mực trúng Tỏa Sáng. Thắng cộng `floor(giây còn lại) × 2 + 50 × số lửa`. Tổng hành trình chỉ cộng các Đêm đã thắng. Thua được thử lại Đêm hiện tại.

## Headless và kiểm chứng

[game.contract.json](game.contract.json) ở gốc repo khai báo tuning, build/run/headless. Chạy không cần GPU/Three.js, chỉ Node:

```sh
node src/headless.mjs --seed 42 --night 2 --ticks 1200 --out /tmp/night2.jsonl --snapshot-every 10
```

Hỗ trợ `--night 1|2|3`, `--scenario`, `--inputs`. Sparse frames giữ trường cũ; input pause/dash theo cạnh nhấn. Tick 0 trước input; sự kiện dùng tick kết quả; pause tăng tick nhưng đóng băng sim_tick và gameplay. JSONL gồm snapshot v1.1, event và end. Lỗi input/scenario mã 2; lỗi runtime/ghi output mã 1.

```sh
npm run verify
node scripts/proof-phase2.mjs
```

`verify` chặn build khi test đỏ. CI chạy test/build. Script proof chạy 8 scenario hai lần so byte và đo Đêm 3 đủ 21.600 tick. Mỗi tính năng có input/output tại [docs/proof/phase-2](docs/proof/phase-2). Giả định, acceptance criteria, lỗi AI, thay test cũ và retro: [docs/notes/phase-2.md](docs/notes/phase-2.md).

Kết quả hiện tại: **35 test đạt**, headless dưới 1s; Chrome headless 1280×720 khoảng **60 FPS** từng Đêm (cửa sổ đo 5s). Xem report.json/browser.json và ảnh trong thư mục proof. FPS là số đo máy phát triển, chưa phải stress test dài ở mật độ tối đa. Chưa có playthrough thủ công trọn ba Đêm hay kiểm tra audio bằng tai.

## Sáng tạo của tôi

Mây đội nón lá treo đèn nhỏ, đảo nổi có mây và cây procedural, vệt tỏa sáng, lời Ông Đăng và hiệu ứng làm mờ tầng che Mây. Chi tiết trang trí không thêm thực thể gameplay. Âm thanh tổng hợp trong trình duyệt, không dùng asset ngoài. Logic/bản đồ dùng chung browser và headless; tính tất định có test.

## Bàn giao và bước tiếp

- Giữ nguyên tag `phase-1` để chạy lại PRD-0 với luật cũ; Phase 2 chuẩn hóa tuning và mở rộng theo Ticket-02.
- Mốc bàn giao Phase 2: tag `phase-2`; xem checkpoint và bằng chứng để phân biệt mục đã kiểm chứng với giới hạn.
- Phase 3/4 chờ phát hành. Release `v1.0.0` và video cuối theo lịch Phase 4; hiện chưa tạo Release cuối.
- Cần quay mp4 dưới 5 phút và đặt link đầu README khi có video. Cần reviewer độc lập, số liệu token thực tế nếu công cụ cung cấp, xác nhận repo public/tên/deadline theo Coach.

Tài liệu: [CHECKPOINTS](CHECKPOINTS.md), [SUBMISSION](SUBMISSION.md), [RULES](RULES.md), [RUBRIC](RUBRIC.md). Nguồn và giấy phép: [CREDITS](CREDITS.md), [LICENSE](LICENSE).
