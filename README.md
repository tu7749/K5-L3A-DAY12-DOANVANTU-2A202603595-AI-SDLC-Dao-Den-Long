# Đảo Đèn Lồng · Giữ sáng tới bình minh

**Video demo: chưa quay.** Phase 3 theo [Ticket-03 — Đèn cạn dầu](docs/Ticket-03.md), Contract **v1.2**. Phase 4 chưa phát hành. Tài liệu lab gốc ở [docs/LAB-README.md](docs/LAB-README.md).

Game 3D góc nhìn thứ ba: cùng Mây thắp đèn ở Đảo Bến, Đảo Cau và Đảo Chuông. Mỗi đèn cần 10 đom đóm; Bóng Mực làm mất Ngọn Lửa, Gió Lạc cướp đom đóm. Giữ ít nhất 3/5, 4/6, 5/7 đèn sáng lúc hết giờ từng Đêm để đón Bình Minh. Không thắng sớm khi thắp đủ đèn.

## Cài và chơi (macOS/Linux)

Cần Node.js 24, npm và trình duyệt WebGL. Trong repo:

```sh
npm ci
npm run build
npm start
```

Mở **http://localhost:4173**. Nếu cổng đang dùng: `PORT=4174 npm start`. Bản web tĩnh ở `dist/`, không cần CDN sau cài đặt. Muốn nhận bản cập nhật, tải lại trang sau build.

## Chế độ hỗ trợ

Theo yêu cầu chơi dễ hơn, bản trình duyệt mặc định bật **Hỗ trợ**: chạy9m/s (+50%), bắt đầu40 đom đóm, sinh thêm mỗi2s, trần60; thêm điểm sinh hợp lệ trên từng bản đồ. Trong Hỗ trợ, thắp đủ tất cả đèn sẽ thắng ngay và tự vào Đêm kế tiếp; thắng Đêm3 hiện Bình Minh. Chế độ Chuẩn/headless vẫn chờ bình minh theo Phase3. Có bùa thì chạy10.8m/s. Vào Cài đặt để bật/tắt; áp dụng khi bắt đầu/chơi lại Đêm, nhãn HỖ TRỢ/CHUẨN hiện cạnh tên đảo. Headless và chế độ Chuẩn giữ đúng tuning6m/s,20 đom đóm, chu kỳ4s và trần30. Không đổi các tag phase đã nộp.

## Điều khiển

| Phím | Hành động |
| --- | --- |
| WASD | Đi theo camera; A trái, D phải |
| Kéo chuột | Xoay camera |
| Space | Nhảy |
| Shift | Lướt theo hướng di chuyển hoặc hướng đang nhìn |
| E | Nạp/thắp lại/châm dầu đèn nhận được gần nhất trong 2m |
| Q | Tỏa Sáng, tốn 3 đom đóm |
| Esc / P | Tạm dừng: tiếp tục, chơi lại Đêm, cài đặt, về menu |

Bùa đỏ giúp chạy nhanh và lướt không hồi chiêu trong 10s. Bục vàng phóng Mây sang đảo/tầng khác. Đèn sáng có ít nhất 30 dầu tạo vùng an toàn 6m. Dưới 30, Bóng Mực wander có thể tới hút dầu. Ngoài mép đảo có thể rơi; mất một lửa và toàn bộ đom đóm rồi hồi sinh sau 1s nếu còn lửa. Đêm 3 có gió báo trước bằng lá bay/âm thanh. Âm lượng, độ nhạy chuột và Bảng màu dễ phân biệt được lưu trên trình duyệt. Chế độ dễ phân biệt đổi viền/mắt Bóng Mực sang xanh lam, cảnh báo trắng kèm ⚠. Đèn tắt xẹp và có vết rách; đèn dưới30 dầu và thanh dầu nhấp nháy 1Hz.

Đêm 1/2/3 kéo dài **240/270/300 giây**. Đèn thắp lần đầu cần10 đom đóm, có100 dầu, tự hao1 mỗi giây. Đèn sáng nhận châm dầu (+10 dầu mỗi đom đóm, tối đa100). Tắt dầu thì mất tiến độ nạp; đèn từng sáng chỉ cần5 để thắp lại. Bóng đang hút làm hao thêm5 mỗi giây mỗi con. Sức chứa bắt đầu10, tăng2 mỗi lần thắp thành công (kể cả thắp lại), tối đa20.

