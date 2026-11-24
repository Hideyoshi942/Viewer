# Bộ Tài Liệu Học & Sơ Đồ Tư Duy Toàn Diện AWS DVA-C03 (16 Topics · 38 Lessons · Luồng Xử Lý & Bẫy Thi)

> **Mới bắt đầu học?** Đọc trước [Lộ trình 4 chặng & Giải thích bình dân (ví dụ dễ hiểu)](dva-c03-beginner-guide.md) · **Học chi tiết từng chương & làm 325 bài tập:** [Khóa học AWS DVA-C03 (37 Chương & 16 Bộ bài tập)](dva-c03/00-tong-quan-va-lo-trinh-dva-c03.md)
> **Cấu trúc kỳ thi DVA-C03** *(áp dụng từ 01/12/2026)*: **65 câu hỏi** (50 câu tính điểm + 15 câu thử nghiệm) · **130 phút** (+30 phút ESL = 160 phút) · **Điểm đỗ 720/1000** · Không trừ điểm câu sai.
> **Mẹo xem:** Bấm **⤢ Phóng to** ở góc trên bên phải mỗi sơ đồ để mở toàn màn hình, kéo để di chuyển, `Ctrl + cuộn` để zoom, hoặc tải ảnh `SVG`/`PNG`.

---

# Phần 1 — Bản Đồ 4 Domains, 16 Topics & 38 Lessons

## 1.1. Tỷ trọng 4 Domain trong đề thi DVA-C03

```mermaid
pie showData
    title Tỷ trọng điểm thi AWS DVA-C03
    "Domain 1: Development with AWS Services" : 30
    "Domain 2: Security" : 26
    "Domain 3: Testing and Deployment" : 22
    "Domain 4: Troubleshooting and Optimization" : 22
```

## 1.2. Tổng quan 16 Chủ đề (Topics)

```mermaid
mindmap
  root((AWS DVA-C03: 16 Topics))
    D1["Domain 1: Development 30%"]
      T2["Chủ đề 2: EC2, ELB/ASG, VPC, Route 53 (Ch.5,6,7,9,10)"]
      T3["Chủ đề 3: RDS, Aurora, ElastiCache (Ch.8)"]
      T4["Chủ đề 4: S3 & CloudFront (Ch.11,13,15)"]
      T5["Chủ đề 5: ECS, ECR, Fargate, EB (Ch.16,17)"]
      T6["Chủ đề 6: AWS Lambda (Ch.21)"]
      T7["Chủ đề 7: DynamoDB & DAX (Ch.22)"]
      T8["Chủ đề 8: API Gateway (Ch.23)"]
      T9["Chủ đề 9: SQS, SNS, Kinesis, EventBridge (Ch.19,31)"]
      T10["Chủ đề 10: Step Functions & AppSync (Ch.28)"]
      T11["Chủ đề 11 MỚI: Bedrock, AgentCore, Q, Kiro (Ch.35.0-35.5)"]
    D2["Domain 2: Security 26%"]
      T1["Chủ đề 1: IAM, AWS CLI & SDK (Ch.3,4,12)"]
      T12["Chủ đề 12: Cognito & Advanced Identity (Ch.27,29)"]
      T13["Chủ đề 13: KMS, Secrets, SSM & S3 Sec (Ch.14,30)"]
    D3["Domain 3: Testing & Deployment 22%"]
      T14["Chủ đề 14: CloudFormation, SAM & CDK (Ch.18,25,26)"]
      T15["Chủ đề 15: CI/CD Pipelines (Ch.24)"]
    D4["Domain 4: Troubleshoot & Optimize 22%"]
      T16["Chủ đề 16: CloudWatch, X-Ray, ADOT & Exam (Ch.1,20,33,W0)"]
```

---

## 1.3. Nhóm 1 — Domain 2: Security (Chủ đề 1, 12, 13)

