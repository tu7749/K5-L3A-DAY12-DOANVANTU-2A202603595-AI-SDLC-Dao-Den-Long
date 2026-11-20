# Nguồn

- Tên, nhân vật Mây, Bóng Mực, bối cảnh và yêu cầu: Đảo Đèn Lồng Day 12 AI SDLC Lab, tài liệu khóa học do người dùng cung cấp (`docs/PRD-0.md`). Quyền đối với tài liệu gốc thuộc tác giả khóa học.
- Mã nguồn và hình học procedural: tạo trong phiên làm việc với OpenAI Codex. Không dùng hình ảnh, mô hình, nhạc hay nhân vật thương mại từ bên ngoài. Phase 2 có nhạc và hiệu ứng Web Audio do mã nguồn src/audio.js tổng hợp, tạo cùng OpenAI Codex; không dùng bản ghi âm bên ngoài.
- Three.js 0.180.0: https://github.com/mrdoob/three.js, MIT; giấy phép được kèm trong `node_modules/three/LICENSE`, bản build sao chép thành `dist/vendor/THREE-LICENSE.txt`.
- Font: system-ui và Georgia có sẵn trên máy, không phân phối file font.
- Phase4: benchmark/soak, bảng điểm, rebind và release scripts viết cùng OpenAI Codex. Node.js24 (test/runtime), Google Chrome/Chromium và DevTools Protocol dùng để kiểm chứng; không phân phối binary các công cụ này. Không thêm asset bên ngoài ở Phase3/4.
