# Phase 3 — Đèn cạn dầu

Nguồn: docs/Ticket-03.md. Kế hoạch: thay trạng thái đèn/dầu và luật thắng trước; cập nhật những test bị thay thế; thêm scenario biên 0/30, drain, refuel, relight, capacity; cập nhật UI/accessibility; chạy hồi quy và browser QA; commit/tag/push phase-3. Phase 4 chưa có ticket.

## ADR-003: dầu nguyên, lịch tick và bình minh

- Mỗi đèn giữ fuelUnits nguyên (một đơn vị = 1/60 fuel), ever_lit và relit_count. Snapshot xuất fuel làm tròn một chữ số. Default lit:true → 6000 đơn vị và ever_lit:true, không cộng successful_lights hay điểm. Scenario fuel quy đổi round(fuel*60).
- Bước 2 trừ 1 đơn vị hao tự nhiên và 5 đơn vị cho mỗi bóng đang drain đèn còn sáng ở đầu bước. Tắt ngay khi <=0, đặt deposited=0 và giữ ever_lit. Vì thứ tự ticket, bóng chỉ rời drain ở bước AI sau đó (và vẫn hút tick đó dù Mây tiến vào hoặc châm đủ dầu sau bước 2).
- Đèn nhận tương tác nếu chưa sáng hoặc fuelUnits<6000. Thắp lần đầu cần10, từng sáng cần5; châm dầu dùng ceil((6000-fuelUnits)/600). Thắp thành công tăng successful_lights; sức chứa min(20,10+2*successful_lights).
- Chỉ kết thúc thắng ở bình minh khi đủ ceil(0.6*n) đèn còn sáng; hết máu ưu tiên trên mọi kết quả. Điểm bonus đọc dầu sau toàn bộ tick cuối. Không còn thưởng thời gian/all_lit.
- Wander ưu tiên đèn sáng yếu, nếu không có thì đèn tắt; chọn gần nhất và id tăng dần. Wander tới đèn yếu trong2m thì drain; chase giữ logic phát hiện/bỏ đuổi. Hết choáng về wander trước khi chọn mục tiêu tick đó (không lập tức chase); tick sau lại phát hiện bình thường. Nếu drain bị châm lên>=30, state thành wander và được đẩy ra vùng an toàn.
- fuel_drain phát mỗi khi sim_tick chia hết60 cho từng bóng đã thực sự hút ở bước2. Ticket chưa chỉ rõ chu kỳ tính từ bắt đầu drain hay từ Đêm: chọn lịch sim_tick chung để tái lập, không dựa tick pause.

## Những test cũ được thay thế có lý do

- all_lit thắng ngay → xác nhận tiếp tục playing; test thắng/bổ sung điểm chuyển sang bình minh đúng ngưỡng.
- Thời lượng300/330/360 →240/270/300.
- Điểm deposit10→5, thưởng thời gian bỏ; điểm pulse thường5 giữ, drain15 mới.
- Safe zone đèn sáng luôn bật → chỉ bật khi fuel>=30; regression dùng đèn mới/thời gian ngắn vẫn giữ được.
- Capacity luôn10→10–20 theo successful_lights; scenario setup không tự tăng số lần thắp.
- Các luật di chuyển, lướt, pause, bùa, Gió Lạc, vật lý và spawn không đổi. Không skip test.

## Acceptance criteria và bằng chứng

| Yêu cầu | Kiểm chứng |
| --- | --- |
| Dầu100/hao1/tắt/reset/ever_lit | unit test tick6000, pause; fuel-expiry.* |
| Châm dầu/ceil/chọn đèn/skip đầy | unit refuel và nearest; refuel.* |
| Thắp lại5/capacity10–20/điểm | unit partial relight/score/capacity; capacity20.*, relight-on-dawn.* |
| Weak<30 mất safe, đúng30 còn | test integer threshold; refuel-safe-ejection.* |
| Wander chọn weak/drain/thoát/pulse | test chọn id, chase không đổi, nhiều drain, pulse15; drain-stacking.*, drain-pulse.* |
| Thắng bình minh/ngưỡng/ưu tiên máu | unit cả3 Đêm và last-tick relight; no-early-win.*, dawn-insufficient.*, relight-on-dawn.* |
| Điểm mới không thưởng thời gian | unit dawn fuel floor, failed dawn no bonus, first/relight/refuel/pulse |
| V1.2 snapshot/scenario/events | validation test; CLI output từng scenario |
| Thanh dầu, nháy1Hz, off scale/tear | Chrome QA visual state + ảnh fuel-normal/colorblind.png |
| Colorblind viền/mắt xanh, warning trắng ⚠ | browser.json assert màu/shade material/checkbox persisted; colorblind-setting.png |
| Không hỏng cơ chế không bị thay | toàn bộ53 test, không skip; giữ tag phase-1/phase-2 |

## Kết quả / nhật ký AI / retro

- 53 test đạt: giữ35 regression (sửa các assertion/tên theo luật thay thế, không xóa/skip), thêm18 test Phase3. Xem verify.txt.
- 10 scenario có assertion ngữ nghĩa, mỗi scenario chạy2 lần và so byte JSONL. report.json có máy chạy và kết quả. Headless Đêm3 đủ18.000 tick dưới1s trên máy phát triển.
- Chrome headless1280×720 khoảng60FPS cả3 Đêm, cửa sổ đo3s mỗi Đêm. Không có runtime exception. QA xác nhận đủ20 ô, off lamp scaleY=.8/tear visible, hai pha nhấp nháy, accent Bóng Mực#00B3FF, cảnh báo trắng với⚠, cài đặt phục hồi qua reload và UI kết quả thắng ở bình minh.
- Lỗi phát hiện qua ảnh: vết rách vẽ phía+Z bị giấy đèn che khi camera nhìn từ−Z. Cho nét rách render cuối, không depth-test để thấy trên thân đèn tắt từ góc camera ban đầu.
- Không có playthrough thủ công trọn3 Đêm, chưa nghe audio bằng tai, chưa có reviewer độc lập. Số đo FPS ngắn không thay stress test dài.
- Token: ước tính thủ công rất thô15.000–30.000 token cho Phase3 dựa trên khối lượng prompt/code/log, không phải usage API; chưa có dữ liệu để tính tiền. Giữ logic cũ và test cũ giúp giới hạn thay đổi, không thêm dependency.
- Bài học: xử lý hết dầu trước tương tác làm case tickcuối khác hẳn chỉ đếm đèn; scenario last-tick cho bằng chứng rõ hơn thử chơi ngẫu nhiên. Dầu nguyên tránh lỗi ngưỡng mà snapshot làm tròn30 vẫn thực tế yếu.
- Phase4 chưa phát hành, chưa tạo tag phase-4/Releasev1.0.0 hay video. Phase1/2 tags giữ nguyên.

## Kiểm tra bản clone sạch

Clone --no-local commit 48c48ae vào /tmp/day12-phase3-clean-20261120. npm ci --offline với cache chứa tarball đã tải (không dùng node_modules repo gốc): thêm1 package, audit0 vulnerabilities. npm run verify:53/53 test đạt, không skip, build dist thành công.
