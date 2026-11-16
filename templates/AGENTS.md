# <Tên dự án> — Agent Context

<!-- Chép file này vào gốc dự án rồi thay mọi <...>. Xoá mục nào không dùng và mọi chú thích dạng này. -->

**Trạng thái (<dd/mm/yyyy>): <ĐANG LÀM | CHỜ DUYỆT | BẢO TRÌ>.** <Một đến hai câu: đã có gì, đang làm gì, chưa được phép làm gì.> **Hạn: <thời điểm>** (nếu có). Mục tiêu: <dự án làm gì cho ai, một câu>.

## Đọc trước khi làm bất cứ việc gì
1. <Tài liệu cao nhất về phạm vi/hành vi, vd. spec đã duyệt hoặc đề bài>. **Tài liệu này là quyền cao nhất.**
2. <Kiến trúc / thiết kế đã duyệt>.
3. <Convention của mã>.
4. <Kế hoạch / lộ trình>.
- Hai tài liệu mâu thuẫn nhau thì **dừng và báo owner**, không tự chọn.

## Luật cứng
- **Chỉ viết mã ứng dụng** (`<thư mục mã>`) **cho slice đã được owner duyệt.** Spec/design chưa duyệt thì chỉ được sửa tài liệu.
- Giữ phạm vi đã chốt. Việc ngoài phạm vi ghi vào đề xuất, không làm.
- Không commit, push, tạo PR, merge hay deploy nếu owner chưa yêu cầu. Hỏi trước khi chạy migration/seed lên CSDL đã có dữ liệu, dùng dịch vụ ngoài, hoặc làm việc huỷ dữ liệu.
- Secret (khoá, chuỗi kết nối) chỉ ở `.env` (đã gitignore), không bao giờ xuất hiện trong mã, commit, log, chat hay dòng lệnh.
- <Nguồn sự thật duy nhất: vd. hợp đồng API ở đâu, file nào sinh tự động và không sửa tay.>
- <Luật riêng của dự án.>

## Quy trình: dùng skill `sdlc`

Skill nằm trong plugin `sdlc` (submodule `<đường dẫn>`). Chưa cài plugin thì gọi skill theo tên.

| Khi nào | Skill | Đầu ra trong repo này |
|---|---|---|
| Làm rõ hành vi, phạm vi, tiêu chí chấp nhận | `/sdlc:spec <phạm vi>` | `<docs/spec/>` |
| Slice có luồng, giao diện module hoặc cấu trúc mới | `/sdlc:design <slice>` | `<docs/design/>` |
| Dữ liệu, ràng buộc, migration | `/sdlc:database <phạm vi>` | Mô hình dữ liệu + kế hoạch migrate |
| Cắt spec thành việc nhỏ demo được | `/sdlc:to-tickets <spec>` | Danh sách ticket (chỉ đăng lên tracker khi owner đồng ý) |
| Viết mã cho một slice **đã duyệt** | `/sdlc:implement <slice>` (kèm `/sdlc:tdd` nếu có ranh giới hành vi rõ) | Mã + test trên nhánh `<feat/…>` |
| Giao diện, a11y, responsive | `/sdlc:frontend-ui-design <màn hình>` | Trạng thái UI |
| Kiểm tra hành vi với bằng chứng thật | `/sdlc:verify <phạm vi>` | Báo cáo: đã chạy gì, đạt, hỏng, chưa kiểm |
| Xem lại thay đổi trước khi mở PR | `/sdlc:review <nhánh hoặc PR>` | Danh sách phát hiện theo mức độ |
| Mở PR | `/sdlc:pr <phạm vi>` | PR nháp hoặc PR, không merge |
| Quyết định ảnh hưởng phạm vi, an toàn, chi phí | `/sdlc:sign-off <quyết định>` | Ghi quyết định vào spec |

**Luồng gợi ý:**
- Slice lớn: `spec` → `design` (+`database`) → `implement` (+`tdd`) → `verify` → `review` → `pr`.
- Sửa nhỏ: `implement` → `verify` → `pr`.
- Không bắt buộc đi đủ chuỗi. Chọn skill phù hợp với việc đang làm.

**Bàn giao:** Cuối mỗi bước, nêu kết quả, những gì chưa kiểm, rủi ro còn lại, và đưa **đúng một** lệnh `/sdlc:<skill> <phạm vi>` kế tiếp. Không tự chạy lệnh đó.

**Subagent** (`sdlc:repo_explorer`, `implementation_worker`, `test_engineer`, `code_reviewer`): chỉ dùng khi việc đủ lớn.
- Không cho hai agent sửa cùng một file.
- Agent chính giữ quyền về git, PR và deploy.

## Định nghĩa xong
- <Lệnh kiểm tra tổng, vd. `npm run verify`> chạy xanh: <format, lint, typecheck, test…>.
- Mỗi tiêu chí chấp nhận của slice có test hoặc bước kiểm tay có bằng chứng.
- Báo đúng những gì **thật sự đã chạy**; tách rõ phần đã kiểm và chưa kiểm.

## Ngôn ngữ
- Tài liệu, spec, mô tả PR: <tiếng Việt>.
- Mã, comment, commit (`type(scope): description`): <tiếng Anh>.
