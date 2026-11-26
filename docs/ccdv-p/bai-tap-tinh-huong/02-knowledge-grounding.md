# Bài tập tình huống — Chủ đề 2: Enterprise Knowledge Grounding (Hybrid Search, Contextual Retrieval & Citations)

> Kết hợp BM25 + Dense Vector Search, Cross-Encoder Reranking, Contextual Retrieval và Citations API để giảm ảo giác và đảm bảo truy xuất nguồn tin cậy.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A payment-dispute assistant invokes the Anthropic API and writes the resulting decision to a downstream ledger. During network blips, the client retries timed-out requests, occasionally creating duplicate ledger entries. How should the engineering team eliminate duplicate side effects?

- **A.** Disable all automatic retries in the Anthropic SDK client configuration and surface every transient network timeout directly to the end user.
- **B.** Attach a unique idempotency key per dispute workflow to downstream writes and deduplicate retries before committing to the ledger.
- **C.** Set `temperature` to 0.0 and `top_p` to 1.0 on all Claude requests so retried calls produce identical text that merges automatically in the database.
- **D.** Enable Prompt Caching on the system prompt so the Anthropic API returns the cached assistant completion instead of executing a second inference.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý giải quyết tranh chấp thanh toán gọi Anthropic API và ghi quyết định kết quả vào một sổ cái (ledger) phía sau. Khi mạng chập chờn, client thử lại các request bị timeout, thỉnh thoảng tạo ra các bản ghi sổ cái trùng lặp. Nhóm kỹ thuật nên loại bỏ các tác dụng phụ trùng lặp (duplicate side effects) bằng cách nào?

**Đáp án đúng:** **B**

Trong các hệ thống phân tán có retry, idempotency key là bắt buộc cho mọi thao tác ghi (write/mutate) để đảm bảo ngữ nghĩa at-least-once delivery không gây ra duplicate side effects.

- **A:** Tắt hoàn toàn retry sẽ làm giảm độ tin cậy của hệ thống trước các lỗi mạng thoáng qua (transient errors).
- **B (Đúng):** Sử dụng idempotency key duy nhất cho mỗi workflow giúp hệ thống downstream nhận diện các lần retry trùng lặp và đảm bảo chỉ ghi sổ cái đúng một lần.
- **C:** Temperature 0.0 không đảm bảo tính tất định tuyệt đối và cũng không tự động gộp các bản ghi trùng lặp ở tầng cơ sở dữ liệu.
- **D:** Prompt Caching chỉ cache tiền tố KV ở phía inference để giảm chi phí/độ trễ, không phải cơ chế deduplicate side effects.

</details>

### Câu 2 `hard`

An enterprise RAG pipeline uses dense vector embeddings exclusively for legal contract search. Users report that queries containing exact clause numbers such as 'Section 14.2(b)' or proprietary SKU codes frequently miss the exact document. Which retrieval upgrade directly resolves this failure mode?

- **A.** Increase the embedding vector dimension from 1024 to 3072 in the vector store while keeping pure cosine similarity search for all queries.
- **B.** Reduce the chunk overlap to zero tokens during ingestion so that each section number appears in only a single isolated vector record.
- **C.** Combine BM25 lexical search with dense vector retrieval using Reciprocal Rank Fusion followed by a cross-encoder reranker.
- **D.** Replace the vector database with a giant context-window prompt that stuffs all 500 enterprise legal contracts into every Claude request.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline RAG doanh nghiệp chỉ sử dụng dense vector embeddings để tìm kiếm hợp đồng pháp lý. Người dùng báo cáo rằng các truy vấn chứa số điều khoản chính xác như 'Section 14.2(b)' hoặc mã SKU độc quyền thường bỏ sót đúng tài liệu cần tìm. Nâng cấp truy xuất (retrieval upgrade) nào giải quyết trực tiếp chế độ lỗi này?

**Đáp án đúng:** **C**

Dense embeddings giỏi nắm bắt ngữ nghĩa nhưng yếu với exact lexical tokens (mã SKU, số điều khoản). Hybrid Search (BM25 + Dense + RRF) kết hợp Cross-Encoder Reranking là chuẩn mực production cho RAG chính xác cao.

