# Chương 18 – AWS CloudFormation

> **Nguồn:** 18 video của chương + *CloudFormation Quiz* (16 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **Infrastructure as Code (IaC)** và lợi ích của CloudFormation (kiểm soát, chi phí, năng suất, tách biệt trách nhiệm).
- Tạo, cập nhật (qua **Change Set**) và xoá **stack** bằng console và AWS CLI.
- Đọc/viết template **YAML** với đầy đủ các section: `Resources`, `Parameters`, `Mappings`, `Outputs` (+ `Export`), `Conditions`.
- Dùng thành thạo các **intrinsic function**: `Ref`, `Fn::GetAtt`, `Fn::FindInMap`, `Fn::ImportValue`, `Fn::Join`, `Fn::Sub`, `Fn::Base64`, các hàm điều kiện.
- Hiểu hành vi **rollback** khi tạo/cập nhật thất bại và cách xử lý `UPDATE_ROLLBACK_FAILED`.
- Bảo mật và bảo vệ stack: **Service Role** (`iam:PassRole`), **Capabilities**, **DeletionPolicy**, **Stack Policy**, **Termination Protection**.
- Mở rộng CloudFormation bằng **Custom Resources** (Lambda) và triển khai đa tài khoản/đa region bằng **StackSets**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | CloudFormation - Overview | Bài 1 – Tổng quan CloudFormation |
| 002–003 | Create Stack / Update & Delete Stack - Hands On | Bài 2 – Tạo, cập nhật và xoá stack |
| 004 | YAML Crash Course | Bài 3 – YAML cấp tốc |
| 005 | CloudFormation - Resources | Bài 4 – Resources |
| 006 | CloudFormation - Parameters | Bài 5 – Parameters và Pseudo Parameters |
| 007 | CloudFormation - Mappings | Bài 6 – Mappings |
| 008 | CloudFormation - Outputs & Exports | Bài 7 – Outputs và Exports |
| 009 | CloudFormation - Conditions | Bài 8 – Conditions |
| 010 | CloudFormation - Intrinsic Functions | Bài 9 – Intrinsic Functions |
| 011 | CloudFormation - Rollbacks | Bài 10 – Rollbacks |
| 012 | CloudFormation - Service Role | Bài 11 – Service Role |
| 013 | CloudFormation - Capabilities | Bài 12 – Capabilities |
| 014 | CloudFormation - Deletion Policy | Bài 13 – DeletionPolicy |
| 015 | CloudFormation - Stack Policy | Bài 14 – Stack Policy |
| 016 | CloudFormation - Termination Protection | Bài 15 – Termination Protection |
| 017 | CloudFormation - Custom Resources | Bài 16 – Custom Resources |
| 018 | CloudFormation - StackSets | Bài 17 – StackSets |
| Quiz | CloudFormation Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan CloudFormation

### Lý thuyết

- **CloudFormation** là cách **mô tả hạ tầng AWS bằng code** (gần như mọi loại tài nguyên). Ví dụ trong template bạn khai báo: "tôi muốn 1 security group, 2 EC2 instance dùng security group đó, Elastic IP cho từng instance, 1 S3 bucket, 1 load balancer phía trước các EC2".
- Bạn chỉ **khai báo (declarative)** những gì cần có và quan hệ giữa chúng; CloudFormation **tự tạo theo đúng thứ tự**, đúng cấu hình. Không còn thao tác thủ công.
- Có thể **trực quan hoá** template thành sơ đồ bằng **Infrastructure Composer**.

#### Lợi ích

| Nhóm | Lợi ích |
|---|---|
| **Infrastructure as Code** | Không tạo tài nguyên thủ công → kiểm soát tốt. Template lưu trong **Git** (version control). Mọi thay đổi hạ tầng được **review qua code**. |
| **Chi phí** | Mọi tài nguyên trong stack được **gắn tag** định danh → dễ biết stack tốn bao nhiêu. **Ước tính chi phí** từ template. Chiến lược tiết kiệm: môi trường dev tự **xoá stack lúc 17h, tạo lại lúc 8h**. |
| **Năng suất** | Xoá và tạo lại hạ tầng **nhanh chóng** (đúng tinh thần pay-as-you-go của cloud). **Tự sinh sơ đồ** kiến trúc. Lập trình khai báo → **không cần tự tính thứ tự tạo/orchestration**. |
| **Tách biệt trách nhiệm** | Tạo nhiều stack cho nhiều ứng dụng/nhiều tầng: stack **network/VPC**, stack **ứng dụng**… |
| **Không phát minh lại bánh xe** | Tận dụng template có sẵn trên mạng và tài liệu. |

#### Cách hoạt động

- Template phải được **upload lên Amazon S3**, rồi CloudFormation **tham chiếu** tới nó để tạo **stack**. (Upload qua console thì AWS tự đẩy lên S3 phía sau.)
- **Stack** = tập hợp tài nguyên AWS được tạo từ template; được định danh bằng **tên duy nhất trong một region**.
- **Không sửa** được template cũ: muốn cập nhật thì **upload phiên bản template mới** rồi **update stack**.
- **Xoá stack** → **mọi tài nguyên** do CloudFormation tạo ra đều bị xoá.

#### Cách triển khai template

| Cách | Mô tả |
|---|---|
| **Thủ công** | Viết template bằng Infrastructure Composer hoặc code editor, dùng console để nhập parameter… (dùng trong khoá học để học) |
| **Tự động** | Viết template YAML, deploy bằng **CLI** hoặc công cụ **CI/CD** (khuyến nghị khi muốn tự động hoá toàn bộ) |

#### Các thành phần (building blocks) của template

| Section | Ý nghĩa |
|---|---|
| `AWSTemplateFormatVersion` | Phiên bản định dạng template (dùng nội bộ AWS, giá trị duy nhất `"2010-09-09"`) |
| `Description` | Mô tả/chú thích template |
| **`Resources`** | Tài nguyên AWS cần tạo — **section BẮT BUỘC duy nhất** |
| `Parameters` | Đầu vào **động** |
| `Mappings` | Biến **tĩnh** |
| `Outputs` | Tham chiếu tới những gì đã tạo |
| `Conditions` | Điều kiện để tạo tài nguyên |

Thêm các **template helpers**: references (`Ref`) và functions (intrinsic functions).

### Kiến thức thực tế

- **Cập nhật 2024+:** *AWS Application Composer* đã được **đổi tên thành AWS Infrastructure Composer** (video đôi chỗ gọi cả hai tên). Composer có thể dùng ngay trong console CloudFormation hoặc qua extension VS Code (AWS Toolkit).
- **CloudFormation miễn phí** với tài nguyên thuộc namespace `AWS::*`; bạn chỉ trả tiền cho tài nguyên được tạo ra (EC2, RDS…). Các handler của bên thứ ba trong **CloudFormation Registry** có thể tính phí theo số handler operation.
- Các công cụ liên quan nên biết:
  - **AWS SAM** (chương sau) và **AWS CDK** đều **sinh ra template CloudFormation** rồi deploy bằng CloudFormation.
  - **IaC generator** (2024): quét tài nguyên đã tạo thủ công trong tài khoản và **sinh template** để đưa vào quản lý bằng CloudFormation.
  - **Git sync**: stack tự cập nhật khi template trong repository Git thay đổi.
  - **Drift detection**: phát hiện tài nguyên bị sửa tay khác với template (`aws cloudformation detect-stack-drift --stack-name X`).
- Kiểm tra template trước khi deploy:

  ```bash
  aws cloudformation validate-template --template-body file://template.yaml   # chỉ kiểm tra cú pháp
  pip install cfn-lint && cfn-lint template.yaml                               # kiểm tra kỹ hơn (thuộc tính, kiểu…)
  ```

### Ghi nhớ cho kỳ thi

- CloudFormation = **IaC, declarative**; **không cần chỉ định thứ tự tạo** tài nguyên.
- Template luôn được CloudFormation tham chiếu **từ Amazon S3**.
- **`Resources` là section bắt buộc duy nhất.**
- Cập nhật stack = **upload template mới**, không sửa template cũ; **không** sửa tài nguyên bằng tay.

---

## Bài 2 – Tạo, cập nhật và xoá stack

### Lý thuyết

- **Tạo stack:** chọn template (có sẵn / sample / Infrastructure Composer / upload file) → đặt tên stack → (tags, permissions, các tuỳ chọn nâng cao) → **Submit**.
- Tab của stack trong console: **Stack info**, **Events** (lịch sử sự kiện: `CREATE_IN_PROGRESS`, `CREATE_COMPLETE`…), **Resources** (logical ID ↔ physical ID), **Outputs**, **Parameters**, **Template**.
- CloudFormation tự **gắn tag** cho tài nguyên nó tạo: `aws:cloudformation:stack-name`, `aws:cloudformation:logical-id`, `aws:cloudformation:stack-id`.
- **Cập nhật stack:** chỉ có 2 lựa chọn: **Use current template** (giữ nguyên, chỉ đổi parameter) hoặc **Replace current template** (thay template mới).
- **Change Set**: bản **xem trước những gì sẽ thay đổi** khi update: tài nguyên nào **Add / Modify / Remove**, và cột **Replacement**:
  - `Replacement: True` → tài nguyên cũ bị **thay thế** (tạo cái mới, xoá cái cũ — ví dụ EC2 instance mới với ID mới).
  - `Replacement: False` → thay đổi **tại chỗ** (in-place).
  - CloudFormation tự quyết định dựa trên thuộc tính bạn đổi. Không hài lòng thì xem lại code.
- **Xoá stack:** xoá **toàn bộ** tài nguyên của stack, CloudFormation **tự tính thứ tự xoá** (ví dụ: EIP → EC2 → Security Group). Nếu chỉ terminate EC2 bằng tay thì SG, EIP vẫn còn → luôn dọn dẹp qua CloudFormation.

### Kiến thức thực tế

- **Cập nhật:** `t2.micro` là thế hệ cũ; hiện nên dùng `t3.micro`/`t4g.micro`. Tài khoản tạo sau 15/07/2025 dùng mô hình Free Tier mới (credit), nên kiểm tra loại instance đủ điều kiện miễn phí trong console.
- **Đừng hard-code AMI ID**: dùng parameter kiểu SSM để luôn lấy AMI mới nhất ở mọi region:

  ```yaml
  Parameters:
    LatestAmiId:
      Type: AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>
      Default: /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64
  ```

- Thuộc tính `SecurityGroups` (theo **tên**) chỉ dùng cho **default VPC**. Trong VPC tự tạo, dùng `SecurityGroupIds` với `!GetAtt MySG.GroupId` (an toàn nhất, luôn trả về ID của security group).
- Lệnh tiện nhất cho CI/CD là **`aws cloudformation deploy`**: tự tạo stack nếu chưa có, hoặc tạo + thực thi change set nếu đã có (dùng `--no-execute-changeset` để chỉ xem trước).

  ```bash
  aws cloudformation deploy --stack-name EC2InstanceDemo --template-file 1-ec2-with-sg-eip.yaml \
    --parameter-overrides SecurityGroupDescription="This is a cool security group"
  ```

- Template > 51.200 byte phải upload lên S3 và dùng `--template-url` (giới hạn qua S3: 1 MB). `aws cloudformation package` tự upload code/template con lên S3.

### Ghi nhớ cho kỳ thi

- **Change Set** = xem trước thay đổi trước khi update (không đảm bảo update thành công, chỉ cho biết sẽ thay đổi gì).
- `Replacement: True` → tài nguyên mới với physical ID mới.
- Dọn dẹp bằng **Delete stack**, CloudFormation tự xác định thứ tự xoá.

---

## Bài 3 – YAML cấp tốc

### Lý thuyết

- Template CloudFormation viết bằng **YAML hoặc JSON**. YAML dễ đọc, dễ viết hơn (JSON nhiều dấu ngoặc, khó nội suy chuỗi) → khoá học dùng YAML.
- Thành phần của YAML:

| Thành phần | Cú pháp | Ví dụ |
|---|---|---|
| Cặp **key: value** | `key: value` | `invoice: 34843` |
| **Object lồng nhau** | thụt lề (bằng dấu cách, không dùng tab) | `bill-to:` rồi các key thụt vào |
| **Mảng (list)** | dấu `-` đầu dòng | `- sku: BL394D` |
| **Chuỗi nhiều dòng** | dấu `\|` | `lines: \|` |
| **Comment** | dấu `#` | `# an elastic IP for our instance` |

```yaml
invoice: 34843
date: 2001-01-23
bill-to:
  given: Chris
  family: Dumars
  address:
    lines: |
      458 Walkman Dr.
      Suite #292
    city: Royal Oak
product:
  - sku: BL394D
    quantity: 4
    description: Basketball
    price: 450.00
  - sku: BL4438H
    quantity: 1
    description: Super Hoop
    price: 2392.00
```

- Áp dụng vào template: `Resources` là object; `MyInstance` là object con; `Type` là key-value chuỗi; `Properties` là object; `SecurityGroups` là **list** (2 phần tử); `SecurityGroupIngress` là list các object (list 1 phần tử vẫn là list).

### Kiến thức thực tế

- `|` giữ nguyên xuống dòng (literal) — dùng cho **UserData**, code Lambda inline. `>` gộp các dòng thành một (folded).
- **Lỗi hay gặp:** dùng tab thay dấu cách; thụt lề lệch 1 khoảng trắng làm object rơi sai cấp; chuỗi có `:` hoặc bắt đầu bằng `*`, `!`, `{` cần đặt trong dấu nháy.
- Tag YAML như `!Ref`, `!Sub`, `!GetAtt` là **dạng rút gọn** của intrinsic function — chỉ có trong YAML; JSON phải viết `{"Ref": "..."}`, `{"Fn::Sub": "..."}`.
- Chuyển đổi YAML ↔ JSON nhanh bằng Infrastructure Composer hoặc công cụ `cfn-flip`.

### Ghi nhớ cho kỳ thi

- Đọc hiểu được YAML: object lồng nhau (thụt lề), list (`-`), chuỗi nhiều dòng (`|`), comment (`#`).

---

## Bài 4 – Resources

### Lý thuyết

- `Resources` là **lõi** của template và là **section bắt buộc duy nhất**. Mỗi resource đại diện cho một thành phần AWS sẽ được tạo/cấu hình.
- Resource có thể **tham chiếu lẫn nhau**; AWS tự lo việc tạo, cập nhật, xoá.
- Có **hơn 700 loại resource** (và ngày càng tăng). Định dạng type: **`service-provider::service-name::data-type-name`**, ví dụ `AWS::EC2::Instance`, `AWS::S3::Bucket`, `AWS::EC2::EIP`.
- Kỹ năng quan trọng là **đọc tài liệu** (*AWS resource and property types reference*). Mỗi trang resource có:
  - **Syntax** (JSON/YAML), danh sách **Properties**.
  - Mỗi property ghi rõ: **Required** (có/không), **Type** (String, Array of String…), **Update requires**: *No interruption* / *Some interruption* / **Replacement**. Ví dụ với `AWS::EC2::Instance`: đổi `IamInstanceProfile` → *No interruption*; đổi `ImageId` → **Replacement**.
  - **Return values** (`Ref` và `Fn::GetAtt`), **Examples**.
- Câu hỏi thường gặp:
  - **Tạo số lượng resource động được không?** Có, dùng **CloudFormation Macros và Transform** (ngoài phạm vi khoá học). Trong khoá học, viết gì thì tạo đúng cái đó.
  - **Mọi dịch vụ AWS đều được hỗ trợ?** **Gần như tất cả**. Phần còn thiếu → dùng **CloudFormation Custom Resources** (đề thi muốn bạn biết cách này).

### Kiến thức thực tế

- **Cập nhật:** hiện nay có thể tạo resource lặp lại bằng **`Fn::ForEach`** (cần khai báo `Transform: AWS::LanguageExtensions`), không bắt buộc phải viết macro riêng:

  ```yaml
  Transform: AWS::LanguageExtensions
  Resources:
    Fn::ForEach::Buckets:
      - BucketName
      - [Logs, Assets, Backups]
      - ${BucketName}Bucket:
          Type: AWS::S3::Bucket
  ```

- Các **thuộc tính cấp resource** (resource attributes), nằm ngang hàng `Type`/`Properties`: `DependsOn`, `Condition`, `DeletionPolicy`, `UpdateReplacePolicy`, `CreationPolicy`, `UpdatePolicy`, `Metadata`.
- **`DependsOn`**: CloudFormation tự suy ra thứ tự qua `Ref`/`GetAtt`. Chỉ dùng `DependsOn` khi phụ thuộc **ngầm** (ví dụ EC2 trong public subnet cần `VPCGatewayAttachment` xong trước mới có Internet).
- **Nested stacks** (`AWS::CloudFormation::Stack`): tái sử dụng template con (ví dụ một template ALB chuẩn dùng cho nhiều app). Khác với cross-stack reference (Outputs/Export) ở Bài 7.
- **CloudFormation Registry**: ngoài `AWS::*` còn có resource type của bên thứ ba/tự viết (ví dụ `MongoDB::Atlas::Cluster`) và **CloudFormation Hooks** để kiểm tra tuân thủ trước khi tạo tài nguyên.
- Lỗi thường gặp: tên property sai chữ hoa/thường (`Instancetype`), thiếu property bắt buộc, giá trị sai kiểu → stack fail ở bước tạo. Dùng `cfn-lint` để bắt sớm.

### Ghi nhớ cho kỳ thi

- Định dạng type: `AWS::Service::Type`.
- Dịch vụ chưa được hỗ trợ / logic tuỳ biến → **Custom Resources**.

---

## Bài 5 – Parameters và Pseudo Parameters

### Lý thuyết

- **Parameters** = cách **cung cấp đầu vào** cho template. Rất quan trọng khi **tái sử dụng** template trong công ty và khi giá trị **không xác định trước** được. Nhờ có **kiểu** và ràng buộc, parameter giúp **ngăn lỗi**.
- Khi nào nên dùng parameter? Tự hỏi: *"Cấu hình này có khả năng thay đổi trong tương lai không?"* Nếu có → parameter (đổi giá trị không cần upload lại template). Hoặc nếu **không thể biết trước**.
- Các thiết lập của parameter:

| Thiết lập | Ý nghĩa |
|---|---|
| `Type` | `String`, `Number`, `CommaDelimitedList`, `List<Number>`, **AWS-Specific Parameter** (ví dụ `AWS::EC2::KeyPair::KeyName`, `AWS::EC2::VPC::Id`, `List<AWS::EC2::Subnet::Id>` — giúp bắt giá trị không hợp lệ), **SSM Parameter** |
| `Description`, `ConstraintDescription` | Mô tả, thông báo khi vi phạm ràng buộc |
| `MinLength` / `MaxLength` | Độ dài chuỗi |
| `MinValue` / `MaxValue` | Giới hạn số |
| `Default` | Giá trị mặc định |
| `AllowedValues` | Danh sách giá trị cho phép (hiện thành dropdown) |
| `AllowedPattern` | Regex |
| `NoEcho` | Ẩn giá trị (mật khẩu) khỏi console/log |

- Hai ví dụ quan trọng cho kỳ thi:

  ```yaml
  Parameters:
    InstanceType:
      Description: Choose an EC2 instance type
      Type: String
      AllowedValues:
        - t2.micro
        - t2.small
        - t2.medium
      Default: t2.micro
    DBPassword:
      Description: The database admin password
      Type: String
      NoEcho: true

  Resources:
    MyEC2Instance:
      Type: AWS::EC2::Instance
      Properties:
        InstanceType: !Ref InstanceType
        ImageId: ami-0123456789abcdef0
  ```

  - `AllowedValues` → người dùng chỉ chọn trong dropdown: **cho họ lựa chọn nhưng bạn vẫn kiểm soát**.
  - `NoEcho: true` → mật khẩu không hiển thị ở đâu cả.
- **Dùng parameter**: hàm **`Fn::Ref`**, dạng rút gọn YAML **`!Ref`**. `!Ref` dùng được cho **parameter** (trả về giá trị) và **resource** (trả về physical ID) → **không đặt tên resource trùng tên parameter**. Trong template ở Bài 2: `!Ref SecurityGroupDescription` (parameter), `!Ref SSHSecurityGroup`, `!Ref ServerSecurityGroup`, `!Ref MyInstance` (resource).

#### Pseudo Parameters

Có sẵn trong mọi template, không cần khai báo, dùng bất cứ lúc nào:

| Pseudo parameter | Giá trị trả về (ví dụ) |
|---|---|
| `AWS::AccountId` | `123456789012` |
| `AWS::Region` | `us-east-1` |
| `AWS::StackId` | `arn:aws:cloudformation:us-east-1:123456789012:stack/MyStack/1c2fa620-...` |
| `AWS::StackName` | `MyStack` |
| `AWS::NotificationARNs` | `[arn:aws:sns:us-east-1:123456789012:MyTopic]` |
| `AWS::NoValue` | Không có giá trị (dùng với `Fn::If` để bỏ một thuộc tính) |

Hay dùng nhất: `AWS::Region` và `AWS::AccountId` — template **tự biết** đang chạy ở region/tài khoản nào, người dùng không cần nhập.

### Kiến thức thực tế

- Pseudo parameter khác: `AWS::Partition` (`aws`, `aws-cn`, `aws-us-gov`) và `AWS::URLSuffix` (`amazonaws.com`) — dùng khi dựng ARN để template chạy được ở mọi partition: `!Sub "arn:${AWS::Partition}:s3:::${MyBucket}/*"`.
- **`NoEcho` không phải là cơ chế quản lý bí mật**: giá trị vẫn có thể lộ nếu bạn đưa nó vào `Outputs`, `Metadata` hay tag. Thực tế nên dùng **dynamic references** để CloudFormation đọc bí mật lúc deploy:

  ```yaml
  MasterUserPassword: '{{resolve:secretsmanager:prod/db/password:SecretString:password}}'
  InstanceType: '{{resolve:ssm:/myapp/prod/instance-type}}'
  ```

  Hoặc với RDS, dùng `ManageMasterUserPassword: true` để RDS tự tạo và quản lý mật khẩu trong Secrets Manager.
- Parameter kiểu SSM (`AWS::SSM::Parameter::Value<String>`) đọc giá trị **tại thời điểm tạo/cập nhật stack**; lần update sau CloudFormation đọc lại giá trị mới.
- Truyền parameter bằng CLI: `--parameters ParameterKey=InstanceType,ParameterValue=t2.small` (create/update-stack) hoặc `--parameter-overrides InstanceType=t2.small` (deploy). Khi update giữ nguyên giá trị cũ: `ParameterKey=X,UsePreviousValue=true`.
- Giới hạn: tối đa **200 parameters** mỗi template.

### Ghi nhớ cho kỳ thi

- Parameter tham chiếu bằng **`!Ref`**; dùng `AllowedValues` để giới hạn lựa chọn, `NoEcho` cho mật khẩu.
- Nhớ danh sách pseudo parameter hợp lệ: `AWS::AccountId`, `AWS::Region`, `AWS::StackId`, `AWS::StackName`, `AWS::NotificationARNs`, `AWS::NoValue` (+ `AWS::Partition`, `AWS::URLSuffix`). **Không có `AWS::AccountName`**.

---

## Bài 6 – Mappings

### Lý thuyết

- **Mappings** = **biến cố định (hard-code)** trong template. Hữu ích để phân biệt môi trường (**dev / prod**), **region**, loại AMI…
- Định dạng: `MapName → TopLevelKey → SecondLevelKey → Value`.

  ```yaml
  Mappings:
    RegionMap:
      us-east-1:
        HVM64: ami-0ff8a91507f77f867
        HVMG2: ami-0a584ac55a7631c0c
      us-west-1:
        HVM64: ami-0bdb828fd58c52235
        HVMG2: ami-066ee5fd4a9ef77f1
      eu-west-1:
        HVM64: ami-047bb4163c506cd98
        HVMG2: ami-0a7c483d527806435

  Resources:
    MyEC2Instance:
      Type: AWS::EC2::Instance
      Properties:
        ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", HVM64]
        InstanceType: t2.micro
  ```

  (AMI ID trong ví dụ lấy từ slide minh hoạ, đã cũ.)
- Truy cập giá trị bằng **`Fn::FindInMap`** / `!FindInMap [MapName, TopLevelKey, SecondLevelKey]` — đúng **3 tham số**. Kết hợp `!Ref "AWS::Region"` → deploy ở region nào thì tự lấy AMI của region đó.

#### Mappings hay Parameters?

| | Mappings | Parameters |
|---|---|---|
| Khi nào | **Biết trước mọi giá trị**, suy ra được từ region, AZ, account, môi trường… | Giá trị **phụ thuộc người dùng**, quyết định lúc chạy |
| Ưu điểm | **Kiểm soát an toàn** hơn | **Tự do** tối đa cho người dùng |

### Kiến thức thực tế

- Mapping AMI theo region **nhanh lỗi thời** (AMI mới ra liên tục). Thực tế nên dùng SSM parameter `/aws/service/ami-amazon-linux-latest/...` như ở Bài 2.
- Mapping theo môi trường vẫn rất phổ biến:

  ```yaml
  Parameters:
    EnvironmentName:
      Type: String
      AllowedValues: [development, production]
  Mappings:
    EnvironmentToInstanceType:
      development:
        instanceType: t3.micro
      production:
        instanceType: m5.large
  Resources:
    EC2Instance:
      Type: AWS::EC2::Instance
      Properties:
        InstanceType: !FindInMap [EnvironmentToInstanceType, !Ref EnvironmentName, instanceType]
  ```

- `Fn::FindInMap` hỗ trợ giá trị mặc định khi không tìm thấy key nếu bật `Transform: AWS::LanguageExtensions`: `!FindInMap [Map, !Ref Env, key, {DefaultValue: t3.micro}]`.
- Mapping **không chứa được** `!Ref` hay hàm bên trong giá trị — chỉ chuỗi/danh sách tĩnh.

### Ghi nhớ cho kỳ thi

- `!FindInMap [MapName, TopLevelKey, SecondLevelKey]` — 3 tham số.
- Mọi `!Ref` trong `FindInMap` phải trỏ tới thứ **có tồn tại** (parameter đã khai báo hoặc pseudo parameter). Thiếu khai báo parameter → template lỗi (xem Câu 10).
- Một template có thể có **nhiều mapping**.

---

## Bài 7 – Outputs và Exports

### Lý thuyết

- `Outputs` là section **tuỳ chọn**, khai báo các giá trị đầu ra. Có thể **xem** trong console/CLI và **export** để **stack khác import**.
- Ví dụ: stack **network** export **VPC ID, Subnet ID** → stack **ứng dụng** import. Đây là cách **cộng tác giữa các stack** và để chuyên gia quản lý stack của riêng họ.
- Stack export:

  ```yaml
  Resources:
    MyCompanyWideSSHSecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupDescription: Company-wide SSH access
        SecurityGroupIngress:
          - IpProtocol: tcp
            FromPort: 22
            ToPort: 22
            CidrIp: 10.0.0.0/8

  Outputs:
    StackSSHSecurityGroup:
      Description: The SSH Security Group for our Company
      Value: !Ref MyCompanyWideSSHSecurityGroup
      Export:
        Name: SSHSecurityGroup
  ```

- **Tên export phải duy nhất trong một region** (của một tài khoản).
- Stack import bằng **`Fn::ImportValue`** / `!ImportValue`:

  ```yaml
  Resources:
    MySecureInstance:
      Type: AWS::EC2::Instance
      Properties:
        AvailabilityZone: us-east-1a
        ImageId: ami-0123456789abcdef0
        InstanceType: t2.micro
        SecurityGroups:
          - !ImportValue SSHSecurityGroup
  ```

- Khi hai stack đã liên kết: **không thể xoá stack export** cho tới khi **mọi stack import** không còn tham chiếu (phải xoá/sửa các stack import trước).

### Kiến thức thực tế

- Đặt tên export theo tên stack để tránh trùng: `Name: !Sub "${AWS::StackName}-VpcId"`. Ở stack import: `!ImportValue network-prod-VpcId` hoặc `Fn::ImportValue: !Sub "${NetworkStackName}-VpcId"`.
- Cũng **không thể sửa giá trị** của một export đang được import (update stack sẽ fail). Muốn đổi phải gỡ import ở stack kia trước. Đây là lý do nhiều đội dùng **SSM Parameter Store** làm "cầu nối" lỏng hơn giữa các stack.
- Cross-stack reference chỉ hoạt động **trong cùng region và cùng tài khoản**.
- CLI:

  ```bash
  aws cloudformation describe-stacks --stack-name network --query "Stacks[0].Outputs"
  aws cloudformation list-exports
  aws cloudformation list-imports --export-name SSHSecurityGroup   # stack nào đang import
  ```

- Giới hạn: tối đa **200 outputs** mỗi template.

### Ghi nhớ cho kỳ thi

- Chia sẻ giá trị giữa 2 template → **Outputs + Export** ở template A, **`Fn::ImportValue`** ở template B.
- Tên export **duy nhất trong region**.
- Stack có export đang được tham chiếu **không xoá được** → xoá các stack tham chiếu trước.

---

## Bài 8 – Conditions

### Lý thuyết

- **Conditions** điều khiển việc **tạo resource hoặc output** dựa trên điều kiện. Ví dụ: stack Dev và stack Prod dùng chung template, nhưng chỉ Prod có thêm EBS volume.
- Điều kiện thường dựa trên **môi trường** (dev/test/prod), **region**, hoặc **giá trị parameter**. Condition có thể tham chiếu condition khác, parameter, mapping.
- Hàm logic: **`Fn::And`, `Fn::Equals`, `Fn::If`, `Fn::Not`, `Fn::Or`**.

  ```yaml
  Parameters:
    EnvType:
      Type: String
      AllowedValues: [dev, test, prod]

  Conditions:
    CreateProdResources: !Equals [!Ref EnvType, prod]

  Resources:
    MountPoint:
      Type: AWS::EC2::VolumeAttachment
      Condition: CreateProdResources
      Properties:
        InstanceId: !Ref EC2Instance
        VolumeId: !Ref NewVolume
        Device: /dev/sdh
  ```

  Nếu `CreateProdResources` đúng → tạo `MountPoint`; sai → không tạo. Condition có thể áp dụng cho **resource, output**…
- Với kỳ thi: **không cần biết viết** condition (nâng cao), chỉ cần biết **nó tồn tại**.

### Kiến thức thực tế

- Dùng `Fn::If` để thay đổi **một thuộc tính** thay vì cả resource, kết hợp `AWS::NoValue` để bỏ thuộc tính:

  ```yaml
  Conditions:
    IsProd: !Equals [!Ref EnvType, prod]
    IsNotProd: !Not [Condition: IsProd]
    IsProdInUsEast1: !And
      - Condition: IsProd
      - !Equals [!Ref "AWS::Region", us-east-1]

  Resources:
    Database:
      Type: AWS::RDS::DBInstance
      Properties:
        Engine: mysql
        DBInstanceClass: !If [IsProd, db.r6g.large, db.t4g.micro]
        MultiAZ: !If [IsProd, true, false]
        AllocatedStorage: "20"
        ManageMasterUserPassword: true
        MasterUsername: admin
        BackupRetentionPeriod: !If [IsProd, 7, !Ref "AWS::NoValue"]
  ```

- Resource có điều kiện mà resource khác `!Ref` tới thì resource kia cũng phải có cùng điều kiện (hoặc dùng `!If`), nếu không sẽ lỗi khi condition = false.
- Trong section `Conditions` chỉ dùng được các hàm `And/Equals/Not/Or/If`, `Ref` tới parameter, `FindInMap`… — **không `Ref` tới resource**.

### Ghi nhớ cho kỳ thi

- Conditions dùng để **tạo có điều kiện** resource/output (ví dụ chỉ ở prod).
- Hàm: `And`, `Equals`, `If`, `Not`, `Or`.

---

## Bài 9 – Intrinsic Functions

### Lý thuyết

Danh sách hàm: `Ref`, `Fn::GetAtt`, `Fn::FindInMap`, `Fn::ImportValue`, `Fn::Join`, `Fn::Sub`, `Fn::ForEach`, `Fn::ToJsonString`, hàm điều kiện (`Fn::If`, `Fn::Not`, `Fn::Equals`…), `Fn::Base64`, `Fn::Cidr`, `Fn::GetAZs`, `Fn::Select`, `Fn::Split`, `Fn::Transform`, `Fn::Length`. **Cần nắm chắc:** Ref, GetAtt, FindInMap, ImportValue, Base64, Conditions (và Join/Sub).

| Hàm | Dạng rút gọn | Công dụng | Ví dụ |
|---|---|---|---|
| **`Ref`** | `!Ref` | Parameter → **giá trị**; Resource → **physical ID** | `VpcId: !Ref MyVPC` |
| **`Fn::GetAtt`** | `!GetAtt` | Lấy **thuộc tính** của resource (chỉ những gì tài liệu liệt kê trong *Return values*) | `!GetAtt EC2Instance.PublicDnsName` |
| **`Fn::FindInMap`** | `!FindInMap` | Lấy giá trị trong mapping | `!FindInMap [RegionMap, !Ref "AWS::Region", HVM64]` |
| **`Fn::ImportValue`** | `!ImportValue` | Import giá trị đã export ở stack khác | `!ImportValue SSHSecurityGroup` |
| **`Fn::Base64`** | `!Base64` | Chuyển chuỗi sang Base64 — chủ yếu để truyền **UserData** cho EC2 | `UserData: !Base64 \| ...` |
| **`Fn::Join`** | `!Join` | Nối danh sách bằng dấu phân cách | `!Join [":", [a, b, c]]` → `a:b:c` |
| **`Fn::Sub`** | `!Sub` | Thay biến `${...}` trong chuỗi | `!Sub "arn:aws:s3:::${MyBucket}/*"` |
| Conditions | `!If`, `!Not`, `!Equals`, `!And`, `!Or` | Logic điều kiện | `!If [IsProd, m5.large, t3.micro]` |

- **Ví dụ `Ref`**: tạo subnet cần VPC → `VpcId: !Ref MyVPC` (MyVPC là resource hoặc parameter).

  ```yaml
  DbSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      CidrBlock: 10.0.1.0/24
  ```

- **Ví dụ `GetAtt`**: với `AWS::EC2::Instance`, `Ref` trả về **InstanceId**; `GetAtt` trả về `AvailabilityZone`, `PrivateDnsName`, `PrivateIp`, `PublicDnsName`, `PublicIp`, `VpcId`, `InstanceId`… Dùng `PublicDnsName` để tạo bản ghi CNAME Route 53:

  ```yaml
  MyDNSRecord:
    Type: AWS::Route53::RecordSet
    Properties:
      HostedZoneName: example.com.
      Name: app.example.com.
      Type: CNAME
      TTL: "300"
      ResourceRecords:
        - !GetAtt EC2Instance.PublicDnsName
  ```

- **Ví dụ `Base64` cho UserData**:

  ```yaml
  UserData:
    Fn::Base64: |
      #!/bin/bash
      dnf update -y
      dnf install -y httpd
      systemctl enable --now httpd
  ```

### Kiến thức thực tế

#### Các hàm hay dùng khác

```yaml
# Fn::Sub với biến resource/attribute/pseudo parameter
BucketArnObjects: !Sub "${MyBucket.Arn}/*"
LogGroupName: !Sub "/app/${AWS::StackName}/${AWS::Region}"

# Fn::Sub dạng 2 tham số (đặt biến tạm)
Url: !Sub
  - "https://${Domain}/api"
  - Domain: !GetAtt MyALB.DNSName

# Fn::Join — ghép chuỗi
Fn::Join:
  - ''
  - ['IPAddress=', !Ref IPAddress]       # -> IPAddress=10.0.0.1

# Fn::GetAZs + Fn::Select — chọn AZ đầu tiên của region hiện tại
AvailabilityZone: !Select [0, !GetAZs ""]

# Fn::Split + Fn::Select
FirstSubnet: !Select [0, !Split [",", !Ref SubnetCsv]]

# Fn::Cidr — chia VPC 10.0.0.0/16 thành 6 subnet /24 (cidrBits = 8)
CidrBlock: !Select [0, !Cidr [!GetAtt MyVPC.CidrBlock, 6, 8]]
```

- **Lỗi hay gặp:** không lồng được 2 dạng rút gọn kiểu `!Base64 !Sub ...` trên cùng dòng — phải viết `Fn::Base64: !Sub |` như ví dụ dưới. Trong `!Sub`, muốn giữ nguyên `${VAR}` của bash thì viết `${!VAR}`.

#### Ví dụ template đầy đủ: Parameters, Mappings, Conditions, Outputs/Export, cfn-init, cfn-signal

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Web server demo (Parameters, Mappings, Conditions, Outputs, cfn-init, cfn-signal)

Parameters:
  EnvType:
    Type: String
    AllowedValues: [dev, prod]
    Default: dev
  LatestAmiId:
    Type: AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>
    Default: /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64
  VpcId:
    Type: AWS::EC2::VPC::Id
  PublicSubnetId:
    Type: AWS::EC2::Subnet::Id

Mappings:
  EnvConfig:
    dev:
      InstanceType: t3.micro
    prod:
      InstanceType: t3.small

Conditions:
  IsProd: !Equals [!Ref EnvType, prod]

Resources:
  WebSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: !Sub "Web SG for ${AWS::StackName}"
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

  WebServer:
    Type: AWS::EC2::Instance
    CreationPolicy:                 # chờ tín hiệu từ cfn-signal tối đa 10 phút
      ResourceSignal:
        Count: 1
        Timeout: PT10M
    Metadata:
      AWS::CloudFormation::Init:
        config:
          packages:
            yum:
              httpd: []
          files:
            /var/www/html/index.html:
              content: !Sub "<h1>Hello from ${AWS::StackName} (${EnvType})</h1>"
              mode: "000644"
              owner: root
              group: root
          commands:
            01_start_httpd:
              command: systemctl enable --now httpd
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: !FindInMap [EnvConfig, !Ref EnvType, InstanceType]
      SubnetId: !Ref PublicSubnetId
      SecurityGroupIds:
        - !GetAtt WebSG.GroupId
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}-web"
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          dnf install -y aws-cfn-bootstrap
          /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServer --region ${AWS::Region}
          /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServer --region ${AWS::Region}

  DataVolume:                       # chỉ tạo ở prod
    Type: AWS::EC2::Volume
    Condition: IsProd
    DeletionPolicy: Snapshot
    UpdateReplacePolicy: Snapshot
    Properties:
      AvailabilityZone: !GetAtt WebServer.AvailabilityZone
      Size: 20
      VolumeType: gp3

  DataVolumeAttachment:
    Type: AWS::EC2::VolumeAttachment
    Condition: IsProd
    Properties:
      InstanceId: !Ref WebServer
      VolumeId: !Ref DataVolume
      Device: /dev/sdf

