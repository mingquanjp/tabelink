# Contributing Guide

Tài liệu này mô tả cách team quản lý branch, commit, Pull Request và các lệnh Git thường dùng trong dự án TABELINK.

## Mục Lục

- [Quy tắc branch](#quy-tắc-branch)
- [Cách tạo nhánh](#cách-tạo-nhánh)
- [Quy tắc commit message](#quy-tắc-commit-message)
- [Quy trình Pull Request](#quy-trình-pull-request)
- [Quy tắc review code](#quy-tắc-review-code)
- [Các lệnh Git cần thiết](#các-lệnh-git-cần-thiết)

## Quy tắc branch

Dự án dùng các nhóm branch sau:

| Branch | Mục đích |
| --- | --- |
| `main` | Branch ổn định, dùng cho demo hoặc bản có thể chạy được. |
| `develop` | Branch tích hợp code của team trước khi đưa lên `main`. |
| `feature/<ten-task>` | Branch phát triển tính năng hoặc task mới. |
| `fix/<ten-loi>` | Branch sửa lỗi. |
| `hotfix/<ten-loi>` | Branch sửa lỗi khẩn cấp từ `main`. |

Quy tắc chung:

- Không code trực tiếp trên `main`.
- Không code trực tiếp trên `develop` nếu task không quá nhỏ.
- Mỗi task nên có một branch riêng.
- Branch feature/fix được tạo từ `develop`.
- Code hoàn thành sẽ mở Pull Request vào `develop`.
- Chỉ merge `develop` vào `main` khi đã ổn định để demo hoặc release.

## Cách tạo nhánh

Trước khi tạo branch mới, luôn cập nhật `develop`:

```powershell
git checkout develop
git pull origin develop
```

Tạo branch feature:

```powershell
git checkout -b feature/dev-environment
```

Tạo branch fix:

```powershell
git checkout -b fix/db-health-error
```

Push branch lên GitHub:

```powershell
git push -u origin feature/dev-environment
```

Quy tắc đặt tên branch:

```text
feature/<ten-ngan-gon>
fix/<ten-loi>
hotfix/<ten-loi-khan-cap>
docs/<ten-tai-lieu>
refactor/<pham-vi-refactor>
```

Ví dụ:

```text
feature/login-page
feature/owner-menu-management
fix/backend-cors
docs/update-readme
refactor/api-client
```

## Quy tắc commit message

Commit message nên ngắn, rõ, mô tả đúng thay đổi.

Format:

```text
type: short description
```

Các `type` thường dùng:

| Type | Khi nào dùng |
| --- | --- |
| `feat` | Thêm tính năng mới. |
| `fix` | Sửa lỗi. |
| `docs` | Sửa tài liệu. |
| `chore` | Việc cấu hình, setup, dependency, housekeeping. |
| `test` | Thêm hoặc sửa test. |
| `refactor` | Sửa cấu trúc code nhưng không đổi hành vi. |
| `style` | Sửa format, lint, khoảng trắng, không đổi logic. |
| `build` | Thay đổi liên quan build system hoặc package. |

Ví dụ tốt:

```text
chore: setup development environment
docs: add contributing guide
feat: add owner dashboard route
fix: handle backend health check failure
test: add db health e2e test
refactor: simplify frontend api client
```

Ví dụ không nên dùng:

```text
update
fix bug
done
final
code moi
```

Một commit nên tập trung vào một nhóm thay đổi rõ ràng. Không gom nhiều việc không liên quan vào cùng một commit.

## Quy trình Pull Request

Luồng PR chuẩn:

1. Tạo branch từ `develop`.
2. Code và commit trên branch riêng.
3. Chạy kiểm tra local.
4. Push branch lên GitHub.
5. Mở Pull Request vào `develop`.
6. Người khác review code.
7. Sửa feedback nếu có.
8. Merge sau khi PR đạt yêu cầu.

Trước khi mở PR, chạy các lệnh kiểm tra.

Backend:

```powershell
cd backend
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Checklist trước khi mở PR:

- Code chạy được ở local.
- Không commit `backend/.env`.
- Không commit `frontend/.env.local`.
- Không commit `node_modules/`, `dist/`, `.next/`.
- Commit message rõ nghĩa.
- PR mô tả được thay đổi chính.
- Nếu thay đổi UI, nên có ảnh chụp màn hình.
- Nếu thay đổi API, nên ghi endpoint và response liên quan.

Nội dung PR nên có:

```text
## Thay đổi chính
- ...

## Cách kiểm tra
- ...

## Ghi chú
- ...
```

## Quy tắc review code

Người review nên tập trung vào:

- Code có đúng yêu cầu task không.
- Có lỗi logic hoặc lỗi runtime không.
- Có ảnh hưởng tới phần khác không.
- Có hard-code secret, token, password không.
- Có test phù hợp chưa.
- Tên biến, tên hàm, cấu trúc file có dễ hiểu không.
- README hoặc tài liệu có cần cập nhật không.

Người tạo PR cần:

- Trả lời feedback rõ ràng.
- Sửa code nếu feedback hợp lý.
- Giải thích nếu không đồng ý sửa.
- Không tự merge khi còn review chưa xử lý.

Quy tắc merge:

- Ưu tiên `Squash and merge` để lịch sử commit gọn.
- Xóa branch sau khi merge nếu không dùng nữa.
- Không force push lên branch của người khác nếu chưa thống nhất.

## Các lệnh Git cần thiết

Kiểm tra trạng thái hiện tại:

```powershell
git status
```

Xem branch hiện tại:

```powershell
git branch --show-current
```

Lấy code mới nhất:

```powershell
git pull origin develop
```

Tạo branch mới:

```powershell
git checkout -b feature/task-name
```

Chuyển branch:

```powershell
git checkout develop
```

Xem file đã thay đổi:

```powershell
git diff
```

Stage toàn bộ thay đổi:

```powershell
git add .
```

Stage một file cụ thể:

```powershell
git add README.md
```

Commit:

```powershell
git commit -m "docs: update setup guide"
```

Push branch lần đầu:

```powershell
git push -u origin feature/task-name
```

Push các commit tiếp theo:

```powershell
git push
```

Cập nhật branch feature với code mới từ `develop`:

```powershell
git checkout feature/task-name
git pull origin develop
```

Xem lịch sử commit:

```powershell
git log --oneline --graph --decorate --all
```

Kiểm tra file có bị ignore không:

```powershell
git check-ignore -v <file-path>
```

Xem remote:

```powershell
git remote -v
```

Xóa branch local sau khi đã merge:

```powershell
git branch -d feature/task-name
```

Xóa branch remote sau khi đã merge:

```powershell
git push origin --delete feature/task-name
```

## Lưu ý an toàn

Không commit các file sau:

```text
backend/.env
frontend/.env.local
backend/node_modules/
frontend/node_modules/
backend/dist/
frontend/.next/
```

Nếu lỡ đưa secret lên GitHub, cần báo ngay cho team và thay secret đó. Chỉ xóa commit là chưa đủ, vì secret có thể đã nằm trong lịch sử Git.