```mermaid
mindmap
  root((Domain 2: Security))
    T1["Chủ đề 1: IAM, CLI & SDK"]
      L3["Ch.03: Region, AZ, Root Account + MFA"]
      L4["Ch.04: IAM Users, Groups, Roles, Policies"]
        K4["Explicit Deny > Allow > Implicit Deny; Least Privilege"]
      L12["Ch.12: AWS CLI, SDK & Credentials Chain"]
        K12["Thứ tự Creds: Env -> Shared Creds -> Container/EC2 Instance Profile"]
        K12b["STS AssumeRole + ExternalId + MFA; Exponential Backoff"]
    T12["Chủ đề 12: Cognito & Advanced Identity"]
      L27["Ch.27: Cognito User Pools vs Identity Pools"]
        K27a["User Pool: AuthN -> JWT ID/Access/Refresh Token"]
        K27b["Identity Pool: Đổi Token lấy AWS Creds tạm qua STS"]
      L29["Ch.29: Advanced Identity"]
        K29["SAML 2.0 Federation, STS AssumeRoleWithWebIdentity, IAM Permission Boundary"]
    T13["Chủ đề 13: Mã hóa, Secrets & S3 Security"]
      L14["Ch.14: Amazon S3 Security"]
        K14a["SSE-S3 AES-256 vs SSE-KMS Audit/Rotate vs SSE-C"]
        K14b["Bucket Policy, Block Public Access, Presigned URL Expiry"]
      L30["Ch.30: KMS, Secrets Manager & SSM"]
        K30a["KMS GenerateDataKey -> Envelope Encryption; Encrypt trực tiếp max 4 KB"]
        K30b["Secrets Manager auto-rotate RDS vs SSM Parameter Store rẻ, phân cấp"]
```

---

## 1.4. Nhóm 2 — Hạ tầng, Lưu trữ, DB & Containers (Chủ đề 2, 3, 4, 5)

```mermaid
mindmap
  root((Compute, DB, Storage & Containers))
    T2["Chủ đề 2: EC2, ELB/ASG, VPC & Route 53"]
      L5["Ch.05: EC2 Fundamentals"]
        K5["User Data boot script; IMDSv2 bắt buộc Token chống SSRF"]
      L6["Ch.06: EC2 Instance Storage"]
        K6["EBS gắn 1 AZ; EFS NFS gắn nhiều AZ; Instance Store tạm mất khi Stop"]
      L7["Ch.07: ELB + ASG"]
        K7["ALB Layer 7 HTTP/gRPC/Path vs NLB Layer 4 TCP/Static IP; Sticky Sessions"]
      L9["Ch.09: Route 53"]
        K9["Alias trỏ AWS Resource miễn phí; Weighted/Latency/Failover/Geolocation"]
      L10["Ch.10: VPC Fundamentals"]
        K10["Security Group Stateful Allow vs NACL Stateless Allow/Deny; VPC Endpoints"]
    T3["Chủ đề 3: RDS, Aurora & ElastiCache"]
      L8["Ch.08: RDS + Aurora + ElastiCache"]
        K8a["RDS Multi-AZ HA/Failover vs Read Replica Scale Read; IAM DB Auth"]
        K8b["Aurora Serverless v2; ElastiCache Redis Auth/SortedSet vs Memcached"]
        K8c["Lazy Loading cache miss vs Write-Through nhất quán + TTL"]
    T4["Chủ đề 4: Amazon S3 & CloudFront"]
      L11["Ch.11: S3 Intro - Bucket, Versioning, Storage Classes"]
      L13["Ch.13: Advanced S3 - Lifecycle, Multipart >100MB, S3 Select, CRR/SRR"]
      L15["Ch.15: CloudFront - OAC, Signed URL 1 file vs Signed Cookie nhiều file"]
    T5["Chủ đề 5: ECS, ECR, Fargate & Beanstalk"]
      L16["Ch.16: ECS, ECR & Fargate"]
        K16a["ECS Task Role quyền cho App vs Execution Role kéo Image/ghi Log"]
        K16b["ECR Immutable Tags, Image Scan, Lifecycle Policy"]
      L17["Ch.17: Elastic Beanstalk"]
        K17["AllAtOnce vs Rolling vs RollingAdditionalBatch vs Immutable vs Blue/Green"]
```