- **A:** Tăng số chiều vector vẫn không khắc phục được điểm yếu cố hữu của dense embedding đối với mã định danh chính xác hoặc từ khóa hiếm.
- **B:** Giảm overlap không giải quyết vấn đề khớp từ khóa chính xác (exact lexical match) và có thể làm mất ngữ cảnh ở ranh giới chunk.
- **C (Đúng):** Hybrid Search kết hợp BM25 (khớp chính xác mã hiệu/từ khóa) và Dense Vector (ngữ nghĩa) qua RRF, sau đó tinh chỉnh bằng cross-encoder reranker, giải quyết triệt để lỗi bỏ sót mã điều khoản.
- **D:** Nhồi toàn bộ 500 hợp đồng vào prompt vượt quá giới hạn context, gây chi phí cực lớn và độ trễ cao không khả thi ở production.

</details>

### Câu 3 `hard`

During ingestion of financial reports, chunks containing tables of quarterly revenue lose their company name and fiscal year headers because those headers reside at the top of the document. When retrieved, Claude misattributes figures to the wrong quarter. Which technique best solves this?

- **A.** Enable extended thinking with a 16,000-token thinking budget on user queries without modifying the underlying chunking or indexing pipeline.
- **B.** Lower the retrieval top-k parameter from 20 to 3 in the vector query so that fewer ambiguous table chunks enter the model's context window.
- **C.** Strip all numeric revenue tables during PDF ingestion and instruct Claude to reconstruct quarterly figures solely from surrounding prose.
- **D.** Apply Contextual Retrieval by prepending a concise LLM-generated situational summary to each chunk before embedding and BM25 indexing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong quá trình nạp (ingestion) các báo cáo tài chính, các chunk chứa bảng doanh thu theo quý bị mất tên công ty và tiêu đề năm tài chính vì các tiêu đề đó nằm ở đầu tài liệu. Khi được truy xuất, Claude gán nhầm số liệu cho sai quý. Kỹ thuật nào giải quyết tốt nhất vấn đề này?

**Đáp án đúng:** **D**

Contextual Retrieval (do Anthropic đề xuất) giải quyết trực tiếp vấn đề chunk bị mất ngữ cảnh (orphaned chunks) bằng cách bổ sung tiền tố ngữ cảnh trước khi index cả vector lẫn BM25.

- **A:** Extended thinking không thể tự suy ra tên công ty hay quý tài chính nếu bản thân các chunk được truy xuất không chứa thông tin đó.
- **B:** Giảm top-k không bổ sung thông tin bị thiếu trong chunk mà còn tăng nguy cơ bỏ sót tài liệu đúng.
- **C:** Loại bỏ bảng số liệu tài chính làm mất dữ liệu cốt lõi và ép mô hình suy đoán, dẫn đến hallucination nghiêm trọng.
- **D (Đúng):** Contextual Retrieval tạo phần mô tả ngữ cảnh ngắn gọn (tên công ty, quý tài chính, mục lục) gắn vào đầu mỗi chunk trước khi tạo embedding và chỉ mục BM25, giữ nguyên ngữ cảnh cho bảng biểu.

</details>

### Câu 4 `medium`

A global fintech application runs Claude in production via Amazon Bedrock in `us-east-1`. To meet a 99.95% availability SLA against regional cloud outages, the architecture team wants automated failover. Which design satisfies this requirement?

- **A.** Configure a single-region Bedrock endpoint with 20 sequential retries and a 5-minute timeout before failing the incoming user request.
- **B.** Implement a provider abstraction layer that fails over across Bedrock regions or to Vertex AI / Anthropic direct API on health degradation.
- **C.** Pre-cache every possible user prompt and financial response in a distributed Redis cluster so the LLM provider is never needed during outages.
- **D.** Run a local 1B-parameter quantized model inside the user's browser via WebAssembly as the primary inference engine for complex financial advice.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng fintech toàn cầu chạy Claude trên production thông qua Amazon Bedrock tại `us-east-1`. Để đáp ứng SLA khả dụng 99.95% trước các sự cố gián đoạn đám mây theo vùng, nhóm kiến trúc muốn có cơ chế chuyển đổi dự phòng tự động (automated failover). Thiết kế nào đáp ứng yêu cầu này?

**Đáp án đúng:** **B**

Để đạt SLA 99.95% cho hệ thống AI critical, kiến trúc chuẩn là multi-region failover (ví dụ Bedrock cross-region inference hoặc failover giữa Bedrock, Vertex AI và Anthropic API).

