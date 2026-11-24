# Chương 25 – AWS Serverless SAM - Serverless Application Model

> **Nguồn:** 8 video của chương + *SAM Quiz* (4 câu, bổ sung thêm câu hỏi tự soạn).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**. Một số runtime dùng trong video (Python 2.7, 3.7, 3.9) **đã bị Lambda deprecate**; ví dụ trong tài liệu dùng runtime còn hỗ trợ.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **AWS SAM** là gì và quan hệ của nó với **CloudFormation** (Transform `AWS::Serverless-2016-10-31`).
- Viết SAM template với các resource `AWS::Serverless::Function`, `Api`, `SimpleTable`.
- Dùng SAM CLI: `sam init`, `sam build`, `sam deploy --guided`, `sam delete`, `sam sync` (**SAM Accelerate**).
- Cấp quyền cho Lambda bằng **SAM Policy Templates** (`S3ReadPolicy`, `SQSPollerPolicy`, `DynamoDBCrudPolicy`…).
- Triển khai Lambda an toàn với **CodeDeploy** qua `AutoPublishAlias` + `DeploymentPreference` (canary/linear, alarms, hooks).
- Chạy và test **local**: `sam local invoke`, `start-api`, `start-lambda`, `generate-event`.
- Quản lý **nhiều môi trường** bằng `samconfig.toml` và `--config-env`.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, SAM Overview | Bài 1 – Tổng quan AWS SAM và SAM Accelerate |
| 003 | SAM - Hands On | Bài 2 – Ứng dụng SAM đầu tiên: init, build, deploy |
| 004 | SAM with DynamoDB - Hands On | Bài 3 – SAM với API Gateway và DynamoDB |
| 005 | SAM Policy Templates | Bài 4 – SAM Policy Templates |
| 006 | SAM with CodeDeploy | Bài 5 – SAM và CodeDeploy (traffic shifting) |
| 007 | SAM - Local Capabilities | Bài 6 – Chạy và test SAM ở local |
| 008 | SAM - Multiple Environments | Bài 7 – Nhiều môi trường với `samconfig.toml` |
| Quiz | SAM Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan AWS SAM và SAM Accelerate

### Lý thuyết

- Đã biết cách triển khai API serverless (API Gateway + Lambda + DynamoDB), nhưng **quản lý tất cả** bằng CloudFormation thuần thì khá phức tạp.
- **SAM = Serverless Application Model**: **framework** để **phát triển và triển khai** ứng dụng serverless.
  - Cấu hình bằng file **YAML** theo cú pháp SAM.
  - SAM **sinh ra CloudFormation phức tạp** từ file SAM YAML đơn giản → SAM là "đường tắt" của CloudFormation, thân thiện với developer.
  - **Hỗ trợ mọi thứ của CloudFormation**: `Outputs`, `Mappings`, `Parameters`, `Resources`…
  - Có thể dùng **CodeDeploy** để triển khai Lambda.
  - Chạy **Lambda, API Gateway, DynamoDB ở local** để debug.
- Đề thi chỉ hỏi SAM ở **mức cơ bản**.

#### Công thức (recipe) của SAM

1. **Transform header** ở đầu template, báo cho CloudFormation biết đây là SAM template cần chuyển đổi:

   ```yaml
   Transform: 'AWS::Serverless-2016-10-31'
   ```

2. Viết code, dùng các **SAM construct** thay cho resource CloudFormation:

   | SAM resource | Tương ứng |
   |---|---|
   | `AWS::Serverless::Function` | Lambda function (+ IAM role, event sources, permission…) |
   | `AWS::Serverless::Api` | API Gateway (REST API) |
   | `AWS::Serverless::SimpleTable` | DynamoDB table (khoá chính đơn giản) |

3. **Package & deploy**: `sam deploy`. Trước đây phải chạy 2 lệnh `sam package` rồi `sam deploy`; nay **`sam deploy` tự package**.
4. Đồng bộ nhanh thay đổi lên Lambda bằng **SAM Accelerate**: `sam sync --watch`.

#### Quy trình deploy

