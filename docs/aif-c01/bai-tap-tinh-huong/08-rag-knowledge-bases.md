# Bài tập tình huống — RAG & Knowledge Bases for Amazon Bedrock

> Kiến trúc Retrieval-Augmented Generation (RAG), Chunking strategies, Vector Databases (OpenSearch Serverless, Aurora pgvector, Pinecone) và trích dẫn nguồn giảm Hallucination.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A legal tech company is building a RAG application using Amazon Bedrock Knowledge Bases over lengthy, multi-section regulatory PDFs. Fixed-size chunking frequently splits paragraphs mid-sentence and loses surrounding context. They want to search precise small child chunks while returning broader parent sections to the LLM. Which chunking strategy should they select?

- **A.** Hierarchical chunking
- **B.** No chunking
- **C.** Fixed-size chunking with 0% overlap
- **D.** Random token sampling

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty công nghệ pháp lý đang xây dựng ứng dụng RAG bằng Amazon Bedrock Knowledge Bases trên các tệp PDF quy định dài và có nhiều phần. Việc chia đoạn kích thước cố định (fixed-size chunking) thường cắt ngang đoạn văn giữa câu và làm mất ngữ cảnh xung quanh. Họ muốn tìm kiếm trên các đoạn con (child chunks) nhỏ, chính xác trong khi trả về các phần cha (parent sections) rộng hơn cho LLM. Họ nên chọn chiến lược chunking nào?

**Đáp án đúng:** **A**

Bedrock Knowledge Bases hỗ trợ 4 chiến lược chunking: Default/Fixed-size, Hierarchical (Parent-Child giúp cân bằng độ chính xác tìm kiếm và ngữ cảnh rộng), Semantic (cắt theo ngữ nghĩa) và No chunking (cho file ngắn).

- **A (Đúng):** Chính xác. Hierarchical chunking chia tài liệu thành 2 cấp: Child chunks nhỏ (để tìm kiếm vector chính xác) và Parent chunks lớn (để trả về đầy đủ ngữ cảnh cho LLM sinh câu trả lời).
- **B:** Sai. No chunking giữ nguyên toàn bộ file PDF làm 1 chunk, không phù hợp với tài liệu pháp lý dài nhiều chương.
- **C:** Sai. Fixed-size không overlap sẽ càng làm mất ngữ cảnh tại ranh giới cắt.
- **D:** Sai. Đây không phải là chiến lược chunking của Bedrock Knowledge Bases.

</details>

### Câu 2 `medium`

A customer support team has a RAG pipeline on Amazon Bedrock Knowledge Bases, but the top 10 retrieved document chunks often contain less relevant passages ranked above the best answer. Which feature should they enable to reorder the retrieved chunks by semantic relevance before passing them to the Foundation Model?

- **A.** Migrating vector storage from OpenSearch Serverless to Amazon S3 Glacier
- **B.** Reranking retrieved chunks using a reranker model in Bedrock Knowledge Bases
- **C.** Disabling vector embeddings and running SQL LIKE wildcard queries instead
- **D.** Setting the foundation model Temperature parameter to 0.9 during generation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ hỗ trợ khách hàng có một pipeline RAG trên Amazon Bedrock Knowledge Bases, nhưng 10 đoạn tài liệu được truy xuất hàng đầu thường chứa các đoạn ít liên quan hơn được xếp hạng cao hơn câu trả lời tốt nhất. Họ nên bật tính năng nào để sắp xếp lại các đoạn đã truy xuất theo mức độ liên quan ngữ nghĩa trước khi truyền cho Foundation Model?

**Đáp án đúng:** **B**

Reranking là bước tinh chỉnh quan trọng trong RAG giúp tăng độ chính xác của ngữ cảnh đưa vào LLM bằng cách sắp xếp lại kết quả từ Vector DB.

- **A:** Sai. S3 Glacier là kho lưu trữ lạnh, không thể dùng làm Vector Database cho RAG.
- **B (Đúng):** Chính xác. Reranking đánh giá lại mức độ liên quan ngữ nghĩa giữa câu hỏi và từng đoạn văn bản truy xuất được, đưa các đoạn chính xác nhất lên đầu trước khi gửi cho LLM.
- **C:** Sai. Truy vấn từ khóa SQL LIKE mất đi khả năng tìm kiếm ngữ nghĩa của Vector Search.
- **D:** Sai. Temperature cao chỉ làm LLM trả lời ngẫu nhiên hơn, không cải thiện thứ tự truy xuất tài liệu.

