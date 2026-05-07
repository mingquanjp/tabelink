# TABELINK

TABELINK là nền tảng giúp người Nhật đang sinh sống, làm việc hoặc công tác tại Hà Nội tìm thấy các nhà hàng Việt Nam phù hợp với nhu cầu của họ. Dự án cũng giúp chủ nhà hàng tại Việt Nam tiếp cận nhóm khách Nhật hiệu quả hơn thông qua thông tin song ngữ, bộ lọc tìm kiếm, đánh giá, đặt bàn, quảng cáo, huy hiệu xác thực và dữ liệu phân tích.

Repository này chứa môi trường phát triển ban đầu của dự án, gồm frontend Next.js, backend NestJS và thư mục SQL cho database.

## Mục Lục

- [Bài toán](#bài-toán)
- [Người dùng mục tiêu](#người-dùng-mục-tiêu)
- [Vai trò trong hệ thống](#vai-trò-trong-hệ-thống)
- [Tính năng chính](#tính-năng-chính)
- [Tech Stack](#tech-stack)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Clone dự án](#clone-dự-án)
- [Thiết lập môi trường](#thiết-lập-môi-trường)
- [Cài đặt dependencies](#cài-đặt-dependencies)
- [Cách chạy dự án](#cách-chạy-dự-án)
- [Kiểm tra hoạt động](#kiểm-tra-hoạt-động)
- [Quy tắc env và Git ignore](#quy-tắc-env-và-git-ignore)

## Bài toán

Người Nhật làm việc tại Hà Nội đang thiếu thông tin đáng tin cậy về các nhà hàng Việt Nam phù hợp với khẩu vị, ngôn ngữ, tiêu chuẩn vệ sinh và thói quen sử dụng dịch vụ của họ.

Chủ nhà hàng tại Hà Nội có thể muốn tiếp cận khách Nhật, nhưng chưa có một kênh quảng bá đủ rõ ràng, hiệu quả và đúng đối tượng.

TABELINK giải quyết hai phía của bài toán:

- Khách Nhật dễ tìm, so sánh, đánh giá, đặt bàn và theo dõi các nhà hàng phù hợp.
- Chủ nhà hàng có công cụ quản lý thông tin, thực đơn, đặt bàn, ưu đãi, phản hồi và dữ liệu kinh doanh.

## Người dùng mục tiêu

- Người Nhật đang sinh sống tại Hà Nội.
- Người Nhật đến Việt Nam công tác hoặc du lịch.
- Chủ nhà hàng tại Việt Nam muốn thu hút khách hàng Nhật.
- Quản trị viên vận hành hệ thống.

## Vai trò trong hệ thống

| Vai trò | Mô tả |
| --- | --- |
| Quản trị viên hệ thống | Quản lý tài khoản, quyền hạn, nội dung, quảng cáo, huy hiệu xác thực và các đánh giá không phù hợp. |
| Người dùng | Tìm kiếm nhà hàng, xem thông tin, đánh giá, đặt bàn, theo dõi bảng tin và sử dụng ưu đãi. |
| Chủ nhà hàng | Quản lý thông tin nhà hàng, thực đơn, hình ảnh, đặt bàn, chiến dịch quảng cáo, khuyến mãi và phân tích dữ liệu. |
| Khách | Người chưa đăng nhập, có thể tìm kiếm và xem thông tin công khai ở mức giới hạn. |

## Tính năng chính

Các tính năng dưới đây được rút ra từ đặc tả sản phẩm. Không phải toàn bộ tính năng đã được triển khai trong code hiện tại.

| Nhóm | Tính năng |
| --- | --- |
| Tài khoản | Đăng ký, đăng nhập, quản lý quyền và trạng thái người dùng. |
| Tìm kiếm | Tìm kiếm nhà hàng theo bản đồ, danh sách, bộ lọc nâng cao, vị trí và tiêu chí dành cho khách Nhật. |
| Thông tin nhà hàng | Hiển thị thông tin song ngữ Nhật - Việt, thực đơn, hình ảnh, nhân viên biết tiếng Nhật và dịch vụ đi kèm. |
| Đánh giá | Người dùng gửi phản hồi, phân loại đánh giá theo tiêu chí như vệ sinh, phục vụ, khẩu vị và không gian. |
| Đặt bàn | Gửi yêu cầu đặt bàn bằng mẫu câu tiếng Nhật có sẵn, hỗ trợ yêu cầu đặc biệt. |
| Huy hiệu xác thực | Cấp huy hiệu cho nhà hàng đạt tiêu chí về vệ sinh, phục vụ và khả năng phục vụ khách Nhật. |
| Thanh toán và VAT | Hiển thị phương thức thanh toán được hỗ trợ và khả năng xuất hóa đơn VAT. |
| Quản lý nhà hàng | Chủ nhà hàng cập nhật thông tin, menu, ảnh, trạng thái bàn và danh sách đặt bàn. |
| Quảng cáo và ưu đãi | Tạo chiến dịch quảng cáo, ưu đãi, banner và nội dung nhắm tới khách Nhật tại Hà Nội. |
| Phân tích dữ liệu | Dashboard cho chủ nhà hàng theo dõi lượt xem, click, khách hàng, món phổ biến và hiệu quả quảng cáo. |
| Bản đồ và chỉ đường | Tích hợp bản đồ để tìm đường đến nhà hàng mà không cần rời ứng dụng. |
| Bảng tin | Hiển thị bài đăng, review, hashtag, xu hướng và gợi ý nhà hàng. |

## Tech Stack

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL trên NeonDB |
| ORM | TypeORM |
| Package manager | npm |
| Version control | Git, GitHub |

## Cấu trúc thư mục

```text
.
|-- backend/              # NestJS API
|-- frontend/             # Next.js frontend
|-- database/
|   |-- migrations/       # SQL migration files
|   `-- seeds/            # SQL seed files
|-- docs/                 # Tài liệu dự án
`-- README.md
```

## Trạng thái triển khai hiện tại

Môi trường phát triển ban đầu đã được thiết lập với các phần sau:

- Frontend Next.js chạy ở `http://localhost:3000`.
- Backend NestJS chạy ở `http://localhost:8080`.
- Backend có API kiểm tra trạng thái: `GET /health`.
- Backend có API kiểm tra kết nối database: `GET /db-health`.
- Frontend có trang kiểm tra kết nối backend: `/dev-health`.
- Frontend có các route placeholder:
  - `/login`
  - `/register`
  - `/owner/dashboard`
  - `/owner/menu`
  - `/owner/reservations`
  - `/owner/campaigns`
- Database folder đã có `migrations/` và `seeds/`.

## Yêu cầu môi trường

Cài trước các công cụ sau:

- Node.js `>= 20.9`
- npm
- Git
- Tài khoản NeonDB
- Công cụ quản trị PostgreSQL như DBeaver, pgAdmin hoặc psql
- VS Code hoặc editor tương đương

Kiểm tra version:

```powershell
node -v
npm -v
git --version
```

## Clone dự án

Clone repository từ GitHub:

```powershell
git clone https://github.com/mingquanjp/tableink.git
cd tableink
```

Kiểm tra cấu trúc sau khi clone:

```powershell
Get-ChildItem
```

Kết quả mong muốn có các thư mục chính:

```text
backend/
frontend/
database/
docs/
```

## Thiết lập môi trường

### Backend env

Tạo file env thật cho backend:

```powershell
cd backend
Copy-Item .env.example .env
```

Mở `backend/.env` và cập nhật giá trị:

```env
APP_PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/tabelink_dev?sslmode=require
JWT_SECRET=change_me
```

Thay `DATABASE_URL` bằng connection string thật lấy từ NeonDB.

Quay lại root:

```powershell
cd ..
```

### Frontend env

Tạo file env thật cho frontend:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
```

Nội dung mặc định:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Quay lại root:

```powershell
cd ..
```

## Cài đặt dependencies

Cài dependencies cho backend:

```powershell
cd backend
npm install
```

Cài dependencies cho frontend:

```powershell
cd ../frontend
npm install
```

Quay lại root:

```powershell
cd ..
```

## Cách chạy dự án

Dự án cần chạy hai terminal: một terminal cho backend và một terminal cho frontend.

### Terminal 1: chạy backend

```powershell
cd backend
npm run start:dev
```

Backend chạy tại:

```text
http://localhost:8080
```

### Terminal 2: chạy frontend

```powershell
cd frontend
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

Sau khi cả hai server đã chạy, mở:

```text
http://localhost:3000
```

Để kiểm tra frontend gọi backend, mở:

```text
http://localhost:3000/dev-health
```

Nếu PowerShell chặn lệnh `npm`, dùng dạng `.cmd`:

```powershell
npm.cmd run start:dev
npm.cmd run dev
```

## Kiểm tra hoạt động

Backend health check:

```text
GET http://localhost:8080/health
```

Kết quả mong muốn:

```json
{ "status": "ok" }
```

Database health check:

```text
GET http://localhost:8080/db-health
```

Kết quả mong muốn:

```json
{ "database": "connected" }
```

Frontend health page:

```text
http://localhost:3000/dev-health
```

Trang này gọi backend thông qua biến môi trường:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Lệnh kiểm tra trước khi push

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

Kết quả mong muốn:

```text
Backend build pass
Backend unit test pass
Backend e2e test pass
Frontend lint pass
Frontend build pass
```

## Quy tắc env và Git ignore

Các file env thật không được commit:

```text
backend/.env
frontend/.env.local
```

Các file env mẫu được commit:

```text
backend/.env.example
frontend/.env.local.example
```

Không commit các thư mục build và dependencies:

```text
backend/node_modules/
frontend/node_modules/
backend/dist/
frontend/.next/
```

Nếu một file cần commit nhưng đang bị ignore, kiểm tra bằng:

```powershell
git check-ignore -v <file-path>
```

## Chuẩn hoàn thành setup môi trường

Setup môi trường được xem là đạt khi:

- Clone repo về máy mới được.
- Cài dependencies cho `backend/` và `frontend/` được.
- Tạo được `backend/.env` và `frontend/.env.local`.
- Backend chạy được ở `http://localhost:8080`.
- Frontend chạy được ở `http://localhost:3000`.
- `GET /health` trả `{ "status": "ok" }`.
- `GET /db-health` trả `{ "database": "connected" }`.
- Trang `/dev-health` gọi được backend.
- Backend build, unit test và e2e test pass.
- Frontend lint và build pass.
- Không có secret thật bị commit lên GitHub.
