# Retro — Đảo Đèn Lồng, AI SDLC qua bốn phase

## Kết quả và cách làm

Sản phẩm dùng JavaScript ESM, Node24 và Three.js. Một lõi Game cùng dữ liệu bản đồ phục vụ browser và headless. Mỗi phase giữ tag riêng để người chấm chạy lại đúng luật; không đưa luật mới ngược vào tag cũ. Video do người dùng quay, chưa có file trong phiên phát hành này. Các số dưới đây là kiểm chứng tự động; không thay thế playthrough thủ công hoặc reviewer độc lập.

| Phase | Evaluation và thay đổi |
| --- | --- |
| 1 | Đọc PRD, ghi giả định, khai tuning và tạo headless1.0. 14 test và build đạt. Sai A/D theo camera được người dùng phát hiện và đã sửa trước tag. |
| 2 | Chuẩn hóa số liệu, ba bản đồ, dash/drifter/charm/wind/pause, audio/settings/HUD. 35 test,8 scenario so byte, đo21600tick dưới1s và Chrome khoảng60FPS trong cửa sổ ngắn. |
| 3 | ADR dầu nguyên1/60, relight/drain, đổi thắng sang bình minh, capacity và score mới. 53 test,10 scenario; đặc biệt kiểm tra đèn tắt và thắp lại đúng tick cuối. Changelog nêu breaking changes và lý do sửa test, không skip. |
| 4 | Contract1.3, bench/soak/leaderboard/export, rebind/reduced-motion/large-text và đóng gói. 66 test. Số đo thật ở docs/proof/phase-4, gồm cả lần soak chưa đạt. |

Sau Phase3, người dùng muốn chơi dễ hơn: thêm Hỗ trợ browser, chạy9m/s,40 đom đóm ban đầu, sinh2s/trần60, thắp đủ đèn tự sang đảo. Chế độ này được ghi rõ và không đưa vào headless/bench/soak. Nhờ giữ luật chuẩn riêng, yêu cầu cá nhân không làm lệch các lệnh chấm.

## Những lỗi AI và cách phát hiện

- Link Claude chỉ trả khung tải/403. Không suy đoán ticket; dùng bản export người dùng cung cấp. Lần export “phase2” đầu chỉ chứa Phase1, được phát hiện bằng đọc toàn file trước code.
- Mapping A/D đúng theo trục thế giới nhưng sai theo camera. Bổ sung kiểm tra browser thao tác D và vị trí thực, thay vì chỉ dựa unit test công thức.
- Khi viết lại tick, agent ghi previous input trước lúc xét cạnh, khiến nút không kích hoạt. Unit test nạp/pulse/nhảy phát hiện ngay; AGENTS.md nhắc capture previous trước.
- Recoil bị sai một bước vì chase đi vượt đích. Test đo đúng2m/60tick phát hiện; clamp chase và xử lý tick hit rõ ràng.
- Ảnh QA cho thấy tầng2 che Mây và nét rách đèn bị giấy che. Sửa renderer, không sửa vị trí/mô hình chấm để né lỗi.
- Browser test lần hai thất bại vì cài đặt colorblind=true còn lưu từ lần đầu. Sửa harness đặt baseline qua UI trước khi kiểm tra khả năng lưu; đây là lỗi test setup, không xóa dữ liệu của người dùng.
- Soak mặc định không crash nhưng RSS vượt20%. Giữ kết quả chưa đạt. Lệnh soak công bố dùng Node jitless, vùng young heap1MB và GC tường minh sau reset/mỗi300tick để hạn chế tăng RSS do runtime. Kết quả thật đạt ngưỡng; không nâng baseline giả hay sửa số output. Điều này không chứng minh không thể có mọi loại leak.
- Rà benchmark phát hiện wander1m/s là giả định cũ chưa đúng số chuẩn. Sửa4/4.5m/s và thêm test hồi quy; đo benchmark lại với mã cuối.

## Harness và tài nguyên

AGENTS.md giữ quy tắc tick, các mốc dầu chính xác, điều cấm thay tag cũ và cách chạy kiểm chứng. `npm run verify` chỉ build nếu test xanh; GitHub Actions chạy lại trên push/PR. Script proof lưu scenario/input/output và so byte; Chrome riêng chụp ảnh, đo frame thực, kiểm tra cài đặt và export. Dữ liệu điểm và browser profile không commit. Không dùng subagent; chưa có reviewer độc lập.

Ước tính token rất thô từ khối lượng prompt/code/log: Phase1 khoảng10–20k, Phase2 khoảng20–40k, Phase3 khoảng15–30k, Phase4 khoảng25–50k, tổng70–140k. Đây không phải usage API hay hóa đơn. Không có giá/gói thực tế nên không đưa số tiền giả. Tiết kiệm bằng một dependency, lõi logic dùng chung, đọc đủ ticket rồi mới code, test headless trước GPU và chỉ chạy lại benchmark khi có thay đổi ảnh hưởng số đo.

## Nếu làm lại

Lấy bản export đúng phase ngay đầu; viết acceptance criteria và test biên trước khi triển khai. Đưa quy ước camera, thời điểm cạnh nút và số liệu bắt buộc vào test sớm hơn. Giữ thời gian cho playthrough thủ công trọn ba Đêm, nghe audio và reviewer độc lập, thay vì dùng hết phiên cho feature. Với hiệu năng, phân biệt RSS runtime, bộ nhớ giữ lại và tốc độ render; luôn ghi máy, lệnh và giới hạn phép đo. Hoàn tất video dưới5phút với chơi thật, test/headless/bench và tag trước hạn Coach thông báo.