---

## 1.5. Nhóm 3 — Serverless Core, Messaging & Workflow (Chủ đề 6, 7, 8, 9, 10)

```mermaid
mindmap
  root((Serverless Core & Messaging))
    T6["Chủ đề 6: AWS Lambda Deep Dive (Ch.21)"]
      K6a["Sync 6MB / Async 256KB / Max Timeout 15p / /tmp 10GB"]
      K6b["Tăng Memory = tăng vCPU; DB Connection tạo ngoài Handler"]
      K6c["Reserved Concurrency giới hạn vs Provisioned Concurrency chống Cold Start"]
      K6d["SnapStart Java/Python/.NET; Layers; Alias Weighted Traffic Shifting"]
    T7["Chủ đề 7: Amazon DynamoDB & DAX (Ch.22)"]
      K7a["PK + SK; Item max 400KB; LSI tạo lúc đầu cùng PK vs GSI tạo sau bất kỳ PK"]
      K7b["1 RCU = 4KB Strong / 8KB Eventual; 1 WCU = 1KB"]
      K7c["Streams + Lambda Trigger; TTL xóa tự động miễn phí WCU"]
      K7d["DAX microsecond Read Cache; Optimistic Locking với ConditionExpression"]
    T8["Chủ đề 8: Amazon API Gateway (Ch.23)"]
      K8a["HTTP API rẻ/nhanh vs REST API đầy đủ Cache, WAF, Usage Plan, VTL"]
      K8b["Lambda Proxy Integration; Cognito vs Lambda Custom Authorizer"]
      K8c["504 Timeout >29s; 429 Throttling; Bật CORS trả Access-Control-Allow-Origin"]
    T9["Chủ đề 9: SQS, SNS, Kinesis & EventBridge"]
      L19["Ch.19: SQS, SNS & Kinesis"]
        K19a["SQS Standard vs FIFO MessageGroupId/Dedup; Visibility Timeout + DLQ"]
        K19b["SNS Fan-out Pub/Sub + Filter Policy; Kinesis Shard 1MB/s in, 2MB/s out"]
      L31["Ch.31: EventBridge Event Bus/Scheduler, SES, Rekognition"]
    T10["Chủ đề 10: Step Functions & AppSync (Ch.28)"]
      K10a["Step Functions Standard chạy tới 1 năm/Exactly-once vs Express 5p/High-rate"]
      K10b["ASL States: Task, Choice, Parallel, Map, Wait; Retry & Catch"]
      K10c["AppSync Managed GraphQL + Real-time Subscriptions thay Cognito Sync"]
```

---

## 1.6. Nhóm 4 — Chủ đề 11 [MỚI DVA-C03]: AI, AgentCore, Guardrails, Q & Kiro

```mermaid
flowchart TD
    T11["Chủ đề 11: Chương 35.0 – 35.5 (Cập nhật DVA-C03)"]
    T11 --> C350["Ch.35.0: Tổng quan DVA-C02 -> DVA-C03"]
    T11 --> C351["Ch.35.1: Amazon Bedrock & AgentCore"]
    T11 --> C352["Ch.35.2: Amazon Q Developer & Kiro"]
    T11 --> C353["Ch.35.3: Bảo mật AI - Task 2.3"]
    T11 --> C354["Ch.35.4: Mở rộng Container, CI/CD, Observability"]
    T11 --> C355["Ch.35.5: 30 câu luyện thi chuẩn DVA-C03"]

    C350 --> K350["Domain 1: 30% | Domain 2: 26% | Domain 3: 22% | Domain 4: +4% -> 22%"]
    C351 --> K351["Converse / ConverseStream API, Retry Throttling; AgentCore: Action Group Lambda + Session + Memory + MCP"]
    C352 --> K352["Q Developer: /dev, /test, /review thay CodeGuru; Kiro: Spec-driven Dev + Steering + Hooks"]
    C353 --> K353["Bedrock Guardrails 6 Policies: PII, Denied Topics, Prompt Injection; VPC PrivateLink; Human-in-the-loop"]
    C354 --> K354["CodeConnections thay CodeCommit; ECR Immutable + Inspector; S3 Presigned URL Expiry Trap; App Signals + ADOT"]
```