Outputs:
  WebsiteURL:
    Description: URL của web server
    Value: !Sub "http://${WebServer.PublicDnsName}"
  WebSGId:
    Value: !GetAtt WebSG.GroupId
    Export:
      Name: !Sub "${AWS::StackName}-WebSGId"
  DataVolumeId:
    Condition: IsProd
    Value: !Ref DataVolume
```

Deploy:

```bash
aws cloudformation deploy --stack-name web-dev --template-file web.yaml \
  --parameter-overrides EnvType=dev VpcId=vpc-0abc123 PublicSubnetId=subnet-0def456
```

Giải thích bộ công cụ **cfn helper scripts** (gói `aws-cfn-bootstrap`):

| Script | Vai trò |
|---|---|
| `cfn-init` | Đọc `AWS::CloudFormation::Init` trong `Metadata` → cài package, tạo file, chạy command, khởi động service. Cấu hình **khai báo**, dễ đọc hơn UserData dài. |
| `cfn-signal` | Gửi tín hiệu thành công/thất bại (`-e $?`) về CloudFormation, kết hợp `CreationPolicy` (hoặc `WaitCondition`). Nếu hết `Timeout` mà không nhận tín hiệu → resource **fail** → stack rollback. |
| `cfn-hup` | Daemon theo dõi thay đổi metadata và chạy lại `cfn-init` khi update stack. |
| `cfn-get-metadata` | Đọc metadata của resource. |

- Không có `CreationPolicy`, stack báo `CREATE_COMPLETE` ngay khi EC2 chạy, **kể cả khi script cài đặt lỗi**. Có `cfn-signal` → stack chỉ thành công khi ứng dụng cài đặt xong.
- Lỗi hay gặp: instance **không ra được Internet** (subnet private không NAT) → `cfn-signal` không gửi được → timeout. Log để debug: `/var/log/cfn-init.log`, `/var/log/cloud-init-output.log` (cần tắt rollback để giữ instance lại mà xem, xem Bài 10).

### Ghi nhớ cho kỳ thi

- `Ref` → giá trị parameter / **ID** của resource. `GetAtt` → **thuộc tính** khác (DNS name của ALB/EC2, ARN…).
- Lấy DNS name của ALB → **`Fn::GetAtt`** (`!GetAtt MyALB.DNSName`).
- `Ref` dùng được cho **Parameters và Resources**, **không** dùng cho **Conditions** (condition được gắn bằng key `Condition:` hoặc `Fn::If`).
- UserData phải đi qua **`Fn::Base64`**.
- `Fn::Join` với dấu phân cách `''` → nối liền: `IPAddress=10.0.0.1`.

---

## Bài 10 – Rollbacks

### Lý thuyết

| Tình huống | Mặc định | Tuỳ chọn |
|---|---|---|
| **Tạo stack thất bại** | **Rollback toàn bộ** (mọi thứ bị xoá). Xem log (Events) để biết lý do, nhưng không còn tài nguyên để xem. | **Tắt rollback** (*Preserve successfully provisioned resources*) để giữ tài nguyên lại mà **troubleshoot** |
| **Cập nhật stack thất bại** | Tự rollback về **trạng thái ổn định gần nhất** (xoá những gì mới tạo). Xem log, thông báo lỗi. | Tương tự, có thể giữ tài nguyên đã tạo thành công |
| **Rollback cũng thất bại** (`UPDATE_ROLLBACK_FAILED`) | Thường do tài nguyên bị **sửa tay** | **Sửa tay** tài nguyên đó, rồi gọi **`ContinueUpdateRollback`** (console / API / CLI) |

- Trong console, mục **Stack failure options**:
  - **Roll back all stack resources** (mặc định): quay về trạng thái ổn định trước đó.
  - **Preserve successfully provisioned resources**: giữ tài nguyên tạo thành công, chỉ rollback tài nguyên lỗi.

### Kiến thức thực tế

- **Trạng thái `ROLLBACK_COMPLETE` sau lần tạo đầu tiên**: stack **không update được**, chỉ có thể **xoá rồi tạo lại** (Câu 1 của quiz).
- **Cập nhật so với video:** khi tạo/cập nhật với *Preserve successfully provisioned resources* (`--disable-rollback`), stack dừng ở `CREATE_FAILED`/`UPDATE_FAILED`. Từ trạng thái này bạn có thể **sửa template rồi update/retry tiếp từ điểm lỗi**, hoặc chủ động rollback bằng `aws cloudformation rollback-stack`. Video nói "không thể update để sửa" — chỉ đúng với stack đã ở `ROLLBACK_COMPLETE`.
- Xử lý `UPDATE_ROLLBACK_FAILED`:

  ```bash
  # Sau khi sửa tay tài nguyên gây lỗi
  aws cloudformation continue-update-rollback --stack-name my-stack
  # Hoặc bỏ qua tài nguyên không thể rollback (stack đánh dấu nó là đã rollback xong)
  aws cloudformation continue-update-rollback --stack-name my-stack --resources-to-skip MyInstance
  ```

- **Rollback triggers**: cấu hình CloudWatch alarm (`--rollback-configuration`) để CloudFormation tự rollback nếu alarm kích hoạt trong thời gian theo dõi sau update.
- Tạo mới với `--on-failure DELETE` (xoá stack khi lỗi, không để lại stack `ROLLBACK_COMPLETE`) hữu ích trong pipeline.
- Lỗi phổ biến gây fail: AMI/region không khớp, trùng tên tài nguyên (đặt tên cứng cho S3 bucket, IAM role…), thiếu quyền, vượt service quota, `cfn-signal` timeout.

### Ghi nhớ cho kỳ thi

- Tạo lỗi → mặc định **rollback hết**; có thể **tắt rollback** để troubleshoot.
- Update lỗi → rollback về **trạng thái tốt gần nhất**.
- `UPDATE_ROLLBACK_FAILED` → sửa tay rồi **`ContinueUpdateRollback`**.
- `ROLLBACK_COMPLETE` sau lần tạo đầu → **xoá stack, tạo stack mới**.

---

## Bài 11 – Service Role

### Lý thuyết

- **Service role** = IAM role **dành riêng cho CloudFormation**, cho phép CloudFormation **create/update/delete** tài nguyên của stack **thay mặt bạn**.
- Use case: cho người dùng quyền tạo/cập nhật/xoá stack **mà không cần** quyền trực tiếp trên tài nguyên → đạt **least privilege**.
- Ví dụ: user chỉ có quyền `cloudformation:*` + **`iam:PassRole`**; service role có quyền `s3:*Bucket` → CloudFormation tạo được S3 bucket nhờ service role.
- **Bắt buộc**: user phải có quyền **`iam:PassRole`** (quyền cần thiết để giao một role cho một dịch vụ AWS).

### Kiến thức thực tế

- Policy tối thiểu cho developer dùng service role:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      { "Effect": "Allow", "Action": ["cloudformation:*"], "Resource": "*" },
      {
        "Effect": "Allow",
        "Action": "iam:PassRole",
        "Resource": "arn:aws:iam::123456789012:role/DemoRoleForCFNWithS3Capabilities",
        "Condition": { "StringEquals": { "iam:PassedToService": "cloudformation.amazonaws.com" } }
      }
    ]
  }
  ```

  Có thể ép buộc dùng role bằng điều kiện `cloudformation:RoleArn` trong policy của user.