- **A:** Retry trong cùng một region đang gặp sự cố sẽ không bao giờ thành công và làm tăng độ trễ nghiêm trọng.
- **B (Đúng):** Lớp abstraction đa vùng/đa nhà cung cấp (multi-region Bedrock hoặc fallback sang Vertex AI / Anthropic API) đảm bảo tính sẵn sàng cao khi một region hoặc provider gặp sự cố.
- **C:** Không thể cache trước mọi câu hỏi tự do của người dùng trong ứng dụng fintech tương tác thời gian thực.
- **D:** Mô hình 1B trên trình duyệt không đủ năng lực suy luận tài chính phức tạp và không đáp ứng chuẩn bảo mật/kiểm soát doanh nghiệp.

</details>

### Câu 5 `hard`

A medical Q&A assistant must guarantee that every clinical claim in its response is strictly grounded in retrieved hospital guidelines, with verifiable inline citations. Even with a warning in the system prompt, Claude occasionally blends general pretraining knowledge into answers. Which implementation enforces strict grounding?

- **A.** Set `temperature` to 0.9 and `top_k` to 50 to encourage more creative synthesis across all retrieved clinical guideline documents.
- **B.** Increase `max_tokens` to 8192 and add bold uppercase warnings in the system prompt so Claude avoids using any external pretraining facts.
- **C.** Use structured outputs requiring each claim to reference an exact `document_id` and verbatim quote, then verify quotes programmatically.
- **D.** Remove all retrieved hospital chunks from the prompt and rely solely on Claude's built-in medical knowledge with a disclaimer banner.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý hỏi đáp y tế phải đảm bảo rằng mọi khẳng định lâm sàng trong phản hồi của nó đều bám sát hoàn toàn vào các hướng dẫn bệnh viện đã truy xuất, kèm theo trích dẫn nội tuyến có thể kiểm chứng. Ngay cả khi có cảnh báo trong system prompt, Claude thỉnh thoảng vẫn trộn lẫn kiến thức tiền huấn luyện (pretraining knowledge) chung vào câu trả lời. Cách triển khai nào thực thi việc bám sát dữ liệu gốc (strict grounding) một cách chặt chẽ?

**Đáp án đúng:** **C**

Trong lĩnh vực rủi ro cao như y tế/pháp lý, chỉ nhắc nhở bằng system prompt là chưa đủ. Cần kết hợp Structured Output (bắt buộc kèm `doc_id` + verbatim quote) và bước hậu kiểm deterministic (kiểm tra quote có thực sự tồn tại trong chunk gốc).

- **A:** Temperature cao làm tăng tính ngẫu nhiên và nguy cơ hallucination, hoàn toàn đi ngược yêu cầu y khoa chính xác.
- **B:** Tăng `max_tokens` hay viết hoa cảnh báo không ngăn mô hình dùng kiến thức pretraining một cách đảm bảo.
- **C (Đúng):** Ép đầu ra có cấu trúc (structured output) gắn `document_id` và trích dẫn nguyên văn (verbatim quote), sau đó kiểm chứng chuỗi trích dẫn bằng code (programmatic verification) trước khi hiển thị.
- **D:** Bỏ RAG làm mất hoàn toàn khả năng kiểm chứng theo hướng dẫn nội bộ của bệnh viện.

</details>

### Câu 6 `hard`

A RAG system retrieves top-50 candidate chunks using hybrid search and passes all 50 chunks directly to Claude Sonnet. Accuracy is lower than expected, and latency exceeds 6 seconds per query. Profiling shows the relevant answer is often ranked at position 28. What is the most effective architectural improvement?

- **A.** Replace hybrid search with random sampling across the document index to reduce vector database CPU utilization during peak hours.
- **B.** Increase the candidate retrieval count from 50 to 200 chunks in the vector query so Claude has even more surrounding context to read.
- **C.** Insert a cross-encoder reranker to score the top-50 candidates and pass only the top-5 to top-8 chunks to Claude.
- **D.** Duplicate the top-50 retrieved chunks twice inside the user message to reinforce important paragraphs in the attention mechanism.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống RAG truy xuất top-50 chunk ứng viên bằng hybrid search và truyền trực tiếp cả 50 chunk cho Claude Sonnet. Độ chính xác thấp hơn kỳ vọng và độ trễ vượt quá 6 giây mỗi truy vấn. Kết quả đo đạc (profiling) cho thấy câu trả lời liên quan thường nằm ở vị trí xếp hạng thứ 28. Cải tiến kiến trúc nào hiệu quả nhất?