```
template.yaml (SAM) + code
        | sam build      -> .aws-sam/build: CloudFormation template + code đã build (kèm dependencies)
        v
        | sam deploy     -> zip & upload lên S3, tạo + execute ChangeSet CloudFormation
        v
CloudFormation stack: Lambda, API Gateway, DynamoDB...
```

#### SAM Accelerate (`sam sync`)

- Tập tính năng giúp **giảm độ trễ khi deploy** lên AWS để test trên cloud nhanh hơn.
- `sam sync` đồng bộ project khai báo trong SAM template lên AWS.
- Nếu chỉ đổi **code** (không đổi hạ tầng), nó **bỏ qua CloudFormation** và dùng **service API** (ví dụ Lambda `UpdateFunctionCode`) → cập nhật trong **vài giây**.

| Lệnh | Tác dụng |
|---|---|
| `sam sync` | Đồng bộ **code + hạ tầng** (thay đổi hạ tầng vẫn đi qua CloudFormation) |
| `sam sync --code` | Chỉ đồng bộ **code**, không cập nhật hạ tầng, không qua CloudFormation |
| `sam sync --code --resource AWS::Serverless::Function` | Chỉ đồng bộ code của **tất cả Lambda function** (và dependencies) |
| `sam sync --code --resource-id HelloWorldLambdaFunction` | Chỉ đồng bộ **một resource** cụ thể theo ID |
| `sam sync --watch` | Chạy nền, **theo dõi thay đổi file** và tự đồng bộ: đổi config → `sam sync`, chỉ đổi code → kiểu `sam sync --code` |

### Kiến thức thực tế

- `sam sync` dành cho **môi trường dev**, **không dùng cho production** (nó cố ý tạo drift giữa stack và resource thật để đổi lấy tốc độ). Production nên dùng `sam deploy` qua pipeline CI/CD (`sam pipeline init` có sẵn template cho CodePipeline, GitHub Actions, GitLab…).
- Resource SAM hiện có thêm: `AWS::Serverless::HttpApi` (HTTP API), `AWS::Serverless::LayerVersion`, `AWS::Serverless::Application` (nested app từ Serverless Application Repository), `AWS::Serverless::StateMachine` (Step Functions), `AWS::Serverless::Connector`, `AWS::Serverless::GraphQLApi` (AppSync). **Không có** `AWS::Serverless::UserPool` — Cognito vẫn khai báo bằng `AWS::Cognito::UserPool` của CloudFormation.
- Section **`Globals`** giúp khai báo thuộc tính chung (Runtime, Timeout, MemorySize, Environment, Tracing…) cho mọi function, tránh lặp.
- SAM CLI **cài sẵn trong CloudShell**; trên máy cá nhân cài theo hướng dẫn AWS (installer cho Windows/macOS/Linux) và cần **Docker** (hoặc Finch) cho các lệnh `sam local` và `sam build --use-container`.
- Lựa chọn khác cho IaC serverless: **AWS CDK** (Chương 26), Serverless Framework, Terraform. Đề DVA-C02 hỏi cả SAM lẫn CDK.

### Ghi nhớ cho kỳ thi

- Thấy `Transform: 'AWS::Serverless-2016-10-31'` → **SAM template**.
- `AWS::Serverless::Function / Api / SimpleTable` (không có `UserPool`).
- `sam build` → `sam deploy` (tự package + upload S3 + ChangeSet CloudFormation). Lệnh cũ: `sam package` + `sam deploy`.
- Đồng bộ code nhanh, bỏ qua CloudFormation → **`sam sync --code`** / **`sam sync --watch`** (SAM Accelerate).

---

## Bài 2 – Ứng dụng SAM đầu tiên: init, build, deploy

### Lý thuyết

Cấu trúc project do `sam init` (Hello World Example, Python) sinh ra:

```
sam-app/
├── hello_world/
│   ├── app.py              # code Lambda
│   └── requirements.txt    # thư viện Python (ví dụ requests)
├── events/
│   └── event.json          # event mẫu để test local
├── tests/                  # unit/integration test
├── samconfig.toml          # cấu hình SAM CLI (stack name, region, tham số build/deploy...)
└── template.yaml           # SAM template
```

