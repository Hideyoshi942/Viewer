# Sơ đồ tư duy AWS DVA-C03 theo Topics & Lessons kèm Kiến thức chính

> **Cấu trúc kỳ thi DVA-C03** *(áp dụng từ 01/12/2026)*: **65 câu hỏi** (50 câu tính điểm + 15 câu thử nghiệm) · **130 phút** (+30 phút ESL) · **Điểm đỗ 720/1000**.
> **Mẹo xem:** Bấm **⤢ Phóng to** ở góc trên bên phải mỗi sơ đồ để mở toàn màn hình và zoom `+` / `-` khi học.

---

## Tổng quan: 4 Domains & 16 Topics (38 Lessons)

```mermaid
pie showData
    title Tỷ trọng điểm thi AWS DVA-C03
    "Domain 1: Development with AWS Services" : 30
    "Domain 2: Security" : 26
    "Domain 3: Testing and Deployment" : 22
    "Domain 4: Troubleshooting and Optimization" : 22
```

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

## Nhóm 1 — Domain 2: Security (Chủ đề 1, 12, 13)

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

## Nhóm 2 — Hạ tầng, Lưu trữ, DB & Containers (Chủ đề 2, 3, 4, 5)

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

## Nhóm 3 — Serverless Core, Messaging & Workflow (Chủ đề 6, 7, 8, 9, 10)

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
      L31["Ch.31: EventBridge Event Bus/Scheduler,SES, Rekognition"]
    T10["Chủ đề 10: Step Functions & AppSync (Ch.28)"]
      K10a["Step Functions Standard chạy tới 1 năm/Exactly-once vs Express 5p/High-rate"]
      K10b["ASL States: Task, Choice, Parallel, Map, Wait; Retry & Catch"]
      K10c["AppSync Managed GraphQL + Real-time Subscriptions thay Cognito Sync"]
```

---

## Nhóm 4 — Chủ đề 11 [MỚI DVA-C03]: AI, AgentCore, Guardrails, Q & Kiro

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

## Nhóm 5 — Domain 3 & Domain 4: IaC, CI/CD & Observability (Chủ đề 14, 15, 16)

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