**Đáp án đúng:** **C**

Two-stage retrieval (Recall cao ở stage 1 với top-50 Hybrid Search, Precision cao ở stage 2 với Cross-Encoder Reranker lọc xuống top 5-8) là mẫu kiến trúc chuẩn để tối ưu cả độ chính xác lẫn chi phí/độ trễ.

- **A:** Lấy mẫu ngẫu nhiên phá hủy hoàn toàn chất lượng truy xuất thông tin.
- **B:** Tăng lên 200 chunk làm context phình to, tăng độ trễ, tăng chi phí và làm trầm trọng thêm nhiễu thông tin.
- **C (Đúng):** Cross-encoder reranker đánh giá sâu sự tương tác giữa query và từng chunk để đưa đoạn liên quan nhất (từ vị trí 28) lên top 5-8, vừa giảm mạnh token/độ trễ vừa khắc phục hiện tượng lost-in-the-middle.
- **D:** Nhân đôi 50 chunk chỉ làm tốn gấp đôi input token mà không cải thiện thứ hạng của đoạn văn đúng.

</details>

### Câu 7 `medium`

A document ingestion pipeline indexes PDFs using fixed 500-character splits without respecting paragraph or sentence boundaries. Users complain that answers omit half of a policy rule that was cut in half across two chunks. Which chunking strategy addresses this issue?

- **A.** Sort all characters alphabetically inside each chunk before generating dense vector embeddings to normalize token ordering.
- **B.** Shrink the fixed chunk size from 500 characters to 50 characters so that each individual chunk fits inside a single database column.
- **C.** Convert every extracted PDF page into a Base64-encoded string and index the raw Base64 text directly inside the BM25 inverted index.
- **D.** Use structure-aware recursive splitting by headings and paragraphs with a 10-20% token overlap, or parent-child chunking.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline nạp tài liệu lập chỉ mục (index) các tệp PDF bằng cách cắt cố định 500 ký tự mà không tôn trọng ranh giới đoạn văn hoặc câu. Người dùng phàn nàn rằng câu trả lời bị thiếu một nửa quy tắc chính sách do bị cắt đôi qua hai chunk. Chiến lược chia nhỏ (chunking strategy) nào giải quyết vấn đề này?

**Đáp án đúng:** **D**

Fixed-character chunking cắt ngang câu/đoạn làm mất thông tin. Structure-aware chunking (theo heading/paragraph + overlap) hoặc Small-to-Big (Parent-Child) retrieval giữ nguyên tính toàn vẹn ngữ nghĩa.

- **A:** Sắp xếp lại ký tự phá hủy hoàn toàn cấu trúc ngữ pháp và ngữ nghĩa của văn bản.
- **B:** Chunk 50 ký tự quá nhỏ, cắt vụn câu chữ khiến cả embedding lẫn LLM đều mất ngữ cảnh.
- **C:** Chuỗi Base64 không có ý nghĩa ngôn ngữ, không thể tìm kiếm bằng BM25 hay embedding văn bản.
- **D (Đúng):** Chia chunk theo cấu trúc tài liệu (tiêu đề, đoạn văn) kết hợp overlap 10-20% hoặc mô hình parent-child chunking giúp bảo toàn trọn vẹn ngữ nghĩa của từng điều khoản chính sách.

</details>

### Câu 8 `hard`

A production backend uses the Anthropic Python SDK (`Anthropic()`) inside an `asyncio` FastAPI service. Under concurrent load, the event loop freezes for several seconds whenever API calls execute, causing health checks to time out. What is the root cause and fix?

- **A.** The synchronous `Anthropic` client blocks the event loop; replace it with `AsyncAnthropic` and `await` all API calls.
- **B.** FastAPI cannot parse JSON responses from Claude concurrently; migrate the entire backend framework to synchronous Django WSGI.
- **C.** The `max_tokens` parameter is configured too low, causing Python's cyclic garbage collector to pause the asyncio event loop.
- **D.** Disable Kubernetes liveness and readiness probes during peak traffic hours so the orchestrator does not restart blocked pods.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một backend production sử dụng Anthropic Python SDK (`Anthropic()`) bên trong một dịch vụ FastAPI `asyncio`. Dưới tải đồng thời, event loop bị đóng băng trong vài giây mỗi khi lệnh gọi API thực thi, khiến các health check bị timeout. Nguyên nhân gốc rễ và cách khắc phục là gì?