`template.yaml` tiêu biểu:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: sam-app

Globals:
  Function:
    Timeout: 3

Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: hello_world/
      Handler: app.lambda_handler
      Runtime: python3.13
      Architectures:
        - x86_64
      Events:
        HelloWorld:
          Type: Api            # SAM tự tạo API Gateway REST API (ServerlessRestApi), stage "Prod"
          Properties:
            Path: /hello
            Method: get

Outputs:
  HelloWorldApi:
    Description: API Gateway endpoint URL for Prod stage
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/"
  HelloWorldFunction:
    Value: !GetAtt HelloWorldFunction.Arn
```

`hello_world/app.py`:

```python
import json

def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "hello world"}),
    }
```

### Kiến thức thực tế

- Các lần deploy sau chỉ cần `sam build && sam deploy` (đọc tham số từ `samconfig.toml`).
- `sam validate --lint` kiểm tra template (dùng cfn-lint) trước khi deploy.
- `sam logs -n HelloWorldFunction --stack-name sam-app --tail` để xem log CloudWatch ngay trên terminal.
- Lỗi hay gặp: `Requires capabilities : [CAPABILITY_IAM]` khi deploy không qua `--guided` → thêm `--capabilities CAPABILITY_IAM`. Bucket artifact: dùng `--resolve-s3` để SAM tự tạo/quản lý bucket.
- Dùng **`Architectures: [arm64]`** (Graviton) thường rẻ hơn khoảng 20% cho cùng thời lượng chạy, nếu thư viện tương thích.

### Ghi nhớ cho kỳ thi

- `sam init` → `sam build` → `sam deploy --guided` → `sam delete`.
- `sam deploy` upload artifact lên **S3** và triển khai qua **CloudFormation ChangeSet**.

---

## Bài 3 – SAM với API Gateway và DynamoDB

### Lý thuyết

Quick Start template **"Serverless API"** (Node.js) tạo 3 function CRUD + 1 bảng DynamoDB. Điểm đáng chú ý trong `template.yaml`:

```yaml
Transform: AWS::Serverless-2016-10-31

Resources:
  getAllItemsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/get-all-items.getAllItemsHandler
      Runtime: nodejs22.x
      MemorySize: 128
      Timeout: 100
      Policies:
        - DynamoDBCrudPolicy:            # SAM policy template - 2 dòng thay cho cả IAM policy
            TableName: !Ref SampleTable
      Environment:
        Variables:
          SAMPLE_TABLE: !Ref SampleTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /
            Method: GET

  getByIdFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/get-by-id.getByIdHandler
      Runtime: nodejs22.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref SampleTable
      Environment:
        Variables:
          SAMPLE_TABLE: !Ref SampleTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /{id}
            Method: GET

  putItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/put-item.putItemHandler
      Runtime: nodejs22.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref SampleTable
      Environment:
        Variables:
          SAMPLE_TABLE: !Ref SampleTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /
            Method: POST

  SampleTable:
    Type: AWS::Serverless::SimpleTable   # -> AWS::DynamoDB::Table
    Properties:
      PrimaryKey:
        Name: id
        Type: String
      ProvisionedThroughput:
        ReadCapacityUnits: 2
        WriteCapacityUnits: 2
