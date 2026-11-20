# Phase 2 — kế hoạch và acceptance criteria

Nguồn: docs/Ticket-02.md. Phase 3/4 chưa phát hành. Giữ tag phase-1 để tái lập luật cũ.

## Kế hoạch trước triển khai

1. Chuẩn hóa tuning và ba bản đồ; cập nhật tick pipeline và schema v1.1.
2. Kiểm chứng lướt, rơi/hồi sinh, pulse 3D, vùng an toàn, sinh theo lịch, tầng/dốc/bục.
3. Thêm drifter/charm/wind và scenario cho từng tính năng.
4. Giao diện chuỗi Đêm, pause/settings/audio/HUD/palette.
5. Hồi quy, đo headless, build sạch; lưu bằng chứng rồi commit/tag/push.

## Acceptance criteria phần 3

| Yêu cầu | Cách chứng minh |
| --- | --- |
| Gió Lạc | idle→chase khi ≥5 và ≤15m; chạm cướp tối đa 3; flee 240 tick; pulse trả đồ, 120 tick biến mất; test + scenario |
| Bùa Gió | nhặt theo XZ/độ cao, 600 tick, chạy 7.2, dash không cooldown, tái xuất sau 2700; test + scenario |
| Chuỗi Đêm | menu→intro→play→result→next, thua retry cùng Đêm, thắng Đêm 3 Bình Minh tổng điểm các Đêm thắng; kiểm tra controller và chơi trực tiếp |
| Pause | input cạnh, tick tăng nhưng sim_tick và toàn bộ gameplay dừng; menu resume/retry/settings/home; test + scenario |
| Settings | volume/sensitivity lưu localStorage, khôi phục lúc mở; kiểm tra trình duyệt |
| Audio | nhạc procedural và cue pickup/light/pulse/hit/jump/dash/win/loss/spawn/10s; kiểm tra trình duyệt |
| HUD | vị trí theo ticket, 10 ô, cooldowns, E nạp, mũi tên ngoài màn hình, đồng hồ đỏ chớp ≤30s; kiểm tra trình duyệt |
| Palette/light | màu chuẩn trong renderer/CSS, ambient=0.15+0.55*lit/total; kiểm tra mã và trình duyệt |

## Thay luật / giả định cần ghi rõ

- Test Phase 1 dùng số tự chọn (pickup 1.5, cost 5, drop ceil, điểm khi nhặt, pulse push tức thì) được sửa theo Ticket-02; không tắt test âm thầm.
- Góc điểm sinh dùng x=r*cos(a), z=r*sin(a). Chọn điểm trống bằng PRNG seeded.
- Ticket không quy định thời gian spawning/wander: spawning 30 tick cho bóng sinh theo lịch; wander 1m/s tới điểm sinh kế tiếp. Bóng scenario mặc định chase, hoạt động ngay.
- Pulse dùng 3D cho cả Bóng Mực/Gió Lạc. Gió Lạc scenario mặc định Y do scenario cung cấp; sinh mặc định tâm Y=0.8.
- Bóng Mực không rơi khỏi địa hình; cầu/dốc là đường đi, vách/tower chặn. Safe zone theo XZ và không chặn Gió Lạc.
- Night 3 xuất phát chân (0,0,0) theo contract gốc; bên dưới tầng 2, không tự dịch chuyển lên. Các tầng là bề mặt rắn có thể đứng phía dưới; tower chỉ chiếm từ Y=6.
- Điểm gió cảnh báo ở tick 1680, bắt đầu 1800, dài 300 tick, lặp mỗi 1800; hướng chốt khi cảnh báo. Bùa tái xuất tính từ lúc nhặt.

## Kết quả và hồi quy