**Đáp án đúng:** **A**

Trong các dịch vụ bất đồng bộ Python (`asyncio`/FastAPI), luôn phải sử dụng `AsyncAnthropic` với `await` (và cấu hình connection pool phù hợp) để tránh block event loop.

- **A (Đúng):** Dùng client đồng bộ `Anthropic()` trong hàm `async def` sẽ block toàn bộ event loop của FastAPI. Phải chuyển sang `AsyncAnthropic()` và dùng `await`.
- **B:** FastAPI xử lý JSON rất tốt; lỗi treo event loop là do I/O blocking chứ không phải do JSON parsing.
- **C:** Tham số `max_tokens` không liên quan đến việc blocking event loop của asyncio.
- **D:** Tắt health check chỉ che giấu triệu chứng treo event loop, khiến người dùng tiếp tục bị timeout.

</details>

### Câu 9 `medium`

A knowledge-base assistant answers questions over 200,000 internal engineering docs. Users complain about outdated answers from deprecated RFCs and missing results for acronyms. Which TWO improvements directly solve these two RAG issues?

*(Chọn 2 đáp án)*

- **A.** Attach `status` and `updated_at` metadata to chunks and apply pre-retrieval metadata filters to exclude deprecated RFCs.
- **B.** Add BM25 keyword search alongside dense embeddings in a hybrid retrieval pipeline to capture exact internal acronyms.
- **C.** Increase Claude's `temperature` to 1.0 so the model invents newer interpretations of deprecated engineering documents.
- **D.** Disable chunking completely and store entire 100-page PDFs as single embedding vectors without any metadata attributes.
- **E.** Switch from JSON output to XML output in the final response without modifying the underlying retrieval pipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý cơ sở tri thức trả lời câu hỏi trên 200.000 tài liệu kỹ thuật nội bộ. Người dùng phàn nàn về các câu trả lời lỗi thời từ các RFC đã ngừng sử dụng và kết quả bị thiếu đối với các từ viết tắt. HAI cải tiến nào trực tiếp giải quyết hai vấn đề RAG này?

**Đáp án đúng:** **A, B**

Metadata filtering giải quyết vấn đề tài liệu lỗi thời (freshness/lifecycle), trong khi Hybrid Search (BM25 + Dense) giải quyết vấn đề thuật ngữ/từ viết tắt chuyên ngành.

- **A (Đúng):** Gắn metadata `status`/`updated_at` và lọc trước khi truy xuất (pre-filtering) giúp loại bỏ hoàn toàn các RFC đã lỗi thời.
- **B (Đúng):** BM25 trong Hybrid Search đảm bảo khớp chính xác các từ viết tắt (acronyms) nội bộ mà dense vector dễ bỏ sót.
- **C:** Tăng temperature không loại bỏ tài liệu cũ mà còn làm tăng nguy cơ bịa đặt thông tin.
- **D:** Nhúng cả tài liệu 100 trang thành 1 vector làm loãng ngữ nghĩa nghiêm trọng và mất khả năng lọc chính xác.
- **E:** Đổi định dạng đầu ra không tác động gì đến chất lượng truy xuất tài liệu cũ hay từ viết tắt.

</details>

### Câu 10 `hard`

When building a strict citation-grounded RAG system for compliance audits, which TWO architectural controls ensure that Claude's output only presents verifiable facts from the retrieved corpus?

*(Chọn 2 đáp án)*

- **A.** Instruct Claude to respond with a standard abstention message when the retrieved passages do not contain sufficient evidence.
- **B.** Require structured citations mapping each statement to a chunk ID and run a deterministic post-check verifying the quoted span exists.
- **C.** Omit the retrieved chunks from the prompt when confidence is low and let Claude answer directly from parametric memory.
- **D.** Set `top_p` to 0.99 and `temperature` to 0.8 to maximize linguistic diversity in regulated compliance summaries.
- **E.** Use client-side regex to append random document URLs to every sentence after the assistant response is streamed.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi xây dựng một hệ thống RAG bám sát trích dẫn nghiêm ngặt cho kiểm toán tuân thủ, HAI biện pháp kiểm soát kiến trúc nào đảm bảo rằng đầu ra của Claude chỉ trình bày các sự kiện có thể kiểm chứng từ kho tài liệu đã truy xuất?