Điểm: +5 mỗi đom đóm nạp/châm, +100 thắp mới, +40 thắp lại. Pulse trúng Bóng Mực thường +5/con, đang hút dầu +15/con. Thắng lúc bình minh cộng mỗi đèn còn sáng `50 + floor(dầu)` và50 mỗi ngọn lửa. Không thưởng thời gian. Tổng hành trình chỉ cộng các Đêm thắng; hết lửa luôn thua trước dù đúng tick bình minh.

## Headless và kiểm chứng

[game.contract.json](game.contract.json) ở gốc repo khai báo tuning, build/run/headless. Chạy không cần GPU/Three.js, chỉ Node:

```sh
node src/headless.mjs --seed 42 --night 2 --ticks 1200 --out /tmp/night2.jsonl --snapshot-every 10
```

Hỗ trợ `--night 1|2|3`, `--scenario`, `--inputs`. Sparse frames giữ trường cũ; input pause/dash theo cạnh nhấn. Tick 0 trước input; sự kiện dùng tick kết quả; pause tăng tick nhưng đóng băng sim_tick và gameplay. JSONL gồm snapshot v1.2, event và end. Lỗi input/scenario mã 2; lỗi runtime/ghi output mã 1.

```sh
npm run verify
node scripts/proof-phase3.mjs
```

`verify` chặn build khi test đỏ. CI chạy test/build. Script proof chạy10 scenario có assertion hai lần so byte và đo Đêm 3 đủ18.000 tick. Mỗi tính năng có input/output tại [docs/proof/phase-3](docs/proof/phase-3). Giả định, acceptance criteria, lỗi AI, thay test cũ và retro: [docs/notes/phase-3.md](docs/notes/phase-3.md).

Kết quả hiện tại: **58 test đạt** (gồm5 test hỗ trợ), headless dưới 1s; Chrome headless 1280×720 khoảng **60 FPS** từng Đêm (xem cửa sổ đo trong browser.json). Xem report.json/browser.json và ảnh trong thư mục proof. FPS là số đo máy phát triển, chưa phải stress test dài ở mật độ tối đa. Chưa có playthrough thủ công trọn ba Đêm hay kiểm tra audio bằng tai.

## Sáng tạo của tôi

Mây đội nón lá treo đèn nhỏ, đảo nổi có mây và cây procedural, vệt tỏa sáng, lời Ông Đăng và hiệu ứng làm mờ tầng che Mây. Chi tiết trang trí không thêm thực thể gameplay. Âm thanh tổng hợp trong trình duyệt, không dùng asset ngoài. Logic/bản đồ dùng chung browser và headless; tính tất định có test.

## Bàn giao và bước tiếp

- Giữ nguyên tag `phase-1` để chạy lại PRD-0 với luật cũ; Phase 2 chuẩn hóa tuning và mở rộng theo Ticket-02.
- Giữ tag `phase-2` cho luật cũ. Phase 3 có mốc bàn giao `phase-3`; ADR, lý do cập nhật test ở docs/notes/phase-3.md và breaking changes ở CHANGELOG.md. Bằng chứng cũ thuộc tag tương ứng, không phải luật hiện tại.
- Phase 4 chờ phát hành. Release `v1.0.0` và video cuối theo lịch Phase 4; hiện chưa tạo Release cuối.
- Cần quay mp4 dưới 5 phút và đặt link đầu README khi có video. Cần reviewer độc lập, số liệu token thực tế nếu công cụ cung cấp, xác nhận repo public/tên/deadline theo Coach.

Tài liệu: [CHECKPOINTS](CHECKPOINTS.md), [SUBMISSION](SUBMISSION.md), [RULES](RULES.md), [RUBRIC](RUBRIC.md). Nguồn và giấy phép: [CREDITS](CREDITS.md), [LICENSE](LICENSE).
