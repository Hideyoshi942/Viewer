# Chương 26 – Cloud Development Kit (CDK)

> **Nguồn:** Thư mục chương không có transcript video, nên tài liệu này được **biên soạn từ đề cương (syllabus) khoá học** (CDK Overview, CDK Hands On, CDK Constructs, CDK Commands and Bootstrapping, CDK Unit Testing, CDK vs SAM, Quiz) kết hợp tài liệu chuẩn của AWS CDK v2. Câu hỏi ôn tập là **câu hỏi tự soạn** theo phong cách đề thi.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**. Tài liệu dùng **CDK v2** (package duy nhất `aws-cdk-lib`); CDK v1 (`@aws-cdk/aws-s3`…) đã **end-of-support từ 06/2023**. Số thứ tự video trong bảng là ước lượng theo thứ tự đề cương.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **AWS CDK** là gì: định nghĩa hạ tầng bằng **ngôn ngữ lập trình quen thuộc**, rồi **synthesize** ra **CloudFormation template**.
- Phân biệt các cấp **Construct**: **L1** (`Cfn*`), **L2** (intent-based, có default hợp lý), **L3** (patterns) và biết tìm construct trên **Construct Hub**.
- Dùng CDK CLI: `cdk init`, `cdk synth`, `cdk bootstrap`, `cdk deploy`, `cdk diff`, `cdk destroy` và hiểu stack **`CDKToolkit`**.
- Xây ứng dụng mẫu **S3 → Lambda → Rekognition → DynamoDB** bằng CDK.
- Viết **unit test** cho CDK bằng module **`assertions`**: fine-grained assertions và snapshot test; dùng `Template.fromJSON` cho template có sẵn.
- So sánh **CDK vs SAM** và kết hợp `cdk synth` + `sam local invoke` để test Lambda local.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | CDK Overview | Bài 1 – Tổng quan AWS CDK |
| 002 | CDK Hands On | Bài 2 – Ứng dụng CDK: S3 → Lambda → Rekognition → DynamoDB |
| 003 | CDK Constructs | Bài 3 – CDK Constructs (L1, L2, L3) |
| 004 | CDK Commands and Bootstrapping | Bài 4 – Lệnh CDK và Bootstrapping |
| 005 | CDK Unit Testing | Bài 5 – Unit Testing với CDK |
| 006 | CDK vs SAM | Bài 6 – CDK vs SAM |
| Quiz | CDK Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan AWS CDK

### Lý thuyết

