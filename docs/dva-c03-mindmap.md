# Sơ đồ tư duy ôn thi AWS Certified Developer - Associate (DVA-C03)

> **Cấu trúc kỳ thi DVA-C03** *(áp dụng từ 01/12/2026)*: **65 câu hỏi** (50 câu tính điểm + 15 câu thử nghiệm) · **130 phút** (+30 phút ESL = 160 phút) · **Điểm đỗ 720/1000** · Không trừ điểm câu sai.
> **Mẹo xem:** Bấm nút **⤢ Phóng to** ở góc trên bên phải mỗi sơ đồ để mở toàn màn hình và zoom `+`/`-` khi học.

---

## 1. Tỷ trọng 4 Domain trong đề thi DVA-C03

```mermaid
pie showData
    title Tỷ trọng điểm thi AWS DVA-C03
    "Domain 1: Development with AWS Services" : 30
    "Domain 2: Security" : 26
    "Domain 3: Testing and Deployment" : 22
    "Domain 4: Troubleshooting and Optimization" : 22
```

---

## 2. Sơ đồ tư duy tổng thể DVA-C03 (Toàn cảnh 4 Domain)

```mermaid
mindmap
  root((AWS DVA-C03))
    D1["Domain 1: Development (30%)"]
      Serverless["Compute & API"]
        Lambda["Lambda: Event, Layer, Alias, Version"]
        APIGW["API Gateway: REST vs HTTP, Authorizer, Stage"]
      Storage["Data & Storage"]
        DynamoDB["DynamoDB: PK/SK, GSI/LSI, Streams, DAX, TTL"]
        S3["S3: Presigned URL, Multipart, Event, CORS"]
        ElastiCache["ElastiCache: Redis vs Memcached, Lazy/Write-through"]
      Messaging["Messaging & Workflow"]
        SQS["SQS: Standard vs FIFO, Visibility Timeout, DLQ"]
        SNS["SNS: Pub/Sub Fan-out, Filter Policy"]
        EventBridge["EventBridge: Event Bus, Rule, Scheduler"]
        StepFn["Step Functions: Standard vs Express"]
        Kinesis["Kinesis: Data Streams vs Firehose"]
      AI_Dev["AI Mới trong DVA-C03"]
        Bedrock["Amazon Bedrock: InvokeModel, Converse, Streaming"]
        AgentCore["Bedrock AgentCore: Action Group, Session, MCP"]
        Q_Kiro["Amazon Q Developer & Kiro: Spec-driven Dev"]
    D2["Domain 2: Security (26%)"]
      Identity["Identity & Access"]
        IAM["IAM: Policy Evaluation, Role, STS AssumeRole"]
        Cognito["Cognito: User Pool AuthN vs Identity Pool AuthZ"]
      Encryption["Encryption & Secrets"]
        KMS["KMS: CMK, Envelope Encryption, GenerateDataKey"]
        Secrets["Secrets Manager Rotate vs SSM Parameter Store"]
      DataSec["Network & App Security"]
        S3Sec["S3: Bucket Policy, Block Public Access, OAC"]
      AISec["Task 2.3 Mới: AI Security"]
        Guardrails["Bedrock Guardrails: PII, Denied Topics, Prompt Injection"]
        Privacy["Data Privacy: Zero-retention, VPC PrivateLink"]
        AgentSec["Agent Security: Tool AuthZ, Session Isolation, Human-in-the-loop"]
    D3["Domain 3: Testing & Deployment (22%)"]
      Package["Packaging & Containers"]
        ECR["ECR: Immutable Tags, Lifecycle, Image Scan"]
        ECS["ECS / Fargate / EKS: Task Definition, IAM Task Role"]
      Testing["Testing Mới"]
        UnitInt["Local Test: SAM CLI, AWS SDK Mocking"]
        AITest["AI Test Gen: Q Developer & Kiro Regression/Coverage"]
      CICD["CI/CD & Deploy"]
        CodeSuite["CodeConnections + CodeBuild + CodeDeploy + CodePipeline"]
        DeployStrat["Strategy: AllAtOnce, Rolling, Canary, Linear, Blue/Green"]
      IaC["Infrastructure as Code"]
        CFN_SAM_CDK["CloudFormation Drift vs SAM vs CDK"]
    D4["Domain 4: Troubleshooting & Optimization (22%)"]
      Observe["Observability"]
        CW["CloudWatch: Logs Insights, Custom Metrics, Alarms"]
        Trace["X-Ray + ADOT OpenTelemetry + Application Signals"]
        AIDebug["Amazon Q Developer: Log Analysis & Root Cause"]
      Optimize["Performance & Cost"]
        LambdaOpt["Lambda: Memory=CPU, Provisioned Concurrency, SnapStart"]
        DynamoOpt["DynamoDB: Hot Partition, Adaptive Capacity, S3 Offload"]
        APIOption["API Caching & CloudFront TTL / Invalidation"]
```