```

- **`Policies`** với **`DynamoDBCrudPolicy`** chỉ vài dòng là có IAM policy đầy đủ — so với CloudFormation thuần phải viết role + policy dài.
- **`Events`** với `Type: Api` định nghĩa API Gateway path/method cực kỳ ngắn gọn.
- **`SimpleTable`** chuyển thành bảng DynamoDB với primary key và provisioned throughput.

### Kiến thức thực tế

- `SimpleTable` chỉ hỗ trợ **khoá chính đơn** (partition key). Cần sort key, GSI, Streams, TTL… thì dùng `AWS::DynamoDB::Table` trực tiếp (vẫn viết được trong SAM template).
- Thực tế nên dùng `BillingMode: PAY_PER_REQUEST` (on-demand) cho workload dev/không đều.
- Dùng **DynamoDB Local** khi test:

  ```bash
  docker run -d -p 8000:8000 amazon/dynamodb-local
  # trong code đọc biến môi trường để đặt endpoint http://host.docker.internal:8000 khi chạy local
  ```

- Thay vì `Policies`, SAM có **`AWS::Serverless::Connector`** để khai báo quan hệ "function này đọc/ghi bảng kia" và SAM tự sinh quyền tối thiểu.

### Ghi nhớ cho kỳ thi

- `AWS::Serverless::SimpleTable` = DynamoDB đơn giản.
- `Events: Type: Api` = tự tạo API Gateway trigger.
- Quyền cho Lambda viết gọn bằng **policy templates** trong `Policies`.

---

## Bài 4 – SAM Policy Templates

### Lý thuyết

- **SAM Policy Templates**: danh sách template có sẵn để **gán quyền cho Lambda function**; mỗi template gom một nhóm permission, giúp dễ hiểu function được làm gì. Tên template thường **tự giải thích**.
- 3 ví dụ quan trọng:

| Template | Quyền |
|---|---|
| **`S3ReadPolicy`** | **Đọc** (read-only) object trong S3 |
| **`SQSPollerPolicy`** | **Poll** (nhận/xoá message) một SQS queue |
| **`DynamoDBCrudPolicy`** | **CRUD** = Create, Read, Update, Delete trên bảng DynamoDB |

Ví dụ:

```yaml
MyFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ${codeuri}
    Handler: hello.handler
    Runtime: python3.13          # video dùng python2.7 - đã deprecated từ lâu
    Policies:
      - SQSPollerPolicy:
          QueueName: !GetAtt MyQueue.QueueName
```

Khi SAM transform, template trên trở thành **IAM policy** gắn vào **execution role** của Lambda → không phải lo cách tự viết IAM role.

### Kiến thức thực tế

- Một số template khác hay gặp: `S3CrudPolicy`, `S3WritePolicy`, `DynamoDBReadPolicy`, `DynamoDBWritePolicy`, `SQSSendMessagePolicy`, `SNSPublishMessagePolicy`, `LambdaInvokePolicy`, `StepFunctionsExecutionPolicy`, `KMSDecryptPolicy`, `SSMParameterReadPolicy`, `AWSSecretsManagerGetSecretValuePolicy`, `KinesisStreamReadPolicy`, `EventBridgePutEventsPolicy`, `VPCAccessPolicy`.
- `Policies` chấp nhận lẫn lộn: tên **managed policy** (`AmazonS3ReadOnlyAccess`), **policy template**, hoặc **inline policy document**:

  ```yaml
  Policies:
    - AWSLambdaBasicExecutionRole
    - S3ReadPolicy:
        BucketName: !Ref MyBucket
    - Statement:
        - Effect: Allow
          Action: ses:SendEmail
          Resource: "*"
  ```

- Policy template **giới hạn resource** theo tham số (tên bảng, bucket, queue) → đúng nguyên tắc **least privilege**. Template có `S3ReadPolicy` nhận `BucketName` (tên bucket, không phải ARN) — lỗi hay gặp là truyền ARN.

### Ghi nhớ cho kỳ thi

- Lambda cần đọc S3 → **`S3ReadPolicy`**; poll SQS → **`SQSPollerPolicy`**; CRUD DynamoDB → **`DynamoDBCrudPolicy`**.
- Policy templates khai báo trong thuộc tính **`Policies`** của `AWS::Serverless::Function`.

---

## Bài 5 – SAM và CodeDeploy (traffic shifting)

### Lý thuyết

- SAM **dùng CodeDeploy** để cập nhật Lambda, tận dụng **traffic shifting** qua **alias**.
- Hỗ trợ **pre-traffic / post-traffic hooks** (Lambda function kiểm tra deployment) và **rollback tự động** bằng **CloudWatch Alarms**.

Luồng:

```
Alias "live" -> v1
   | (sam deploy / CI/CD kích hoạt CodeDeploy)
   v
1. PreTraffic hook (Lambda test, tuỳ chọn)
2. Traffic shifting v1 -> v2 trên alias theo chiến lược (Canary / Linear / AllAtOnce)
   - Theo dõi CloudWatch Alarms (tuỳ chọn) -> báo động thì rollback
