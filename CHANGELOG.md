# Changelog

## Phase 3 — Contract v1.2 — breaking changes

- Đèn không sáng vĩnh viễn: fuel100 hao1/s, tắt về deposited0; ever_lit giữ lại, relight cần5. Đèn sáng nhận refuel10 dầu/đom đóm.
- Safe zone chỉ bật khi dầu>=30. Wander ưu tiên đèn yếu; thêm drain5/s mỗi bóng; pulse ngắt drain, hồi đủ dầu đẩy bóng ra.
- Bỏ thắng sớm all_lit. Đêm240/270/300s; tại bình minh cầnceil(60% tổng đèn) còn sáng. Reason thắng dawn_survived, no_flames ưu tiên.
- Thay toàn bộ điểm: nạp/châm5, lần đầu100, thắp lại40, pulse5/15; bonus bình minh theo đèn/dầu/ngọn lửa, không thời gian.
- Capacity10+2*successful_lights tối đa20, reset đầu mỗi Đêm; scenario dựng đèn không tự tăng.
- Snapshot v1.2 thêm fuel/ever_lit/relit_count, player.capacity, state drain. Scenario hỗ trợ fuel/history/successful_lights/target_lantern_id. Event refuel/lantern_out/fuel_drain, lantern_lit thêm relight.
- Cài đặt bảng màu dễ phân biệt được lưu; đèn tắt xẹp20%/có vết rách, thanh dầu và nhấp nháy khi dầu<30.
- Các test thắng/điểm/thời lượng cũ được sửa; không có test bị skip. ADR và truy vết: docs/notes/phase-3.md.

## Phase 2 — Contract v1.1

Chuẩn hóa số liệu; ba bản đồ, dash, Gió Lạc, Bùa Gió, gió, pause, audio/settings/HUD. Bằng chứng và luật cũ: tag phase-2.

## Phase 1 — Contract v1.0

Bản đầu PRD-0, game3D và headless. Bằng chứng/giả định ban đầu: tag phase-1.

## Phase 4 — Contract v1.3 / release v1.0.0

- Benchmark CLI: cửa sổ1280×720, cảnh chuẩn200 wander/100 motes/3 lit, camera chuẩn, warmup và công thức dt/avg/p1/p95 thực; null RSS cho web có giải thích.
- Soak10 Đêm một process, input seeded, RSS thực và reset; công bố runtime jitless/GC. Giữ cả kết quả chưa đạt ban đầu.
- Bảng điểm top10 lưu đĩa qua API local, export qua run_cmd; web tĩnh fallback localStorage+download. Chỉ lưu tổng các Đêm thắng.
- Rebind đủ9 hành động, duplicate detection, restore, persistence. Chữ18px/×1.25, reduced motion, thông báo hướng spawn/gió/countdown/dầu yếu.
- Sửa bug wander dùng1m/s về4/4.5m/s theo số chuẩn; thêm regression. Các luật dầu/drain/win/score Phase3 giữ nguyên.
- Đóng gói ZIP tự chứa assets, API server không cần npm install, README/ảnh/credits/retro đầy đủ. Tạo phase-4 và v1.0.0; video chờ người dùng quay.

## Sau v1.0.0 — Studio demo trên nhánh main

- Công cụ thử nghiệm có nhãnDEMO: chọn3Đêm/cảnh tính năng, nạp/hồi/dịch chuyển/thêm thời gian/đèn/mote/shade, khóa giờ/bất tử/túi vô hạn/cooldown. Không lưu điểm demo.
- Đồ họa recording/quality/low, geometry cache dùng chung, danh sách occluder tính khi dựng cảnh, ánh sáng bổ sung/camera orbit chỉ trong Studio.
- Giữ Game/contract, các tag phase-1…4 và Releasev1.0.0; các cảnh chỉ minh họa tính năng trên code hiện tại. Bằng chứng riêng tại docs/proof/demo-studio.