**Đáp án đúng:** **A, B**

Grounding chuẩn compliance đòi hỏi: (1) Cho phép mô hình từ chối trả lời khi thiếu bằng chứng (abstention), và (2) Kiểm chứng deterministic các trích dẫn so với nội dung chunk thực tế.

- **A (Đúng):** Thiết kế cơ chế từ chối rõ ràng (abstention/fallback) khi thiếu bằng chứng giúp ngăn mô hình tự suy diễn từ kiến thức pretraining.
- **B (Đúng):** Yêu cầu trích dẫn có cấu trúc kèm kiểm chứng deterministic đối chiếu với chunk gốc đảm bảo không có trích dẫn giả (fake citations).
- **C:** Cho phép trả lời từ bộ nhớ tham số khi thiếu tài liệu là nguyên nhân trực tiếp gây hallucination.
- **D:** Độ ngẫu nhiên cao làm giảm tính nhất quán và độ bám sát nguồn dữ liệu trong kiểm toán tuân thủ.
- **E:** Gắn URL ngẫu nhiên tạo ra trích dẫn sai lệch, vi phạm nghiêm trọng yêu cầu kiểm toán.

</details>

### Câu 11 `hard`

An enterprise engineering RAG assistant indexes 500,000 internal runbooks containing exact error codes (such as `ERR_SSL_0x842`) alongside conceptual troubleshooting guides. Users report that pure dense-vector similarity search frequently misses exact error-code matches, while pure keyword search fails on paraphrased questions. Which retrieval architecture best resolves both failure modes?

- **A.** Increase the dense embedding model dimension from 1024 to 3072, rebuild the HNSW index with higher efConstruction, and raise the vector database top-K parameter from 10 to 100 without changing the pipeline.
- **B.** Combine BM25 lexical search and dense vector retrieval via Reciprocal Rank Fusion (RRF), followed by a cross-encoder reranker before passing chunks to Claude.
- **C.** Replace the vector database with a full-text SQL LIKE query engine and ask Claude Haiku to generate 20 synonymous keyword variations for every user question before searching.
- **D.** Fine-tune Claude Sonnet on all 500,000 runbooks so the model memorizes every error code internally and eliminates the need for an external retrieval step at runtime.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý RAG kỹ thuật doanh nghiệp lập chỉ mục 500.000 runbook nội bộ chứa các mã lỗi chính xác (như `ERR_SSL_0x842`) cùng với các hướng dẫn khắc phục sự cố mang tính khái niệm. Người dùng báo cáo rằng tìm kiếm tương đồng dense-vector thuần túy thường bỏ sót các mã lỗi chính xác, trong khi tìm kiếm từ khóa thuần túy lại thất bại với các câu hỏi diễn giải khác từ ngữ. Kiến trúc truy xuất nào giải quyết tốt nhất cả hai chế độ lỗi này?

**Đáp án đúng:** **B**

Hybrid Search (BM25 + Dense Vector) kết hợp Reciprocal Rank Fusion (RRF) và Cross-Encoder Reranking là kiến trúc chuẩn cho RAG production khi dữ liệu vừa có thuật ngữ/mã định danh chính xác vừa cần hiểu ngữ nghĩa tự nhiên.

- **A:** Tăng chiều embedding hay top-K không khắc phục được bản chất của dense embeddings là yếu kém khi khớp chính xác các chuỗi mã lỗi hiếm hoặc định danh đặc thù, đồng thời nhồi 100 chunks vào prompt gây tốn chi phí và context rot.
- **B (Đúng):** Hybrid Search kết hợp BM25 (bắt chính xác mã lỗi như ERR_SSL_0x842) và Dense Vector (hiểu ngữ nghĩa câu hỏi diễn đạt lại), trộn kết quả bằng RRF rồi tinh lọc bằng Cross-Encoder Reranker giúp tối ưu cả recall lẫn precision trước khi đưa vào Claude.
- **C:** Dùng SQL LIKE và mở rộng từ khóa bằng LLM vừa chậm, vừa không có cơ chế tính điểm tương đồng ngữ nghĩa hay BM25 TF-IDF chuẩn xác trên quy mô 500,000 tài liệu.
- **D:** Fine-tuning không phù hợp để ghi nhớ dữ liệu tra cứu chính xác và thường xuyên thay đổi như 500,000 runbooks; RAG với Hybrid Search mới đảm bảo tính cập nhật và grounding.

