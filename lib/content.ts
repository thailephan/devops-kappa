// Nội dung skill-tree DevOps. Tách khỏi UI để dễ bảo trì.
// Muốn thêm/sửa bài học: sửa các node trong NODES bên dưới (hoặc file lib/tierN.ts).

import type { Lang, Tier, QA, NodeLink, SkillNode } from "./skill-types";
import { TIER2 } from "./tier2";
import { TIER3 } from "./tier3";
import { TIER4 } from "./tier4";
import { TIER5 } from "./tier5";
import { TIER6 } from "./tier6";
import { TIER7 } from "./tier7";

export type { Lang, Tier, QA, NodeLink, SkillNode };

export const TIERS: Tier[] = [
  { id: 0, n: "TẦNG 0", t: "Nền tảng tư duy", sub: "Văn hóa · DORA · Vòng lặp phản hồi" },
  { id: 1, n: "TẦNG 1", t: "Khối xây dựng", sub: "Linux · Networking · Git" },
  { id: 2, n: "TẦNG 2", t: "Đóng gói ứng dụng", sub: "Docker · Compose · 12-Factor" },
  { id: 3, n: "TẦNG 3", t: "CI/CD", sub: "Pipeline · Test · Deploy" },
  { id: 4, n: "TẦNG 4", t: "Hạ tầng dạng mã", sub: "Cloud · Terraform · Ansible" },
  { id: 5, n: "TẦNG 5", t: "Điều phối", sub: "Kubernetes · Helm · Autoscale" },
  { id: 6, n: "TẦNG 6", t: "Quan sát & SRE", sub: "Metrics/Logs/Traces · SLO · On-call" },
  { id: 7, n: "TẦNG 7", t: "Bảo mật & Boss", sub: "DevSecOps · Supply chain · Capstone" },
];

export const RANKS: [number, string][] = [
  [0, "Junior DevOps"],
  [300, "Mid DevOps / SRE"],
  [700, "Senior DevOps"],
  [1200, "Staff / Platform Engineer"],
  [1800, "Principal / SRE Lead"],
];