- Khi stack đã gắn service role, các lần update/delete sau **tiếp tục dùng role đó**. Nếu role bị xoá, stack không xoá được — phải tạo lại role (cùng tên) hoặc chỉ định role khác.
- CDK (`cdk bootstrap`) và SAM pipeline cũng dùng mô hình này: role `cfn-exec-role` thực hiện deploy.

### Ghi nhớ cho kỳ thi

- Cho dev tạo/cập nhật stack mà **không có quyền trực tiếp** trên tài nguyên → **Stack Service Role** + **`iam:PassRole`**.

---

## Bài 12 – Capabilities

### Lý thuyết

| Capability | Khi nào cần |
|---|---|
| **`CAPABILITY_IAM`** | Template tạo/cập nhật tài nguyên IAM (user, role, group, policy, access key, instance profile…) **không đặt tên tuỳ chỉnh** |
| **`CAPABILITY_NAMED_IAM`** | Tài nguyên IAM có **tên tuỳ chỉnh** (ví dụ `RoleName: MyCustomRoleName`) |
| **`CAPABILITY_AUTO_EXPAND`** | Template có **Macro** hoặc **nested stacks** (biến đổi động) — xác nhận template có thể thay đổi trước khi deploy |

- Mục đích: bạn phải **xác nhận rõ ràng** (acknowledge) rằng CloudFormation sẽ tạo tài nguyên IAM — một biện pháp bảo mật.
- Thiếu capability → lỗi **`InsufficientCapabilitiesException`** → chạy lại với capability (thêm 1 tham số API hoặc tick 1 ô trên console).