</details>

### Câu 12 `hard`

A legal contract analysis system chunks 120-page PDFs into 600-token segments for RAG. During evaluation, queries like 'What is the termination penalty for Acme Corp in Q3?' fail because the retrieved chunk only reads 'The penalty shall be 15% of the remaining quarterly fee' without mentioning 'Acme Corp' or 'Termination'. Which ingestion-time technique specifically addresses this context loss?

- **A.** Reduce the chunk size from 600 tokens to 100 tokens with zero overlap so that each sentence is indexed as an isolated vector unit.
- **B.** Apply lowercase normalization and stop-word removal across the entire PDF before splitting it into fixed-size character windows.
- **C.** Apply Contextual Retrieval at ingestion by prompting Claude to prepend a 50-token situational context summary to each chunk before indexing.
- **D.** Increase the temperature parameter to 0.9 and enable top-k sampling during answer generation so Claude can infer missing entity names and quarterly termination clauses from general contract templates.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống phân tích hợp đồng pháp lý chia nhỏ các tệp PDF 120 trang thành các đoạn 600 token cho RAG. Trong quá trình đánh giá, các truy vấn như 'What is the termination penalty for Acme Corp in Q3?' thất bại vì chunk được truy xuất chỉ ghi 'The penalty shall be 15% of the remaining quarterly fee' mà không nhắc đến 'Acme Corp' hay 'Termination'. Kỹ thuật thời điểm nạp dữ liệu (ingestion-time technique) nào giải quyết cụ thể tình trạng mất ngữ cảnh này?

**Đáp án đúng:** **C**

Contextual Retrieval giải quyết tận gốc vấn đề mất ngữ cảnh khi chunking tài liệu dài bằng cách thêm đoạn tóm tắt ngữ cảnh định vị (situational context) vào mỗi chunk lúc ingestion trước khi tạo dense embedding và BM25 index.

- **A:** Giảm chunk xuống 100 tokens không overlap càng làm mất ngữ cảnh xung quanh nghiêm trọng hơn, khiến đoạn văn bản tách rời hoàn toàn khỏi tên công ty và tên điều khoản.
- **B:** Chuẩn hóa chữ thường và bỏ stop-word không bổ sung được thông tin bị thiếu (tên thực thể hoặc tiêu đề mục nằm ở các trang trước của hợp đồng).
- **C (Đúng):** Contextual Retrieval (pattern của Anthropic) dùng Claude (thường là Haiku kết hợp Prompt Caching trên toàn bộ tài liệu) để sinh đoạn ngữ cảnh ngắn gắn vào đầu mỗi chunk trước khi embed và đánh chỉ mục BM25, giúp chunk mang đầy đủ thông tin 'Acme Corp' và 'Termination'.
- **D:** Tăng temperature khi sinh câu trả lời chỉ làm tăng nguy cơ hallucination chứ không giúp bước retrieval tìm đúng chunk bị mất ngữ cảnh.

</details>

### Câu 13 `medium`

A healthcare compliance assistant powered by Claude must answer policy questions strictly from approved clinical guidelines and refuse to extrapolate when evidence is missing. Auditors found several responses where Claude blended retrieved facts with unverified external medical assumptions. Which implementation best enforces strict grounding and verifiable attribution?

- **A.** Instruct Claude in the user prompt to append a comprehensive legal and medical disclaimer at the end of every response stating that the clinician must independently verify all figures against source PDFs.
- **B.** Set `max_tokens` to 150 so the model does not have enough output space to generate unverified medical assumptions.
- **C.** Pass retrieved documents inside an unstructured plain-text block and rely on `temperature: 0.2` to guarantee zero hallucinations.
- **D.** Require structured claims paired with verbatim Citations API spans, enforce explicit abstention on missing evidence, and verify spans in code.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý tuân thủ y tế sử dụng Claude phải trả lời các câu hỏi chính sách bám sát hoàn toàn vào các hướng dẫn lâm sàng đã phê duyệt và từ chối suy diễn khi thiếu bằng chứng. Các kiểm toán viên phát hiện một số phản hồi trong đó Claude pha trộn các sự kiện được truy xuất với các giả định y khoa bên ngoài chưa được kiểm chứng. Cách triển khai nào thực thi tốt nhất việc bám sát dữ liệu gốc nghiêm ngặt và gán nguồn có thể kiểm chứng?