const TIER0_1: SkillNode[] = [
  {
    id: "FND-00", tier: 0, xp: 100, prereq: [],
    title: "Tư duy DevOps & DORA",
    sum: "DevOps là văn hóa, không phải tool. Đo bằng DORA, rút ngắn vòng phản hồi.",
    theory: `<p><b>DevOps không phải một chức danh hay một bộ công cụ</b> — nó là cách rút ngắn vòng lặp <i>code → chạy trên production → biết nó ổn không → sửa</i> một cách an toàn, tự động, lặp lại được. Là developer bạn đã ở nửa đầu; DevOps là chiếm nốt nửa sau: <b>đóng gói · giao hàng · vận hành · quan sát · chịu trách nhiệm khi hỏng lúc 3h sáng</b>.</p>
<p>4 câu hỏi gốc cho mọi quyết định (giống tư duy trade-off): (1) Thay đổi này ra tới user bằng đường nào? (2) Làm sao biết nó khỏe hay ốm? (3) Nó hỏng kiểu gì, tự phục hồi được không? (4) Khi nào tôi <i>chưa</i> cần thứ này?</p>
<p><b>Khung CALMS:</b> Culture (xóa tường Dev↔Ops) · Automation · Lean (batch nhỏ) · Measurement · Sharing. Tool chỉ phục vụ 5 trụ này.</p>
<p><b>DORA — 4 chỉ số là la bàn của mọi việc bạn học sau này:</b></p>
<ul>
<li><b>Deployment Frequency</b> — deploy thường xuyên tới mức nào.</li>
<li><b>Lead Time for Changes</b> — từ commit tới chạy trên prod mất bao lâu.</li>
<li><b>Change Failure Rate (CFR)</b> — % lần deploy gây sự cố.</li>
<li><b>MTTR</b> — hỏng rồi phục hồi mất bao lâu.</li>
</ul>
<p><b>Vì sao deploy nhỏ & thường xuyên lại AN TOÀN hơn:</b> batch nhỏ → blast radius nhỏ → khi hỏng dễ cô lập thủ phạm, rollback ít mất mát. Deploy 200 commit/lần thì lỗi nằm trong 200 — không debug nổi. Tần suất cao <i>tăng</i> ổn định chứ không giảm.</p>`,
    whenUse: `<p>Áp dụng <b>trước mọi quyết định tool</b>. Không có con số DORA thì "áp Docker/K8s vào" chỉ là nghi lễ. Đo trước, tự động sau. Và luôn hỏi câu (4): với edtech 100 user thì <b>chưa</b> cần Kubernetes — chống over-engineering là một phần của DevOps.</p>`,
    pros: [
      "Mọi lựa chọn tool sau đều có cơ sở đo được (DORA), không cảm tính",
      "Batch nhỏ giảm rủi ro, tăng tốc độ giao hàng cùng lúc",
      "Văn hóa sở hữu end-to-end: ai code thì lo cả vận hành",
    ],
    cons: [
      "Đòi thay đổi văn hóa/tổ chức — khó hơn cài tool nhiều",
      "Cần kỷ luật đo lường; thiếu số liệu thì dễ chạy theo trend",
    ],
    questions: [
      { q: "Team deploy 1 lần/tháng, mỗi lần gộp 200 commit. Vì sao rủi ro cao và DevOps sửa thế nào?",
        a: "Blast radius khổng lồ: 200 commit hỏng thì phải bới cả 200 để tìm thủ phạm, rollback mất luôn tính năng tốt. Sửa bằng <strong>giảm batch size</strong> — deploy nhỏ & thường xuyên, mỗi lần ít thay đổi để lỗi dễ cô lập và MTTR giảm. Nghịch lý cốt lõi của DevOps: <strong>tần suất deploy cao lại làm hệ ổn định hơn</strong>, không phải kém đi." },
      { q: "Change Failure Rate của team đang là 0%. Tin tốt hay dấu hiệu xấu?",
        a: "Thường là <strong>dấu hiệu xấu</strong>: nghĩa là team deploy quá hiếm/quá sợ, hoặc không đo. Mục tiêu không phải 0% mà là <strong>CFR thấp + MTTR thấp</strong> (hỏng thì phục hồi nhanh). 0% thật sự chỉ đạt được khi bạn gần như không ship gì — và 'không ship' cũng là một loại thất bại." },
      { q: "Sếp nói: 'Làm DevOps đi, mua Kubernetes về.' Phản biện.",
        a: "DevOps là <strong>văn hóa + quy trình</strong>, không mua được bằng tool. Mua K8s mà vẫn deploy tay 1 lần/tháng thì chỉ thêm phức tạp và một hệ thống mới phải vận hành. Bắt đầu từ <strong>đo DORA + tự động hóa CI</strong>; tool nặng như K8s chỉ đến sau khi có <strong>bằng chứng đo được</strong> là đang thiếu nó." },
      { q: "Với edtech mới có 500 user, đâu là 3 thứ bạn cố tình CHƯA làm (chống over-engineering)?",
        a: "Ví dụ hợp lý: <strong>chưa Kubernetes</strong> (một VM + Docker Compose hoặc managed container là đủ), <strong>chưa microservices</strong> (monolith triển khai nhanh, ít điểm gãy), <strong>chưa multi-region</strong> (một region gần user). Nguyên tắc: kiến trúc phải <strong>tiến hóa được</strong>, và bạn chỉ mua độ phức tạp khi có nỗi đau đo được — câu hỏi (4) trong tư duy gốc." },
      { q: "Trong 4 chỉ số DORA, nếu chỉ được cải thiện MỘT thứ đầu tiên cho team hay bị sự cố kéo dài, bạn chọn gì và vì sao?",
        a: "Chọn <strong>MTTR</strong> (thời gian phục hồi). Với team hay 'chết lâu', giảm MTTR đem lại giá trị tức thì cho user và giảm áp lực on-call, đồng thời buộc phải xây rollback nhanh + observability — những nền tảng kéo theo cải thiện cả CFR và Lead Time. Chữa 'hỏng thì lâu mới dậy' trước khi lo 'deploy nhanh hơn'." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Viết 1 trang 'baseline DORA' cho chính app/dự án của bạn: (1) hiện deploy bao lâu/lần? (2) từ merge tới prod mất bao lâu? (3) mấy lần deploy gần nhất có gây sự cố? (4) lần sự cố gần nhất mất bao lâu để phục hồi? Nếu chưa đo được cái nào → đó chính là hạng mục cần dựng đầu tiên. Rồi liệt kê 3 thứ bạn <b>cố tình chưa làm</b> ở quy mô hiện tại và lý do.</p>`,
    links: [
      { t: "DORA — DevOps Research & Assessment (State of DevOps)", u: "dora.dev" },
      { t: "Google Cloud — Use the Four Keys to measure DevOps", u: "cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance" },
      { t: "The DevOps Handbook (Gene Kim) — tóm tắt CALMS", u: "itrevolution.com/product/the-devops-handbook" },
      { t: "Atlassian — What is DevOps?", u: "atlassian.com/devops" },
    ],
  },
  {
    id: "LNX-01", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Linux & CLI vận hành",
    sum: "Không vận hành được thứ mình không hiểu: process, systemd, log, permission, shell.",
    theory: `<p>90% sự cố production được debug bằng CLI Linux. Cần nắm chắc: <b>filesystem & permission</b> (user/group, <code>chmod</code>/<code>chown</code>, vì sao không chạy mọi thứ bằng root), <b>process</b> (<code>ps</code>, <code>top/htop</code>, tín hiệu SIGTERM vs SIGKILL), <b>systemd</b> (<code>systemctl</code>, <code>journalctl</code>), <b>tài nguyên</b> (<code>df</code>, <code>free</code>, <code>du</code>), và <b>shell script</b> để tự động việc lặp.</p>
<p>Bộ lệnh chẩn đoán khi một service 'ốm':</p>
<pre><code>systemctl status app        # còn chạy không, restart mấy lần
journalctl -u app -n 100    # 100 dòng log cuối của service
ps aux --sort=-%mem | head  # process nào ngốn RAM
df -h                       # đĩa còn chỗ không (đầy đĩa = sập ngầm)
ss -tlnp                    # đang listen cổng nào, PID nào</code></pre>
<p><b>Tư duy:</b> đi theo đường request đi (từ ngoài vào trong) và luôn hỏi 'log ở đâu, tài nguyên nào cạn'. Đầy đĩa (<code>df</code>) và hết file descriptor là 2 nguyên nhân 'sập bí ẩn' kinh điển ít người nghĩ tới.</p>`,
    whenUse: `<p>Nền tảng cho <b>mọi</b> tầng trên: Docker, K8s, cloud VM đều là Linux bên dưới. Developer đã quen macOS/WSL vẫn nên luyện vì prod gần như luôn là Linux server không GUI. Không cần thành sysadmin — cần đủ để đọc log, tìm process, sửa permission, viết script tự động.</p>`,
    pros: [
      "Debug được sự cố thật thay vì đoán mò hoặc chỉ biết restart",
      "Là ngôn ngữ chung của mọi công cụ DevOps phía trên",
      "Shell script tự động hóa nhanh các việc lặp lại",
    ],
    cons: [
      "Bề mặt kiến thức rộng, dễ lan man nếu không bám nhu cầu thực tế",
      "Thao tác tay trên server dễ gây 'drift' nếu không kỷ luật (xem IAC-09)",
    ],
    questions: [
      { q: "App trả 502 Bad Gateway. Bạn gõ những lệnh gì, theo thứ tự nào?",
        a: "502 = reverse proxy (Nginx) không nói chuyện được với backend. Đi từ ngoài vào trong: app còn sống? (<code>systemctl status app</code> / <code>ps aux</code>) → có listen đúng cổng? (<code>ss -tlnp</code>) → gọi thẳng backend bỏ qua proxy (<code>curl localhost:3000/health</code>) → đọc log app (<code>journalctl -u app</code>) + log Nginx. <strong>Nguyên tắc: lần theo đường request, cô lập tầng hỏng trước khi sửa.</strong>" },
      { q: "Service trên prod 'sập bí ẩn' nhưng CPU/RAM đều bình thường. Hai thủ phạm kinh điển bạn kiểm tra?",
        a: "(1) <strong>Đầy đĩa</strong> — <code>df -h</code>; log/upload phình khiến ghi file thất bại, DB không commit được, app chết ngầm. (2) <strong>Hết file descriptor / cổng</strong> — quá nhiều kết nối mở (<code>ss</code>, <code>lsof</code>, <code>ulimit -n</code>). Cả hai không hiện trên đồ thị CPU/RAM nên hay bị bỏ sót; đây là lý do observability phải gồm cả saturation của đĩa & fd, không chỉ CPU." },
      { q: "Khác nhau giữa gửi SIGTERM và SIGKILL cho process? Vì sao container/K8s dùng SIGTERM trước?",
        a: "<strong>SIGTERM</strong> yêu cầu process tự dọn dẹp rồi thoát (đóng kết nối, flush, hoàn tất request đang chạy) — graceful shutdown. <strong>SIGKILL</strong> giết ngay lập tức, không cho dọn → có thể mất dữ liệu/hỏng trạng thái. K8s gửi SIGTERM, chờ <code>terminationGracePeriod</code> rồi mới SIGKILL. App của bạn phải <strong>bắt SIGTERM</strong> để thoát sạch, nếu không mỗi lần deploy sẽ cắt ngang request của học viên." },
      { q: "Vì sao KHÔNG nên chạy service bằng user root trong (và ngoài) container? Sửa thế nào?",
        a: "Root có toàn quyền: nếu service bị khai thác, kẻ tấn công chiếm luôn máy/host. Nguyên tắc <strong>least privilege</strong>: tạo user riêng quyền tối thiểu, chỉ mở quyền vào đúng thư mục cần. Trong Dockerfile thêm <code>USER appuser</code>; trên VM chạy service qua systemd với <code>User=</code> riêng. Giảm blast radius khi (không phải nếu) bị xâm nhập." },
      { q: "Đặt secret vào biến môi trường tốt hơn hardcode, nhưng vì sao vẫn CHƯA đủ an toàn cho prod?",
        a: "Env var tách secret khỏi code (không lọt vào Git) — tốt cho dev. Nhưng vẫn lộ qua <code>/proc</code>, core dump, log lỗi in cả env, hay child process kế thừa. Prod cần <strong>secret manager</strong> (Vault / cloud secret store) cấp secret ngắn hạn, có xoay vòng và audit. Đây là cầu nối tới node SEC-17." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Dựng 1 VM Linux (multipass/Vagrant/VPS rẻ). Cài Nginx làm reverse proxy trỏ về 1 app nhỏ chạy bằng systemd. Rồi <b>tự gây sự cố</b> và debug: (a) dừng app → xem 502, dùng bộ lệnh chẩn đoán tìm ra; (b) đổ đầy đĩa bằng <code>fallocate</code> → xem chuyện gì xảy ra; (c) viết 1 shell script kiểm tra sức khỏe (curl /health, kiểm <code>df</code>) và gửi cảnh báo khi bất thường.</p>`,
    links: [
      { t: "Linux Journey — học Linux có lộ trình", u: "linuxjourney.com" },
      { t: "The Missing Semester of Your CS Education (MIT)", u: "missing.csail.mit.edu" },
      { t: "systemd — man systemctl / journalctl", u: "man7.org/linux/man-pages/man1/systemctl.1.html" },
      { t: "Google SRE — nguyên tắc vận hành", u: "sre.google/sre-book/table-of-contents" },
    ],
  },
  {
    id: "NET-02", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Networking cho DevOps",
    sum: "DNS · TCP/IP · HTTP/TLS · reverse proxy/LB — hiểu đường đi của một request.",
    theory: `<p>Bạn không thể debug hệ phân tán nếu không hiểu gói tin đi đâu. Cần: <b>DNS</b> (phân giải tên → IP, TTL, vì sao 'đổi DNS 5 phút sau mới ăn'), <b>TCP/IP & cổng</b>, <b>HTTP/HTTPS</b> (method, status code, header, keep-alive), <b>TLS handshake</b> (vì sao chứng chỉ hết hạn = sập toàn site), <b>reverse proxy & load balancer</b> (Nginx/ALB: phân tải, TLS termination, health check).</p>
<p>Bộ lệnh mạng cần thuộc:</p>
<pre><code>dig course.edu +short        # DNS phân giải ra IP nào
curl -v https://course.edu   # xem handshake TLS + header + status
curl -o /dev/null -s -w "%{time_total}\\n" https://course.edu  # đo latency
ss -tlnp                     # đang listen cổng nào
traceroute course.edu        # gói tin đi qua đâu, tắc ở chặng nào</code></pre>
<p><b>Latency numbers để định hình thiết kế:</b> round-trip trong cùng DC ~0.5ms · xuyên lục địa ~150ms · TLS handshake thêm 1–2 RTT. Đây là lý do đặt CDN/edge gần user và tái dùng kết nối (keep-alive) quan trọng với edtech phục vụ video toàn quốc.</p>`,
    whenUse: `<p>Cần cho cloud (VPC/subnet/security group ở CLD-08 chính là networking), cho Ingress K8s, cho debug 'service A không gọi được service B'. Mức 'đủ dùng': hiểu status code, đọc được <code>curl -v</code>, biết phân biệt lỗi DNS / lỗi kết nối / lỗi TLS / lỗi ứng dụng.</p>`,
    pros: [
      "Chẩn đoán được nhóm lỗi phổ biến nhất: kết nối, DNS, TLS, timeout",
      "Là nền để hiểu VPC/security group/Ingress mà không sợ",
      "Giúp thiết kế đường đi request tối ưu (CDN, keep-alive, LB)",
    ],
    cons: [
      "Lý thuyết mạng sâu vô tận — dễ sa đà; nên bám các lệnh & tình huống thực",
      "Một số vấn đề nằm ở tầng nhà cung cấp, ngoài tầm kiểm soát",
    ],
    questions: [
      { q: "Đổi bản ghi DNS trỏ domain sang server mới nhưng nhiều user vẫn vào server cũ hàng giờ. Vì sao và phòng thế nào?",
        a: "Do <strong>TTL của bản ghi DNS</strong>: resolver và trình duyệt cache IP cũ tới khi TTL hết. Muốn chuyển mượt: <strong>hạ TTL xuống thấp (vd 60s) trước vài ngày</strong>, đổi xong rồi nâng lại. Đừng kỳ vọng DNS đổi tức thì — đây là lý do chuyển traffic quan trọng nên làm ở tầng load balancer, không phải bằng cách sửa DNS." },
      { q: "Toàn bộ site sập lúc nửa đêm, không ai deploy gì. Nghi phạm số 1 liên quan mạng?",
        a: "<strong>Chứng chỉ TLS hết hạn.</strong> Nó hết theo lịch nên hay sập vào thời điểm 'chẳng ai làm gì', và làm <em>mọi</em> HTTPS request fail cùng lúc. Phòng: tự động gia hạn (cert-manager/Let's Encrypt) + <strong>alert trước khi hết hạn 2–3 tuần</strong>. Kiểm nhanh bằng <code>curl -v</code> hoặc <code>openssl s_client</code>." },
      { q: "Phân biệt 502, 503, 504 — mỗi cái chỉ về tầng nào?",
        a: "<strong>502 Bad Gateway</strong>: proxy nhận được phản hồi hỏng/không kết nối được backend (app chết, sai cổng). <strong>503 Service Unavailable</strong>: không có backend khỏe mạnh để phục vụ (đang deploy, hết pod, LB không thấy target healthy). <strong>504 Gateway Timeout</strong>: backend có nhận nhưng trả lời quá chậm (query treo, downstream chậm). Đọc đúng mã giúp nhắm đúng tầng để sửa thay vì restart bừa." },
      { q: "Vì sao đặt CDN + dùng HTTP keep-alive lại quan trọng cho edtech phục vụ video/ảnh toàn quốc?",
        a: "Round-trip xuyên lục địa ~150ms và TLS handshake tốn thêm 1–2 RTT. <strong>CDN</strong> đưa nội dung tĩnh (video, ảnh, bài học) tới edge gần user → cắt latency và giảm tải origin. <strong>Keep-alive/HTTP2</strong> tái dùng kết nối đã bắt tay TLS → tránh trả giá handshake cho mỗi request. Với nội dung tĩnh nặng, đây là đòn tối ưu lớn nhất và rẻ nhất." },
      { q: "Service A trong VPC không gọi được service B. Bạn kiểm tra theo trình tự nào để cô lập?",
        a: "Đi từng tầng: (1) <strong>DNS</strong> — <code>dig</code> tên B có ra IP đúng? (2) <strong>Kết nối L3/L4</strong> — <code>nc -vz B 443</code> / <code>curl -v</code> có bắt tay TCP được không (nếu treo → thường là security group/firewall chặn cổng). (3) <strong>TLS</strong> — chứng chỉ hợp lệ? (4) <strong>Ứng dụng</strong> — status code/response. Cô lập được 'tắc ở tầng nào' rồi mới sửa; phần lớn lỗi nội bộ cloud là <strong>security group chặn cổng</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Với domain bất kỳ (hoặc app của bạn): (1) dùng <code>dig</code> xem chuỗi phân giải + TTL; (2) <code>curl -v</code> để đọc từng bước TLS handshake và toàn bộ header; (3) đo <code>time_total</code> từ 2 vị trí mạng khác nhau để thấy ảnh hưởng khoảng cách; (4) dựng Nginx làm reverse proxy + TLS (Let's Encrypt) cho 1 app, rồi cố tình đặt sai cổng backend để tự tạo 502 và đọc log. Ghi lại mỗi status code bạn gặp nghĩa là gì.</p>`,
    links: [
      { t: "Cloudflare Learning — DNS, TLS, HTTP", u: "cloudflare.com/learning" },
      { t: "MDN — HTTP status codes", u: "developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
      { t: "High Performance Browser Networking (Ilya Grigorik)", u: "hpbn.co" },
      { t: "Let's Encrypt — chứng chỉ TLS miễn phí", u: "letsencrypt.org/docs" },
    ],
  },
  {
    id: "GIT-03", tier: 1, xp: 100, prereq: ["FND-00"],
    title: "Git workflow & Release",
    sum: "Git ở góc độ vận hành: trunk-based, semver, tag release, rollback bằng artifact.",
    theory: `<p>Bạn đã biết Git để <i>code</i>. Node này là Git để <i>giao hàng</i> — khác biệt quan trọng. Trọng tâm: <b>chiến lược nhánh</b> (trunk-based development vs GitFlow), <b>semantic versioning</b> (MAJOR.MINOR.PATCH), <b>tag</b> gắn với artifact/release, và <b>rollback</b> đúng cách.</p>
<p><b>Trunk-based</b> (nhánh ngắn, merge vào main nhiều lần/ngày, ẩn tính năng chưa xong sau feature flag) là nền của CI/CD hiện đại vì nó tạo ra <b>batch nhỏ</b> — đúng tinh thần DORA. <b>GitFlow</b> (nhiều nhánh dài: develop/release/hotfix) sinh batch to, merge đau, ngược với deploy thường xuyên — chỉ hợp sản phẩm phát hành theo phiên bản (desktop app), không hợp web service liên tục.</p>
<pre><code>git tag -a v1.4.2 -m "release 1.4.2" && git push --tags
# CI build image gắn nhãn theo tag: registry/app:v1.4.2 (+ digest)
# Rollback = deploy lại image cũ ĐÃ build, KHÔNG build lại từ code</code></pre>
<p><b>Nguyên tắc vàng:</b> mỗi release là một <b>artifact bất biến</b> (immutable) gắn với một commit/tag cụ thể. Rollback nghĩa là trỏ lại artifact cũ, không phải 'sửa code cho về như cũ'.</p>`,
    whenUse: `<p>Chiến lược nhánh + versioning là điều kiện tiên quyết cho CI (CI-06) và CD (CD-07). Chọn trunk-based cho web service deploy liên tục; chỉ dùng nhánh dài khi thực sự phát hành theo phiên bản đóng gói.</p>`,
    pros: [
      "Trunk-based → batch nhỏ → hợp với CI/CD và các chỉ số DORA",
      "Tag + semver cho lịch sử release rõ ràng, truy vết được",
      "Rollback bằng artifact bất biến: nhanh và đã kiểm chứng",
    ],
    cons: [
      "Trunk-based đòi kỷ luật cao: test tốt + feature flag, nếu không dễ vỡ main",
      "GitFlow tuy trực quan nhưng sinh merge lớn, chậm, ngược tinh thần deploy liên tục",
    ],
    questions: [
      { q: "Deploy v2.0 xong phát hiện lỗi nặng lúc peak. Rollback ngay thế nào, và vì sao KHÔNG dùng git revert vội?",
        a: "Ưu tiên <strong>deploy lại artifact/tag v1.x đã build sẵn</strong> — nhanh (giây/phút), đã được kiểm chứng khi chạy trước đó. <code>git revert</code> tạo commit mới phải <strong>build + test + deploy lại từ đầu</strong> → chậm, và có thể kéo theo lỗi mới hoặc xung đột. Git revert là để dọn lịch sử mã <em>sau khi</em> đã cứu hỏa bằng cách trỏ về artifact cũ. Rollback là thao tác vận hành, không phải thao tác sửa code." },
      { q: "Vì sao trunk-based development hợp CI/CD hơn GitFlow? Liên hệ DORA.",
        a: "Trunk-based tạo <strong>nhánh ngắn, merge liên tục</strong> → mỗi thay đổi nhỏ, tích hợp sớm, ít xung đột → chính là <strong>batch nhỏ</strong> giúp Lead Time ngắn và CFR thấp (DORA). GitFlow có các nhánh sống lâu (develop/release) sinh <strong>merge lớn, đau, hiếm</strong> — ngược với 'deploy thường xuyên'. Tính năng chưa xong được giấu sau <strong>feature flag</strong> thay vì giữ trong nhánh dài." },
      { q: "Bạn cần release gấp một bản sửa lỗi bảo mật khi main đã có tính năng dở dang chưa muốn phát hành. Xử lý thế nào?",
        a: "Nếu tính năng dở dang đã nằm trong main nhưng <strong>ẩn sau feature flag</strong> (đúng cách của trunk-based) thì cứ build & deploy từ main bình thường, flag tắt nên user không thấy. Nếu không có flag, tạo <strong>hotfix từ tag release đang chạy trên prod</strong> (không phải từ HEAD của main), vá, tag <code>vX.Y.(Z+1)</code>, deploy, rồi merge ngược về main. Bài học: feature flag giúp tách 'đã deploy' khỏi 'đã phát hành'." },
      { q: "Theo semver, thêm một endpoint API mới (không phá cái cũ) thì tăng số nào? Còn đổi định dạng response cũ?",
        a: "Thêm tính năng <strong>tương thích ngược</strong> (endpoint mới, cũ vẫn chạy) → tăng <strong>MINOR</strong> (1.4.0 → 1.5.0). Đổi định dạng response cũ khiến client hiện tại vỡ → <strong>breaking change → tăng MAJOR</strong> (1.5.0 → 2.0.0). PATCH chỉ dành cho sửa lỗi không đổi hành vi công khai. Semver là 'hợp đồng' với người dùng API — với edtech có app mobile gọi API, tăng MAJOR bừa sẽ làm app cũ của học viên vỡ." },
      { q: "Vì sao gắn tag Docker image bằng 'latest' để deploy prod là anti-pattern?",
        a: "<code>latest</code> là nhãn <strong>di động</strong>: nó trỏ tới image khác nhau theo thời gian, nên bạn không biết prod đang chạy chính xác bản nào → không tái tạo được, không rollback tin cậy được, hai node có thể kéo hai bản khác nhau. Hãy gắn tag <strong>bất biến theo version/commit + digest</strong> (<code>app:v1.4.2@sha256:...</code>). Immutable artifact là điều kiện để rollback và audit hoạt động." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên một repo mẫu: (1) thiết lập luồng trunk-based — nhánh ngắn, mở PR, merge vào main; (2) gắn <code>git tag -a v1.0.0</code> và viết quy ước semver cho dự án; (3) mô phỏng release: script build 'artifact' gắn theo tag, lưu lại; (4) tập rollback: 'deploy' artifact v1.0.0 sau khi đã 'deploy' v1.1.0 lỗi — đo xem nhanh hơn revert+build lại bao nhiêu. Viết 1 đoạn quy ước nhánh + release cho team.</p>`,
    links: [
      { t: "trunkbaseddevelopment.com", u: "trunkbaseddevelopment.com" },
      { t: "Semantic Versioning 2.0.0", u: "semver.org" },
      { t: "Martin Fowler — Patterns for Managing Source Code Branches", u: "martinfowler.com/articles/branching-patterns.html" },
      { t: "Atlassian — Git workflows so sánh", u: "atlassian.com/git/tutorials/comparing-workflows" },
    ],
  },
];

export const NODES: SkillNode[] = [
  ...TIER0_1,
  ...TIER2,
  ...TIER3,
  ...TIER4,
  ...TIER5,
  ...TIER6,
  ...TIER7,
];