</details>

### Câu 3 `medium`

A solutions architect is designing a Retrieval-Augmented Generation (RAG) solution using Amazon Bedrock Knowledge Bases. Which TWO AWS-managed vector stores are natively supported as the vector database? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon OpenSearch Serverless
- **B.** Amazon Aurora PostgreSQL with pgvector
- **C.** Amazon Redshift Spectrum
- **D.** Amazon ElastiCache for Memcached
- **E.** Amazon S3 Glacier Deep Archive

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư giải pháp đang thiết kế giải pháp Retrieval-Augmented Generation (RAG) bằng Amazon Bedrock Knowledge Bases. HAI vector store được AWS quản lý nào được hỗ trợ gốc (natively supported) làm cơ sở dữ liệu vector? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Các Vector Database phổ biến được Bedrock Knowledge Bases hỗ trợ gồm: Amazon OpenSearch Serverless, Amazon Aurora PostgreSQL (pgvector), Pinecone, Redis Enterprise Cloud và MongoDB Atlas.

- **A (Đúng):** Chính xác. Amazon OpenSearch Serverless là vector store mặc định và được hỗ trợ gốc bởi Bedrock Knowledge Bases.
- **B (Đúng):** Chính xác. Amazon Aurora PostgreSQL (cùng extension pgvector) được hỗ trợ trực tiếp làm vector store trong Bedrock Knowledge Bases.
- **C:** Sai. Redshift Spectrum dùng để truy vấn dữ liệu phân tích trên S3, không phải vector store được hỗ trợ gốc bởi Bedrock Knowledge Bases.
- **D:** Sai. Memcached không hỗ trợ tìm kiếm vector cho Bedrock Knowledge Bases (chỉ Redis Enterprise Cloud được hỗ trợ trong nhóm đối tác).
- **E:** Sai. S3 Glacier là dịch vụ lưu trữ lưu trữ lạnh, không phải vector database.

</details>

### Câu 4 `medium`

A company wants to build an internal HR chatbot that answers employee questions using frequently updated PDF policy documents stored in Amazon S3, and provides source citations for every answer. Which architecture should the company implement?

- **A.** Fine-tune a Foundation Model every night whenever an internal policy PDF document changes
- **B.** Use Retrieval-Augmented Generation (RAG) with Knowledge Bases for Amazon Bedrock
- **C.** Paste the full text of all company policy PDFs into the system prompt of every API call
- **D.** Use Amazon Translate to convert updated PDF policy documents into vector embeddings

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn xây dựng chatbot nhân sự (HR) nội bộ trả lời câu hỏi của nhân viên bằng các tài liệu chính sách PDF thường xuyên được cập nhật lưu trữ trong Amazon S3, và cung cấp trích dẫn nguồn cho mọi câu trả lời. Công ty nên triển khai kiến trúc nào?

**Đáp án đúng:** **B**

RAG (đặc biệt qua Knowledge Bases for Amazon Bedrock) là giải pháp chuẩn cho bài toán dữ liệu nội bộ thay đổi thường xuyên và yêu cầu trích dẫn nguồn minh bạch.

- **A:** Sai. Fine-tuning tốn kém, chậm và không đảm bảo mô hình trích dẫn chính xác nguồn tài liệu khi dữ liệu thay đổi thường xuyên.
- **B (Đúng):** Chính xác. Knowledge Bases for Amazon Bedrock tự động đồng bộ tài liệu từ S3, chia chunk, tạo vector embeddings và truy xuất ngữ cảnh mới nhất kèm trích dẫn (citations) cho FM.
- **C:** Sai. Đưa toàn bộ PDF vào prompt sẽ vượt quá giới hạn Context Window và cực kỳ tốn kém chi phí input token.
- **D:** Sai. Amazon Translate dịch ngôn ngữ, không tạo vector embeddings.

</details>

### Câu 5 `medium`

A developer is configuring Knowledge Bases for Amazon Bedrock and wants to use a fully managed, serverless AWS vector database that scales automatically without managing clusters. Which vector store option meets this requirement?

- **A.** Amazon OpenSearch Serverless
- **B.** Amazon S3 Glacier Deep Archive
- **C.** Amazon Redshift Spectrum
- **D.** AWS Snowball Edge

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang cấu hình Knowledge Bases for Amazon Bedrock và muốn sử dụng một vector database AWS được quản lý hoàn toàn, không máy chủ (serverless), tự động mở rộng quy mô mà không cần quản lý cluster. Tùy chọn vector store nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