### Kiến thức thực tế

- SAM template (có `Transform: AWS::Serverless-2016-10-31`) thường cần `--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND`.
- Hạn chế đặt tên cứng cho IAM role: tên trùng giữa các stack/region sẽ gây lỗi, và đổi tên → **Replacement**. Để CloudFormation tự sinh tên thì chỉ cần `CAPABILITY_IAM`.
- Không dùng `AmazonEC2FullAccess`/`*FullAccess` trong thực tế; viết policy tối thiểu.

### Ghi nhớ cho kỳ thi

- Tạo IAM resource → `CAPABILITY_IAM` / `CAPABILITY_NAMED_IAM` (có tên). Macro/nested stack → `CAPABILITY_AUTO_EXPAND`.
- `InsufficientCapabilitiesException` → thêm `--capabilities`.

---

## Bài 13 – DeletionPolicy

### Lý thuyết

- **DeletionPolicy** kiểm soát điều gì xảy ra với resource khi nó **bị xoá khỏi template** hoặc khi **stack bị xoá** → cách để **giữ lại / sao lưu** tài nguyên.

| Giá trị | Hành vi |
|---|---|
| **`Delete`** (mặc định) | Xoá resource cùng stack. **Ngoại lệ S3 bucket:** chỉ xoá được nếu bucket **rỗng**, nếu không thì xoá **thất bại** |
| **`Retain`** | **Giữ lại** resource khi xoá stack (ví dụ bảng DynamoDB chứa dữ liệu quan trọng). Dùng được cho **mọi resource** |
| **`Snapshot`** | Tạo **snapshot cuối** rồi mới xoá. Hỗ trợ: EBS Volume, ElastiCache Cluster, ElastiCache ReplicationGroup, RDS DBInstance, RDS DBCluster, Redshift, Neptune, DocumentDB… |