3. PostTraffic hook (Lambda test, tuỳ chọn)
4. Hoàn tất: alias "live" -> 100% v2
```

Các thuộc tính trong SAM template:

| Thuộc tính | Ý nghĩa |
|---|---|
| **`AutoPublishAlias`** | SAM phát hiện code mới → **publish version mới** và **cập nhật alias** trỏ tới version đó |
| **`DeploymentPreference.Type`** | Tốc độ chuyển traffic: **Canary**, **Linear**, **AllAtOnce** (cấu hình của CodeDeploy). Ví dụ `Canary10Percent10Minutes` |
| **`Alarms`** | Danh sách CloudWatch alarm; alarm kích hoạt → **rollback** |
| **`Hooks`** | Lambda chạy **PreTraffic** / **PostTraffic** để test deployment |

Các giá trị `Type`:

| Loại | Giá trị |
|---|---|
| Canary | `Canary10Percent5Minutes`, `Canary10Percent10Minutes`, `Canary10Percent15Minutes`, `Canary10Percent30Minutes` |
| Linear | `Linear10PercentEvery1Minute`, `Linear10PercentEvery2Minutes`, `Linear10PercentEvery3Minutes`, `Linear10PercentEvery10Minutes` |
| Tất cả một lần | `AllAtOnce` |

### Kiến thức thực tế

Template đầy đủ có alarm và hook:

```yaml
  AliasErrorMetricGreaterThanZeroAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Lambda errors > 0 tren alias moi
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 2
      MetricName: Errors
      Namespace: AWS/Lambda
      Period: 60
      Statistic: Sum
      Threshold: 0
      Dimensions:
        - Name: Resource
          Value: !Sub "${HelloWorldFunction}:live"
        - Name: FunctionName
          Value: !Ref HelloWorldFunction
        - Name: ExecutedVersion
          Value: !GetAtt HelloWorldFunction.Version.Version

  PreTrafficLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: CodeDeployHook_preTrafficHook   # role mặc định chỉ cho invoke hàm có tiền tố CodeDeployHook_
      Handler: pre_traffic.handler
      Runtime: python3.13
      CodeUri: hooks/
      DeploymentPreference:
        Enabled: false
      Policies:
        - Statement:
            - Effect: Allow
              Action: codedeploy:PutLifecycleEventHookExecutionStatus
              Resource: !Sub "arn:${AWS::Partition}:codedeploy:${AWS::Region}:${AWS::AccountId}:deploymentgroup:${ServerlessDeploymentApplication}/*"
            - Effect: Allow
              Action: lambda:InvokeFunction
              Resource: !Ref HelloWorldFunction.Version
      Environment:
        Variables:
          NewVersion: !Ref HelloWorldFunction.Version
```

Hook bắt buộc **báo kết quả** về CodeDeploy, nếu không deployment sẽ treo tới khi timeout:

```python
import boto3
cd = boto3.client("codedeploy")

def handler(event, context):
    status = "Succeeded"
    try:
        # gọi thử version mới, kiểm tra kết quả...
        pass
    except Exception:
        status = "Failed"
    cd.put_lifecycle_event_hook_execution_status(
        deploymentId=event["DeploymentId"],
        lifecycleEventHookExecutionId=event["LifecycleEventHookExecutionId"],
        status=status,
    )