Knowledge Bases for Amazon Bedrock hỗ trợ các vector store gồm: Amazon OpenSearch Serverless, Amazon Aurora PostgreSQL (pgvector), Pinecone, Redis Enterprise Cloud và MongoDB Atlas.

- **A (Đúng):** Chính xác. Amazon OpenSearch Serverless là lựa chọn vector store mặc định và phổ biến nhất trong Knowledge Bases for Amazon Bedrock, tự động mở rộng không cần quản lý server.
- **B:** Sai. S3 Glacier là kho lưu trữ lạnh dài hạn, không phải vector database để tìm kiếm tương đồng thời gian thực.
- **C:** Sai. Redshift là Data Warehouse cho phân tích SQL, không phải vector store được Bedrock Knowledge Bases hỗ trợ mặc định.
- **D:** Sai. Snowball Edge là thiết bị phần cứng vận chuyển dữ liệu vật lý.

</details>

### Câu 6 `hard`

A team is building a RAG pipeline over 200-page financial reports and observes that retrieved text chunks often lose surrounding context or cut off tables mid-sentence. Which TWO techniques can improve retrieval quality? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set the fixed chunk size to 10 tokens with zero overlap across page boundaries
- **B.** Set Temperature to 1.0 in the embedding model to diversify vector representations
- **C.** Configure chunking overlap or use hierarchical and semantic chunking strategies
- **D.** Disable vector similarity search and rely solely on random chunk selection
- **E.** Attach document metadata (year, department, section) to enable metadata filtering

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ đang xây dựng pipeline RAG trên các báo cáo tài chính dài 200 trang và nhận thấy các đoạn văn bản được truy xuất thường bị mất ngữ cảnh xung quanh hoặc cắt ngang bảng biểu giữa chừng. HAI kỹ thuật nào có thể cải thiện chất lượng truy xuất? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Chất lượng của hệ thống RAG phụ thuộc rất lớn vào chiến lược Chunking (chunk size, overlap, semantic/hierarchical chunking) và Metadata Filtering để truy xuất đúng đoạn văn bản giàu ngữ cảnh.

- **A:** Sai. Chunk 10 token quá nhỏ, làm vụn ngữ cảnh và phá vỡ cấu trúc bảng biểu.
- **B:** Sai. Embedding model chuyển văn bản thành vector cố định và không có tham số Temperature.
- **C (Đúng):** Chính xác. Chunk overlap giúp giữ ngữ cảnh chuyển tiếp giữa các đoạn, còn hierarchical/semantic chunking chia theo cấu trúc ngữ nghĩa thay vì cắt cứng theo số ký tự.
- **D:** Sai. Chọn ngẫu nhiên sẽ phá hủy độ chính xác của hệ thống RAG.
- **E (Đúng):** Chính xác. Metadata filtering giúp thu hẹp phạm vi tìm kiếm đúng tài liệu/năm tài chính trước khi xếp hạng tương đồng vector.

</details>

### Câu 7 `medium`

A RAG application queries an engineering knowledge base where users frequently search for exact part numbers (such as 'SKU-9942-B') as well as conceptual questions (such as 'how to calibrate the pressure valve'). Pure vector search occasionally misses exact part numbers. What retrieval strategy should the team implement?

- **A.** Increase the Foundation Model's Temperature parameter to 1.0 for variety
- **B.** Strip all numeric product codes from documents before generating embeddings
- **C.** Hybrid search combining keyword search (BM25) and vector semantic search
- **D.** Use Zero-shot prompting directly without connecting a Knowledge Base

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng RAG truy vấn cơ sở tri thức kỹ thuật nơi người dùng thường xuyên tìm kiếm mã phụ tùng chính xác (như 'SKU-9942-B') cũng như các câu hỏi khái niệm (như 'cách hiệu chỉnh van áp suất'). Tìm kiếm vector thuần túy thỉnh thoảng bỏ sót các mã phụ tùng chính xác. Đội ngũ nên triển khai chiến lược truy xuất nào?

**Đáp án đúng:** **C**

Hybrid Search (Keyword + Vector) là best practice trong RAG thực tế (như trên Amazon OpenSearch Serverless) để giải quyết điểm yếu của pure vector search với mã sản phẩm, tên riêng hoặc thuật ngữ hiếm.