```yaml
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    DeletionPolicy: Delete
    Properties: { ImageId: ami-0123456789abcdef0 }

  MyTable:
    Type: AWS::DynamoDB::Table
    DeletionPolicy: Retain
    Properties: { ... }

  MyDBInstance:
    Type: AWS::RDS::DBInstance
    DeletionPolicy: Snapshot
    Properties: { ... }
```

- S3 bucket không rỗng: xoá tay hết object rồi tiếp tục xoá stack, hoặc dùng **Custom Resource** để tự động làm rỗng bucket (Bài 16).

### Kiến thức thực tế

- **Mặc định không phải lúc nào cũng là `Delete`:** với `AWS::RDS::DBCluster` và `AWS::RDS::DBInstance` không thuộc cluster, mặc định là **`Snapshot`**.
- **`UpdateReplacePolicy`**: tương tự DeletionPolicy nhưng áp dụng khi resource bị **thay thế** trong lúc update (Replacement). Nên đặt cả hai cho database: `DeletionPolicy: Snapshot` + `UpdateReplacePolicy: Snapshot`.
- **`RetainExceptOnCreate`** (thêm năm 2023): giữ resource khi xoá stack, nhưng **xoá** nếu resource vừa được tạo trong lần **tạo stack bị rollback** → tránh rác tài nguyên khi tạo lỗi.
- Resource `Retain` sau khi xoá stack là "mồ côi", vẫn **tính tiền**. Có thể đưa trở lại quản lý bằng **resource import** (change set type `IMPORT`).
- Snapshot do DeletionPolicy tạo **không tự xoá** → nhớ dọn để tránh phí lưu trữ.