**Đáp án đúng:** **D**

Để đảm bảo strict grounding trong các lĩnh vực nhạy cảm như y tế hay pháp lý, cần kết hợp trích dẫn có cấu trúc/Citations API, cơ chế abstention khi không đủ bằng chứng và bước xác minh tự động (programmatic span verification).

- **A:** Thêm disclaimer chung chung không ngăn được việc mô hình trộn lẫn thông tin suy diễn ngoài tài liệu và không cung cấp bằng chứng trích dẫn cụ thể.
- **B:** Giới hạn `max_tokens` chỉ cắt ngắn câu trả lời (dễ gây truncation), hoàn toàn không kiểm soát được việc mô hình có bám sát tài liệu nguồn hay không.
- **C:** Temperature thấp giúp giảm tính ngẫu nhiên nhưng không đảm bảo 100% mô hình không suy diễn từ kiến thức pre-training khi thiếu cơ chế ép trích dẫn và từ chối.
- **D (Đúng):** Bắt buộc cấu trúc claim kèm trích dẫn nguyên văn (hoặc dùng Citations API), quy tắc từ chối rõ ràng khi thiếu bằng chứng (abstention), và kiểm chứng span trích dẫn bằng code trước khi trả về người dùng là chuẩn mực grounding nghiêm ngặt nhất.

</details>

### Câu 14 `hard`

An order-processing agent uses Claude tool calling to invoke an internal `issue_refund` microservice. During transient gateway timeouts, the orchestrator retries the LLM workflow, causing duplicate refunds for the same customer dispute. Which TWO engineering practices prevent duplicate side effects while preserving retry resilience? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Generate a deterministic idempotency key per logical workflow action and pass it to the `issue_refund` service so repeated retries return the cached original result.
- **B.** Disable all HTTP retries in the orchestrator and immediately fail the user session with a manual support ticket whenever any downstream tool call takes longer than 2 seconds to respond.
- **C.** Respect `Retry-After` headers and apply exponential backoff with full jitter strictly on transient 429, 502, 503, and 529 status codes.
- **D.** Ask Claude in the system prompt to track whether it already invoked `issue_refund` across previous failed HTTP connections outside its current context window and skip duplicate calls.
- **E.** Switch the Messages API call from non-streaming to SSE streaming mode because streaming automatically deduplicates downstream microservice mutations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent xử lý đơn hàng sử dụng lệnh gọi tool của Claude để gọi một microservice `issue_refund` nội bộ. Trong thời gian gateway bị timeout tạm thời, bộ điều phối thử lại workflow LLM, gây ra hoàn tiền trùng lặp cho cùng một tranh chấp của khách hàng. HAI thực hành kỹ thuật nào ngăn chặn các tác dụng phụ trùng lặp trong khi vẫn giữ khả năng phục hồi khi thử lại? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

Chống side-effect trùng lặp khi retry đòi hỏi sự phối hợp giữa tầng tool/microservice (deterministic idempotency keys) và tầng orchestrator (chính sách retry có chọn lọc trên mã lỗi tạm thời kèm `Retry-After` và backoff + jitter).

- **A (Đúng):** Sử dụng idempotency key nhất quán cho mỗi hành động logic giúp backend `issue_refund` nhận biết các request retry trùng lặp và trả về kết quả đã xử lý mà không trừ/hoàn tiền lần hai.
- **B:** Tắt hoàn toàn retry làm giảm độ tin cậy (availability) của hệ thống trước các lỗi mạng thoáng qua (transient errors).
- **C (Đúng):** Chỉ retry các mã lỗi tạm thời (429, 5xx, 529) với `Retry-After` và exponential backoff + jitter giúp tránh retry vô ích trên các lỗi logic (4xx) và giảm tải cho hệ thống đích.
- **D:** LLM là stateless và không thể biết kết quả của các HTTP connection bị timeout ở tầng orchestrator nếu không có state/idempotency lưu ở tầng ứng dụng.
- **E:** SSE streaming chỉ thay đổi cách nhận token phản hồi từ Claude, không có bất kỳ cơ chế chống trùng lặp giao dịch nào cho microservice bên dưới.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