---

## 1.7. Nhóm 5 — Domain 3 & Domain 4: IaC, CI/CD & Observability (Chủ đề 14, 15, 16)

```mermaid
mindmap
  root((IaC, CI/CD & Monitoring))
    T14["Chủ đề 14: IaC - CloudFormation, SAM & CDK"]
      L18["Ch.18: CloudFormation"]
        K18["Intrinsic Ref/GetAtt/Sub/ImportValue; Drift Detection; Rollback; StackSets"]
      L25["Ch.25: AWS SAM"]
        K25["Transform AWS::Serverless-2016-10-31; sam build / local invoke / deploy; Canary/Linear"]
      L26["Ch.26: AWS CDK"]
        K26["L1 CfnResource, L2 Curated, L3 Pattern; cdk synth -> CloudFormation"]
    T15["Chủ đề 15: CI/CD Pipelines (Ch.24)"]
      K15a["CodeConnections thay CodeCommit -> CodePipeline -> CodeBuild buildspec.yml"]
      K15b["CodeDeploy appspec.yml: In-place vs Blue/Green; BeforeAllowTraffic Hooks"]
      K15c["CodeArtifact lưu package npm/pip/maven nội bộ"]
    T16["Chủ đề 16: Giám sát, Truy vết & Chiến thuật thi"]
      L1["Ch.01 & Tuần 0: Diagnostic & Kế hoạch ôn 4 Domain"]
      L20["Ch.20: CloudWatch, X-Ray & CloudTrail"]
        K20a["CloudWatch Logs Insights, Metric Filter, EMF Embedded Metric Format"]
        K20b["X-Ray: Segment, Subsegment, Annotation Indexed vs Metadata Not Indexed"]
        K20c["CloudTrail Audit API Calls ai gọi gì lúc nào; ADOT & App Signals"]
      L33["Ch.33: Exam Prep - Xin +30p ESL, đọc từ khóa loại trừ bẫy"]
```

---

# Phần 2 — Sơ Đồ Luồng Chuyên Sâu, JSON/YAML Chuẩn Thi & Bẫy Kinh Điển

## 2.1. Luồng đánh giá IAM Policy & Cross-Account STS

```mermaid
flowchart TD
    Start["Request tới AWS API"] --> ExplicitDeny{"Có Explicit Deny ở SCP / Permission Boundary / IAM / Resource Policy?"}
    ExplicitDeny -->|Có| Denied["DENY (Chặn tuyệt đối)"]
    ExplicitDeny -->|Không| SameAccount{"Cùng Account?"}
    SameAccount -->|Có| AllowEither{"Identity Policy HOẶC Resource Policy có Allow?"}
    AllowEither -->|Có| BoundaryCheck{"Có Permission Boundary / Session Policy?"}
    AllowEither -->|Không| ImplicitDeny["Implicit DENY"]
    BoundaryCheck -->|Có| BothAllow{"Cả Identity & Boundary đều Allow?"}
    BoundaryCheck -->|Không| Allowed["ALLOW"]
    BothAllow -->|Có| Allowed
    BothAllow -->|Không| ImplicitDeny
    SameAccount -->|Không - Cross-Account| CrossAllow{"Identity Policy ở Account A VÀ Resource/Trust Policy ở Account B cùng Allow?"}
    CrossAllow -->|Có| Allowed
    CrossAllow -->|Không| ImplicitDeny
```

