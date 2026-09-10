import type { SkillNode } from "./skill-types";

export const TIER2: SkillNode[] = [
  {
    id: "DKR-04", tier: 2, xp: 100, prereq: ["LNX-01"],
    title: "Docker & Dockerfile",
    sum: "Container hóa app: image/layer/cache, multi-stage build, image nhỏ & an toàn.",
    theory: `<p>Container giải bài toán muôn thuở 'chạy tốt trên máy tôi mà': nó đóng gói <b>app + runtime + thư viện + cấu hình</b> thành một đơn vị chạy giống hệt nhau ở laptop, CI và prod. Ba khái niệm hay bị lẫn: <b>image</b> là bản mẫu bất biến (read-only, gồm nhiều layer xếp chồng); <b>container</b> là một tiến trình đang chạy sinh ra từ image (có thêm một lớp ghi tạm bên trên); <b>volume</b> là nơi lưu dữ liệu bền, tách khỏi vòng đời container. Nhớ điều này vì <b>filesystem trong container là ephemeral</b> — xóa container là mất sạch mọi thứ ghi vào lớp tạm.</p>
<p><b>Layer & build cache</b> là chìa khóa để build nhanh. Mỗi lệnh trong Dockerfile tạo một layer; Docker cache lại từng layer và chỉ build lại từ layer đầu tiên bị thay đổi trở xuống. Vì thế thứ tự lệnh quyết định tốc độ: copy <code>package.json</code> và cài dependency <i>trước</i>, copy mã nguồn <i>sau</i> — vì mã đổi liên tục còn dependency thì hiếm đổi.</p>
<p><b>Multi-stage build</b> tách 'môi trường build' khỏi 'môi trường chạy'. Stage build có đủ toolchain (compiler, devDependencies) nặng cả GB; stage runtime chỉ chứa artifact đã build. Ví dụ Dockerfile cho course catalog service (Node):</p>
<pre><code># ---- Stage build ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage runtime ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
RUN addgroup -S app &amp;&amp; adduser -S app -G app
USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]</code></pre>
<p><b>Base image nhỏ & an toàn:</b> đổi từ <code>node:20</code> (~1.1GB) sang <code>node:20-alpine</code> (~180MB) hoặc distroless (chỉ có runtime, không shell) vừa giảm dung lượng vừa cắt bề mặt tấn công — không có shell thì kẻ tấn công khó chạy lệnh trong container. Luôn thêm <code>USER</code> non-root: mặc định container chạy bằng root, nếu bị khai thác kèm lỗ hổng thoát container thì chiếm luôn host.</p>
<p><b>Vài quy tắc vận hành cốt lõi:</b> (1) <code>.dockerignore</code> để không copy <code>node_modules</code>, <code>.git</code>, secret vào image — vừa nhanh vừa tránh lộ bí mật. (2) App phải <b>log ra stdout/stderr</b>, không ghi file log trong container (container chết là mất log, và không co giãn được). (3) Đẩy/kéo image qua <b>registry</b> và <b>tag theo digest</b> (<code>app@sha256:...</code>) để đảm bảo mọi node kéo đúng một bản bất biến, không phải <code>latest</code> trôi nổi.</p>
<p><b>Kịch bản hỏng kinh điển:</b> team đóng gói video upload service với base <code>node:20</code> full, không multi-stage, chạy bằng root — image 1.4GB. Mỗi lần deploy 30 node kéo image mất 8-10 phút, autoscale lúc cao điểm chậm chạp vì kéo image lâu, và một CVE trong package build (không cần lúc runtime) vẫn nằm trong image prod. Chuyển sang alpine + multi-stage: image còn 190MB, thời gian kéo còn dưới 1 phút, bề mặt tấn công giảm hẳn.</p>`,
    whenUse: `<p>Dùng khi bạn cần <b>một artifact chạy giống nhau ở mọi môi trường</b> và muốn nền tảng cho CI/CD, autoscale, K8s sau này. Với edtech, container hóa từng service (catalog, enrollment, grading) giúp mỗi service build/deploy/scale độc lập. Mức 'đủ dùng' cho developer: viết được Dockerfile multi-stage, hiểu cache layer để build nhanh, biết đẩy image lên registry với tag bất biến.</p>
<p><b>Khi nào CHƯA cần / không nên:</b> app cực nhỏ chạy một VM và ít khi đổi thì container chỉ thêm một lớp phức tạp. <b>Đừng</b> nhét database có state nặng vào container tự quản khi chưa hiểu volume và backup — dùng managed DB an toàn hơn. Container hóa là bước 'đóng gói', không tự nó là 'đo trước, tự động sau' — vẫn phải có lý do vận hành rõ ràng.</p>`,
    pros: [
      "Cùng một image chạy giống nhau ở dev, CI, prod — hết cảnh chạy tốt trên máy tôi",
      "Multi-stage + base nhỏ cho image gọn, kéo nhanh, autoscale lẹ, bề mặt tấn công thấp",
      "Là artifact bất biến gắn digest, hợp với rollback và audit",
      "Cô lập dependency giữa các service, mỗi service build và scale độc lập",
    ],
    cons: [
      "Filesystem ephemeral dễ khiến người mới mất dữ liệu nếu không hiểu volume",
      "Layer/cache đặt sai thứ tự làm build chậm và image phình to",
      "Chạy root và base image full là cạm bẫy bảo mật hay gặp",
    ],
    questions: [
      { q: "CI của grading service build image mất 12 phút mỗi lần dù chỉ sửa vài dòng code. Bạn nghi thứ tự lệnh Dockerfile sai chỗ nào?",
        a: "Nhiều khả năng Dockerfile <code>COPY . .</code> toàn bộ mã nguồn <strong>trước</strong> khi cài dependency, nên chỉ cần đổi một dòng code là cache của layer cài dependency bị vô hiệu và phải <code>npm ci</code> lại từ đầu. Sửa bằng cách <strong>copy package.json và cài dependency trước, copy mã nguồn sau</strong>, vì mã đổi liên tục còn dependency hiếm đổi. Nguyên tắc chung: đặt các layer ít thay đổi lên trên, layer hay thay đổi xuống dưới để tận dụng tối đa build cache. Thêm <code>.dockerignore</code> để khỏi copy node_modules và .git vào context cũng cắt được thời gian đáng kể." },
      { q: "Team đóng gói video upload service, image ra 1.4GB, deploy 30 node rất chậm. Bạn đề xuất gì và trade-off là gì?",
        a: "Chuyển sang <strong>multi-stage build với base image nhỏ</strong> (alpine hoặc distroless): stage build chứa toolchain nặng, stage runtime chỉ copy artifact đã build nên còn khoảng 190MB, kéo image nhanh hơn nhiều và autoscale kịp lúc cao điểm. Trade-off: alpine dùng musl libc nên vài thư viện native có thể cần biên dịch lại hoặc trở nên khó debug, và distroless không có shell nên không <code>exec</code> vào container được để soi — phải quan sát qua log và metric thay vì vào tay. Với video upload, image nhỏ đáng giá vì thời gian kéo ảnh hưởng trực tiếp tới tốc độ co giãn khi tải tăng đột biến." },
      { q: "Vì sao không nên chạy container bằng user root, và distroless giúp gì thêm về mặt bảo mật?",
        a: "Mặc định container chạy bằng root; nếu app bị khai thác kèm một lỗ hổng thoát container thì kẻ tấn công có quyền root trên host, blast radius rất lớn. Thêm <code>USER</code> non-root áp dụng <strong>least privilege</strong>: dù bị chiếm, kẻ tấn công cũng chỉ có quyền tối thiểu trong container. <strong>Distroless đi xa hơn bằng cách loại bỏ shell và mọi công cụ hệ thống</strong>, nên ngay cả khi vào được cũng khó chạy lệnh, tải payload hay dò tìm. Đánh đổi là mất khả năng vào container debug bằng tay, buộc bạn đầu tư vào observability đúng cách." },
      { q: "Enrollment service ghi file log và file tạm vào thư mục trong container. Sau một lần restart, log biến mất và bạn không debug được sự cố. Sai ở đâu?",
        a: "Filesystem của container là <strong>ephemeral</strong>: mọi thứ ghi vào lớp ghi tạm sẽ mất khi container bị xóa hoặc thay thế, mà deploy/autoscale/restart thì thay container liên tục. App nên <strong>log ra stdout/stderr</strong> để nền tảng gom lại thành luồng sự kiện tập trung (đúng tinh thần 12-Factor), không tự ghi file log trong container. Dữ liệu cần bền phải để ở <strong>volume hoặc external store</strong> (object storage, DB) chứ không nằm trong container. Đây cũng là điều kiện để container stateless và scale ngang được." },
      { q: "Đồng nghiệp muốn deploy prod bằng tag app:latest cho tiện. Bạn phản biện thế nào?",
        a: "<code>latest</code> là nhãn <strong>di động</strong>, trỏ tới image khác nhau theo thời gian, nên bạn không biết chính xác prod đang chạy bản nào và hai node có thể kéo hai bản khác nhau — mất khả năng tái tạo, rollback và audit. Hãy tag theo <strong>version/commit và ghim theo digest</strong> (<code>app:v1.4.2@sha256:...</code>) để mỗi deploy là một artifact bất biến xác định. Khi có sự cố, bạn deploy lại đúng digest cũ đã kiểm chứng thay vì hy vọng <code>latest</code> vẫn còn trỏ đúng chỗ. Immutable artifact là nền tảng để rollback nhanh và điều tra tin cậy." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Lấy một service Node/Python nhỏ (ví dụ course catalog API) và làm tuần tự: (1) viết Dockerfile ngây thơ một stage với base full, build và ghi lại dung lượng image bằng <code>docker images</code>; (2) chuyển sang <b>multi-stage</b> + base <code>alpine</code> hoặc distroless, đo lại dung lượng và so sánh; (3) thêm <code>.dockerignore</code> và thêm <code>USER</code> non-root, thử <code>docker exec</code> vào để xác nhận không còn chạy root; (4) sắp lại thứ tự copy dependency trước mã nguồn, sửa một dòng code rồi build lại để thấy cache ăn ở đâu; (5) tag image theo commit và đẩy lên một registry (Docker Hub hoặc GHCR), rồi kéo về bằng digest. Ghi lại con số dung lượng và thời gian build trước/sau để thấy trade-off cụ thể.</p>`,
    links: [
      { t: "Docker — Get started & build images", u: "docs.docker.com/get-started" },
      { t: "Docker — Dockerfile best practices", u: "docs.docker.com/develop/develop-images/dockerfile_best-practices" },
      { t: "Docker — Multi-stage builds", u: "docs.docker.com/build/building/multi-stage" },
      { t: "Google — Distroless base images", u: "github.com/GoogleContainerTools/distroless" },
    ],
  },
  {
    id: "CMP-05", tier: 2, xp: 100, prereq: ["DKR-04"],
    title: "Docker Compose & 12-Factor App",
    sum: "Chạy nhiều service local + nguyên tắc 12-Factor (config qua env, stateless).",
    theory: `<p>Một app edtech thực tế không chỉ có một container: có API, database, cache Redis, có khi cả một worker chấm bài. <b>Docker Compose</b> mô tả toàn bộ dàn service trong một file YAML để chạy cùng lúc trên máy local bằng một lệnh <code>docker compose up</code> — mỗi lập trình viên dựng được môi trường giống nhau trong vài giây, không cần cài Postgres/Redis lên máy thật.</p>
<pre><code>services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/edtech
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: edtech
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 5
  cache:
    image: redis:7-alpine
volumes:
  dbdata:</code></pre>
<p><b>12-Factor App</b> là bộ nguyên tắc để app 'sống tốt' trong môi trường container/cloud. Không phải cả 12 điều đều quan trọng như nhau với vận hành; những điều đáng thuộc nằm lòng:</p>
<ul>
<li><b>Config qua biến môi trường</b> — không hardcode connection string, không đóng cứng cấu hình prod vào image. Cùng một image chạy dev/staging/prod chỉ khác env. Đây là lý do ở YAML trên, <code>DATABASE_URL</code> được truyền qua <code>environment</code>.</li>
<li><b>Tách build / release / run</b> — build ra image bất biến một lần; release là image gắn với một tập config cụ thể; run chỉ là chạy release đó. Không sửa code trên server đang chạy.</li>
<li><b>Tiến trình stateless</b> — app không giữ state trong bộ nhớ hay trên đĩa cục bộ; state đẩy ra ngoài (DB, cache, object storage). Nhờ vậy mới scale ngang được.</li>
<li><b>Disposability</b> — khởi động nhanh, tắt sạch: bắt <code>SIGTERM</code> để hoàn tất request đang chạy rồi thoát. Container bị giết/thay bất cứ lúc nào là chuyện bình thường.</li>
<li><b>Log là luồng sự kiện</b> — app chỉ ghi ra stdout, để nền tảng gom và định tuyến, không tự quản file log.</li>
</ul>
<p><b>Bẫy kinh điển với depends_on:</b> <code>depends_on</code> mặc định chỉ đảm bảo container <i>được khởi động theo thứ tự</i>, KHÔNG chờ service bên trong <i>sẵn sàng nhận request</i>. Postgres cần vài giây để chấp nhận kết nối, nên API khởi động xong có thể kết nối DB thất bại ngay và crash. Cách đúng là gắn <b>healthcheck</b> và dùng <code>condition: service_healthy</code> như YAML trên, hoặc để app tự retry kết nối lúc khởi động (bền hơn nữa vì prod thật không có Compose lo hộ).</p>
<p><b>Khi nào Compose là ĐỦ và bạn KHÔNG cần Kubernetes:</b> môi trường dev local, CI (dựng DB thật để test), demo, hoặc một app chạy trên một VM với vài service và lượng tải khiêm tốn. Với edtech giai đoạn đầu, một VM + Compose + managed DB có thể phục vụ tốt tới khi có nỗi đau đo được (cần autoscale nhiều node, self-healing, rolling update phức tạp) thì mới lên K8s. Nhảy vào K8s quá sớm là over-engineering: bạn mua thêm một hệ thống phức tạp phải vận hành mà chưa có bài toán tương xứng.</p>
<p><b>Kịch bản hỏng do vi phạm stateless:</b> team chạy 2 instance API sau load balancer nhưng lưu session đăng nhập trong bộ nhớ tiến trình. Học viên đăng nhập ở instance A, request sau rơi vào instance B — bị đá ra đăng nhập lại liên tục. Tương tự, file học viên upload được ghi vào đĩa cục bộ của một instance nên instance kia không thấy. Sửa bằng nguyên tắc stateless: <b>session đẩy vào Redis</b> (hoặc dùng JWT không cần server nhớ), <b>file upload đẩy vào object storage</b> (S3/GCS) thay vì đĩa cục bộ. Chỉ khi state ra ngoài thì mới thêm/bớt instance tùy ý được.</p>`,
    whenUse: `<p>Dùng Compose khi bạn cần <b>dựng nhiều service cùng lúc ở local hoặc CI</b> một cách lặp lại được, và khi tải còn đủ nhỏ để một máy lo hết. Đây là công cụ 'đủ tốt' cho phần lớn giai đoạn đầu và là bàn đạp tự nhiên trước khi chạm tới orchestration. Áp 12-Factor ngay từ đầu vì nó gần như miễn phí lúc mới build nhưng cực đắt để sửa về sau khi app đã bám chặt vào state cục bộ.</p>
<p><b>Khi nào KHÔNG dùng:</b> Compose không phải công cụ chạy prod nhiều node — nó không có self-healing thật, autoscale, rolling update hay lập lịch trên cụm máy; đừng cố ép Compose làm việc của K8s. Ngược lại, cũng đừng lôi K8s vào chỉ để chạy ba container trên một VM. Chọn theo nỗi đau đo được, không theo trend.</p>`,
    pros: [
      "Dựng cả dàn service local/CI giống hệt nhau chỉ bằng một lệnh, lặp lại được",
      "12-Factor giúp app stateless nên scale ngang và thay thế container dễ dàng",
      "Config qua env cho phép một image dùng chung cho mọi môi trường",
      "Đủ dùng cho giai đoạn đầu, tránh over-engineering khi chưa cần K8s",
    ],
    cons: [
      "Không phải công cụ prod nhiều node: thiếu self-healing thật, autoscale, rolling update",
      "depends_on không chờ service sẵn sàng nên dễ tạo lỗi khởi động nếu không có healthcheck",
      "Áp 12-Factor muộn rất đắt: sửa app đã bám state cục bộ tốn nhiều công",
    ],
    questions: [
      { q: "Học viên phàn nàn bị đăng xuất ngẫu nhiên sau khi bạn scale API lên 2 instance sau load balancer. Nguyên nhân gốc và cách sửa theo 12-Factor?",
        a: "App đang <strong>giữ session trong bộ nhớ tiến trình</strong> nên vi phạm nguyên tắc tiến trình stateless: request rơi vào instance không giữ session đó sẽ coi như chưa đăng nhập. Sửa bằng cách <strong>đẩy state ra ngoài</strong> — lưu session vào Redis dùng chung, hoặc dùng token dạng JWT để server không cần nhớ gì. Khi tiến trình stateless, load balancer định tuyến request tới bất kỳ instance nào cũng cho kết quả nhất quán, và bạn thêm/bớt instance tùy ý. Đây là điều kiện tiên quyết để autoscale hoạt động đúng." },
      { q: "API của bạn thỉnh thoảng crash ngay khi khởi động bằng docker compose up, log báo không kết nối được database. depends_on đã khai báo đầy đủ. Vì sao?",
        a: "<code>depends_on</code> mặc định chỉ đảm bảo container database <strong>được khởi động trước</strong>, chứ không chờ Postgres bên trong <strong>sẵn sàng nhận kết nối</strong> — mà Postgres cần vài giây để khởi tạo. API bật lên kết nối ngay lúc DB chưa nghe nên thất bại và crash. Sửa bằng <strong>healthcheck cho db kèm condition: service_healthy</strong>, hoặc bền hơn là để <strong>app tự retry kết nối lúc khởi động</strong>. Cách retry đáng làm vì prod thật (không có Compose) cũng có lúc DB tạm không sẵn sàng, app cần tự chịu được." },
      { q: "Sếp muốn 'chuyên nghiệp' nên yêu cầu đưa app edtech đang chạy ổn trên một VM với Docker Compose lên Kubernetes ngay. App mới ~50k user, tải đều. Bạn phản biện thế nào?",
        a: "Hỏi trước: <strong>nỗi đau đo được nào đòi K8s?</strong> Nếu chưa cần autoscale nhiều node, self-healing trên cụm, hay rolling update phức tạp thì K8s chỉ thêm một hệ thống nặng phải vận hành, học và bảo trì — đúng định nghĩa over-engineering. Compose + một VM + managed DB thường đủ cho giai đoạn này, và đầu tư nên dồn vào <strong>làm app đúng 12-Factor</strong> để sau này lên K8s gần như không phải sửa app. <strong>Chỉ nâng cấp orchestration khi có bằng chứng đo được là đang thiếu nó</strong>, không nâng vì nghe cho oách." },
      { q: "Vì sao 12-Factor yêu cầu config qua biến môi trường thay vì file config theo môi trường gắn trong image, và điều này giúp gì cho rollback?",
        a: "Nếu đóng cứng config prod vào image thì mỗi môi trường cần một image khác nhau, phá vỡ nguyên tắc <strong>một artifact bất biến chạy mọi nơi</strong> và dễ vô tình ship cấu hình sai môi trường. Đưa config qua env giúp <strong>cùng một image dùng cho dev/staging/prod</strong>, chỉ khác biến môi trường lúc release. Nhờ tách build/release/run, khi cần rollback bạn deploy lại chính image cũ đã kiểm chứng với đúng bộ config của nó, thay vì build lại từ code. Lưu ý env var chỉ hợp cho config thường; secret prod vẫn nên lấy từ secret manager." },
      { q: "Học viên upload bài nộp, file lúc thấy lúc không sau khi bạn chạy nhiều instance. Vấn đề gì và giải pháp stateless đúng là gì?",
        a: "App đang <strong>ghi file upload vào đĩa cục bộ của một instance</strong>, nên instance khác phục vụ request sau không thấy file đó — lại là vi phạm stateless, y hệt vấn đề session. Filesystem container còn là ephemeral nên file có thể mất khi container bị thay. Giải pháp đúng là <strong>đẩy file lên object storage bên ngoài</strong> (S3/GCS/MinIO) và chỉ lưu đường dẫn/metadata trong DB, để mọi instance truy cập chung một nguồn. Khi cả session lẫn file đều nằm ngoài tiến trình, bạn mới thực sự scale ngang và thay container tùy ý được." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Dựng một stack edtech thu nhỏ bằng Docker Compose gồm 3 service: một API, một Postgres, một Redis. (1) Viết <code>docker-compose.yml</code>, truyền toàn bộ cấu hình DB/Redis qua <code>environment</code> chứ không hardcode trong code; (2) cố tình bỏ healthcheck và chạy <code>docker compose up</code> nhiều lần để thấy API đôi khi crash vì DB chưa sẵn sàng, rồi thêm <b>healthcheck + condition: service_healthy</b> (hoặc retry trong app) và xác nhận hết crash; (3) chạy 2 instance API sau một reverse proxy, lưu session trong bộ nhớ và quan sát bị đăng xuất loạn, rồi chuyển session sang Redis để chứng minh stateless; (4) làm tương tự với upload file: ghi đĩa cục bộ (thấy lúc có lúc không) rồi chuyển sang một object store như MinIO. Cuối cùng viết một đoạn ngắn lập luận vì sao stack này CHƯA cần Kubernetes ở quy mô hiện tại.</p>`,
    links: [
      { t: "The Twelve-Factor App", u: "12factor.net" },
      { t: "Docker — Compose overview & compose file", u: "docs.docker.com/compose" },
      { t: "Docker Compose — startup order & healthcheck (depends_on)", u: "docs.docker.com/compose/how-tos/startup-order" },
      { t: "Docker — Manage data with volumes", u: "docs.docker.com/storage/volumes" },
    ],
  },
];