### Ghi nhớ cho kỳ thi

- Mặc định `Delete`; giữ lại → `Retain`; sao lưu trước khi xoá → `Snapshot` (EBS, RDS, ElastiCache, Redshift…).
- **S3 bucket không rỗng không xoá được** → làm rỗng thủ công hoặc **Custom Resource**.

---

## Bài 14 – Stack Policy

### Lý thuyết

- Mặc định khi update stack, **mọi hành động update được phép trên mọi resource**. Muốn **bảo vệ** cả stack hoặc một phần stack khỏi update → **Stack Policy**.
- Stack policy là **tài liệu JSON** định nghĩa hành động update nào được phép trên resource nào **trong lúc update stack**.

  ```json
  {
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      },
      {
        "Effect": "Deny",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "LogicalResourceId/ProductionDatabase"
      }
    ]
  }
  ```

  Statement 1: cho phép update mọi thứ. Statement 2: **chặn mọi update** lên resource có logical ID `ProductionDatabase`.
- Mục tiêu: bảo vệ resource khỏi **update vô tình**.
- Khi đã đặt stack policy, **mặc định mọi resource đều được bảo vệ** → cần **`Allow` tường minh** cho resource muốn cho phép update.

### Kiến thức thực tế

- Các action: `Update:Modify`, `Update:Replace`, `Update:Delete`, `Update:*`. Có thể dùng `Condition` với `ResourceType` (ví dụ chặn replace mọi `AWS::RDS::DBInstance`).
- CLI:

  ```bash
  aws cloudformation set-stack-policy --stack-name prod-app --stack-policy-body file://stack-policy.json
  # Ghi đè tạm thời cho 1 lần update (policy gốc vẫn giữ nguyên sau đó)
  aws cloudformation update-stack --stack-name prod-app --template-body file://app.yaml \
    --stack-policy-during-update-body file://allow-all.json
  ```

- Stack policy **không xoá được**, chỉ **sửa** (muốn bỏ thì sửa thành allow all).
- Stack policy chỉ bảo vệ khỏi update **qua CloudFormation**; không ngăn người có quyền IAM sửa tay tài nguyên — kết hợp IAM policy, và DeletionPolicy cho trường hợp xoá.

### Ghi nhớ cho kỳ thi

- Bảo vệ resource khỏi **update** → **Stack Policy** (JSON). Có policy → mặc định **mọi thứ bị chặn**, phải **Allow** tường minh.
- Phân biệt: Stack Policy (chặn **update**), DeletionPolicy (hành vi khi **xoá resource**), Termination Protection (chặn **xoá stack**).

---

## Bài 15 – Termination Protection

### Lý thuyết

- Để tránh **xoá nhầm stack** → bật **Termination Protection**.
- Khi bật, thao tác xoá stack bị từ chối: *"Termination protection is enabled on the stack..."* → phải **tắt** termination protection trước (cần quyền tương ứng) rồi mới xoá.

### Kiến thức thực tế

- Có thể bật ngay khi tạo: `aws cloudformation create-stack ... --enable-termination-protection`.
- Với **nested stack**, termination protection lấy theo **root stack** (bật/tắt ở root).
- Quyền cần có: `cloudformation:UpdateTerminationProtection` — chỉ cấp cho admin để tránh dev tự tắt rồi xoá stack prod.
- Termination protection **không** bảo vệ tài nguyên khỏi bị xoá trong lúc **update** (ví dụ xoá resource khỏi template) → dùng thêm Stack Policy / DeletionPolicy.

### Ghi nhớ cho kỳ thi

- Ngăn **xoá stack** vô tình → **Termination Protection**.

---

## Bài 16 – Custom Resources

### Lý thuyết

- **Custom Resources** dùng để:
  - Định nghĩa resource **chưa được CloudFormation hỗ trợ**.
  - Định nghĩa **logic provisioning tuỳ biến** cho tài nguyên **ngoài CloudFormation**: tài nguyên **on-premises**, **bên thứ ba**.
  - Chạy **script tuỳ biến** trong các giai đoạn **create / update / delete** của stack thông qua **Lambda**.
- Ví dụ kinh điển (đề thi hay hỏi): chạy Lambda để **làm rỗng S3 bucket trước khi xoá bucket**.
- Khai báo: type **`Custom::MyCustomResourceTypeName`** (hoặc `AWS::CloudFormation::CustomResource`), được **backed by** **Lambda function** (phổ biến nhất) hoặc **SNS topic**.
- Thuộc tính bắt buộc **`ServiceToken`**: ARN của Lambda hoặc SNS topic, **phải cùng region** với stack.
- Các property khác = **input data parameters** truyền vào Lambda (trong `event["ResourceProperties"]`).

  ```yaml
  Resources:
    MyCustomResourceUsingLambda:
      Type: Custom::MyLambdaResource
      Properties:
        ServiceToken: arn:aws:lambda:REGION:ACCOUNT_ID:function:FUNCTION_NAME
        # input values (optional)
        ExampleProperty: "ExampleValue"
  ```

