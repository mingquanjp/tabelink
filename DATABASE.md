# DATABASE

Tài liệu này mô tả thiết kế cơ sở dữ liệu hiện tại của dự án TABELINK, cách kết nối NeonDB, cách backend sử dụng database, cách chạy file `database/inits.sql`, và quy tắc quản lý thay đổi schema cho team.

## Mục Lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [File database trong repo](#file-database-trong-repo)
- [Cách team kết nối database](#cách-team-kết-nối-database)
- [Cách backend kết nối database](#cách-backend-kết-nối-database)
- [Cách khởi tạo schema](#cách-khởi-tạo-schema)
- [Cách kiểm tra kết nối](#cách-kiểm-tra-kết-nối)
- [Tổng quan schema hiện tại](#tổng-quan-schema-hiện-tại)
- [Cách đọc schema cho backend developer](#cách-đọc-schema-cho-backend-developer)
- [Chi tiết các nhóm bảng](#chi-tiết-các-nhóm-bảng)
- [Quan hệ dữ liệu chính](#quan-hệ-dữ-liệu-chính)
- [Ràng buộc và index quan trọng](#ràng-buộc-và-index-quan-trọng)
- [Trigger UpdatedAt](#trigger-updatedat)
- [Quy tắc quản lý thay đổi database](#quy-tắc-quản-lý-thay-đổi-database)
- [Checklist trước khi merge thay đổi DB](#checklist-trước-khi-merge-thay-đổi-db)

## Tổng quan

Database hiện tại được thiết kế cho nền tảng TABELINK, phục vụ hai nhóm chính:

- Khách Nhật tìm kiếm, xem thông tin, đặt bàn, đánh giá và theo dõi nhà hàng.
- Chủ nhà hàng quản lý thông tin nhà hàng, thực đơn, bàn, đặt bàn, khuyến mãi, quảng cáo, huy hiệu và phân tích dữ liệu.

Ngoài ra hệ thống có vai trò quản trị viên để quản lý tài khoản, kiểm duyệt nội dung, xét duyệt quảng cáo và huy hiệu xác thực.

Schema hiện tại nằm trong:

```text
database/inits.sql
```

File này đang là schema khởi tạo đầy đủ cho PostgreSQL.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Database | PostgreSQL |
| Cloud database | NeonDB |
| Backend connection | TypeORM |
| PostgreSQL driver | `pg` |
| Backend framework | NestJS |
| Env management | `@nestjs/config` |

## File database trong repo

```text
database/
|-- inits.sql              # Schema khởi tạo hiện tại
|-- migrations/
|   `-- .gitkeep           # Nơi đặt migration SQL về sau
`-- seeds/
    `-- .gitkeep           # Nơi đặt seed data về sau
```

Ý nghĩa:

- `database/inits.sql`: file tạo toàn bộ schema ban đầu.
- `database/migrations/`: dùng cho các thay đổi schema theo từng bước sau này.
- `database/seeds/`: dùng cho dữ liệu mẫu hoặc dữ liệu khởi tạo cần thiết.

## Cách team kết nối database

Database chính của dự án được tạo và quản lý trên NeonDB bởi người sở hữu project Neon.

Team không tự tạo database riêng để chạy schema nếu không được yêu cầu. Luồng làm việc mặc định:

- Người sở hữu Neon quản lý project, database, connection string và chạy schema trên Neon.
- Backend dùng `DATABASE_URL` để kết nối tới Neon.
- Thành viên team dùng pgAdmin4, DBeaver hoặc công cụ PostgreSQL tương đương để kết nối vào server Neon và kiểm tra bảng/dữ liệu khi cần.
- Không commit connection string thật lên GitHub.

### Thông tin cần có để kết nối bằng pgAdmin4

Khi một thành viên cần check DB bằng pgAdmin4, người sở hữu Neon sẽ cung cấp các thông tin sau:

| Trường trong pgAdmin4 | Giá trị lấy từ Neon |
| --- | --- |
| Host name/address | Host của Neon, ví dụ `ep-xxxx.ap-southeast-1.aws.neon.tech` |
| Port | `5432` |
| Maintenance database | Tên database, ví dụ `tabelink_dev` hoặc database Neon đang dùng |
| Username | User trong Neon |
| Password | Password trong Neon |
| SSL mode | `Require` |

Trong pgAdmin4:

1. Mở pgAdmin4.
2. Chọn `Register` -> `Server`.
3. Tab `General`: đặt tên server, ví dụ `TABELINK Dev`.
4. Tab `Connection`: nhập host, port, database, username, password.
5. Tab `SSL`: chọn SSL mode là `Require` nếu pgAdmin yêu cầu.
6. Save.
7. Mở database và kiểm tra schema `public`.

### Connection string backend

Connection string có dạng:

```env
postgresql://USER:PASSWORD@HOST.neon.tech/tabelink_dev?sslmode=require
```

Trong backend, connection string được đặt tại:

```text
backend/.env
```

Ví dụ:

```env
APP_PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/tabelink_dev?sslmode=require
JWT_SECRET=change_me
```

Không commit `backend/.env` lên GitHub.

File được commit chỉ là:

```text
backend/.env.example
```

## Cách backend kết nối database

Backend đọc `DATABASE_URL` qua `ConfigService` và kết nối PostgreSQL bằng TypeORM.

File cấu hình:

```text
backend/src/app.module.ts
```

Cấu hình hiện tại:

```ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    ssl: {
      rejectUnauthorized: false,
    },
    autoLoadEntities: true,
    synchronize: false,
  }),
})
```

Các điểm quan trọng:

- `type: 'postgres'`: backend dùng PostgreSQL.
- `url`: lấy từ `DATABASE_URL` trong `.env`.
- `ssl.rejectUnauthorized: false`: cho phép kết nối SSL với NeonDB trong môi trường dev.
- `autoLoadEntities: true`: TypeORM tự load entity khi entity được khai báo trong module.
- `synchronize: false`: không cho TypeORM tự sửa schema database.

Quy tắc bắt buộc:

```text
synchronize phải luôn là false.
```

Lý do: schema phải được quản lý bằng SQL migration rõ ràng. Không để ORM tự tạo, sửa hoặc xóa bảng ngoài kiểm soát.

## Cách khởi tạo schema

File khởi tạo schema:

```text
database/inits.sql
```

Schema này sẽ được chạy trực tiếp trên Neon bởi người sở hữu Neon hoặc người được phân quyền rõ ràng.

Thành viên backend thông thường không cần tự chạy `inits.sql` nếu database dev đã được tạo sẵn. Khi cần kiểm tra, hãy kết nối bằng pgAdmin4 và đọc schema/dữ liệu hiện có.

### Cách 1: Neon SQL Editor

1. Mở Neon Console.
2. Chọn project database của TABELINK.
3. Mở SQL Editor.
4. Copy toàn bộ nội dung `database/inits.sql`.
5. Paste vào SQL Editor.
6. Run.
7. Kiểm tra các bảng đã được tạo.

### Cách 2: DBeaver hoặc pgAdmin

Chỉ dùng cách này nếu bạn được phân quyền chạy script.

1. Tạo connection PostgreSQL tới NeonDB.
2. Bật SSL nếu công cụ yêu cầu.
3. Mở SQL script.
4. Copy nội dung `database/inits.sql`.
5. Execute script.
6. Refresh schema và kiểm tra danh sách bảng.

### Cách 3: psql

Chỉ dùng cách này nếu bạn được phân quyền chạy script.

Nếu máy đã có `psql`, có thể chạy:

```powershell
psql "<DATABASE_URL>" -f database/inits.sql
```

Ví dụ:

```powershell
psql "postgresql://USER:PASSWORD@HOST.neon.tech/tabelink_dev?sslmode=require" -f database/inits.sql
```

Không ghi connection string thật vào file tài liệu hoặc commit history.

## Cách kiểm tra kết nối

Chạy backend:

```powershell
cd backend
npm run start:dev
```

Kiểm tra backend sống:

```text
GET http://localhost:8080/health
```

Kết quả mong muốn:

```json
{ "status": "ok" }
```

Kiểm tra backend kết nối được database:

```text
GET http://localhost:8080/db-health
```

Kết quả mong muốn:

```json
{ "database": "connected" }
```

Endpoint `/db-health` chạy query:

```sql
select 1;
```

Nếu `/health` pass nhưng `/db-health` fail, lỗi thường nằm ở `DATABASE_URL`, SSL, quyền truy cập NeonDB hoặc network.

## Tổng quan schema hiện tại

Schema hiện tại có các nhóm chính:

| Nhóm | Bảng |
| --- | --- |
| Account và master data | `USER_ACCOUNT`, `FEATURE_MASTER`, `PAYMENT_METHOD`, `HASHTAG`, `SPECIAL_REQUEST_TEMPLATE`, `BADGE_MASTER` |
| Profile và quản trị tài khoản | `CUSTOMER_PROFILE`, `OWNER_PROFILE`, `USER_FOLLOW`, `MODERATION_LOG` |
| Nhà hàng và thực đơn | `RESTAURANT`, `RESTAURANT_MEDIA`, `RESTAURANT_FEATURE`, `RESTAURANT_PAYMENT_METHOD`, `MENU_ITEM`, `RESTAURANT_TABLE` |
| Đặt bàn và gọi món | `RESERVATION`, `RESERVATION_ITEM`, `RESERVATION_SPECIAL_REQUEST` |
| Review va blog/social | `REVIEW`, `BLOG_POST`, `BLOG_MEDIA`, `BLOG_TAG`, `BLOG_LIKE`, `BLOG_COMMENT`, `BLOG_SHARE` |
| Promotion, badge, analytics | `PROMOTION`, `BADGE_APPLICATION`, `RESTAURANT_BADGE`, `RESTAURANT_ANALYTICS_DAILY`, `MENU_ITEM_ANALYTICS_DAILY` |

Ghi chú từ schema:

- Guest không được lưu trong database. Guest là người dùng chưa đăng nhập.
- Hành động của khách hàng tham chiếu qua `CUSTOMER_PROFILE`.
- Hành động của chủ nhà hàng tham chiếu qua `OWNER_PROFILE`.
- Hành động của admin tham chiếu qua `USER_ACCOUNT`, và application phải kiểm tra `Role = 'Admin'`.

## Cách đọc schema cho backend developer

Khi làm backend, không nên chỉ nhìn tên bảng. Cần đọc bảng theo nghiệp vụ, role sử dụng và quan hệ dữ liệu.

### Luồng tài khoản

Tất cả tài khoản đăng nhập nằm ở `USER_ACCOUNT`.

Sau đó dữ liệu tách theo role:

```text
USER_ACCOUNT.Role = 'User'  -> CUSTOMER_PROFILE
USER_ACCOUNT.Role = 'Owner' -> OWNER_PROFILE
USER_ACCOUNT.Role = 'Admin' -> không có profile riêng, dùng USER_ACCOUNT
```

Backend cần tự đảm bảo:

- Nếu user gọi API dành cho khách hàng, account đó phải có role `User` và có record trong `CUSTOMER_PROFILE`.
- Nếu owner gọi API quản lý nhà hàng, account đó phải có role `Owner` và có record trong `OWNER_PROFILE`.
- Nếu admin gọi API kiểm duyệt, account đó phải có role `Admin`.

Database có foreign key để giữ quan hệ dữ liệu, nhưng kiểm tra quyền theo role vẫn là trách nhiệm của backend.

### Luồng nhà hàng

Nhà hàng thuộc về owner:

```text
OWNER_PROFILE -> RESTAURANT
```

Các dữ liệu phụ của nhà hàng:

```text
RESTAURANT -> RESTAURANT_MEDIA
RESTAURANT -> RESTAURANT_FEATURE -> FEATURE_MASTER
RESTAURANT -> RESTAURANT_PAYMENT_METHOD -> PAYMENT_METHOD
RESTAURANT -> MENU_ITEM
RESTAURANT -> RESTAURANT_TABLE
```

Khi code API owner, luôn kiểm tra restaurant có thuộc owner đang đăng nhập không. Một số bảng đã có composite foreign key để hỗ trợ việc này, nhưng backend vẫn nên check trước để trả lỗi rõ ràng.

### Luồng đặt bàn

Đặt bàn bắt đầu từ customer và restaurant:

```text
CUSTOMER_PROFILE -> RESERVATION <- RESTAURANT
```

Một reservation có thể có:

```text
RESERVATION -> RESERVATION_ITEM
RESERVATION -> RESERVATION_SPECIAL_REQUEST
RESERVATION -> RESTAURANT_TABLE
```

Backend cần chú ý:

- `Pax` phải lớn hơn `0`.
- `ReservationDateTime` phải là thời điểm hợp lệ.
- Nếu gán bàn, bàn đó phải thuộc đúng restaurant.
- Không được double-book một bàn cùng thời điểm khi status là `Pending` hoặc `Approved`.

### Luồng review

Review do customer tạo cho restaurant:

```text
CUSTOMER_PROFILE -> REVIEW <- RESTAURANT
```

Review có thể gắn với reservation:

```text
RESERVATION -> REVIEW
```

Nếu review có `ReservationID`, database kiểm tra reservation đó thuộc đúng customer và restaurant.

Backend cần chú ý:

- `Rating` từ `1` đến `5`.
- Các điểm vệ sinh nếu có cũng từ `1` đến `5`.
- `Status` kiểm soát review đang hiển thị, bị ẩn hay bị xóa.

### Luồng promotion và badge

Owner tạo promotion hoặc xin badge cho restaurant:

```text
OWNER_PROFILE -> RESTAURANT -> PROMOTION
OWNER_PROFILE -> RESTAURANT -> BADGE_APPLICATION
```

Admin duyệt:

```text
USER_ACCOUNT(Role='Admin') -> PROMOTION.ApprovedByAdminID
USER_ACCOUNT(Role='Admin') -> BADGE_APPLICATION.ReviewedByAdminID
USER_ACCOUNT(Role='Admin') -> RESTAURANT_BADGE.GrantedByAdminID
```

Backend cần chú ý:

- Promotion active/rejected/ended phải có admin duyệt.
- Badge application khi không còn pending phải có admin review.
- Owner chỉ được thao tác với restaurant thuộc quyền sở hữu của mình.

### Luồng analytics

Analytics được lưu theo ngày:

```text
RESTAURANT -> RESTAURANT_ANALYTICS_DAILY
MENU_ITEM -> MENU_ITEM_ANALYTICS_DAILY
```

Backend có thể dùng các bảng này cho dashboard owner:

- Lượt truy cập nhà hàng.
- Lượt truy cập từ khách Nhật.
- Số review.
- Số reservation.
- Giờ cao điểm.
- Lượt xem và lượt đặt món.

Các bảng analytics không thay thế log sự kiện chi tiết. Đây là bảng tổng hợp theo ngày.

### Bảng tổng hợp cho backend

| Bảng | Dùng cho | Backend cần chú ý |
| --- | --- | --- |
| `USER_ACCOUNT` | Đăng nhập, phân quyền, trạng thái tài khoản | Email unique lowercase, role chỉ gồm `Admin`, `User`, `Owner`. |
| `CUSTOMER_PROFILE` | Hồ sơ người dùng khách hàng | Chỉ dùng cho account role `User`. |
| `OWNER_PROFILE` | Hồ sơ chủ nhà hàng | Chỉ dùng cho account role `Owner`. |
| `RESTAURANT` | Thông tin nhà hàng | Mọi API owner phải kiểm tra `OwnerAccountID`. |
| `RESTAURANT_MEDIA` | Ảnh, cover, media nhà hàng | Có trạng thái kiểm duyệt `Pending`, `Approved`, `Rejected`. |
| `FEATURE_MASTER` | Master tiện ích nhà hàng | Dữ liệu danh mục, thường dùng để filter/search. |
| `RESTAURANT_FEATURE` | Nhà hàng có tiện ích nào | Bảng nối nhiều-nhiều. |
| `PAYMENT_METHOD` | Master phương thức thanh toán | Dữ liệu danh mục. |
| `RESTAURANT_PAYMENT_METHOD` | Nhà hàng hỗ trợ thanh toán nào | Bảng nối nhiều-nhiều. |
| `MENU_ITEM` | Món ăn | Giá không âm, độ cay `0` đến `5`, có song ngữ Nhật - Việt. |
| `RESTAURANT_TABLE` | Bàn và sơ đồ bàn | Status bàn phục vụ floor map và reservation. |
| `RESERVATION` | Đặt bàn | Có status nghiệp vụ, chống double-book khi đã gán bàn. |
| `RESERVATION_ITEM` | Món đặt trước | Item phải thuộc cùng restaurant với reservation. |
| `RESERVATION_SPECIAL_REQUEST` | Yêu cầu đặc biệt | Phải có template hoặc custom text. |
| `SPECIAL_REQUEST_TEMPLATE` | Mẫu yêu cầu đặt bàn | Dùng cho câu mẫu Nhật/Vietnamese như bớt cay, không rau mùi, VAT. |
| `REVIEW` | Đánh giá nhà hàng | Rating và điểm vệ sinh có constraint, có status hiển thị. |
| `BLOG_MEDIA` | Anh/video trong blog | Thuoc blog. |
| `HASHTAG` | Master hashtag | Dung cho blog tag, timeline, trend. |
| `BLOG_TAG` | Gan hashtag vao blog | Bang noi nhieu-nhieu. |
| `PROMOTION` | Quảng cáo, chiến dịch, ưu đãi | Click không vượt impressions, active phải có admin duyệt. |
| `BADGE_MASTER` | Master huy hiệu | Dữ liệu danh mục về tiêu chí/huy hiệu. |
| `BADGE_APPLICATION` | Hồ sơ xin huy hiệu | Owner submit, admin review. |
| `RESTAURANT_BADGE` | Huy hiệu đã cấp | Một restaurant có thể có nhiều badge. |
| `MODERATION_LOG` | Lịch sử kiểm duyệt | Dùng cho audit hành động admin. |
| `RESTAURANT_ANALYTICS_DAILY` | Thống kê ngày của nhà hàng | Count không âm, khách Nhật không vượt tổng visit. |
| `MENU_ITEM_ANALYTICS_DAILY` | Thống kê ngày của món | View/order count không âm. |

## Chi tiết các nhóm bảng

### 1. Account và master data

#### `USER_ACCOUNT`

Lưu tài khoản đăng nhập chung cho admin, user và owner.

Các cột chính:

- `AccountID`: khóa chính.
- `Email`: email đăng nhập.
- `PasswordHash`: mật khẩu đã hash.
- `Role`: vai trò, gồm `Admin`, `User`, `Owner`.
- `Status`: trạng thái tài khoản, gồm `Active`, `Banned`, `Pending`, `Disabled`.
- `CreatedAt`, `UpdatedAt`: thời điểm tạo và cập nhật.

Điểm đáng chú ý:

- Email không được rỗng.
- Email unique theo dạng lowercase qua index `ux_user_account_email_lower`.

#### `FEATURE_MASTER`

Danh mục tính năng hoặc tiện ích của nhà hàng.

Ví dụ: có nhân viên biết tiếng Nhật, có phòng riêng, có chỗ đỗ xe.

#### `PAYMENT_METHOD`

Danh mục phương thức thanh toán.

Ví dụ: Visa, JCB, Apple Pay, tiền mặt.

#### `HASHTAG`

Danh mục hashtag dùng cho review, timeline hoặc xu hướng.

#### `SPECIAL_REQUEST_TEMPLATE`

Mẫu yêu cầu đặc biệt khi đặt bàn.

`RequestType` hiện hỗ trợ:

- `Coriander`
- `LessSpicy`
- `VATInvoice`
- `Other`

#### `BADGE_MASTER`

Danh mục huy hiệu xác thực.

Ví dụ: nhà hàng phù hợp với khách Nhật, đạt tiêu chí vệ sinh, có dịch vụ tiếng Nhật.

### 2. Profile và quản trị tài khoản

#### `CUSTOMER_PROFILE`

Lưu thông tin hồ sơ của người dùng loại `User`.

Khóa chính `AccountID` đồng thời là khóa ngoại tới `USER_ACCOUNT`.

#### `OWNER_PROFILE`

Lưu thông tin hồ sơ của chủ nhà hàng.

Khóa chính `AccountID` đồng thời là khóa ngoại tới `USER_ACCOUNT`.

#### `USER_FOLLOW`

Lưu quan hệ theo dõi giữa các customer.

Ràng buộc:

- Một user không được follow chính mình.
- Khóa chính gồm `FollowerAccountID` và `FollowedAccountID`.

#### `MODERATION_LOG`

Lưu lịch sử kiểm duyệt của admin.

`TargetType` gồm:

- `Review`
- `Promotion`
- `BadgeApplication`
- `Account`
- `RestaurantMedia`

`ActionType` gồm:

- `Approve`
- `Reject`
- `Hide`
- `Delete`
- `Ban`
- `Unban`

### 3. Nhà hàng và thực đơn

#### `RESTAURANT`

Lưu thông tin nhà hàng.

Các cột chính:

- `RestaurantID`: khóa chính.
- `OwnerAccountID`: chủ nhà hàng.
- `NameVN`, `NameJP`: tên tiếng Việt và tiếng Nhật.
- `Address`: địa chỉ.
- `Latitude`, `Longitude`: tọa độ bản đồ.
- `DescriptionVN`, `DescriptionJP`: mô tả song ngữ.
- `IssuesVAT`: có hỗ trợ VAT hay không.
- `Status`: `Draft`, `PendingApproval`, `Active`, `Suspended`.

Ràng buộc:

- Latitude nằm trong khoảng `-90` đến `90`.
- Longitude nằm trong khoảng `-180` đến `180`.
- Có unique composite `(RestaurantID, OwnerAccountID)` để các bảng khác kiểm tra đúng chủ nhà hàng.

#### `RESTAURANT_MEDIA`

Lưu ảnh, ảnh cover hoặc media khác của nhà hàng.

`Status` gồm:

- `Pending`
- `Approved`
- `Rejected`

#### `RESTAURANT_FEATURE`

Bảng nối nhiều-nhiều giữa nhà hàng và tiện ích.

#### `RESTAURANT_PAYMENT_METHOD`

Bảng nối nhiều-nhiều giữa nhà hàng và phương thức thanh toán.

#### `MENU_ITEM`

Lưu món ăn của nhà hàng.

Các cột đáng chú ý:

- `NameVN`, `NameJP`: tên món song ngữ.
- `Price`: giá, không được âm.
- `IsRecommendedForJP`: có được gợi ý cho khách Nhật hay không.
- `SpicyLevel`: độ cay từ `0` đến `5`.
- `HasCoriander`: có rau mùi hay không.
- `IsActive`: món còn hoạt động hay không.

#### `RESTAURANT_TABLE`

Lưu bàn trong nhà hàng và vị trí trên floor map.

`Status` gồm:

- `Empty`
- `Using`
- `Reserved`
- `OutOfService`

### 4. Đặt bàn và gọi món

#### `RESERVATION`

Lưu yêu cầu đặt bàn.

Các cột chính:

- `CustomerAccountID`: khách đặt bàn.
- `RestaurantID`: nhà hàng được đặt.
- `TableID`: bàn được gán, có thể null.
- `ReservationDateTime`: thời gian đặt.
- `Pax`: số người.
- `Status`: trạng thái đặt bàn.

`Status` gồm:

- `Pending`
- `Approved`
- `Rejected`
- `Cancelled`
- `Completed`
- `NoShow`

Index quan trọng:

```sql
ux_reservation_table_timeslot_active
```

Index này ngăn việc một bàn có nhiều booking active cùng thời điểm.

#### `RESERVATION_ITEM`

Lưu món được đặt trước trong reservation.

Ràng buộc quan trọng:

- Item phải thuộc cùng restaurant với reservation.
- Quantity phải lớn hơn `0`.
- UnitPrice không được âm.

#### `RESERVATION_SPECIAL_REQUEST`

Lưu yêu cầu đặc biệt của reservation.

Một request phải có ít nhất một trong hai:

- `TemplateID`
- `CustomText`

### 5. Review và social

#### `REVIEW`

Lưu đánh giá của khách hàng cho nhà hàng.

Các cột đáng chú ý:

- `Rating`: từ `1` đến `5`.
- `ToiletCleanliness`: điểm vệ sinh toilet.
- `DishCleanliness`: điểm vệ sinh bát đũa.
- `SpaceCleanliness`: điểm vệ sinh không gian.
- `IsJapaneseTag`: đánh dấu review phục vụ hiển thị/lọc review từ góc nhìn khách Nhật.
- `Status`: `Visible`, `Hidden`, `Deleted`.

Nếu review liên kết với reservation, schema kiểm tra:

- Reservation thuộc đúng restaurant.
- Reservation thuộc đúng customer.

#### `BLOG_POST`

Luu bai blog cua customer, co the gan voi restaurant.

#### `BLOG_MEDIA`, `BLOG_TAG`, `BLOG_LIKE`, `BLOG_COMMENT`, `BLOG_SHARE`

Cac bang phu cho blog: media, hashtag, like, comment va share.

### 6. Promotion, badge và analytics

#### `PROMOTION`

Lưu chiến dịch quảng cáo hoặc khuyến mãi.

`PromotionType` gồm:

- `Campaign`
- `Advertisement`

`Status` gồm:

- `Pending`
- `Active`
- `Rejected`
- `Ended`

Ràng buộc quan trọng:

- `EndDate` phải lớn hơn `StartDate`.
- `Clicks` không được lớn hơn `Impressions`.
- Promotion ở trạng thái `Active`, `Rejected`, `Ended` phải có admin duyệt.
- Owner tạo promotion phải đúng là owner của restaurant.

#### `BADGE_APPLICATION`

Lưu hồ sơ xin cấp huy hiệu xác thực.

Ràng buộc:

- Khi status khác `Pending`, phải có `ReviewedByAdminID` và `ReviewedAt`.
- Owner submit application phải đúng là owner của restaurant.

#### `RESTAURANT_BADGE`

Lưu huy hiệu đã được cấp cho nhà hàng.

Khóa chính gồm:

```text
RestaurantID + BadgeID
```

#### `RESTAURANT_ANALYTICS_DAILY`

Lưu thống kê theo ngày cho nhà hàng.

Các chỉ số:

- `VisitCount`
- `JapaneseVisitCount`
- `ReviewCount`
- `ReservationCount`
- `PeakHour`

Ràng buộc:

- Các count không được âm.
- `JapaneseVisitCount` không được lớn hơn `VisitCount`.
- `PeakHour` từ `0` đến `23`.

#### `MENU_ITEM_ANALYTICS_DAILY`

Lưu thống kê theo ngày cho món ăn.

Các chỉ số:

- `ViewCount`
- `OrderCount`

## Quan hệ dữ liệu chính

Các quan hệ quan trọng:

```text
USER_ACCOUNT 1 - 1 CUSTOMER_PROFILE
USER_ACCOUNT 1 - 1 OWNER_PROFILE
OWNER_PROFILE 1 - N RESTAURANT
RESTAURANT 1 - N MENU_ITEM
RESTAURANT 1 - N RESTAURANT_TABLE
RESTAURANT 1 - N RESERVATION
CUSTOMER_PROFILE 1 - N RESERVATION
RESERVATION 1 - N RESERVATION_ITEM
RESERVATION 1 - N RESERVATION_SPECIAL_REQUEST
CUSTOMER_PROFILE 1 - N REVIEW
RESTAURANT 1 - N REVIEW
BLOG_POST 1 - N BLOG_MEDIA
REVIEW N - N HASHTAG
RESTAURANT N - N FEATURE_MASTER
RESTAURANT N - N PAYMENT_METHOD
RESTAURANT N - N BADGE_MASTER
RESTAURANT 1 - N PROMOTION
RESTAURANT 1 - N RESTAURANT_ANALYTICS_DAILY
MENU_ITEM 1 - N MENU_ITEM_ANALYTICS_DAILY
```

## Ràng buộc và index quan trọng

### Email unique không phân biệt hoa thường

```sql
CREATE UNIQUE INDEX ux_user_account_email_lower
    ON USER_ACCOUNT (LOWER(Email));
```

Ý nghĩa: `Test@example.com` và `test@example.com` được xem là cùng một email.

### Không double-book bàn cùng thời điểm

```sql
CREATE UNIQUE INDEX ux_reservation_table_timeslot_active
    ON RESERVATION(RestaurantID, TableID, ReservationDateTime)
    WHERE TableID IS NOT NULL AND Status IN ('Pending', 'Approved');
```

Ý nghĩa: một bàn không thể có hai reservation active cùng một thời điểm.

### Composite foreign key kiểm tra đúng owner

Một số bảng như `PROMOTION` và `BADGE_APPLICATION` dùng composite foreign key:

```text
RestaurantID + OwnerAccountID
```

Ý nghĩa: owner chỉ được tạo promotion hoặc badge application cho nhà hàng thuộc quyền sở hữu của họ.

### Composite foreign key kiểm tra dữ liệu cùng restaurant

`RESERVATION_ITEM` kiểm tra item thuộc cùng restaurant với reservation:

```text
ReservationID + RestaurantID
ItemID + RestaurantID
```

Ý nghĩa: không thể đặt món của nhà hàng A trong reservation của nhà hàng B.

## Trigger UpdatedAt

Schema có function:

```sql
set_updated_at()
```

Function này tự cập nhật `UpdatedAt` khi row được update.

Các bảng đang có trigger:

- `USER_ACCOUNT`
- `RESTAURANT`
- `MENU_ITEM`
- `RESERVATION`
- `REVIEW`

Ý nghĩa: application không cần tự set `UpdatedAt` cho các bảng này nếu update qua SQL thông thường.

## Quy tắc quản lý thay đổi database

### Không sửa schema trực tiếp bằng TypeORM synchronize

Trong backend:

```ts
synchronize: false
```

Không đổi thành `true`.

### Không sửa database production bằng tay nếu không có script

Mọi thay đổi schema cần có file SQL rõ ràng trong:

```text
database/migrations/
```

Quy tắc đặt tên migration:

```text
001_create_initial_tables.sql
002_add_restaurant_slug.sql
003_add_review_report_table.sql
```

### Khi thêm bảng mới

Cần xác định:

- Bảng thuộc nhóm domain nào.
- Primary key là gì.
- Foreign key liên kết với bảng nào.
- Có cần `CreatedAt`, `UpdatedAt` không.
- Có cần status enum bằng `CHECK` không.
- Có cần index cho query thường dùng không.
- Nếu có owner/admin/customer action, cần ràng buộc đúng role ở application layer.

### Khi thêm cột mới

Cần xác định:

- Cột có nullable không.
- Có default value không.
- Có cần backfill dữ liệu cũ không.
- Có ảnh hưởng API hoặc frontend không.
- Có cần cập nhật seed data không.

### Khi thêm index mới

Chỉ thêm index khi có lý do rõ:

- Cột dùng trong search/filter.
- Cột dùng trong join.
- Cột dùng trong order by.
- Cột có query thường xuyên.

Không thêm index thừa vì index làm tăng chi phí ghi dữ liệu.

### Khi thay đổi enum bằng CHECK constraint

Các status hiện tại được quản lý bằng `CHECK`.

Ví dụ:

```sql
CHECK (Status IN ('Pending', 'Approved', 'Rejected'))
```

Khi thêm status mới, cần tạo migration sửa constraint. Không chỉ sửa code backend.

## Checklist trước khi merge thay đổi DB

Trước khi merge thay đổi liên quan database, kiểm tra:

- SQL chạy được trên PostgreSQL.
- Không có connection string thật trong file.
- Không có dữ liệu nhạy cảm trong seed.
- Foreign key đúng quan hệ nghiệp vụ.
- Các status có `CHECK` rõ ràng.
- Các cột tiền, số lượng, rating có constraint chống dữ liệu âm hoặc ngoài khoảng hợp lệ.
- Các query chính có index phù hợp.
- Backend vẫn chạy được `GET /db-health`.
- Backend test pass.
- Tài liệu `DATABASE.md` được cập nhật nếu schema thay đổi.

## Lệnh kiểm tra nhanh

Kiểm tra danh sách bảng:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Kiểm tra index:

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Kiểm tra trigger:

```sql
SELECT event_object_table, trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Kiểm tra kết nối tối thiểu:

```sql
SELECT 1;
```

## Update 2026-05-14: blog va review

Schema hien tai tach review nha hang va blog thanh hai domain rieng:

- `REVIEW` chi phuc vu man hinh ID5: customer, restaurant, reservation neu co, rating, cac diem ve sinh, content, `IsJapaneseTag`, status va timestamp. Review khong con bang media/tag rieng.
- Blog dung cac bang `BLOG_POST`, `BLOG_MEDIA`, `BLOG_TAG`, `BLOG_LIKE`, `BLOG_COMMENT`, `BLOG_SHARE`.
- `HASHTAG` la master tag dung cho blog qua `BLOG_TAG`.
- Like blog unique theo `(BlogID, CustomerAccountID)`.
- Comment blog ho tro reply bang `ParentCommentID`, co status `Visible`, `Hidden`, `Deleted`.
- Share blog chi la thao tac copy link, duoc ghi thanh event qua `BLOG_SHARE`.
