# Phase 4 — kế hoạch và tiêu chí nghiệm thu

Nguồn: docs/Ticket-04.md. Giữ tag phase-1/2/3; Hỗ trợ browser là lựa chọn chơi thêm, luôn tắt trong benchmark, soak và headless.

## Kế hoạch trước triển khai

1. Bổ sung Contract1.3 bench_cmd/soak_cmd, benchmark cảnh chuẩn và đo frame thực từ Chrome riêng; không tự bịa số đo.
2. Soak10 Đêm cùng process, input seeded, RSS sau tải đầu và reset cuối; chạy thật và ghi máy chạy.
3. Leaderboard top10, ASCII name3–12, tie theo achieved_at; API server ghi file local, CLI export cùng file; bản web tĩnh fallback localStorage và nút xuất.
4. Đổi đủ9 hành động, báo trùng, reset/lưu; chỉ báo xuất hiện bóng/gió/countdown/dầu yếu; reduced motion, font18px+large1.25.
5. Unit/integration/browser QA, clone sạch/build, README/ảnh/changelog/credits/retro. Commit số đo và tag phase-4, Releasev1.0.0 có zip bản chạy.
6. Video demo do người dùng quay theo trao đổi trước; chưa có file thì ghi rõ chưa có, không làm video giả.

## Tiêu chí

- Benchmark200 wander/100 motes/3 lit fuel100; input/spawn/damage/pickup/decay/end tắt; camera30m cao15m vòng15s; warmup3s rồi đo đúng cửa sổduration. avg/p1/p95 tính từ dt thật, load từ tiến trình tới frame đầu. Web RSS null và ghi lý do.
- Soak chạy1→2→3 xoay vòng, seed7+i (i bắt đầu0), đổi hướng mỗi30tick, xác suất từng nút theo ticket; crashes0, RSSend<=1.2*RSSstart.
- Leaderboard đúng entry và sort/top10, tồn tại sau restart; export qua run_cmd trả entries.
- UI lưu binding/settings qua reload; từ chối phím trùng; default restore; warning đủ4 loại; font>=18px tại1280×720, chữ lớn nhân1.25.
- Bộ test trước còn hiệu lực không skip. Bằng chứng phải nói rõ giới hạn (máy phát triển, thời lượng, chưa kiểm tra audio bằng tai).

## Quyết định và lỗi phát hiện

- Dùng Chrome app window riêng cho benchmark, CDP đặt bounds1280×720, không fullscreen; canvas/viewport1280×720. Ảnh QA dùng headless riêng, không dùng số đó thay benchmark cửa sổ. Vsync/frame cap yêu cầu tắt qua flags Chrome; metadata và raw dt giữ để tính lại.
- Đo load từ process uptime (gồm bootstrap/import), nhận binding ở frame đầu sau render. Dts đo trong cửa sổ sau warmup, nearest-rank p95; k=ceil(1%N) cho p1. RSSwebnull có giải thích; không dùng RSSNode driver làm bộ nhớ game.
- Soak Node mặc định: không crash nhưng RSS46.20→82.69MB, vượt20%. Giữ soak-default-runtime.json. Lệnh công bố dùng jitless/young heap1MB/GC mỗi300tick và sau reset; lượt chính thức43.31→49.45MB, dưới20%, không sửa tay số. Không suy từ đây rằng mọi leak đều bị loại bỏ; số đo máy chấm có thể khác.
- Rà benchmark phát hiện wander còn dùng1m/s tự chọn ở phase cũ; sửa về4/4.5 và thêm test tốc độ, chạy lại toàn bộ hồi quy, bench và soak. Không đổi các luật dầu/điểm/thắng.
- Leaderboard API lưu đĩa bằng ghi tạm/rename; sort score giảm rồi timestamp tăng, top10; timestamp server. Schema validator dùng chung client/server. Dữ liệu local không commit. Web tĩnh fallback localStorage rõ giới hạn CLI.
- Cài đặt bàn phím dùng KeyboardEvent.code, phát hiện trùng trước khi lưu. Chế độ reduced-motion dừng CSS animation và nháy đèn, giữ cảnh báo dầu bằng chữ. Tối thiểu18px, root chữ lớn22.5px. Tất cả9 phím và tên phím trên HUD/footer cập nhật cùng nhau.

## Truy vết đến bằng chứng

| Yêu cầu | Bằng chứng |
| --- | --- |
| Benchmark scene200/100/3lit/camera/freeze | tests/phase4.test.mjs; bench.json.scene.json xác nhận số lượng, trạng thái, dầu, vị trí camera đầu, viewport/bounds |
| Benchmark thresholds/formulas | bench.json, bench.json.frames.json; node scripts/validate-proof.mjs tính lại từ dt |
| Soak10 Đêm/crash/RSS | soak.json và source scripts/soak.mjs; environment.json; giữ lượt default chưa đạt |
| Leaderboard schema/sort/top10/disk | unit test; browser.json persisted_after_server_restart, cli_export_matches; leaderboard.png/save-score.png |
| Đổi9 phím/trùng/reset/lưu | unit test settings; browser.json rebound_jump_works/settings_persisted/restore_defaults; settings-bindings.png |
| Chỉ báo4 loại | browser.json và spawn-direction.png,wind-low-fuel.png,countdown.png |
| Font/reduce motion | browser.json small_fonts=[]; toggle restored true; kiểm tra22.5px; ảnh QA |
| Hồi quy |66 test, không skip; verify.txt; các test luật thay thế có lý do Phase3 |
| Đóng gói |release/dao-den-long-v1.0.0.zip (không commit binary tạo lại được), README.txt trongZIP, License/Credits |
| Retro/video |docs/RETRO.md; docs/demo/README.md. Video chưa có, người dùng quay |

## Đánh giá / tài nguyên

Benchmark/QA được chạy bằng Chrome profile tạm riêng và tự đóng; không điều khiển browser cá nhân. Hỗ trợ chỉ chơi thường, benchmark/soak chuẩn. Đã kiểm tra repo public và chuẩn hóa tên theo SUBMISSION; không đổi lịch sử/tag cũ. Không có reviewer độc lập hay nghe audio bằng tai/playthrough thủ công trọn3 Đêm.

TokenPhase4 ước tính thủ công25–50k, không phải usage API. Không có dữ liệu giá/gói để tính tiền. Giảm chi phí bằng không thêm dependency, dùng module logic chung, đo smoke trước30s, và chỉ đo lại khi sửa điều ảnh hưởng phép đo. Retro tổng hợp ở docs/RETRO.md.

## Số đo cuối

Benchmark cửa sổ Chrome app thực: avg338.64FPS, p1low184.55FPS, p95frame3.9ms,10158frame trong cửa sổ30s sau warmup3s, load1430.85ms từ process startup. Raw dt và bounds/camera/counts được validator tính lại/xác nhận. Đây là số máy AppleM1/16GB, không cam kết máy chấm. Soak10Đêm crashes0, RSS43.3125→49.453125MB (+14.18%). Tất cả10bot thua là kết quả thật.

## Clone và gói phát hành

Clone --no-local commit515ea0d vào /tmp/day12-phase4-clean-20261120; npm ci cache độc lập cài1 dependency, audit0;66/66 test và build đạt. PORT=4175 npm start chạy thành công; GET HTML/browserJS/Three.js/contract1.3/leaderboardAPI đều200, xem clean-clone.json. Gói ZIP433109byte,22file runtime/asset được so byte với nguồn và bản build; exportCLI chạy trong bundle không cần npm install. SHA256 ở package.json trong thư mục proof. Không đưa runtime data hay token vào gói.