### Mẫu IAM Policy JSON hay gặp trong đề thi
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAssumeRoleWithExternalId",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::111122223333:role/PartnerReadOnly",
      "Condition": {
        "StringEquals": { "sts:ExternalId": "partner-secret-id-99" },
        "Bool": { "aws:MultiFactorAuthPresent": "true" }
      }
    }
  ]
}
```
> **Mẹo nhớ:**
> - **Cùng Account**: chỉ cần *Identity Policy* **HOẶC** *Resource Policy* (S3, SQS, KMS...) cho phép (trừ KMS Key Policy phải có `Enable IAM User Permissions` trước).
> - **Khác Account (Cross-account)**: cần **CẢ HAI** bên cùng Allow (trừ khi dùng Resource Policy trên S3/SQS/SNS không dùng `AssumeRole`).
> - `iam:PassRole`: Bắt buộc khi bạn tạo/cập nhật Lambda, EC2, ECS Task có gắn một IAM Role.

---

## 2.2. KMS Envelope Encryption (Mã hóa dữ liệu > 4 KB)

```mermaid
sequenceDiagram
    participant App as Ứng dụng (AWS SDK)
    participant KMS as AWS KMS (CMK)
    participant S3 as Amazon S3 / DB

    Note over App,KMS: Luồng Mã Hóa (Encrypt)
    App->>KMS: kms:GenerateDataKey(KeyId, KeySpec=AES_256)
    KMS-->>App: Trả về PlaintextDataKey + CiphertextBlob (Encrypted Data Key)
    App->>App: Mã hóa file lớn tại local bằng PlaintextDataKey
    App->>App: Xóa PlaintextDataKey khỏi RAM ngay lập tức
    App->>S3: Lưu [Dữ liệu đã mã hóa + CiphertextBlob]

    Note over App,KMS: Luồng Giải Mã (Decrypt)
    App->>S3: Đọc [Dữ liệu đã mã hóa + CiphertextBlob]
    App->>KMS: kms:Decrypt(CiphertextBlob)
    KMS-->>App: Trả về PlaintextDataKey
    App->>App: Giải mã dữ liệu tại local bằng PlaintextDataKey
```

> **Bẫy thi KMS:**
> - `kms:Encrypt` trực tiếp chỉ tối đa **4 KB**. File > 4 KB bắt buộc dùng **Envelope Encryption** (`GenerateDataKey`).
> - Khi dùng `GenerateDataKeyWithoutPlaintext`, KMS chỉ trả `CiphertextBlob` (dùng khi tạo key để lưu trước, giải mã sau).
> - **S3 Presigned URL + IAM Role/STS**: Nếu Lambda/EC2 dùng **STS Temporary Credentials** để ký Presigned URL với `ExpiresIn = 7 ngày`, URL vẫn **chết sớm** khi STS Session Token của Role đó hết hạn (thường 1–12 giờ)! Muốn sống đủ 7 ngày phải dùng IAM User dài hạn hoặc CloudFront Signed URL.

---

## 2.3. Vòng đời Amazon Bedrock, AgentCore & Guardrails (Mới DVA-C03)

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant App as App / Lambda
    participant Guard as Bedrock Guardrails
    participant Agent as Bedrock AgentCore
    participant Tool as Action Group (Lambda / MCP)

    User->>App: Gửi Prompt (có thể chứa PII hoặc Prompt Injection)
    App->>Guard: ApplyGuardrail / Converse kèm guardrailConfig
    alt Vi phạm Denied Topic / Prompt Attack / PII
        Guard-->>App: Chặn hoặc Mask PII trước khi vào Model
        App-->>User: Trả thông báo từ chối an toàn
    else An toàn
        Guard->>Agent: Chuyển Prompt sạch + Session Isolation (sessionId)
        Agent->>Tool: Gọi Tool qua MCP / Action Group (kiểm tra Tool AuthZ)
        alt Hành động nhạy cảm (Xóa DB / Chuyển tiền)
            Agent-->>App: Return of Control (Human-in-the-loop Approval)
            App-->>User: Yêu cầu con người xác nhận
        else Hành động đọc / an toàn
            Tool-->>Agent: Trả kết quả dữ liệu
            Agent->>Guard: Lọc Output (Contextual Grounding & Sensitive Info)
            Guard-->>User: Trả câu trả lời đã kiểm duyệt (không lưu log chứa PII)
        end
    end
```