```

- Trong môi trường dev, có thể tắt bằng `DeploymentPreference: Enabled: false` hoặc dùng `AllAtOnce` để deploy nhanh.
- Nếu deploy bằng `sam sync`, SAM bỏ qua CodeDeploy traffic shifting (chỉ dành cho dev).

### Ghi nhớ cho kỳ thi

- SAM + CodeDeploy: **`AutoPublishAlias`** + **`DeploymentPreference`** (Canary/Linear/AllAtOnce) + **`Alarms`** (rollback) + **`Hooks`** (PreTraffic/PostTraffic).
- CodeDeploy với Lambda = **traffic shifting trên alias**, không phải thay instance.

---

## Bài 6 – Chạy và test SAM ở local

### Lý thuyết

| Lệnh | Tác dụng |
|---|---|
| **`sam local start-lambda`** | Khởi động **endpoint local giả lập Lambda service** → chạy **automated tests** gọi vào endpoint này |
| **`sam local invoke`** | **Gọi một lần** Lambda với payload rồi thoát. Hữu ích để tạo test case. Nếu function gọi AWS (ví dụ DynamoDB) thì dùng **`--profile`** đúng để chọn môi trường |
| **`sam local start-api`** | Khởi động **HTTP server local** host tất cả API và function. **Sửa code thì tự reload** |
| **`sam local generate-event`** | Sinh **event mẫu** cho nguồn sự kiện: S3, API Gateway, SNS, Kinesis, DynamoDB… rồi **pipe** vào `sam local invoke` |

### Kiến thức thực tế

- `sam local` chạy function trong **container Docker** mô phỏng runtime Lambda; lần đầu sẽ pull image `public.ecr.aws/lambda/...` nên hơi lâu.
- Hot reload của `start-api` áp dụng cho **code**; đổi `template.yaml` thì phải `sam build` và khởi động lại.
- Debug bằng IDE: `sam local invoke -d 5858 ...` (debug port) hoặc dùng **AWS Toolkit** cho VS Code / JetBrains.
- Muốn chạy thử trên **cloud thật** nhanh thay cho local: **`sam remote invoke`** và **`sam sync --watch`**; `sam remote test-event` để lưu event test dùng chung.

### Ghi nhớ cho kỳ thi

- Test Lambda local một lần → **`sam local invoke`**.
- API Gateway local → **`sam local start-api`**.
- Endpoint Lambda local cho automated test → **`sam local start-lambda`**.
- Event mẫu S3/SNS/Kinesis… → **`sam local generate-event`**.
- Function local gọi AWS thật → dùng **`--profile`**.

---

## Bài 7 – Nhiều môi trường với `samconfig.toml`

### Lý thuyết

- SAM giúp quản lý **nhiều môi trường** (dev, prod…) dễ dàng bằng file **`samconfig.toml`** (định dạng **TOML**) đặt cạnh SAM template.
- Mỗi môi trường có nhóm tham số riêng cho từng lệnh: `[<env>.deploy.parameters]`, `[<env>.sync.parameters]`… gồm stack name, S3 bucket, prefix, region, capabilities, parameter overrides.

```toml
version = 0.1

[dev.deploy.parameters]
stack_name = "my-dev-stack"
s3_bucket = "my-source-bucket-dev"
s3_prefix = "my-s3-prefix-dev"
region = "us-west-2"
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=\"development\""

[dev.sync.parameters]
watch = true

[prod.deploy.parameters]
stack_name = "my-prod-stack"
s3_bucket = "my-source-bucket-prod"
s3_prefix = "my-s3-prefix-prod"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=\"production\""