- 35 test đạt: 14 test Phase 1 được giữ và cập nhật theo Ticket-02, thêm 21 test cho bản đồ/lướt/độ cao/pause/bùa/Gió Lạc/rơi/wind/pad/chuỗi điểm/recoil/thứ tự chọn đèn.
- Lỗi AI phát hiện qua test: đọc cạnh input sau khi đã ghi previous làm mọi nút không kích hoạt. Sửa capture previous trước; thêm quy tắc AGENTS.md. Test recoil còn phát hiện chase vượt qua đích; clamp bước đến khoảng cách thực để tổng recoil đúng 2m.
- 8 scenario headless, mỗi scenario chạy 2 lần so byte. Script tái lập: node scripts/proof-phase2.mjs. Xem docs/proof/phase-2/report.json và các cặp scenario/inputs/output.
- Headless đủ 21.600 tick Đêm 3 dưới 1s trên máy hiện tại; báo cáo có CPU/OS/Node. Đây là số đo máy phát triển, không suy ra máy chấm.
- Chrome headless thật, viewport 1280×720, đo 5 giây mỗi Đêm: khoảng 60 FPS. Kiểm tra D theo camera, pause không tăng sim_tick, cài đặt lưu và phục hồi qua reload; 0 runtime exception. Ảnh và browser.json trong docs/proof/phase-2.
- QA ảnh phát hiện tầng trên che Mây ở Đêm 3; renderer làm mờ bề mặt tầng/tháp khi Mây ở dưới, không đổi logic headless. Night 3 bắt đầu dưới tầng 2 theo giả định xuất phát gốc.
- Browser QA chưa phải playthrough thủ công thắng đủ ba Đêm, chưa nghe audio bằng tai. Âm thanh procedural đã có cue và nhạc nền; audio context được mở bằng thao tác người dùng, browser QA click qua menu không lỗi.
- Skill Sites dùng trong phiên Phase 1 cho phần web; Phase 2 tiếp tục repo local và kiểm tra bằng Chrome profile tạm riêng, không deploy lên hosting khác. Không dùng subagent/reviewer độc lập.
- Token/chi phí: ước tính thủ công rất thô khoảng 20.000–40.000 token dựa trên khối lượng prompt, code và log trong lượt Phase 2; không phải số usage đo từ API. Không có dữ liệu giá/gói nên chưa ước tính chi phí tiền. Tiết kiệm bằng dùng chung bản đồ/logic, không thêm dependency và kiểm tra headless trước GPU.

## Truy vết phần 3 đến bằng chứng

| Mục | Bằng chứng |
| --- | --- |
| Gió Lạc | drifter-steal-drop.*; unit test steal/drop/flee; renderer ribbon |
| Bùa Gió | charm.*; test speed/dash/respawn 2700 tick |
| Chuỗi 3 Đêm | src/campaign.js; test campaign điểm chỉ tính Đêm thắng; ảnh menu/intro; UI result/next/dawn |
| Pause/menu | pause.*; browser.json pause_freezes; pause.png/settings.png |
| Settings | browser.json settings/restored qua reload, localStorage |
| Audio | src/audio.js và cue dispatch browser.js; chưa kiểm tra bằng tai |
| HUD/palette | ảnh night1/2/3.png; index.html/style.css; ambient formula browser.js |
| Hiệu năng | report.json headless 21600 tick; browser.json FPS cả 3 Đêm tại 1280×720 |

## Retro Phase 2

Tách bản đồ giúp cùng một dữ liệu phục vụ test và render. Các test thời lượng phải kiểm tra cả tick bắt đầu, không chỉ giá trị cuối: recoil thiếu/đủ một bước là ví dụ. Trước phase sau cần ưu tiên playthrough thủ công, nghe audio và kiểm tra ngưỡng FPS dài hơn ở scene đông thực thể. Chưa có yêu cầu Phase 3/4 nên giữ nguyên phạm vi Phase 2.

## Cài đặt từ bản sạch

Clone local với --no-local tại commit 9c765fc vào /tmp/day12-phase2-clean-20261120, chạy npm ci (cache npm tách biệt đã có tarball), npm run verify: cài 1 package, audit 0 vulnerabilities, 35/35 test đạt và build dist thành công. Không dùng node_modules của repo gốc.