### 6 Policies của Amazon Bedrock Guardrails (Bắt buộc thuộc cho Task 2.3)
| Policy | Tác dụng trong đề thi |
|---|---|
| **Content Filters** | Chặn Hate, Insults, Sexual, Violence, Misconduct, và **Prompt Attack** (Prompt Injection / Jailbreak) |
| **Denied Topics** | Chặn chủ đề ngoài phạm vi (ví dụ: tư vấn tài chính, chẩn đoán y khoa) |
| **Word Filters** | Chặn danh sách từ khóa cấm / tên đối thủ cụ thể |
| **Sensitive Information Filters** | Phát hiện và **Block** hoặc **Mask/Anonymize** PII/PHI (Email, SĐT, SSN, thẻ tín dụng) |
| **Contextual Grounding Check** | Phát hiện ảo giác (Hallucination) bằng cách đối chiếu câu trả lời với nguồn tài liệu (RAG) |
| **Automated Reasoning** | Kiểm tra logic câu trả lời theo bộ quy tắc nghiệp vụ hình thức |

---

## 2.4. CI/CD Pipeline, SAM, BuildSpec & AppSpec (Domain 3)

```mermaid
flowchart LR
    Git["GitHub / GitLab (AWS CodeConnections)"] --> Pipe["AWS CodePipeline"]
    Pipe --> Build["AWS CodeBuild (buildspec.yml)"]
    Build --> TestRep["Unit/Integration Test + Q Developer /review"]
    Build --> ECR["Amazon ECR (Immutable Tags + Inspector Scan)"]
    ECR --> Deploy["AWS CodeDeploy / SAM / ECS"]
    Deploy --> Hooks["BeforeAllowTraffic -> Canary/Blue-Green -> AfterAllowTraffic"]
```

### 3 file YAML cốt lõi hay hỏi trong đề thi

**1. AWS SAM (`template.yaml`) — Deploy Lambda Canary/Linear an toàn:**
```yaml
Transform: AWS::Serverless-2016-10-31
Resources:
  OrderApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs20.x
      Handler: index.handler
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          - !Ref AliasErrorMetricGreaterThanZeroAlarm
        Hooks:
          PreTraffic: !Ref PreTrafficHookFunction
          PostTraffic: !Ref PostTrafficHookFunction
```

**2. AWS CodeBuild (`buildspec.yml`) — Build, Test Report & Docker Push:**
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_URI
  build:
    commands:
      - npm test
      - docker build -t $ECR_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION .
  post_build:
    commands:
      - docker push $ECR_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION
reports:
  unit-tests:
    files: ["junit.xml"]
    file-format: JUNITXML
artifacts:
  files: ["imagedefinitions.json"]
```

**3. AWS CodeDeploy (`appspec.yml`) — ECS Blue/Green Traffic Shifting:**
```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: "web-api"
          ContainerPort: 8080
Hooks:
  - BeforeAllowTraffic: "LambdaValidationHook"
  - AfterAllowTraffic: "LambdaSmokeTestHook"
```

---

## 2.5. Sơ đồ quyết định chọn dịch vụ (Architecture Decision Tree)

### A. Chọn dịch vụ Messaging & Workflow
```mermaid
flowchart TD
    Q1{"Cần điều phối nhiều bước, retry, branch, chờ lâu?"}
    Q1 -->|Có| SF["AWS Step Functions (Standard <=1 năm / Express <=5p)"]
    Q1 -->|Không| Q2{"Cần Pub/Sub fan-out 1 -> nhiều?"}
    Q2 -->|Có| Q3{"Cần lọc theo cấu trúc JSON phức tạp / SaaS / Cron?"}
    Q3 -->|Có| EB["Amazon EventBridge"]
    Q3 -->|Không| SNS["Amazon SNS (+ SQS Fan-out)"]
    Q2 -->|Không| Q4{"Cần stream real-time theo thứ tự, nhiều consumer đọc lại?"}
    Q4 -->|Có| KDS["Amazon Kinesis Data Streams (hoặc Firehose để đẩy thẳng S3/Redshift)"]
    Q4 -->|Không| SQS["Amazon SQS (Standard throughput cao / FIFO đúng thứ tự + Dedup)"]