---

## 3. Domain 1 (30%) — Kiến trúc Serverless & Tích hợp AI (Bedrock / AgentCore)

```mermaid
flowchart LR
    Client["Client / Web / Mobile"] --> CF["CloudFront + S3 Static / OAC"]
    Client --> APIGW["API Gateway (REST / HTTP / WebSocket)"]
    APIGW --> Auth["Cognito Authorizer / Lambda Authorizer"]
    APIGW --> Lambda["AWS Lambda"]

    Lambda -->|Sync CRUD| DDB["DynamoDB (PK/SK + GSI + DAX)"]
    Lambda -->|Large > 400KB| S3["Amazon S3 (Presigned URL)"]
    Lambda -->|Async Queue| SQS["SQS + DLQ"]
    Lambda -->|Pub/Sub| SNS["SNS Fan-out"]
    SNS --> SQS
    SQS --> Worker["Worker Lambda / ECS Fargate"]

    Lambda -->|AI Converse / Stream| Bedrock["Amazon Bedrock (FM)"]
    Bedrock -->|Safety Filter| Guard["Bedrock Guardrails"]
    Lambda -->|Agent Action| AgentCore["Bedrock AgentCore (Session + Memory + MCP)"]
```

### Từ khóa ăn điểm Domain 1
- **Lambda**: `6 MB` sync payload, `256 KB` async payload, `15 phút` max timeout, `10 GB` `/tmp`, `Env Vars` max `4 KB` (mã hóa bằng KMS), tái sử dụng DB connection ngoài handler.
- **DynamoDB**: Item max `400 KB` (lớn hơn -> lưu S3 + lưu pointer); `1 RCU = 4 KB` strong / `8 KB` eventual; `1 WCU = 1 KB`; `ProvisionedThroughputExceededException` -> Exponential Backoff + Jitter / On-Demand / DAX.
- **SQS vs SNS vs EventBridge**: SQS pull + buffer + DLQ (`MaxReceiveCount`); SNS push fan-out; EventBridge routing theo event pattern + SaaS + Scheduler.
- **Bedrock (DVA-C03 mới)**: Dùng `Converse` / `ConverseStream` API để gọi thống nhất nhiều Foundation Models; xử lý `ThrottlingException` bằng retry + backoff; dùng **AgentCore** để tách Action Groups (Lambda), Session & Memory, gọi tool qua **MCP**.

---

## 4. Domain 2 (26%) — Bảo mật & Task 2.3 AI Security

```mermaid
mindmap
  root((Domain 2: Security 26%))
    IAM_STS["IAM & STS"]
      Eval["Explicit Deny > Allow > Implicit Deny"]
      AssumeRole["STS AssumeRole: Cross-account, Temporary Creds"]
      PassRole["iam:PassRole: Giao Role cho Lambda/ECS/EC2"]
      ExecRole["Lambda Execution Role vs Resource Policy"]
    Cognito["Amazon Cognito"]
      UserPool["User Pool: Đăng nhập, JWT ID/Access/Refresh Token"]
      IdentityPool["Identity Pool: Đổi Token lấy AWS Creds tạm STS"]
    KMS_Secrets["KMS & Secrets"]
      Envelope["Envelope Encryption: GenerateDataKey -> Data Key"]
      KMSLimit["KMS Encrypt trực tiếp max 4 KB"]
      SecretsMgr["Secrets Manager: Tự động Rotate DB Password"]
      SSM["SSM Parameter Store: Rẻ, lưu config phân cấp"]
    AISecurity["Task 2.3 Mới: AI Security"]
      Guardrails["Bedrock Guardrails: Chặn PII, Toxic, Prompt Injection"]
      PrivateLink["VPC Endpoint PrivateLink: Không đi qua Internet"]
      ZeroTrain["Data Privacy: Dữ liệu không dùng để train lại model"]
      AgentControl["Agent: Least-privilege Tool AuthZ + Human-in-the-loop"]
      LogMask["Che giấu PII trước khi ghi CloudWatch / Invocation Logs"]
```

