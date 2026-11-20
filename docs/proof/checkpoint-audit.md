# Rà soát checkpoint — 20/11/2026

Phạm vi: người dùng xác nhận Phase 2, 3, 4 chưa phát hành và chưa phải làm. Giữ nguyên tag phase-1 ở de99659; không gắn tag các phase tương lai. README lab mới được lưu tại docs/LAB-README.md, README gốc repo vẫn là hướng dẫn chơi.

| Mục | Kết quả và bằng chứng |
| --- | --- |
| CP0 công cụ / ghi chép | Node 24.14.1, Three.js; docs/notes/phase-1.md, AGENTS.md |
| CP0 repo public / tên / deadline / trợ giảng | Chưa xác minh public; tên chưa có hậu tố theo SUBMISSION; cần thông tin Coach; không xác nhận đã hỏi trợ giảng |
| CP1 contract ở gốc | game.contract.json, v1.0; src/headless.mjs |
| CP1 kiểm chứng logic | 14/14 test đạt; docs/proof/verify.txt và tests/game.test.mjs |
| CP1 scenario thật | docs/proof/scenario.json + inputs.json → win.jsonl |
| CP1 tính tất định | Test CLI chạy hai lần và so byte output; test logic cùng seed 1.000 bước |
| CP1 cài bản sạch | git clone --no-local . /tmp/day12-checkpoint-audit-20261120; clone commit de99659; npm ci thành công, thêm 1 package, audit 0 vulnerabilities |
| CP1 build/test bản sạch | npm run verify thành công: 14 test, 14 pass, 0 fail; build tạo dist/ |
| CP1 chạy server bản sạch | Sandbox chặn listen; thử ngoài sandbox gặp EADDRINUSE tại 127.0.0.1:4173. Chưa xác nhận HTTP từ bản clone; không dừng server đang có của người dùng |
| CP1 trực quan | Người dùng đã chơi và báo A/D đảo chiều; đã sửa trong phase-1. Chưa có ảnh/video hay kiểm tra toàn bộ thắng/thua bằng trình duyệt |
| CP1 bàn giao | Commit de99659 và tag phase-1 đã push trong phiên trước |
| CP2–CP4 | Chờ phát hành, chưa cần làm; không đánh dấu hoàn thành |
| CP5 retro | docs/notes/phase-1.md có ghi lỗi, cách sửa, harness, tiết kiệm token; chưa có số đo token/chi phí thực tế |
| CP5 bảo mật | Không track .env/.pem; quét toàn bộ revision local bằng git grep cho private-key marker, GitHub token, OpenAI project key và AWS access key: 0 file ứng viên. Đây là kiểm tra theo mẫu, không bảo đảm tuyệt đối |
| CP5 video | Người dùng quay mp4 dưới 5 phút; cần link ở đầu README sau khi có file |

## Kịch bản quay demo Phase 1 (khoảng 3–4 phút)

1. Mở game, giới thiệu Mây và HUD; WASD, nhảy, xoay camera.
2. Nhặt đom đóm, bấm E nạp đèn; cho thấy vùng sáng và số đèn tăng.
3. Bấm Q gần Bóng Mực; cho thấy tốn đom đóm, Bóng Mực choáng; minh họa sát thương nếu thuận tiện.
4. Hiển thị npm test, chạy scenario headless mẫu và xem win.jsonl; nói rõ đây là scenario kiểm chứng, không phải chiến thắng chơi thường.
5. Cho thấy game.contract.json, AGENTS.md, tag phase-1. Chỉ mô tả Phase 1; các phase sau chưa phát hành.

Sau khi quay: kiểm tra thời lượng và khả năng mở file; thêm video vào docs/demo/demo.mp4 nếu dưới 100MB và đặt link đầu README. Release v1.0.0 thuộc Phase 4 theo lịch lab.