```

### B. Bảng xử lý lỗi & Bẫy kinh điển (Domain 4 — 22%)
| Triệu chứng / Mã lỗi | Nguyên nhân gốc & Cách sửa đúng chuẩn thi AWS |
|---|---|
| **API Gateway `504 Gateway Timeout`** | Backend chạy > **29 giây** (hard limit của API Gateway). Sửa: chuyển sang **Async** (API GW -> SQS/Step Functions -> trả `202 Accepted` + polling/WebSocket). |
| **API Gateway `502 Bad Gateway`** | Lambda trả sai định dạng JSON của Proxy Integration (thiếu `statusCode`, `headers`, hoặc `body` không phải string). |
| **API Gateway `429 Too Many Requests`** | Vượt rate limit / burst limit của Stage hoặc Usage Plan -> bật **Exponential Backoff + Jitter**, hoặc tăng Usage Plan / Caching. |
| **Lỗi CORS trên trình duyệt** | Phải bật phương thức `OPTIONS` (Mock integration) **VÀ** đảm bảo cả Lambda / Gateway Responses (`4XX`/`5XX`) đều trả header `Access-Control-Allow-Origin`. |
| **DynamoDB `ProvisionedThroughputExceededException`** | Hot Partition hoặc thiếu WCU/RCU -> phân tán Partition Key (thêm suffix ngẫu nhiên), chuyển **On-Demand**, hoặc dùng **DAX** cho read-heavy, kết hợp **Exponential Backoff + Jitter**. |
| **SQS message bị xử lý lặp lại nhiều lần** | `VisibilityTimeout` nhỏ hơn thời gian Lambda chạy -> tăng `VisibilityTimeout` >= `6x` Lambda timeout (hoặc gọi `ChangeMessageVisibility`), gắn **DLQ** với `maxReceiveCount`. |
| **Lambda bị timeout / chậm khi khởi tạo** | Di chuyển DB connection & SDK client **ra ngoài handler** (tận dụng Execution Context reuse); tăng **Memory** (tăng tỷ lệ thuận vCPU); bật **Provisioned Concurrency** hoặc **SnapStart** (Java/Python/.NET). |
| **X-Ray không tìm được trace theo `userId`** | Đang ghi vào **Metadata** (không được index) -> chuyển sang **Annotation** (key-value được index để filter trace). |

---

## 2.6. Checklist ôn thi nước rút DVA-C03
- [ ] **Xin +30 phút ESL** trên tài khoản AWS Training/Pearson VUE *trước khi* đặt lịch thi (130p -> 160p).
- [ ] Thuộc lòng **tỷ trọng mới**: Domain 1 (`30%`), Domain 2 (`26%`), Domain 3 (`22%`), Domain 4 (`22%` — tăng mạnh nhất).
- [ ] Phân biệt rạch ròi dịch vụ cũ vs mới: `CodeConnections` (thay CodeCommit), `Amazon Q Developer` (thay CodeGuru Reviewer), `CloudShell/Q/Kiro` (thay Cloud9), `AppSync` (thay Cognito Sync).
- [ ] Nắm chắc toàn bộ cụm mới ở **Chương 35.1 → 35.4**: Bedrock (`Converse`), AgentCore (Action Group/Memory/MCP), Guardrails (6 policies), Q Developer & Kiro, Task 2.3 AI Security, ADOT & Application Signals.
- [ ] Làm hết bộ **30 câu hỏi mới** (Chương 35.5) + Mock Exam `aws-dva-c03` trong `cert-prep-hub` đạt ổn định **>= 80–85%** trước ngày thi.
