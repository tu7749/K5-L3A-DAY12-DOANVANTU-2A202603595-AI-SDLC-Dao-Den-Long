# Đảo Đèn Lồng v1.0.0

Game 3D ba Đêm, Contract1.3. Có chế độ Chuẩn theo đề và chế độ Hỗ trợ khi chơi thường.

- Tải `dao-den-long-v1.0.0.zip`, giải nén, cần Node.js24 và trình duyệt WebGL.
- Tại thư mục giải nén chạy `node scripts/serve.mjs`, mở http://localhost:4173. Không cần cài dependency.
- Bảng xếp hạng ghi trên máy ở `.local/leaderboard.json`; xuất bằng `node scripts/serve.mjs --export-leaderboard out.json`.
- Benchmark/soak, test và mã nguồn đầy đủ trong repo; số đo đã commit tại `docs/proof/phase-4`.
- Đổi đủ9 phím, bảng màu dễ phân biệt, giảm chuyển động, chữ18px/chữ lớn, chỉ báo xuất hiện bóng/gió/countdown/dầu yếu.
- Video demo chưa có: người dùng sẽ quay và bổ sung sau. Chưa tuyên bố đã hoàn thành mục video.

Các tag phase-1/2/3 giữ nguyên. Phase4 có tag phase-4 và v1.0.0.
