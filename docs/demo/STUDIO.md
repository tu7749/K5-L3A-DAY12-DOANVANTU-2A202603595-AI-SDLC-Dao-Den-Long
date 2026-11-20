# Quay demo bằng Studio

Chạy trong repo: npm run build → npm start → mở http://localhost:4173/?demo.

## Tour nhanh để thấy tính năng của cả4 phase

1. Phase1: chọn cảnh Nhặt và thắp đèn, nhấn E tạiL1; có thể bấm Nạp đầy túi/Đến đèn kế rồi thao tác thật.
2. Phase2: chọn Bục/Bùa để nhảy sang đảo; chọn Gió Lạc để thấy cướp đom đóm, bấm Q lấy lại; chọn Đêm3/Tháp để xem tầng cao.
3. Phase3: cảnh Đèn yếu/hút dầu đặt Mây cách bóng8m để bóng tiếp tục hút; bước tới hoặc dùng Đến đèn kế, châm dầu và quan sát vùng an toàn. Bình Minh dựng thời gian3s và đủ ngưỡng đèn.
4. Phase4: nút Cài đặt/Đồ họa, đổi phím/màu/chữ; Bảng điểm đọc dữ liệu thật. Để quay phần bằng chứng chính thức, chạy test/headless/bench/soak bằng Terminal theo README; không dùng cheat thay kết quả các lệnh này.

## Phím tắt thao tác bằng panel

Chọn đảo mở tức thì; không phải thắng đảo trước. Nạp đầy túi đi theo capacity thực; vô hạn đom đóm tự nạp lại mỗi tick. Thắp tất cả sẽ chuyển đảo nếu đang chơi Hỗ trợ. Châm đầy dầu chỉ châm các đèn đã sáng. Khóa giờ giữ thời gian tại lúc bật, thêm60s cập nhật luôn mốc khóa. Sau khi chuyển cảnh mốc khóa chuyển sang thời lượng cảnh mới.

Panel có thể cuộn xuống. Đóng panel để khung hình thoáng, nhãnDEMO luôn hiện. Không lưu điểm demo. Thoát về chơi thường qua link ở đầu panel hoặc URL không có ?demo.

## Đồ họa khi ghi hình

Cài đặt → Quay demo (pixel ratio1) phù hợp khung1280×720; Máy yếu giảm0.75; Chất lượng cao1.5 phù hợp ảnh Retina nhưng tốn GPU hơn. Nên tắt camera bay khi cần điều khiển chính xác. Ánh sáng rõ giúp thấy nhân vật và đèn; ánh sáng này không áp dụng cho benchmark.

Những cảnh gắn nhãn Phase1–4 là minh họa tính năng trên bản hiện tại, không chạy lại luật ở các tag lịch sử. Các tag và Release cũ được giữ nguyên. Video vẫn do người dùng quay thật, không được mô tả cảnh dàn dựng là playthrough chuẩn hoặc kết quả test.