---

## 5. Domain 3 (22%) — Testing, Container & CI/CD

```mermaid
flowchart LR
    Dev["Code + Spec (Kiro / Amazon Q)"] --> Test["Unit & Integration Test (SAM CLI local / AI Test Gen)"]
    Test --> Conn["GitHub / GitLab via AWS CodeConnections"]
    Conn --> Pipe["AWS CodePipeline"]
    Pipe --> Build["CodeBuild (buildspec.yml + Docker Build + ECR Scan)"]
    Build --> ECR["Amazon ECR (Immutable Tags + Lifecycle)"]
    ECR --> Deploy["CodeDeploy / ECS Fargate / EKS"]
    Deploy --> Strat["Canary / Linear / Blue-Green (AppSpec.yml + Hooks)"]
```

### Từ khóa ăn điểm Domain 3
- **CodeConnections** thay cho CodeCommit (đã ngừng nhận khách mới); **Amazon Q Developer** (`/review`) thay CodeGuru Reviewer.
- **SAM (`template.yaml`)**: `sam build` -> `sam local invoke` (test local với Docker) -> `sam deploy`; hỗ trợ `AutoPublishAlias` + `DeploymentPreference: Canary10Percent5Minutes` / `Linear` / `AllAtOnce`.
- **CodeDeploy**: `appspec.yml` (EC2/ECS/Lambda); `BeforeAllowTraffic` / `AfterAllowTraffic` hooks để chạy validation test trước khi chuyển 100% traffic.
- **ECR**: Bật **Immutable Image Tags** (tránh ghi đè `latest`), **Enhanced Scanning (Inspector)** tìm CVE, **Lifecycle Policy** xóa image cũ.

---

## 6. Domain 4 (22%) — Troubleshooting & Optimization

```mermaid
mindmap
  root((Domain 4: Troubleshoot & Optimize 22%))
    Observability["Giám sát & Truy vết"]
      CWLogs["CloudWatch Logs Insights: Filter, Parse JSON, Retention"]
      CWMetrics["Custom Metric: PutMetricData hoặc EMF Embedded Metric"]
      XRay["AWS X-Ray: Segment, Subsegment, Annotation Indexed vs Metadata"]
      AppSignals["CloudWatch Application Signals & ADOT OpenTelemetry"]
      QDebug["Amazon Q Developer: Phân tích lỗi log & gợi ý sửa code"]
    Optimization["Tối ưu hiệu năng & chi phí"]
      LambdaTune["Lambda: Tăng Memory -> tăng CPU; SnapStart Java/Python/.NET"]
      ColdStart["Cold Start: Giảm package size, Provisioned Concurrency"]
      DynamoTune["DynamoDB: Tránh Hot Key, DAX cho Read-heavy, BatchGet/Write"]
      Cache["API Gateway Stage Cache vs CloudFront Edge Cache"]
    CommonErrors["Lỗi kinh điển hay hỏi"]
      Err4xx["403 Missing Auth Token / 429 Too Many Requests"]
      Err5xx["502 Bad Gateway Lambda sai format / 504 Timeout > 29s API GW"]
      CorsErr["CORS lỗi -> bật OPTIONS + Access-Control-Allow-Origin cả lỗi 4xx/5xx"]
```

---

## 7. Bảng chuyển dịch DVA-C02 → DVA-C03 (Nhớ nhanh tránh bẫy)

| Dịch vụ / Chủ đề cũ (DVA-C02) | Thay thế / Cập nhật mới trong DVA-C03 |
|---|---|
| **AWS CodeCommit** | Dùng **AWS CodeConnections** kết nối GitHub / GitLab / Bitbucket |
| **AWS Cloud9** | Dùng **AWS CloudShell** hoặc IDE local + **Amazon Q Developer** / **Kiro** |
| **Amazon CodeGuru Reviewer** | Dùng **Amazon Q Developer** (`/review`, security scan) & **Amazon Inspector** |
| **Amazon Cognito Sync** | Dùng **AWS AppSync** |
| **Tích hợp AI & Agent** *(mới)* | **Amazon Bedrock** (`Converse`, Streaming), **Bedrock AgentCore**, **Bedrock Guardrails** |
| **Truy vết & Chẩn đoán** *(tăng +4%)* | **X-Ray**, **ADOT (OpenTelemetry)**, **CloudWatch Application Signals**, **Amazon Q** |
