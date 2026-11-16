# Danh mục skill của workflow SDLC

Bản sao nguyên văn của [`plugins/sdlc/skills/`](../../plugins/sdlc/skills/) để xem nhanh workflow đang có những skill nào. **Không sửa ở đây**: sửa ở `plugins/sdlc/skills/` rồi chép lại (`npm test` sẽ báo nếu hai bên lệch nhau).

Mỗi skill là một phương pháp làm việc, không gắn với sản phẩm, framework, CSDL, nhánh hay giai đoạn nào. Thông tin dự án lấy từ `AGENTS.md` của dự án đang dùng.

| Nhóm | Skill | Dùng để | Gọi |
| --- | --- | --- | --- |
| Lõi | [spec](spec/SKILL.md) | Làm rõ mục đích, phạm vi, tiêu chí chấp nhận, quyết định còn mở | Tự động hoặc tay |
| Lõi | [design](design/SKILL.md) | Thiết kế luồng người dùng, giao diện module, hành vi dữ liệu và khi lỗi | Tự động hoặc tay |
| Lõi | [implement](implement/SKILL.md) | Làm một slice đã được duyệt, đi dọc từ hành vi tới các tầng cần thiết | **Chỉ gọi tay** |
| Lõi | [verify](verify/SKILL.md) | Kiểm tra hành vi quan sát được, báo đúng cái đã chạy (chỉ đọc) | Tự động hoặc tay |
| Lõi | [review](review/SKILL.md) | Xem lại thay đổi thật so với ý định đã chốt (fork Explore, chỉ đọc) | Tự động hoặc tay |
| Lõi | [pr](pr/SKILL.md) | Chuẩn bị PR gọn, dễ review; không merge | **Chỉ gọi tay** |
| Tuỳ chọn | [frontend-ui-design](frontend-ui-design/SKILL.md) | Chi tiết UI: trạng thái, a11y, responsive, ngôn ngữ | Tự động hoặc tay |
| Tuỳ chọn | [database](database/SKILL.md) | Dữ liệu bền vững, ràng buộc, migration, tương thích dữ liệu cũ | Tự động hoặc tay |
| Tuỳ chọn | [to-tickets](to-tickets/SKILL.md) | Cắt việc đã chốt thành ticket nhỏ, demo được | **Chỉ gọi tay** |
| Tuỳ chọn | [tdd](tdd/SKILL.md) | Vòng Red → Green → Refactor tại ranh giới hành vi hữu ích | Tự động hoặc tay |
| Tuỳ chọn | [sign-off](sign-off/SKILL.md) | Chuẩn bị một quyết định của owner khi lựa chọn ảnh hưởng lớn | **Chỉ gọi tay** |

Lệnh sau khi cài plugin: `/sdlc:<skill> <phạm vi>`. Ví dụ `/sdlc:spec đăng nhập bằng email`.

## Nguyên tắc chung của mọi skill

1. Đọc `AGENTS.md`, spec đang áp dụng, mã và công cụ của **dự án hiện tại**; không lấy nguồn sự thật từ chính các file skill.
2. Chọn đúng một skill hợp với việc; chỉ thêm skill tuỳ chọn khi việc cần. Không có bộ định tuyến hay chuỗi tự chạy.
3. Xác định chế độ thật của dự án (khám phá, thiết kế, triển khai, bảo trì, vận hành) từ bằng chứng và yêu cầu hiện tại.
4. Trước khi viết mã: có kết quả được chọn rõ, ví dụ chấp nhận, phụ thuộc chính. Bắt đầu bằng một lát cắt đầu-cuối; một việc nền móng chạy được là hợp lệ khi ứng dụng chưa tồn tại.
5. Theo stack, convention, chiến lược nhánh và ranh giới duyệt của repo. Hỏi trước khi migrate dữ liệu có sẵn, đụng production, tạo tài nguyên ngoài, làm việc huỷ dữ liệu hoặc merge.
6. Báo cái đã chạy và cái chưa kiểm. Có tài liệu không có nghĩa là sẵn sàng triển khai.
7. **Bàn giao:** đề xuất tối đa **một** skill kế tiếp kèm phạm vi cụ thể, không tự chạy.

## Agent đi kèm (ở `plugins/sdlc/agents/`)

| Agent | Quyền | Việc |
| --- | --- | --- |
| `repo_explorer` | Đọc | Vẽ bản đồ mã, phụ thuộc, tác động của thay đổi |
| `implementation_worker` | Đọc, sửa, chạy lệnh | Làm một kết quả đã được duyệt |
| `test_engineer` | Đọc, sửa, chạy lệnh | Viết và chạy test hành vi trên dữ liệu dùng một lần |
| `code_reviewer` | Chỉ đọc | Review độc lập: đúng sai, bảo mật, hồi quy |