- Luồng xoá S3 bucket: chạy **Delete stack** → custom resource (Lambda) được gọi với `RequestType = Delete` → gọi API **xoá hết object** → khi bucket đã rỗng, CloudFormation mới **xoá bucket** → thành công.

### Kiến thức thực tế

#### Template đầy đủ: tự làm rỗng S3 bucket khi xoá stack

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: S3 bucket tự làm rỗng khi xoá stack (Lambda-backed custom resource)

Resources:
  MyBucket:
    Type: AWS::S3::Bucket

  EmptyBucketFunctionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal: { Service: lambda.amazonaws.com }
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: EmptyBucket
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action: [s3:ListBucket, s3:ListBucketVersions]
                Resource: !GetAtt MyBucket.Arn
              - Effect: Allow
                Action: [s3:DeleteObject, s3:DeleteObjectVersion]
                Resource: !Sub "${MyBucket.Arn}/*"

  EmptyBucketFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.12
      Handler: index.handler
      Timeout: 300
      Role: !GetAtt EmptyBucketFunctionRole.Arn
      Code:
        ZipFile: |
          import boto3
          import cfnresponse

          def handler(event, context):
              try:
                  if event["RequestType"] == "Delete":
                      bucket = boto3.resource("s3").Bucket(event["ResourceProperties"]["BucketName"])
                      bucket.object_versions.delete()   # xoá cả object và mọi version
                  cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
              except Exception as e:
                  print(e)
                  cfnresponse.send(event, context, cfnresponse.FAILED, {"Error": str(e)})

  EmptyBucketOnDelete:
    Type: Custom::EmptyBucket
    Properties:
      ServiceToken: !GetAtt EmptyBucketFunction.Arn
      BucketName: !Ref MyBucket
```

- Vì `EmptyBucketOnDelete` tham chiếu `MyBucket` và `EmptyBucketFunction`, khi xoá stack CloudFormation xoá **custom resource trước** (Lambda làm rỗng bucket) rồi mới xoá bucket, function, role.
- Template tạo IAM role → deploy cần `--capabilities CAPABILITY_IAM`.
- **Cơ chế phản hồi:** CloudFormation gửi event có `RequestType` (`Create`/`Update`/`Delete`), `ResponseURL` (**pre-signed S3 URL**), `ResourceProperties`… Lambda **bắt buộc** gửi kết quả `SUCCESS`/`FAILED` về `ResponseURL`. Module `cfnresponse` chỉ có sẵn khi code viết inline bằng `ZipFile`.
- **Lỗi hay gặp:** Lambda exception mà không gửi response → stack **treo** ở `*_IN_PROGRESS` cho tới timeout (mặc định **1 giờ**). Từ 2024 có thể đặt thuộc tính **`ServiceTimeout`** cho custom resource để rút ngắn thời gian chờ. Luôn bọc `try/except` và luôn gửi response, kể cả với `Delete`.
- Lựa chọn thay thế: CDK có `autoDeleteObjects: true` (bản chất cũng là custom resource); hoặc dùng **S3 Lifecycle rule** để dọn dần. Ngoài ra, nhiều dịch vụ mới nay đã có resource type gốc (hoặc resource type trong **CloudFormation Registry**), nên kiểm tra trước khi tự viết custom resource.

### Ghi nhớ cho kỳ thi

- Làm rỗng S3 bucket trước khi xoá stack / dịch vụ chưa hỗ trợ / tài nguyên on-prem, bên thứ ba → **Custom Resource** (Lambda hoặc SNS), khai báo `ServiceToken`.
- Type `Custom::<Tên>`.

---

## Bài 17 – StackSets

### Lý thuyết

- **StackSets**: **tạo / cập nhật / xoá stack trên nhiều tài khoản và nhiều region** chỉ bằng **một thao tác/template**.
- Từ **tài khoản administrator**, tạo một StackSet từ template → triển khai thành các **stack instance** ở các tài khoản/region đích.
- **Update StackSet** → **mọi stack instance** ở mọi tài khoản, mọi region đều được cập nhật.
- Use case phổ biến: áp dụng cho **mọi tài khoản trong AWS Organization**.
- Chỉ **tài khoản quản trị** (hoặc tài khoản được chỉ định làm **delegated administrator**) mới tạo được StackSet.

### Kiến thức thực tế

| Mô hình quyền | Mô tả |
|---|---|
| **Self-managed permissions** | Tự tạo role `AWSCloudFormationStackSetAdministrationRole` (tài khoản admin) và `AWSCloudFormationStackSetExecutionRole` (mỗi tài khoản đích) |
| **Service-managed permissions** | Dùng **AWS Organizations**, StackSets tự tạo role cần thiết; hỗ trợ **automatic deployment**: tài khoản mới thêm vào OU sẽ **tự động** nhận stack (và có thể tự xoá stack khi tài khoản rời OU) |

```bash
aws cloudformation create-stack-set --stack-set-name baseline-config \
  --template-body file://baseline.yaml \
  --permission-model SERVICE_MANAGED \
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation create-stack-instances --stack-set-name baseline-config \
  --deployment-targets OrganizationalUnitIds=ou-abcd-11111111 \
  --regions us-east-1 ap-southeast-1 \
  --operation-preferences MaxConcurrentPercentage=25,FailureTolerancePercentage=10