- **A:** Sai. Temperature chỉ ảnh hưởng lúc sinh văn bản, không sửa được lỗi truy xuất sai mã SKU từ vector database.
- **B:** Sai. Xóa mã số SKU sẽ làm mất hoàn toàn thông tin cần tìm.
- **C (Đúng):** Chính xác. Hybrid Search kết hợp tìm kiếm từ khóa chính xác (BM25/lexical) cho mã sản phẩm/SKU và tìm kiếm vector ngữ nghĩa (semantic search) cho câu hỏi khái niệm.
- **D:** Sai. Mô hình nền tảng không biết mã SKU nội bộ nếu không có RAG.

</details>

### Câu 8 `medium`

A company wants to use Knowledge Bases for Amazon Bedrock, but they already operate an existing relational database on AWS and want to store vector embeddings inside it using the pgvector extension. Which AWS database service is natively supported by Bedrock Knowledge Bases for this purpose?

- **A.** Amazon Aurora PostgreSQL
- **B.** Amazon DynamoDB
- **C.** Amazon ElastiCache for Memcached
- **D.** Amazon Timestream

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn sử dụng Knowledge Bases for Amazon Bedrock, nhưng họ đã vận hành sẵn một cơ sở dữ liệu quan hệ trên AWS và muốn lưu trữ vector embeddings bên trong đó bằng extension pgvector. Dịch vụ cơ sở dữ liệu AWS nào được Bedrock Knowledge Bases hỗ trợ gốc (natively supported) cho mục đích này?

**Đáp án đúng:** **A**

Nếu doanh nghiệp muốn tận dụng hạ tầng PostgreSQL quen thuộc thay vì OpenSearch Serverless, Amazon Aurora PostgreSQL với `pgvector` là lựa chọn được Bedrock Knowledge Bases hỗ trợ gốc.

- **A (Đúng):** Chính xác. Amazon Aurora PostgreSQL (với extension pgvector) là một trong các vector store được Knowledge Bases for Amazon Bedrock hỗ trợ chính thức.
- **B:** Sai. DynamoDB là NoSQL key-value/document database, không hỗ trợ pgvector.
- **C:** Sai. Memcached là cache đơn giản trong bộ nhớ, không phải vector store được Bedrock Knowledge Bases hỗ trợ.
- **D:** Sai. Timestream là cơ sở dữ liệu chuỗi thời gian (time-series).

</details>

### Câu 9 `medium`

A solutions architect is designing a RAG architecture using Knowledge Bases for Amazon Bedrock and needs to select a supported AWS-managed vector database to store document embeddings. Which TWO AWS services can serve as the vector store? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon S3 Glacier Deep Archive storage
- **B.** Amazon OpenSearch Serverless vector engine
- **C.** Amazon Simple Queue Service (SQS) FIFO
- **D.** Amazon Aurora PostgreSQL with pgvector
- **E.** Amazon Route 53 private hosted zones

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư giải pháp đang thiết kế kiến trúc RAG sử dụng Knowledge Bases for Amazon Bedrock và cần chọn một vector database được AWS quản lý có hỗ trợ để lưu trữ các document embeddings. HAI dịch vụ AWS nào có thể đóng vai trò là vector store? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Knowledge Bases for Amazon Bedrock hỗ trợ các vector store quản lý trên AWS phổ biến nhất gồm Amazon OpenSearch Serverless và Amazon Aurora PostgreSQL (pgvector), bên cạnh các đối tác như Pinecone và Redis Enterprise.

- **A:** Sai. S3 Glacier Deep Archive là lớp lưu trữ lạnh dài hạn, không hỗ trợ truy vấn tương đồng vector theo thời gian thực.
- **B (Đúng):** Chính xác. Amazon OpenSearch Serverless (Vector Engine) là vector store mặc định và được hỗ trợ đầy đủ bởi Knowledge Bases for Amazon Bedrock.
- **C:** Sai. Amazon SQS là dịch vụ hàng đợi tin nhắn (Message Queue), không phải cơ sở dữ liệu vector.
- **D (Đúng):** Chính xác. Amazon Aurora PostgreSQL cài đặt extension pgvector được hỗ trợ chính thức làm Vector Store cho Knowledge Bases for Amazon Bedrock.
- **E:** Sai. Amazon Route 53 là dịch vụ DNS, không lưu trữ embeddings.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