[prod.sync.parameters]
watch = false
```

- Triển khai theo môi trường:

  ```bash
  sam deploy --config-env dev
  sam deploy --config-env prod
  ```

  SAM CLI đọc `samconfig.toml`, lấy đúng tham số và deploy tới đúng nơi. Có thể định nghĩa **bao nhiêu môi trường tuỳ ý**.

### Kiến thức thực tế

- SAM CLI hiện cũng hỗ trợ file cấu hình dạng **YAML** (`samconfig.yaml`/`samconfig.yml`) ngoài TOML; có thể chọn file khác bằng `--config-file`.
- Có thể khai báo tham số chung cho mọi lệnh bằng `[<env>.global.parameters]` (ví dụ `region`, `profile`).
- Dùng `resolve_s3 = true` thay vì tự tạo `s3_bucket`.
- Thực tế, prod thường ở **account AWS riêng**: thêm `profile = "prod"` trong `[prod.deploy.parameters]`, và deploy prod qua **pipeline** (`sam pipeline`) thay vì từ máy developer.

### Ghi nhớ cho kỳ thi

- Nhiều môi trường → **`samconfig.toml`** + **`sam deploy --config-env <env>`**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| SAM là gì | Framework serverless; YAML đơn giản → CloudFormation; hỗ trợ mọi thứ của CloudFormation |
| Transform | `Transform: 'AWS::Serverless-2016-10-31'` |
| Resource chính | `AWS::Serverless::Function`, `::Api`, `::SimpleTable` (+ HttpApi, LayerVersion, Application, StateMachine…); **không có** UserPool |
| Lệnh CLI | `sam init`, `sam build`, `sam deploy [--guided]` (tự package, upload S3, ChangeSet), `sam delete`; cũ: `sam package` |
| SAM Accelerate | `sam sync` (bỏ qua CloudFormation khi chỉ đổi code), `--code`, `--resource`, `--resource-id`, `--watch` |
| Policy templates | `S3ReadPolicy`, `SQSPollerPolicy`, `DynamoDBCrudPolicy`… trong `Policies` |
| CodeDeploy | `AutoPublishAlias` + `DeploymentPreference` (Canary/Linear/AllAtOnce), `Alarms` rollback, `Hooks` Pre/PostTraffic |
| Local | `sam local invoke`, `start-api`, `start-lambda`, `generate-event`; cần Docker; `--profile` |
| Môi trường | `samconfig.toml` + `--config-env` |
| Cập nhật runtime | Python 2.7/3.7/3.9 trong video đã deprecated → dùng Python 3.12/3.13, Node.js 22 |

---

## Câu hỏi ôn tập

*Nguồn: SAM Quiz (câu 1–4). Vì quiz chỉ có 4 câu, câu 5–10 là **câu hỏi tự soạn** dựa trên nội dung video. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Lệnh nào cho phép upload ứng dụng Serverless SAM lên AWS?

- A. `sam deploy`
- B. `sam zip`
- C. `sam upload`
- D. `sam package`

<details><summary>Đáp án</summary>

**A.** `sam deploy` đóng gói, upload artifact lên S3 và triển khai stack CloudFormation. `sam package` chỉ đóng gói + upload artifact và xuất template, không triển khai (trước đây phải chạy kèm `sam deploy`). `sam zip` và `sam upload` không tồn tại.
</details>

**Câu 2.** Bạn vừa nhận vị trí AWS Developer ở công ty mới. Tech lead đưa bạn một số CloudFormation template để review. Một template bắt đầu bằng `Transform: 'AWS::Serverless-2016-10-31'`. Điều này nghĩa là gì?

- A. Đó là một Intrinsic function
- B. Đó là định nghĩa một Lambda function
- C. Đó là một SAM template

<details><summary>Đáp án</summary>

**C.** Transform này báo CloudFormation dùng SAM transform để chuyển SAM template thành CloudFormation template chuẩn.
</details>

**Câu 3.** AWS SAM hỗ trợ các resource type sau, NGOẠI TRỪ ______.

- A. `AWS::Serverless::Function`
- B. `AWS::Serverless::UserPool`
- C. `AWS::Serverless::Api`
- D. `AWS::Serverless::SimpleTable`

<details><summary>Đáp án</summary>

**B.** SAM không có resource UserPool; Cognito User Pool khai báo bằng `AWS::Cognito::UserPool` của CloudFormation (vẫn dùng được trong SAM template).
</details>

**Câu 4.** Bạn nên dùng SAM Policy Template nào trong SAM template để cấp cho Lambda quyền đọc object trong S3 bucket?

- A. `SQSPollerPolicy`
- B. `S3CrudPolicy`
- C. `S3ReadPolicy`
- D. `LambdaInvokePolicy`

<details><summary>Đáp án</summary>

**C.** `S3ReadPolicy` cấp quyền read-only. `S3CrudPolicy` cũng đọc được nhưng thừa quyền ghi/xoá, vi phạm least privilege.
</details>

**Câu 5.** *(Câu hỏi tự soạn)* Developer đang phát triển một Lambda function bằng SAM và muốn các thay đổi code được đẩy lên AWS trong vài giây mỗi khi lưu file, không phải chờ CloudFormation. Nên dùng lệnh nào?

- A. `sam deploy --guided`
- B. `sam sync --watch`
- C. `sam local start-api`
- D. `sam package`

<details><summary>Đáp án</summary>

**B.** SAM Accelerate (`sam sync`) với `--watch` theo dõi file và đồng bộ; nếu chỉ đổi code thì gọi thẳng service API, bỏ qua CloudFormation. `sam local start-api` chạy ở local, không đẩy lên AWS.
</details>

**Câu 6.** *(Câu hỏi tự soạn)* Bạn muốn mỗi lần deploy Lambda bằng SAM, 10% traffic đi tới version mới trong 10 phút rồi mới chuyển hết, và tự động rollback nếu tỉ lệ lỗi tăng. Cần cấu hình gì trong SAM template?

- A. `AutoPublishAlias` + `DeploymentPreference` với `Type: Canary10Percent10Minutes` và `Alarms`
- B. `ProvisionedConcurrencyConfig` + `Events`
- C. Tạo 2 stage API Gateway và dùng Route 53 weighted record
- D. `sam sync --code` với `--watch`

<details><summary>Đáp án</summary>

**A.** SAM dùng CodeDeploy để shift traffic trên alias tự publish; CloudWatch alarm trong `Alarms` kích hoạt rollback.
</details>

**Câu 7.** *(Câu hỏi tự soạn)* Trong SAM + CodeDeploy, đâu là cách chạy kiểm thử tuỳ chỉnh ngay **trước khi** bắt đầu chuyển traffic sang version mới?

- A. Một CloudWatch Alarm
- B. Hook `PreTraffic` trỏ tới một Lambda function
- C. Thuộc tính `AutoPublishAlias`
- D. `sam local invoke`

<details><summary>Đáp án</summary>

**B.** `Hooks.PreTraffic` (và `PostTraffic`) là Lambda function chạy test, sau đó báo kết quả về CodeDeploy bằng `PutLifecycleEventHookExecutionStatus`.
</details>

**Câu 8.** *(Câu hỏi tự soạn)* Bạn muốn test Lambda xử lý sự kiện upload S3 ngay trên máy local mà không cần upload file thật. Cách nhanh nhất?

- A. `sam local generate-event s3 put ... | sam local invoke -e - MyFunction`
- B. `sam deploy` rồi upload file vào bucket
- C. `sam local start-api`
- D. `aws s3 cp` vào bucket local

<details><summary>Đáp án</summary>

**A.** `generate-event` sinh payload S3 mẫu và pipe vào `sam local invoke`. `start-api` chỉ giả lập API Gateway.
</details>

**Câu 9.** *(Câu hỏi tự soạn)* Đội của bạn deploy cùng một SAM application lên dev và prod với stack name, bucket và tham số khác nhau. Cách được SAM hỗ trợ sẵn để chuyển môi trường dễ dàng là gì?

- A. Tạo 2 file `template.yaml` riêng
- B. Định nghĩa các môi trường trong `samconfig.toml` và chạy `sam deploy --config-env prod`
- C. Dùng stage variables của API Gateway
- D. Chạy `sam init` lại cho mỗi môi trường

<details><summary>Đáp án</summary>

**B.** `samconfig.toml` chứa nhóm tham số `[dev.deploy.parameters]`, `[prod.deploy.parameters]`…; `--config-env` chọn nhóm cần dùng.
</details>

**Câu 10.** *(Câu hỏi tự soạn)* Lambda function trong SAM cần thêm, đọc, cập nhật và xoá item trong một bảng DynamoDB, cấp quyền tối thiểu cho đúng bảng đó. Nên khai báo gì?

- A. `Policies: - AmazonDynamoDBFullAccess`
- B. `Policies: - DynamoDBCrudPolicy: { TableName: !Ref MyTable }`
- C. `Policies: - DynamoDBReadPolicy: { TableName: !Ref MyTable }`
- D. `Policies: - SQSPollerPolicy: { QueueName: !Ref MyTable }`

<details><summary>Đáp án</summary>

**B.** `DynamoDBCrudPolicy` cấp quyền Create/Read/Update/Delete giới hạn trên bảng chỉ định. A thừa quyền trên mọi bảng; C chỉ đọc; D sai dịch vụ.
</details>

---

[← Chương 24](ch24-aws-cicd-codecommit-codepipeline-codeb.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 26 →](ch26-cloud-development-kit-cdk.md)