```

- Use case thực tế: bật AWS Config/CloudTrail/GuardDuty, IAM role audit, SNS topic cảnh báo… đồng loạt cho mọi tài khoản.
- `operation-preferences` điều khiển tốc độ triển khai (song song bao nhiêu tài khoản, dung sai lỗi) và thứ tự region.

### Ghi nhớ cho kỳ thi

- Triển khai stack **nhiều tài khoản + nhiều region** trong một thao tác → **StackSets**.
- Không nhầm với Change Sets (xem trước thay đổi) hay Organizations (chỉ quản lý tài khoản).

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| CloudFormation | IaC declarative; template tham chiếu **từ S3**; stack theo region; xoá stack = xoá hết tài nguyên |
| Sections | **`Resources` bắt buộc**; Parameters, Mappings, Outputs, Conditions, Description, AWSTemplateFormatVersion tuỳ chọn |
| Update | Upload template mới; **Change Set** để xem trước; Replacement True/False |
| Parameters | `!Ref`; `AllowedValues`, `NoEcho`; pseudo parameter `AWS::Region`, `AWS::AccountId`, `AWS::StackName`, `AWS::StackId`, `AWS::NotificationARNs`, `AWS::NoValue` |
| Mappings | Giá trị tĩnh biết trước; `!FindInMap [Map, Key1, Key2]` |
| Outputs/Export | Export tên **duy nhất trong region**; `!ImportValue`; không xoá được stack đang bị import |
| Conditions | `And/Equals/If/Not/Or`; tạo resource có điều kiện |
| Intrinsic | `Ref` (ID), `GetAtt` (thuộc tính, ví dụ DNSName), `Base64` (UserData), `Join`, `Sub` |
| Rollback | Tạo lỗi → xoá hết (hoặc preserve); update lỗi → về trạng thái tốt; `UPDATE_ROLLBACK_FAILED` → `ContinueUpdateRollback`; `ROLLBACK_COMPLETE` → xoá và tạo lại |
| Service Role | Least privilege; user cần **`iam:PassRole`** |
| Capabilities | `CAPABILITY_IAM`, `CAPABILITY_NAMED_IAM`, `CAPABILITY_AUTO_EXPAND`; lỗi `InsufficientCapabilitiesException` |
| DeletionPolicy | `Delete` (mặc định), `Retain`, `Snapshot`; S3 bucket phải rỗng |
| Stack Policy | JSON chặn **update** resource; có policy → mặc định deny tất cả |
| Termination Protection | Chặn **xoá stack** |
| Custom Resources | `Custom::X` + `ServiceToken` (Lambda/SNS); làm rỗng S3 bucket |
| StackSets | Nhiều tài khoản + nhiều region trong một thao tác; tích hợp Organizations |
| Thực tế 2026 | Infrastructure Composer (tên mới), dynamic references, SSM AMI parameter, cfn-init/cfn-signal, drift detection, IaC generator |

---

## Câu hỏi ôn tập

*Nguồn: CloudFormation Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Một Administrator lần đầu tạo stack từ template CloudFormation. Stack thất bại với trạng thái `ROLLBACK_COMPLETE`. Administrator đã tìm và sửa lỗi trong template. Để tiếp tục triển khai, Administrator nên làm gì?

- A. Xoá stack bị lỗi và tạo stack mới
- B. Thực thi một ChangeSet trên stack bị lỗi
- C. Thực hiện `update-stack` trên stack bị lỗi
- D. Chạy lệnh `validate-template`

<details><summary>Đáp án</summary>

**A.** Stack ở trạng thái `ROLLBACK_COMPLETE` sau lần tạo đầu tiên không thể update hay thực thi change set; cách duy nhất là xoá rồi tạo lại. `validate-template` (D) chỉ kiểm tra cú pháp, không triển khai gì.
</details>

**Câu 2.** Công ty bạn dùng AWS Organizations để quản lý nhiều tài khoản. Bạn muốn tạo một stack CloudFormation ở nhiều tài khoản và nhiều region. Cách dễ nhất là gì?

- A. CloudFormation ChangeSets
- B. AWS Organizations
- C. AWS CLI
- D. CloudFormation StackSets

<details><summary>Đáp án</summary>

**D.** StackSets triển khai stack lên nhiều tài khoản và region trong một thao tác, tích hợp với Organizations (có thể tự động triển khai cho tài khoản mới). ChangeSets chỉ để xem trước thay đổi; Organizations tự nó không triển khai stack; dùng CLI lặp từng tài khoản thì không phải cách dễ nhất.
</details>

**Câu 3.** Bạn có 2 template. Template A chứa thành phần mạng (VPC, Subnet, SG…), template B chứa hạ tầng ứng dụng (EC2, ALB, EBS…). Bạn muốn gắn các SG ở template A vào EC2 ở template B. Làm thế nào?

- A. Export ID của các SG trong section `Outputs` của template A, rồi import trong template B bằng `Fn::ImportValue`
- B. Không làm được, phải gộp A và B thành một template
- C. Viết Lambda lấy ID SG từ template A và chèn vào template B

<details><summary>Đáp án</summary>

**A.** Đây chính là cơ chế cross-stack reference: `Outputs` + `Export` ở stack A, `!ImportValue` ở stack B.
</details>

**Câu 4.** Đâu **KHÔNG** phải là Pseudo Parameter hợp lệ của CloudFormation?

- A. `AWS::AccountId`
- B. `AWS::Region`
- C. `AWS::AccountName`
- D. `AWS::StackId`

<details><summary>Đáp án</summary>

**C.** Không tồn tại `AWS::AccountName`. Các pseudo parameter hợp lệ: `AWS::AccountId`, `AWS::Region`, `AWS::StackId`, `AWS::StackName`, `AWS::NotificationARNs`, `AWS::NoValue`, `AWS::Partition`, `AWS::URLSuffix`.
</details>

**Câu 5.** Hạ tầng AWS tạo bằng CloudFormation thay đổi theo thời gian. Bạn nên làm gì để cập nhật stack?

- A. Sửa tài nguyên bằng tay trên AWS Console, stack/template sẽ tự động cập nhật theo
- B. Sửa template ở máy local, rồi upload và áp dụng trong console CloudFormation
- C. Tạo một stack CloudFormation mới với template đã cập nhật

<details><summary>Đáp án</summary>

**B.** Cập nhật template rồi update stack (lý tưởng là qua change set). A tuyệt đối không nên: sửa tay gây **drift** và có thể làm update/rollback sau này thất bại; template không tự cập nhật. C tạo ra bộ tài nguyên thứ hai chứ không cập nhật stack hiện có.
</details>

**Câu 6.** Trước khi CloudFormation dùng được một template, template phải được upload ______.

- A. trực tiếp vào CloudFormation
- B. lên Amazon S3
- C. lên AWS CodeCommit

<details><summary>Đáp án</summary>

**B.** CloudFormation luôn tham chiếu template từ Amazon S3. Khi bạn "upload trực tiếp" trên console (A), thực chất AWS tự đẩy file lên S3 phía sau rồi CloudFormation tham chiếu từ đó.
</details>

**Câu 7.** Khi viết template CloudFormation, bạn phải chỉ định thứ tự CloudFormation tạo các resource. (Đúng/Sai)

<details><summary>Đáp án</summary>

**Sai.** CloudFormation là declarative, tự suy ra thứ tự từ các tham chiếu (`Ref`, `GetAtt`…). Chỉ khi có phụ thuộc ngầm mới cần `DependsOn`.
</details>

**Câu 8.** Các section sau đều tuỳ chọn, NGOẠI TRỪ ______ là bắt buộc.

- A. Parameters
- B. Mappings
- C. Resources
- D. Outputs

<details><summary>Đáp án</summary>

**C. Resources** là section bắt buộc duy nhất.
</details>

**Câu 9.** Intrinsic function nào cho phép lấy **DNS name** của một Application Load Balancer được tạo bằng CloudFormation?

- A. `Fn::Ref`
- B. `Fn::Sub`
- C. `Fn::Join`
- D. `Fn::GetAtt`

<details><summary>Đáp án</summary>

**D.** `!GetAtt MyALB.DNSName`. Với `AWS::ElasticLoadBalancingV2::LoadBalancer`, `Ref` trả về **ARN** của load balancer chứ không phải DNS name.
</details>

**Câu 10.** Template sau có lỗi gì?

```yaml
Mappings:
  AWSRegionArch2AMI:
    us-east-1:
      HVM64: ami-6869aa05
    us-west-2:
      HVM64: ami-7172b611
    us-west-1:
      HVM64: ami-31490d51
    eu-west-1:
      HVM64: ami-f9dd458a
  EnvironmentToInstanceType:
    development:
      instanceType: t2.micro
    production:
      instanceType: m4.large
Resources:
  EC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !FindInMap [EnvironmentToInstanceType, !Ref 'EnvironmentName', instanceType]
      ImageId: !FindInMap [AWSRegionArch2AMI, !Ref 'AWS::Region', HVM64]
```

- A. Thiếu parameter `AWS::Region` nên `!Ref 'AWS::Region'` không chạy
- B. Hàm `!FindInMap` sai cú pháp, chỉ được có 2 tham số
- C. Thiếu parameter `EnvironmentName`
- D. Không được khai báo 2 mapping trong một template

<details><summary>Đáp án</summary>

**C.** Template `!Ref 'EnvironmentName'` nhưng không có section `Parameters` khai báo `EnvironmentName`. A sai vì `AWS::Region` là pseudo parameter có sẵn; B sai vì `FindInMap` cần đúng 3 tham số; D sai vì được khai báo nhiều mapping.
</details>

**Câu 11.** Hàm `!Ref` có thể tham chiếu tới những thứ sau, NGOẠI TRỪ ______.

- A. Parameters
- B. Resources
- C. Conditions

<details><summary>Đáp án</summary>

**C.** `Ref` dùng cho Parameters (trả giá trị) và Resources (trả physical ID). Condition được dùng qua key `Condition:` hoặc `Fn::If`, không qua `Ref`.
</details>

**Câu 12.** Với parameter `IPAddress` có giá trị `10.0.0.1`, kết quả của hàm sau là gì?

```yaml
Fn::Join:
  - ''
  - [IPAddress=, !Ref 'IPAddress']
```

- A. `IPAddress,10.0.0.1`
- B. `IPAddress=10.0.0.1`
- C. `IPAddress10.0.0.1`
- D. `10.0.0.1`

<details><summary>Đáp án</summary>

**B.** `Fn::Join` nối các phần tử bằng dấu phân cách là chuỗi rỗng `''`: `"IPAddress="` + `"10.0.0.1"` = `IPAddress=10.0.0.1`.
</details>

**Câu 13.** Bạn không xoá được một stack vì các stack khác đang tham chiếu output đã export của nó. Bạn nên làm gì?

- A. Liên hệ AWS Support
- B. Hết cách!
- C. Xoá (hoặc gỡ tham chiếu ở) các stack đang tham chiếu output đã export trước, rồi mới xoá stack này

<details><summary>Đáp án</summary>

**C.** Export đang được import thì stack nguồn không xoá được. Dùng `aws cloudformation list-imports --export-name <tên>` để biết stack nào đang import.
</details>

**Câu 14.** Bạn tạo exported output nhưng nhận lỗi *"SSHSecurityGroup output already exist"*. Nguyên nhân có thể là gì?

```yaml
Outputs:
  StackSSHSecurityGroup:
    Description: The SSH Security Group for our Company
    Value: !Ref MyCompanyWideSSHSecurityGroup
    Export:
      Name: SSHSecurityGroup
```

- A. Tên exported output phải duy nhất trong region
- B. Sai cú pháp

<details><summary>Đáp án</summary>

**A.** Đã có stack khác trong cùng region export tên `SSHSecurityGroup`. Cú pháp hoàn toàn đúng. Mẹo: đặt tên export kèm tên stack, ví dụ `!Sub "${AWS::StackName}-SSHSecurityGroup"`.
</details>

**Câu 15.** Bạn quản lý hạ tầng bằng CloudFormation và muốn cho developer khả năng tạo và cập nhật tài nguyên của stack **mà không cấp cho họ quyền quản lý** các tài nguyên đó. Dùng gì?

- A. Stack Policy
- B. Stack Service Role
- C. Deletion Policy
- D. StackSets

<details><summary>Đáp án</summary>

**B.** Service role cấp quyền cho CloudFormation thao tác tài nguyên thay mặt developer; developer chỉ cần quyền CloudFormation + `iam:PassRole`. Stack Policy chỉ bảo vệ resource khỏi update; Deletion Policy quy định hành vi khi xoá; StackSets để triển khai đa tài khoản/region.
</details>

**Câu 16.** Bạn deploy một stack có S3 bucket. Trong quá trình làm việc, bạn đã upload file vào bucket. Khi xoá stack, bạn gặp lỗi vì bucket không rỗng. Bạn đã xoá tay các file rồi xoá stack thành công. Tính năng nào giúp **tự động hoá** quy trình này?

- A. CloudFormation Custom Resources
- B. StackSets
- C. Termination Protection
- D. Deletion Policy

<details><summary>Đáp án</summary>

**A.** Custom resource backed by Lambda được gọi khi xoá stack (`RequestType = Delete`) để xoá hết object trước, sau đó CloudFormation mới xoá bucket. Deletion Policy (D) chỉ chọn Delete/Retain/Snapshot, không làm rỗng được bucket.
</details>

---

[← Chương 17](ch17-aws-elastic-beanstalk.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 19 →](ch19-aws-integration-messaging-sqs-sns-kine.md)
