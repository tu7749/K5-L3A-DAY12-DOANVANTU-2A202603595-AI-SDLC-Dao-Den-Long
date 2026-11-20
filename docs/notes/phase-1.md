# Phase 1: giả định, kế hoạch và đánh giá

Nguồn yêu cầu: `docs/PRD-0.md`, bản artifact người dùng cung cấp. Tệp chỉ chứa Phase 1; chưa có Ticket-02/03/04. Không tuyên bố hoàn thành các phase chưa có yêu cầu.

## Quyết định trước khi triển khai

- Dùng JavaScript ESM, Node 24, Three.js. Logic thuần dùng chung browser/headless; không cần GPU hay thư viện ngoài cho headless.
- Contract ở gốc repo làm nguồn tuning duy nhất. Input kiểm tra trước khi mô phỏng; lỗi đầu vào mã 2, lỗi ghi output mã 1.
- Kiểm chứng trước: unit test cho camera, bán kính, capacity, deposit, pulse, damage, invulnerability, safe zone, jump, win/loss; integration test CLI cho sparse frames, tick 0, JSONL, tính tất định, lỗi file.

## Các giả định PRD chưa quy định

- Đảo bán kính 34m, chặn ở mép (không phạt rơi, `fall_enabled=false`). Tốc độ di chuyển trên mặt đất/không trung như nhau. Nhảy vận tốc 7m/s, trọng lực 18m/s²; khoảng cách gameplay luôn theo XZ.
- 65 đom đóm ban đầu; thêm một đom đóm mỗi 180 tick nếu còn dưới 65. Ba Bóng Mực ban đầu; thêm một mỗi 600 tick. Scenario có `random_*:false` tắt sinh tự động tương ứng. Thực thể dựng sẵn không phát event spawn.
- Nạp đèn gần nhất trong bán kính, chuyển tối đa phần còn thiếu, cho phép nạp từng phần. Nạp đủ 5 thì sáng vĩnh viễn.
- Pulse tốn 2 đom đóm kể cả không trúng. Mỗi Bóng Mực trúng được 20 điểm. Không đủ ánh sáng hoặc đang cooldown thì không phát event pulse. Push không đẩy vào vùng đèn sáng.
- Bị chạm mất một ngọn lửa, rơi `ceil(carried*0.5)` đom đóm, các đom đóm rơi cách chân 2.5m; có thể nhặt lại khi đi tới. Miễn nhiễm 2 giây. Đèn sáng bảo vệ trong bán kính 6m.
- Thứ tự tick: di chuyển/nhảy, nhặt, nạp, pulse, Bóng Mực/sát thương, trừ thời gian, kết thúc, spawn. Hết máu ưu tiên thua, sau đó kiểm tra đủ đèn, rồi bình minh.
- Điểm: 10 mỗi lần nhặt, 100 mỗi đèn, 20 mỗi Bóng Mực bị pulse; thắng cộng phần nguyên giây còn lại và 50 mỗi ngọn lửa còn lại. Đom đóm nhặt lại cũng cộng điểm (giả định chưa có quy tắc chống farm).
- State terminal chỉ được xác định trong bước gameplay đầu tiên nếu scenario dựng sẵn đã thỏa thắng/thua. Snapshot 0 luôn là trạng thái dựng scenario, không có input/event/điểm.

## Đánh giá và nhật ký AI

- Codex thực hiện đọc yêu cầu, lập thiết kế, tạo code, unit/integration test, build và bằng chứng. Không dùng subagent. Chưa có reviewer độc lập.
- Lỗi môi trường: link Claude trả 403, dùng bản xuất do người dùng cung cấp; npm bị DNS trong sandbox, cài thành công sau cấp quyền mạng.
- Harness: AGENTS.md giữ quy tắc tick, source tuning và tính trung thực; npm run verify chặn build nếu test thất bại; GitHub Actions chạy lại khi push.
- Token/chi phí từng phase: chưa có số liệu đo từ công cụ; không điền con số giả. Tiết kiệm bằng logic chung, một dependency và test headless không cần trình duyệt.
- Đã có kết quả test và bản web build. Chưa xác minh hình ảnh/điều khiển bằng trình duyệt, chưa quay video, bàn giao mã hiện tại bằng tag `phase-1`; chưa có Release. Không ghi các mục đó là đạt.
- Retro: bản export yêu cầu giúp tránh đoán contract. Lần tiếp theo lấy đủ ticket trước khi lập kế hoạch phase kế tiếp; bổ sung kiểm tra chơi trực tiếp và reviewer độc lập trước khi phát hành.

## Bàn giao Phase 1

- Đã sửa A/D theo góc nhìn camera trong browser, giữ quy ước trục X của headless theo contract.
- Chạy lại npm run verify trước khi tạo commit/tag; bằng chứng tại docs/proof/verify.txt.
- Tag dùng thời gian thực khi tạo; chưa có thông tin giờ bắt đầu lab để xác nhận đúng deadline.