- **CDK = Cloud Development Kit**: định nghĩa hạ tầng cloud bằng **ngôn ngữ lập trình quen thuộc**: **JavaScript/TypeScript, Python, Java, .NET (C#)** và **Go**.
- Mã nguồn chứa các thành phần cấp cao gọi là **Constructs** (ví dụ "một bucket", "một Lambda có API phía trước").
- Code được **"compile" (synthesize)** thành **CloudFormation template** (JSON/YAML) → CloudFormation vẫn là engine triển khai thực sự.
- Vì vậy có thể **triển khai hạ tầng và code ứng dụng cùng lúc**:
  - Rất hợp với **Lambda function** (CDK tự đóng gói code thành asset, upload S3).
  - Rất hợp với **Docker container** trên **ECS/EKS** (CDK build image và push lên ECR).
- Lợi ích so với viết YAML tay:
  - **Type safety**, autocomplete trong IDE, phát hiện lỗi khi compile.
  - Dùng **vòng lặp, điều kiện, hàm, class, kế thừa** để tái sử dụng.
  - **Default an toàn và hợp lý** (ví dụ bucket chặn public access, tự sinh IAM role).
  - Các phương thức **`grant*()`** sinh IAM policy least-privilege chỉ bằng 1 dòng.

#### Kiến trúc CDK

```
CDK App (TypeScript / Python / Java / C# / Go)
  └── Stack(s)
        └── Constructs (Bucket, Function, Table, ...)
              | cdk synth
              v
cdk.out/  -> CloudFormation template (*.template.json) + assets (zip Lambda, Docker image)
              | cdk deploy
              v
CloudFormation stack (+ assets upload lên S3/ECR của bootstrap)
```

- **App**: gốc của cây construct (`new App()`), có thể chứa nhiều **Stack**.
- **Stack**: tương ứng **1 CloudFormation stack** (đơn vị triển khai).
- **Construct**: khối xây dựng, có thể đại diện 1 hoặc nhiều resource AWS.

Ví dụ TypeScript tối giản:

```typescript
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'MyBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}

const app = new App();
new MyStack(app, 'MyStack', { env: { account: '123456789012', region: 'eu-west-1' } });
```

Tương đương bằng Python:

```python
from aws_cdk import App, Stack, RemovalPolicy, aws_s3 as s3
from constructs import Construct

class MyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        s3.Bucket(self, "MyBucket",
                  versioned=True,
                  encryption=s3.BucketEncryption.S3_MANAGED,
                  removal_policy=RemovalPolicy.DESTROY,
                  auto_delete_objects=True)

app = App()
MyStack(app, "MyStack")
app.synth()
```

### Kiến thức thực tế

- CDK v2 gom mọi module stable vào **một package `aws-cdk-lib`** + package `constructs`. Module thử nghiệm (alpha) tách riêng, ví dụ `@aws-cdk/aws-xxx-alpha`.
- Từ 2025, **CDK CLI** (`aws-cdk`, phiên bản 2.1000+) được **phát hành tách khỏi** thư viện `aws-cdk-lib`; nên cập nhật CLI thường xuyên (`npm i -g aws-cdk`) — CLI mới vẫn đọc được app dùng lib cũ.
- CDK CLI viết bằng Node.js nên **luôn cần Node.js** kể cả khi viết app bằng Python/Java.
- Các lựa chọn IaC khác: SAM (Chương 25), CloudFormation thuần, Terraform, Pulumi.

### Ghi nhớ cho kỳ thi

- CDK = IaC bằng **ngôn ngữ lập trình** → **synthesize thành CloudFormation**.
- Ngôn ngữ: **JS/TS, Python, Java, .NET** (và Go).
- Deploy được **hạ tầng + code** (Lambda, container ECS/EKS) cùng lúc.

---

## Bài 2 – Ứng dụng CDK: S3 → Lambda → Rekognition → DynamoDB

### Lý thuyết

Kiến trúc ứng dụng trong bài hands on:

```
User upload ảnh  ──>  S3 bucket
                         | S3 Event Notification (OBJECT_CREATED)
                         v
                    Lambda function ──> Amazon Rekognition (DetectLabels)
                         |
                         v
                    DynamoDB table (lưu tên ảnh + các label phát hiện được)
```

- **S3 bucket** chứa ảnh; mỗi lần upload kích hoạt Lambda.
- **Lambda** đọc ảnh từ S3, gọi **Rekognition `DetectLabels`**, ghi kết quả vào **DynamoDB**.
- Toàn bộ hạ tầng (bucket, function, role, permission, event notification, table) chỉ vài chục dòng CDK.

### Kiến thức thực tế

- Mặc định `removalPolicy` của bucket/table là **`RETAIN`** → `cdk destroy` để lại resource (an toàn cho production). `DESTROY` chỉ nên dùng cho dev/demo.
- Ưu tiên `grant*()` khi có (`bucket.grantRead`, `table.grantReadWriteData`, `queue.grantSendMessages`, `topic.grantPublish`…) thay vì tự viết `PolicyStatement`.
- Lambda Node.js/TypeScript: dùng **`NodejsFunction`** (`aws-cdk-lib/aws-lambda-nodejs`) để tự **bundle bằng esbuild**; Python có `PythonFunction` (module alpha) để tự cài `requirements.txt`.
- Vòng dev nhanh: `cdk watch` hoặc `cdk deploy --hotswap` cập nhật code Lambda/ECS **không qua CloudFormation** (giống `sam sync`) — **chỉ cho dev**, không dùng cho production.

### Ghi nhớ cho kỳ thi

- `bucket.grantRead(fn)`, `table.grantWriteData(fn)` → CDK tự sinh IAM policy least-privilege.
- `bucket.addEventNotification(...)` → S3 trigger Lambda.
- Quy trình: `cdk init` → (`cdk bootstrap`) → `cdk synth` → `cdk deploy` → `cdk destroy`.

---

## Bài 3 – CDK Constructs (L1, L2, L3)

### Lý thuyết

- **Construct** = thành phần chứa **mọi thứ CloudFormation cần để tạo stack**; có thể là **1 resource** (S3 bucket) hoặc **nhiều resource liên quan** (worker queue + compute).
- **AWS Construct Library**: bộ construct chính thức cho từng dịch vụ AWS, có nhiều cấp độ trừu tượng.
- **Construct Hub** (constructs.dev): nơi tìm construct thêm từ **AWS, bên thứ ba và cộng đồng open source**.

#### 3 cấp Construct

| Cấp | Tên | Đặc điểm | Ví dụ |
|---|---|---|---|
| **L1** | **CFN Resources** | **Ánh xạ 1-1** với resource CloudFormation; tên bắt đầu bằng **`Cfn`**; **phải cấu hình tất cả thuộc tính** thủ công; sinh tự động từ CloudFormation spec | `s3.CfnBucket`, `dynamodb.CfnTable` |
| **L2** | **Curated / intent-based** | Đại diện resource AWS với **API cấp cao, default hợp lý**, có **method tiện ích** (`grant*`, `addEventNotification`, `metric*`) | `s3.Bucket`, `lambda.Function`, `dynamodb.Table` |
| **L3** | **Patterns** | Gói **nhiều resource liên quan** cho một kiến trúc phổ biến | `apigateway.LambdaRestApi`, `ecs_patterns.ApplicationLoadBalancedFargateService` |

L1 – phải viết đủ, tên thuộc tính giống CloudFormation:

```typescript
const cfnBucket = new s3.CfnBucket(this, 'MyCfnBucket', {
  bucketName: 'my-l1-bucket-123',
  versioningConfiguration: { status: 'Enabled' },
});
```

L2 – có method/default tiện lợi:

```typescript
const bucket = new s3.Bucket(this, 'MyBucket', {
  versioned: true,
  encryption: s3.BucketEncryption.KMS,
  websiteRedirect: { hostName: 'aws.amazon.com' },
});
const objectUrl = bucket.urlForObject('MyBucket/MyObject'); // method tiện ích
```

L3 – một construct tạo cả API Gateway + integration + Lambda permission:

```typescript
const backend = new lambda.Function(this, 'Backend', { /* ... */ });
const api = new apigateway.LambdaRestApi(this, 'MyApi', {
  handler: backend,
  proxy: false,
});
const items = api.root.addResource('items');
items.addMethod('GET');   // GET /items
items.addMethod('POST');  // POST /items
```

L3 với ECS – ALB + Fargate service (+ cluster/VPC nếu không truyền vào) chỉ vài dòng:

```typescript
new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Web', {
  memoryLimitMiB: 1024,
  cpu: 512,
  taskImageOptions: { image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample') },
  desiredCount: 2,
});
```

#### Escape hatches (L2 → L1)

Khi L2 chưa hỗ trợ một thuộc tính, truy cập L1 bên dưới qua `node.defaultChild`:

```typescript
const cfn = bucket.node.defaultChild as s3.CfnBucket;
cfn.addPropertyOverride('ObjectLockEnabled', true);
cfn.cfnOptions.metadata = { note: 'override bằng escape hatch' };
```

### Kiến thức thực tế

- L1 được sinh tự động từ CloudFormation resource spec nên **có ngay** khi CloudFormation hỗ trợ resource mới; L2 thường ra sau.
- Có thể tự viết **construct riêng** (class `extends Construct`) đóng gói chuẩn công ty (bucket mã hoá + logging + tag) rồi publish lên registry nội bộ / Construct Hub (dùng **projen** + **jsii** để xuất cho nhiều ngôn ngữ).
- Thư viện L3 phổ biến: **AWS Solutions Constructs** (`aws-s3-lambda`, `aws-lambda-dynamodb`, `aws-apigateway-lambda`…).
- **Aspects** (`Aspects.of(app).add(...)`) duyệt toàn bộ cây construct để kiểm tra/sửa (ví dụ bắt buộc tag, bật encryption) — nền tảng của **cdk-nag**.

### Ghi nhớ cho kỳ thi

- **L1 = `Cfn*`** = 1-1 với CloudFormation, phải khai báo hết thuộc tính.
- **L2** = resource cấp cao, default hợp lý, có method (`grant*`).
- **L3 = Patterns** = nhiều resource (ví dụ `LambdaRestApi`, `ApplicationLoadBalancedFargateService`).
- Tìm construct cộng đồng → **Construct Hub**.

---

## Bài 4 – Lệnh CDK và Bootstrapping

### Lý thuyết

| Lệnh | Tác dụng |
|---|---|
| `npm install -g aws-cdk` | Cài CDK CLI |
| **`cdk init app --language <lang>`** | Tạo project CDK mới từ template |
| **`cdk synth`** | **Synthesize** và in ra CloudFormation template (ghi vào `cdk.out/`) |
| **`cdk bootstrap`** | **Deploy CDK Toolkit stack** vào account/region (bắt buộc trước khi deploy) |
| **`cdk deploy`** | Deploy stack (synth + upload assets + CloudFormation ChangeSet) |
| **`cdk diff`** | So sánh **khác biệt** giữa CDK stack local và stack đã deploy |
| **`cdk destroy`** | Xoá stack |
| `cdk ls` | Liệt kê các stack trong app |

#### CDK Bootstrapping

- **Bootstrapping** = quá trình **cấp phát resource cho CDK** **trước khi** deploy CDK app vào một **environment**.
- **Environment = account + region** (ví dụ `aws://123456789012/eu-west-1`). Mỗi environment cần bootstrap **một lần**.
- Tạo CloudFormation stack tên **`CDKToolkit`**, chứa:
  - **S3 bucket** – lưu file (asset Lambda zip, template lớn…).
  - **ECR repository** – lưu Docker image asset.
  - **IAM roles** – cấp quyền thực hiện deployment (deploy role, file/image publishing role, lookup role, **CloudFormation execution role**).
  - SSM parameter `/cdk-bootstrap/<qualifier>/version` – phiên bản bootstrap.

```bash
cdk bootstrap aws://<aws_account>/<aws_region>
cdk bootstrap aws://123456789012/eu-west-1 --profile dev
```

- **Nếu chưa bootstrap**, deploy sẽ lỗi, ví dụ:
  - *"Policy contains a statement with one or more invalid principals"* — principal trỏ tới IAM role của bootstrap chưa tồn tại (thông báo hay được nêu trong đề),
  - *"This stack uses assets, so the toolkit stack must be deployed to the environment (Run "cdk bootstrap aws://...")"*,
  - hoặc lỗi không tìm thấy SSM parameter `/cdk-bootstrap/hnb659fds/version`.
  - → Cách sửa: chạy **`cdk bootstrap`** cho đúng account/region.

```
cdk bootstrap ──> CloudFormation stack "CDKToolkit"
                    ├── S3 bucket   cdk-hnb659fds-assets-<account>-<region>
                    ├── ECR repo    cdk-hnb659fds-container-assets-<account>-<region>
                    └── IAM roles   deploy-role / cfn-exec-role / file-publishing-role / image-publishing-role / lookup-role
cdk deploy    ──> upload assets vào S3/ECR ──> assume deploy role ──> CloudFormation tạo stack ứng dụng
```

### Kiến thức thực tế

- **Cross-account**: bootstrap account đích với trust tới account chạy pipeline:

  ```bash
  cdk bootstrap aws://222222222222/us-east-1 \
    --trust 111111111111 \
    --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
  ```

  Thực tế nên thay `AdministratorAccess` bằng policy hẹp hơn hoặc dùng **permissions boundary**.
- **CDK Pipelines** (`aws-cdk-lib/pipelines`) tạo CodePipeline **self-mutating** (tự cập nhật chính pipeline) để deploy nhiều stage/account.
- Lệnh hữu ích khác: `cdk import` (đưa resource có sẵn vào stack), `cdk migrate` (sinh app CDK từ template/stack CloudFormation có sẵn), `cdk gc` (dọn asset cũ trong bucket/ECR bootstrap), `cdk drift` (phát hiện drift), `cdk doctor`, `cdk context --clear`.
- **`cdk refactor`** (2025+): khi **đổi tên/di chuyển construct** (logical ID thay đổi), CDK dùng **CloudFormation stack refactoring** để giữ nguyên resource thay vì xoá rồi tạo lại (tránh mất dữ liệu bảng/bucket). Cách cũ là `overrideLogicalId()`.
- **CDK Toolkit Library** (`@aws-cdk/toolkit-lib`, GA 2025): gọi `synth`, `deploy`, `diff`, `destroy`… **bằng code** (không cần shell ra CLI) — tiện cho platform nội bộ, test tự động, CI tuỳ biến.
- Luôn chạy **`cdk diff`** trong pull request để review thay đổi (đặc biệt resource bị **replace**).

### Ghi nhớ cho kỳ thi

- **`cdk synth`** = sinh CloudFormation template; **`cdk diff`** = so local với đã deploy.
- **Bootstrap** **mỗi account + region** → stack **`CDKToolkit`** (S3 bucket + ECR repo + IAM roles).
- Lỗi deploy kiểu *"Policy contains a statement with one or more invalid principals"* / *"must bootstrap"* → chạy **`cdk bootstrap`**.

---

## Bài 5 – Unit Testing với CDK

### Lý thuyết

- Test CDK app bằng **CDK Assertions Module** (`aws-cdk-lib/assertions`) kết hợp framework test phổ biến: **Jest** (JavaScript/TypeScript) hoặc **Pytest** (Python).
- Kiểm tra **template CloudFormation đã synth** có đúng như mong đợi — không cần deploy.
- 2 loại test:

| Loại | Cách làm | Khi nào dùng |
|---|---|---|
| **Fine-grained Assertions** (phổ biến) | Kiểm tra **một khía cạnh cụ thể** của template (resource có thuộc tính X, số lượng resource…) | Kiểm tra logic quan trọng, chống regression có chủ đích |
| **Snapshot Tests** | So **toàn bộ template** với **template baseline** đã lưu trước đó | Phát hiện mọi thay đổi ngoài ý muốn (ví dụ khi nâng cấp thư viện, refactor) |

- Tạo đối tượng `Template` để test:
  - **`Template.fromStack(myStack)`**: stack **định nghĩa trong CDK**.
  - **`Template.fromJSON(...)` / `Template.fromString(...)`**: template **tạo bên ngoài CDK** (CloudFormation có sẵn) — vẫn dùng assertions để test.

### Kiến thức thực tế

- Snapshot test **dễ vỡ** (đổi version `aws-cdk-lib` có thể đổi hash asset, thứ tự thuộc tính) → dùng kết hợp với fine-grained, đừng chỉ dựa vào snapshot.
- Matcher hữu ích: `Match.objectLike`, `Match.arrayWith`, `Match.absent()`, `Match.stringLikeRegexp`, `Match.serializedJson`; capture giá trị bằng `new Capture()`.
- Policy-as-code: **cdk-nag** áp rule pack (`AwsSolutionsChecks`, HIPAA, NIST 800-53, PCI DSS) qua Aspects và **báo lỗi khi `cdk synth`** nếu vi phạm (ví dụ bucket không bật access logging):

  ```typescript
  import { Aspects } from 'aws-cdk-lib';
  import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
  Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
  NagSuppressions.addStackSuppressions(stack, [{ id: 'AwsSolutions-S1', reason: 'Bucket demo, không cần access log' }]);
  ```

- **Integration test**: module `@aws-cdk/integ-tests-alpha` + `integ-runner` deploy stack thật và gọi API để kiểm tra (ví dụ upload ảnh rồi kiểm tra item DynamoDB).

### Ghi nhớ cho kỳ thi

- Unit test CDK → **CDK Assertions Module** + **Jest/Pytest**.
- **Fine-grained assertions** (`hasResourceProperties`, `resourceCountIs`) vs **Snapshot tests** (so với baseline).
- **`Template.fromStack`** cho stack CDK; **`Template.fromJSON`/`fromString`** cho template tạo ngoài CDK.

---

## Bài 6 – CDK vs SAM

### Lý thuyết

| Tiêu chí | **SAM** | **CDK** |
|---|---|---|
| Trọng tâm | **Serverless** | **Mọi dịch vụ AWS** |
| Cách viết | Khai báo bằng **JSON/YAML** | **Ngôn ngữ lập trình**: JS/TS, Python, Java, .NET, Go |
| Khởi đầu | Rất nhanh với Lambda | Cần học construct, nhưng linh hoạt hơn |
| Template sẵn | Nhiều **Quick Start template** (`sam init`) | `cdk init` + Construct Hub |
| Bản chất | Transform `AWS::Serverless-2016-10-31` → CloudFormation | Synthesize → CloudFormation |
| Test local | **`sam local`** (invoke, start-api, start-lambda) | Không có sẵn → **dùng SAM CLI** trên template đã synth |

#### SAM + CDK cùng nhau

- Dùng **SAM CLI để test local** Lambda định nghĩa trong CDK app.
- Bước 1: **`cdk synth`** ra CloudFormation template (`cdk.out/`).
- Bước 2: **`sam local invoke`** trỏ tới template đó.

```bash
cdk synth --no-staging
sam local invoke MyFunction --no-event -t ./cdk.out/CdkAppStack.template.json
sam local invoke ImageAnalyzer -e events/s3-put.json -t ./cdk.out/CdkAppStack.template.json
sam local start-api -t ./cdk.out/CdkAppStack.template.json
```

- `MyFunction` có thể là **logical ID** trong template hoặc **construct ID** (SAM CLI đọc metadata `aws:cdk:path` mà CDK gắn vào resource).
- `--no-staging` để template trỏ trực tiếp tới thư mục code (không copy asset vào `cdk.out`), sửa code là thấy ngay khi invoke lại.
- Cần **Docker** như mọi lệnh `sam local`.
- Event mẫu: `sam local generate-event s3 put --bucket b --key cat.jpg > events/s3-put.json`.

```
CDK app ──cdk synth──> cdk.out/CdkAppStack.template.json + assets
                                 | sam local invoke -t ...
                                 v
                         Docker container mô phỏng Lambda runtime
```

### Kiến thức thực tế

- Chọn công cụ:
  - Ứng dụng **thuần serverless**, team thích YAML, muốn bắt đầu nhanh → **SAM** (`sam sync`, policy templates, CodeDeploy tích hợp sẵn).
  - Hạ tầng **đa dịch vụ** (VPC, ECS, RDS, pipeline…), muốn tái sử dụng bằng class/thư viện, đa account → **CDK**.
- CDK làm được tương đương các tính năng SAM: `grant*()` ≈ policy templates; `lambda.Alias` + `codedeploy.LambdaDeploymentGroup` (`LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES`) ≈ `DeploymentPreference`; `cdk watch`/`--hotswap` ≈ `sam sync --watch`.
- Có thể khai báo resource SAM trong CDK bằng L1 `CfnFunction` của module `aws-cdk-lib/aws-sam` (CDK tự thêm transform), nhưng hiếm khi cần.
- AWS Toolkit cho VS Code hỗ trợ chạy/debug Lambda local cho cả SAM lẫn CDK.

### Ghi nhớ cho kỳ thi

- **SAM**: serverless, YAML/JSON, Quick Start nhanh. **CDK**: mọi dịch vụ, ngôn ngữ lập trình.
- Cả hai đều **dựa trên CloudFormation**.
- Test Lambda của CDK ở local → **`cdk synth`** rồi **`sam local invoke -t cdk.out/<Stack>.template.json`**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| CDK là gì | IaC bằng JS/TS, Python, Java, .NET, Go → synthesize ra CloudFormation |
| Cấu trúc | App → Stack (= CloudFormation stack) → Constructs |
| Constructs | **L1 `Cfn*`** (1-1, khai báo hết), **L2** (default + `grant*`), **L3 patterns** (nhiều resource); **Construct Hub** |
| Lệnh | `cdk init`, `synth`, `bootstrap`, `deploy`, `diff`, `destroy`, `ls` |
| Bootstrap | Mỗi **account + region**; stack **`CDKToolkit`** = S3 bucket + ECR repo + IAM roles; thiếu → lỗi invalid principals / must bootstrap |
| Unit test | `aws-cdk-lib/assertions` + Jest/Pytest; fine-grained (`hasResourceProperties`) vs snapshot; `Template.fromStack` / `fromJSON` |
| CDK vs SAM | SAM: serverless, YAML; CDK: mọi dịch vụ, code; test local CDK bằng `cdk synth` + `sam local invoke` |
| Thực tế 2026 | CDK v2 (`aws-cdk-lib`), CLI tách version, Toolkit Library, `cdk refactor`, `cdk gc`, cdk-nag, `cdk watch`/hotswap chỉ cho dev |

---

## Câu hỏi ôn tập

*Toàn bộ là **câu hỏi tự soạn** theo phong cách đề thi DVA-C02, dựa trên nội dung chương. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** AWS CDK cho phép định nghĩa hạ tầng bằng ngôn ngữ lập trình. Khi deploy, code CDK được chuyển thành gì?

- A. Terraform plan
- B. CloudFormation template
- C. SAM template bắt buộc có `Transform`
- D. Các lời gọi API trực tiếp tới từng dịch vụ, không qua CloudFormation

<details><summary>Đáp án</summary>

**B.** CDK **synthesize** code thành CloudFormation template, rồi CloudFormation thực hiện deploy. (Hotswap là ngoại lệ chỉ dành cho dev.)
</details>

**Câu 2.** Construct nào ánh xạ trực tiếp 1-1 với một resource CloudFormation và yêu cầu cấu hình mọi thuộc tính thủ công?

- A. L1 construct (ví dụ `CfnBucket`)
- B. L2 construct (ví dụ `Bucket`)
- C. L3 construct (ví dụ `LambdaRestApi`)
- D. Construct Hub

<details><summary>Đáp án</summary>

**A.** L1 = CFN Resources, tên bắt đầu bằng `Cfn`. L2 có default và method tiện ích; L3 là pattern gồm nhiều resource; Construct Hub là nơi tìm construct.
</details>

**Câu 3.** Developer cần tạo nhanh API Gateway REST API đứng trước một Lambda function, kèm sẵn permission, với ít code nhất. Nên dùng construct nào?

- A. `apigateway.CfnRestApi`
- B. `apigateway.LambdaRestApi`
- C. `lambda.CfnPermission`
- D. `s3.Bucket`

<details><summary>Đáp án</summary>

**B.** `LambdaRestApi` là L3 pattern tạo REST API + integration + permission. `CfnRestApi` là L1, phải tự cấu hình mọi thứ.
</details>

**Câu 4.** Lần đầu chạy `cdk deploy` vào một region mới, developer gặp lỗi *"Policy contains a statement with one or more invalid principals"*. Nguyên nhân có khả năng nhất?

- A. Thiếu quyền `s3:PutObject` trên bucket của ứng dụng
- B. Environment (account/region) chưa được bootstrap
- C. Sai phiên bản Node.js
- D. Stack có quá nhiều resource

<details><summary>Đáp án</summary>

**B.** CDK cần stack `CDKToolkit` (IAM roles, S3 bucket, ECR repo) trong từng account/region. Chạy `cdk bootstrap aws://<account>/<region>`.
</details>

**Câu 5.** Stack `CDKToolkit` được tạo bởi `cdk bootstrap` chứa những gì?

- A. VPC, subnet và NAT Gateway
- B. S3 bucket, ECR repository và các IAM role phục vụ deployment
- C. CodePipeline và CodeBuild project
- D. Chỉ một SSM parameter lưu version CDK

<details><summary>Đáp án</summary>

**B.** S3 bucket lưu file asset, ECR repo lưu Docker image, IAM roles để deploy (kèm SSM parameter version). Không tạo VPC hay pipeline.
</details>

**Câu 6.** Bạn muốn xem khác biệt giữa code CDK local và stack đang chạy trên AWS trước khi deploy. Dùng lệnh nào?

- A. `cdk synth`
- B. `cdk diff`
- C. `cdk ls`
- D. `cdk bootstrap`

<details><summary>Đáp án</summary>

**B.** `cdk diff` so stack local với stack đã deploy. `cdk synth` chỉ in template; `cdk ls` liệt kê stack.
</details>

**Câu 7.** Công ty có 1 account và deploy CDK app vào 3 region: `us-east-1`, `eu-west-1`, `ap-southeast-1`. Cần bootstrap bao nhiêu lần?

- A. 1 lần (bootstrap là global theo account)
- B. 3 lần, mỗi region một lần
- C. Không cần nếu dùng TypeScript
- D. Mỗi lần `cdk deploy` đều phải bootstrap lại

<details><summary>Đáp án</summary>

**B.** Bootstrap theo **environment = account + region**, mỗi environment một lần (chạy lại chỉ khi cần nâng version bootstrap).
</details>

**Câu 8.** Bạn muốn unit test xác nhận rằng Lambda trong CDK stack dùng runtime `python3.13`. Cách phù hợp nhất?

- A. Deploy rồi kiểm tra trên console
- B. `Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', { Runtime: 'python3.13' })`
- C. `cdk diff` trong CI
- D. Snapshot test với `toMatchSnapshot()` là cách duy nhất

<details><summary>Đáp án</summary>

**B.** Fine-grained assertion của module `assertions` kiểm tra đúng thuộc tính cần quan tâm, không cần deploy.
</details>

**Câu 9.** Đội bạn có một CloudFormation template JSON viết tay (không dùng CDK) và muốn kiểm tra nó bằng CDK assertions. Nên tạo `Template` thế nào?

- A. `Template.fromStack()`
- B. `Template.fromJSON()` (hoặc `Template.fromString()`)
- C. Bắt buộc chuyển template sang CDK trước
- D. Không thể, assertions chỉ dùng cho stack CDK

<details><summary>Đáp án</summary>

**B.** `fromJSON`/`fromString` dùng cho template tạo ngoài CDK; `fromStack` dành cho stack định nghĩa trong CDK.
</details>

**Câu 10.** Loại test nào so sánh toàn bộ template CloudFormation đã synth với một baseline lưu trước đó?

- A. Fine-grained assertions
- B. Snapshot tests
- C. Integration tests
- D. Canary tests

<details><summary>Đáp án</summary>

**B.** Snapshot test so toàn bộ template với baseline; thay đổi có chủ đích thì cập nhật snapshot (`jest -u`).
</details>

**Câu 11.** Developer có Lambda function định nghĩa trong CDK app và muốn chạy thử nó trên máy local. Cách làm đúng?

- A. `cdk local invoke MyFunction`
- B. `cdk synth` rồi `sam local invoke MyFunction -t cdk.out/MyStack.template.json`
- C. `cdk deploy --local`
- D. Không thể test local function của CDK

<details><summary>Đáp án</summary>

**B.** CDK không có lệnh chạy local; dùng SAM CLI trên template mà `cdk synth` sinh ra (cần Docker).
</details>

**Câu 12.** Nhận định nào đúng khi so sánh SAM và CDK?

- A. SAM hỗ trợ mọi dịch vụ AWS bằng Python, còn CDK chỉ hỗ trợ serverless bằng YAML
- B. SAM tập trung vào serverless, khai báo bằng JSON/YAML; CDK hỗ trợ mọi dịch vụ AWS bằng ngôn ngữ lập trình; cả hai đều dựa trên CloudFormation
- C. CDK không dùng CloudFormation
- D. SAM và CDK không thể dùng chung trong một dự án

<details><summary>Đáp án</summary>

**B.** Đây là so sánh chuẩn trong khoá học. Hai công cụ còn dùng chung được: test local CDK bằng SAM CLI.
</details>

**Câu 13.** Trong CDK, cách ngắn gọn và least-privilege nhất để cho Lambda function `fn` đọc object trong bucket `bucket` là gì?

- A. Gắn managed policy `AmazonS3FullAccess` vào role
- B. `bucket.grantRead(fn)`
- C. Tạo `iam.CfnPolicy` với `Action: s3:*`
- D. Bật public read cho bucket

<details><summary>Đáp án</summary>

**B.** Method `grant*` của L2 construct sinh IAM policy chỉ gồm action đọc cần thiết, giới hạn trên đúng bucket đó (tương tự `S3ReadPolicy` của SAM).
</details>

---

[← Chương 25](ch25-aws-serverless-sam-serverless-applicat.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 27 →](ch27-cognito-cognito-user-pools-cognito-ide.md)
