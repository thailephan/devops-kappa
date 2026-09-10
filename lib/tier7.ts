import type { SkillNode } from "./skill-types";

export const TIER7: SkillNode[] = [
  {
    id: "SEC-17", tier: 7, xp: 100, prereq: ["CD-07", "IAC-09"],
    title: "DevSecOps & Secrets Management",
    sum: "Shift-left security; secret manager; least privilege; SAST/DAST/SCA.",
    theory: `<p><b>Shift-left</b> nghĩa là đẩy kiểm tra bảo mật về sớm trong vòng đời — bắt lỗi lúc còn rẻ (trên máy dev, trong PR) thay vì để pentest phát hiện lúc đã lên prod. Security không phải một cổng cuối cùng do team khác gác; nó là các bước tự động rải dọc pipeline. Ba điểm chèn cụ thể:</p>
<ul>
<li><b>Pre-commit</b> — quét secret ngay trước khi commit (<code>gitleaks</code>, <code>git-secrets</code>) để token không bao giờ vào lịch sử Git.</li>
<li><b>CI</b> — <b>SAST</b> (quét mã nguồn tĩnh) + <b>SCA</b> (quét phụ thuộc: <code>npm audit</code>, Trivy, Snyk) + <b>image scan</b> (quét lỗ hổng trong container image).</li>
<li><b>Pre-deploy</b> — quét chính sách IaC (<code>tfsec</code>, Checkov, OPA) chặn cấu hình nguy hiểm (S3 public, security group mở 0.0.0.0/0) + <b>DAST</b> chạy trên staging (tấn công app đang chạy như hacker).</li>
</ul>
<p><b>Bẫy chết người — secret lộ trong Git:</b> xóa dòng đó rồi commit lại <i>không cứu được gì</i> — secret vẫn nằm trong lịch sử, ai clone cũng thấy. Kể cả rewrite lịch sử (BFG/filter-repo) cũng phải coi như secret <b>đã bị lộ vĩnh viễn</b>. Hành động đúng và bắt buộc: <b>ROTATE</b> — thu hồi và cấp lại secret mới ngay. Rewrite lịch sử chỉ là dọn dẹp phụ, không thay thế việc xoay.</p>
<p><b>Secret manager vs env var:</b> env var tách secret khỏi code (tốt), nhưng vẫn tĩnh, khó xoay, dễ lộ qua log/core dump, không audit được ai đọc lúc nào. <b>Secret manager</b> (Vault, cloud secret store) cấp secret <b>ngắn hạn có TTL</b>, xoay tự động, ghi log truy cập, và phân quyền theo danh tính.</p>
<p><b>Least privilege</b> cho service account: mỗi service một danh tính riêng, chỉ đúng quyền tối thiểu cần dùng. Khi (không phải nếu) một service bị chiếm, blast radius bị giới hạn ở đúng quyền của nó thay vì lan ra cả hệ thống.</p>`,
    whenUse: `<p>Áp dụng ngay khi bạn đã có pipeline CD (CD-07) và IaC (IAC-09) — vì đó chính là nơi chèn các cổng bảo mật. Với edtech 10M user giữ dữ liệu học viên (trẻ em, thanh toán), đây không phải tùy chọn. Nhưng theo tinh thần <b>đo trước, tự động sau</b>: bắt đầu bằng pre-commit secret scan + SCA (rẻ, giá trị cao), đừng dựng cả Vault HA cluster ngày đầu. Chống over-engineering: <b>gate ở chế độ cảnh báo trước</b>, đo tỉ lệ false positive rồi mới bật chặn cứng.</p>`,
    pros: [
      "Bắt lỗi bảo mật sớm khi còn rẻ, thay vì để pentest phát hiện trên prod",
      "Secret manager cho secret ngắn hạn, xoay tự động và audit được",
      "Least privilege giới hạn blast radius khi một service bị chiếm",
      "Các cổng tự động biến bảo mật thành thói quen lặp lại, không phụ thuộc trí nhớ",
    ],
    cons: [
      "Quét bảo mật dễ đẻ false positive; nếu chặn cứng quá sớm sẽ làm nghẽn pipeline và team lờn cảnh báo",
      "Vận hành secret manager (Vault) thêm một hệ thống phải bảo trì và có thể thành điểm gãy",
    ],
    questions: [
      { q: "Một dev lỡ commit AWS access key vào repo, phát hiện sau 10 phút. Họ định xóa dòng đó rồi commit lại. Có đủ không?",
        a: "<strong>Không đủ, và thứ tự ưu tiên bị sai.</strong> Secret đã nằm trong lịch sử Git, ai đã clone/fetch hoặc bot quét GitHub đều lấy được — phải coi như đã lộ vĩnh viễn. Việc đầu tiên và bắt buộc là <strong>rotate: thu hồi key cũ và cấp key mới ngay</strong>; xóa dòng hay rewrite lịch sử (BFG/filter-repo) chỉ là dọn dẹp phụ. Bài học phòng ngừa: bật <code>gitleaks</code> ở pre-commit để nó không bao giờ vào được commit đầu tiên." },
      { q: "Phân biệt SAST, DAST và SCA. Mỗi loại bắt được nhóm lỗi nào và nên đặt ở đâu trong pipeline?",
        a: "<strong>SAST</strong> quét mã nguồn tĩnh (không chạy app) tìm pattern nguy hiểm như SQL injection, hardcoded secret — đặt trong CI, chạy nhanh trên mỗi PR. <strong>SCA</strong> quét cây phụ thuộc/thư viện bên thứ ba đối chiếu CSDL lỗ hổng đã biết (CVE) — cũng trong CI, vì phần lớn code prod là dependency của người khác. <strong>DAST</strong> tấn công app <em>đang chạy</em> từ ngoài như hacker (fuzzing, thử auth bypass) — đặt <strong>pre-deploy trên staging</strong> vì cần môi trường sống. Chúng bổ sung nhau: SAST/SCA thấy lỗi trong code bạn viết và mượn, DAST thấy lỗi lộ ra khi hệ thống ghép lại chạy thật." },
      { q: "Team đang để secret DB trong biến môi trường của container. Bạn có nên ép chuyển sang Vault ngay không?",
        a: "Env var đã hơn hardcode, nhưng nó tĩnh, khó xoay, lộ qua log/core dump và không audit được — với edtech giữ dữ liệu học viên thì chưa đủ. Tuy vậy đừng nhảy thẳng vào dựng Vault HA cluster nếu chưa đo được nhu cầu: chi phí vận hành và rủi ro biến nó thành điểm gãy mới. <strong>Quyết định theo trade-off: dùng managed secret store của cloud (rẻ, ít vận hành) trước, ưu tiên bật xoay tự động + audit log</strong>; chỉ nâng lên Vault self-host khi có yêu cầu như dynamic secret cho DB hoặc đa-cloud mà managed store không đáp ứng." },
      { q: "IaC policy scan (tfsec/Checkov) bật lên báo 300 vi phạm trên codebase Terraform hiện có. Bật chế độ chặn cứng luôn?",
        a: "<strong>Không — chặn cứng ngày đầu sẽ đóng băng mọi deploy và khiến team disable luôn công cụ.</strong> Chạy ở chế độ <em>cảnh báo (audit)</em> trước, phân loại 300 vi phạm theo mức độ, và chỉ đặt <strong>chặn cứng cho nhóm nghiêm trọng</strong> (S3 public, security group mở 0.0.0.0/0 ở cổng nhạy cảm) rồi mở rộng dần. Đây là shift-left đúng nghĩa: đưa kiểm tra về sớm nhưng theo lộ trình đo được, tránh biến cổng bảo mật thành thứ ai cũng tìm cách vòng qua." },
      { q: "Vì sao mỗi microservice nên có service account riêng thay vì dùng chung một danh tính quyền lớn cho tiện?",
        a: "Dùng chung một danh tính quyền lớn nghĩa là khi một service bị khai thác, kẻ tấn công thừa hưởng <strong>toàn bộ</strong> quyền đó — blast radius là cả hệ thống. <strong>Least privilege: mỗi service một danh tính, chỉ đúng quyền tối thiểu</strong> (service video chỉ đọc bucket video, không đụng được DB thanh toán). Nó cũng làm audit rõ ràng (biết chính xác danh tính nào làm gì) và giới hạn thiệt hại khi rò secret. Đánh đổi là nhiều account/policy hơn để quản — nên quản bằng IaC (IAC-09) để không thành gánh nặng thủ công." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên một repo app nhỏ có pipeline CI: (1) cài <code>gitleaks</code> làm pre-commit hook, cố tình thêm một fake key và xác nhận nó bị chặn; (2) thêm bước SCA vào CI (<code>npm audit</code> hoặc Trivy) và một bước image scan, cho pipeline fail khi có lỗ hổng mức cao; (3) thêm <code>tfsec</code>/Checkov vào một module Terraform và chạy ở chế độ cảnh báo, đếm số vi phạm; (4) diễn tập tình huống lộ secret: viết runbook 5 bước — <b>rotate trước</b>, rồi mới dọn lịch sử — và bấm giờ xem đội mất bao lâu để xoay xong một key.</p>`,
    links: [
      { t: "OWASP — DevSecOps Guideline", u: "owasp.org/www-project-devsecops-guideline" },
      { t: "gitleaks — quét secret trong Git", u: "github.com/gitleaks/gitleaks" },
      { t: "HashiCorp Vault — secret management", u: "developer.hashicorp.com/vault/docs" },
      { t: "OWASP Cheat Sheet — Secrets Management", u: "cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
      { t: "Aqua Trivy — quét image & IaC", u: "trivy.dev" },
    ],
  },
  {
    id: "SUP-18", tier: 7, xp: 100, prereq: ["SEC-17", "CI-06"],
    title: "Supply Chain Security (SBOM · Signing)",
    sum: "SBOM, ký artifact, provenance; phòng tấn công chuỗi cung ứng.",
    theory: `<p><b>Tấn công chuỗi cung ứng</b> là khi kẻ xấu không tấn công thẳng bạn mà đầu độc một mắt xích bạn tin dùng: một thư viện npm bị chiếm, một base image bị chèn mã độc, một bước CI bị sửa. Bạn build sạch từ code của mình nhưng vẫn nhiễm qua thứ mình <i>mượn</i>. Vì phần lớn artifact prod là code người khác, đây là bề mặt tấn công lớn nhất và khó thấy nhất.</p>
<p><b>SBOM (Software Bill of Materials)</b> là danh sách nguyên vật liệu: mọi thành phần + phiên bản có trong artifact. Giá trị lớn nhất lộ ra lúc khủng hoảng — <b>ví dụ Log4Shell</b>: khi lỗ hổng Log4j nổ ra, đội có SBOM trả lời trong vài phút "có, service X và Y dùng Log4j 2.14, ở đây"; đội không có phải grep mù cả tuần qua hàng trăm repo. SBOM biến câu hỏi "chúng ta có dính không, ở đâu" từ nhiều ngày xuống vài giây.</p>
<p><b>Ký artifact</b> (<code>cosign</code>/Sigstore) gắn chữ ký mật mã vào image để chứng minh "image này do pipeline của tôi build, chưa bị đổi". Rồi <b>verify lúc deploy</b> — cluster từ chối image không có chữ ký hợp lệ:</p>
<pre><code>cosign sign --key cosign.key registry/app:v1.4.2
cosign verify --key cosign.pub registry/app:v1.4.2
# K8s: dùng policy controller (Kyverno/Sigstore) chặn image chưa ký</code></pre>
<p><b>Pin theo digest, không theo tag:</b> tag di động (<code>node:20</code>) có thể bị đổi ruột dưới chân bạn. Ghim theo digest bất biến bảo đảm build hôm nay và tháng sau lấy đúng một image:</p>
<pre><code>FROM node:20-slim@sha256:abc123...   # ghim digest, không phải chỉ tag</code></pre>
<p><b>Provenance / SLSA</b> là "giấy khai sinh" của artifact: sinh ở commit nào, pipeline nào, lúc nào — ký lại được để không giả mạo. <b>SLSA</b> là khung xếp hạng mức độ tin cậy của chuỗi build. <b>Dependency confusion</b>: kẻ xấu đẩy một package công khai trùng tên package nội bộ của bạn với version cao hơn, làm trình quản lý gói kéo nhầm bản độc — phòng bằng scoping/registry riêng và pin nguồn.</p>`,
    whenUse: `<p>Xây trên nền SEC-17 và CI-06: chỉ ký/gắn provenance được khi bạn đã kiểm soát pipeline build. Với edtech 10M user, một image bị đầu độc là rò rỉ dữ liệu diện rộng. Nhưng vẫn <b>đo trước, tự động sau</b>: giá trị cao nhất và rẻ nhất là <b>sinh SBOM cho mọi image</b> (một dòng trong CI) và <b>pin base image theo digest</b> — làm ngay. Ký + verify bắt buộc lúc deploy là bước sau, khi bạn đã có policy controller và quy trình quản khóa; bật verify ở chế độ cảnh báo trước khi chặn cứng để không tự khóa mình khỏi prod.</p>`,
    pros: [
      "SBOM biến câu hỏi lúc khủng hoảng thành tra cứu vài giây thay vì grep cả tuần",
      "Ký + verify chặn image lạ/bị đổi ruột trước khi chạy trên cluster",
      "Pin theo digest cho build tái tạo được, không bị đổi ruột dưới chân",
      "Provenance/SLSA cho chuỗi build kiểm chứng được, chống giả mạo artifact",
    ],
    cons: [
      "Thêm hạ tầng quản khóa ký và policy controller; sai chỗ này có thể tự khóa deploy của chính mình",
      "SBOM chỉ hữu ích nếu được lưu trữ và tra cứu được; sinh ra rồi vứt đó thì vô nghĩa",
    ],
    questions: [
      { q: "Sáng ra tin một lỗ hổng nghiêm trọng trong thư viện phổ biến (kiểu Log4Shell) vừa công bố. Team có SBOM và team không có khác nhau thế nào trong 1 giờ đầu?",
        a: "Team <strong>có SBOM</strong> chạy một truy vấn trên kho SBOM và trong vài phút biết chính xác service nào, phiên bản nào, ở đâu bị ảnh hưởng — rồi tập trung vá đúng chỗ. Team <strong>không có</strong> phải grep mù qua hàng trăm repo và image, dễ sót một service phụ vẫn dính, kéo dài phơi nhiễm nhiều ngày. <strong>Giá trị cốt lõi của SBOM là rút ngắn thời gian trả lời câu hỏi 'ta có dính không, ở đâu' từ ngày xuống giây</strong> — đúng lúc mỗi phút đều đắt. Điều kiện: SBOM phải được lưu và tra cứu được, không phải sinh ra rồi vứt." },
      { q: "Dockerfile của team ghi FROM node:20. Vì sao đây là rủi ro chuỗi cung ứng và sửa thế nào?",
        a: "Tag <code>node:20</code> là <strong>nhãn di động</strong>: hôm nay và tháng sau có thể trỏ tới hai image khác nhau, nên build không tái tạo được và nếu tag bị đầu độc bạn kéo phải mã độc mà không hay. <strong>Sửa: ghim theo digest bất biến</strong> — <code>FROM node:20-slim@sha256:...</code> — để luôn lấy đúng một image đã kiểm. Đánh đổi là phải chủ động cập nhật digest khi muốn bản mới (nên tự động hóa bằng Renovate/Dependabot), nhưng đổi lại được tính tái tạo và một điểm kiểm soát rõ ràng." },
      { q: "Ký image bằng cosign rồi. Nhưng nếu chỉ ký mà không làm gì thêm thì đã bảo vệ được gì chưa?",
        a: "<strong>Chưa — ký mà không verify thì gần như vô dụng.</strong> Chữ ký chỉ có giá trị khi có ai đó <em>kiểm</em> nó trước khi chạy: cluster phải có policy controller (Kyverno/Sigstore policy-controller) <strong>từ chối mọi image không mang chữ ký hợp lệ của pipeline</strong>. Đó mới là thứ chặn được kẻ đẩy image lạ hoặc image bị sửa ruột vào registry. Lưu ý vận hành: bật verify ở chế độ cảnh báo trước, vì cấu hình sai khóa/policy có thể tự khóa chính bạn khỏi deploy lên prod." },
      { q: "Dependency confusion là gì và vì sao một edtech có nhiều package nội bộ lại dễ dính?",
        a: "Kẻ tấn công đẩy lên registry công khai một package <strong>trùng tên package nội bộ của bạn nhưng version cao hơn</strong>; nếu trình quản lý gói ưu tiên version cao nhất và với tới cả registry công khai, nó kéo nhầm bản độc thay vì bản nội bộ. Edtech có nhiều package nội bộ (thư viện chung, SDK) mà tên có thể đoán được nên là mục tiêu ngon. <strong>Phòng: dùng scope/namespace riêng, ghim nguồn registry rõ ràng, và cấu hình chặn resolver với tới public cho các package nội bộ</strong>. Nó thuộc họ tấn công chuỗi cung ứng vì lối vào là thứ bạn tin dùng, không phải hệ thống bạn." },
    ],
    lab: `<span class="tag">Lab tổng hợp</span><p style="margin-top:8px">Trên pipeline build image của bạn: (1) thêm bước sinh SBOM (<code>syft</code> hoặc <code>trivy sbom</code>) cho mỗi image và lưu lại như một artifact có thể tra cứu; (2) ghim base image trong Dockerfile theo digest thay vì tag, ghi lại khác biệt; (3) dùng <code>cosign</code> ký image sau khi build và <code>cosign verify</code> để kiểm — rồi thử deploy một image chưa ký lên cluster có policy controller và xác nhận nó bị chặn; (4) mô phỏng diễn tập Log4Shell: chọn một dependency bất kỳ, dùng SBOM trả lời trong dưới 1 phút "service nào đang dùng nó, phiên bản mấy".</p>`,
    links: [
      { t: "SLSA — Supply-chain Levels for Software Artifacts", u: "slsa.dev" },
      { t: "Sigstore / cosign — ký & verify artifact", u: "docs.sigstore.dev" },
      { t: "CISA — Software Bill of Materials (SBOM)", u: "cisa.gov/sbom" },
      { t: "Anchore Syft — sinh SBOM", u: "github.com/anchore/syft" },
      { t: "OWASP — Dependency Confusion", u: "owasp.org/www-community/attacks/Dependency_Confusion" },
    ],
  },
  {
    id: "SYN-A", tier: 7, xp: 200, prereq: ["CD-07", "K8S-11", "IAC-09"], synth: true,
    title: "⚙ Tổng hợp: GitOps end-to-end",
    sum: "Ghép CI/CD + K8s + IaC thành GitOps: Git là nguồn sự thật duy nhất.",
    theory: `<p><b>GitOps</b> ghép ba thứ bạn đã học — CD (CD-07), Kubernetes (K8S-11), IaC (IAC-09) — thành một mô hình vận hành: <b>trạng thái mong muốn của toàn hệ thống được khai báo trong Git, và một agent liên tục kéo Git về đồng bộ với cluster</b>. Git không còn chỉ là nơi giữ code; nó là <b>nguồn sự thật duy nhất</b> cho cả hạ tầng lẫn cấu hình runtime.</p>
<p><b>Pull vs push deploy — khác biệt cốt lõi:</b></p>
<ul>
<li><b>Push</b> (CI truyền thống): pipeline CI cầm credential cluster và <code>kubectl apply</code> đẩy vào. Vấn đề: CI phải giữ khóa quyền lớn vào prod, và cluster không tự biết mình có bị lệch khỏi ý định không.</li>
<li><b>Pull</b> (GitOps — ArgoCD/Flux): một agent <i>chạy trong cluster</i> tự kéo manifest từ Git và áp vào. Credential không rời cluster, và agent liên tục so sánh thực tế với Git.</li>
</ul>
<p><b>Drift detection & auto-heal:</b> vì agent luôn so trạng thái thật với Git, nếu ai đó <code>kubectl edit</code> tay lúc 3h sáng, nó phát hiện <i>lệch (drift)</i> và kéo về đúng như Git — hoặc cảnh báo. Thao tác tay không còn tồn tại lén lút; muốn đổi gì phải qua Git, tức là qua PR, review, audit.</p>
<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: edtech-web
spec:
  source:
    repoURL: https://git.example.com/edtech/config.git
    path: apps/web/overlays/prod
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: web
  syncPolicy:
    automated:
      prune: true      # xóa thứ đã bỏ khỏi Git
      selfHeal: true   # kéo drift về đúng Git</code></pre>
<p><b>Tách app repo và config repo:</b> code app ở một repo, manifest/cấu hình triển khai ở repo khác. Lý do: (1) tránh vòng lặp vô hạn — CI build ghi tag mới vào config repo mà không kích lại chính nó; (2) đổi cấu hình prod (scale, rollback) không cần build lại app; (3) phân quyền khác nhau — ai được sửa cấu hình prod không nhất thiết là ai sửa code.</p>
<p><b>Rollback = git revert manifest:</b> vì trạng thái là khai báo trong Git, quay lui chỉ là <code>git revert</code> commit cấu hình về image/tag cũ — agent tự đồng bộ. Rollback trở thành một thao tác Git có audit, không phải gõ lệnh tay hồi hộp.</p>`,
    whenUse: `<p>GitOps xứng đáng khi bạn <b>đã</b> có Kubernetes + IaC + CD và bắt đầu đau vì drift, vì thao tác tay không truy vết được, vì CI giữ quá nhiều khóa prod. Với edtech 10M user nhiều cluster/nhiều môi trường, nó là cách giữ mọi thứ nhất quán và auditable. Nhưng <b>chống over-engineering</b>: đừng dựng ArgoCD cho một app một cluster deploy vài lần/tuần — lúc đó push CD đơn giản vẫn ổn. GitOps trả giá bằng một hệ thống (ArgoCD/Flux) phải vận hành + kỷ luật "mọi thứ qua Git"; chỉ mua khi nỗi đau drift/audit/đa-cluster đo được.</p>`,
    pros: [
      "Git là nguồn sự thật duy nhất: mọi thay đổi có PR, review, audit và tái tạo được",
      "Pull model giữ credential prod trong cluster, CI không cần khóa quyền lớn",
      "Drift detection + auto-heal xóa sổ thao tác tay lén lút lúc 3h sáng",
      "Rollback là git revert có audit thay vì gõ lệnh tay hồi hộp",
    ],
    cons: [
      "Thêm ArgoCD/Flux phải vận hành và trở thành một mắt xích quan trọng phải giám sát",
      "Đòi kỷ luật tuyệt đối 'mọi thứ qua Git'; một lần sửa tay là auto-heal có thể ghi đè bất ngờ",
    ],
    questions: [
      { q: "So sánh push deploy (CI kubectl apply) và pull deploy (ArgoCD). Với edtech nhiều cluster, mô hình nào an toàn hơn và vì sao?",
        a: "<strong>Pull an toàn hơn ở quy mô nhiều cluster.</strong> Push buộc CI giữ credential quyền lớn vào từng cluster prod — một CI bị chiếm là mất cả hạm đội, và CI không biết cluster có bị sửa tay lệch đi không. Pull đặt agent <em>trong</em> cluster tự kéo Git, nên <strong>credential prod không rời cluster</strong> và agent liên tục so thực tế với Git để phát hiện/sửa drift. Đánh đổi: pull cần vận hành ArgoCD/Flux và giám sát chính nó; ở quy mô một app một cluster thì push đơn giản vẫn hợp lý hơn — đừng mua độ phức tạp GitOps khi chưa đau." },
      { q: "Vì sao GitOps thường tách app repo và config repo? Ghép chung thì hỏng ở đâu?",
        a: "Tách ra vì ba lý do: <strong>(1) tránh vòng lặp CI</strong> — pipeline build image rồi ghi tag mới vào config repo mà không tự kích lại chính nó; <strong>(2) đổi cấu hình prod (scale, đổi tag, rollback) không cần build lại app</strong>, nhanh và ít rủi ro; <strong>(3) phân quyền khác nhau</strong> — người được duyệt thay đổi prod không nhất thiết trùng người sửa code. Ghép chung thì mỗi lần sửa một dòng manifest lại chạy cả build/test app, dễ tạo vòng lặp bot commit, và khó tách quyền — trộn lẫn 'thay đổi code' với 'thay đổi vận hành prod' vào cùng một dòng review." },
      { q: "3h sáng có người kubectl edit tay tăng replicas để chữa cháy. Với GitOps selfHeal bật, chuyện gì xảy ra và đâu là cách làm đúng?",
        a: "Agent phát hiện thực tế <strong>lệch khỏi Git</strong> và sẽ kéo về đúng số replicas khai báo trong Git — thao tác tay bị hoàn tác, có thể ngay giữa lúc chữa cháy, gây bất ngờ nguy hiểm. Đó chính là điểm mạnh (không có thay đổi lén lút) nhưng cũng là cái bẫy: <strong>cách đúng là đổi qua Git — sửa manifest, commit/PR, để agent đồng bộ</strong>; nếu thật sự cần vá tay khẩn cấp thì phải tạm tắt selfHeal cho app đó rồi bù lại Git ngay sau. Bài học: GitOps đòi kỷ luật 'mọi thứ qua Git', và runbook sự cố phải tính đến auto-heal." },
    ],
    lab: `<span class="tag">Lab tổng hợp</span><p style="margin-top:8px">Trên một cluster (kind/minikube): (1) tạo hai repo — app repo và config repo (manifest); (2) cài ArgoCD, khai báo một <code>Application</code> trỏ vào config repo với <code>selfHeal</code> + <code>prune</code>; (3) đổi số replicas trong config repo, commit, và xem ArgoCD tự đồng bộ; (4) chạy <code>kubectl edit</code> tay để tạo drift và quan sát nó bị kéo về; (5) diễn tập rollback: <code>git revert</code> commit đổi image tag về bản cũ và xác nhận cluster tự quay lui. Ghi lại: rollback bằng git revert mất bao lâu và ai có thể audit nó.</p>`,
    links: [
      { t: "Argo CD — tài liệu chính thức", u: "argo-cd.readthedocs.io" },
      { t: "OpenGitOps — nguyên tắc GitOps", u: "opengitops.dev" },
      { t: "Flux CD — GitOps toolkit", u: "fluxcd.io/flux" },
      { t: "Weaveworks — GitOps là gì (khởi nguồn thuật ngữ)", u: "weave.works/technologies/gitops" },
    ],
  },
  {
    id: "SYN-B", tier: 7, xp: 200, prereq: ["SLO-15", "ALT-16", "SCL-13"], synth: true,
    title: "⚙ Tổng hợp: Design for Failure & SRE",
    sum: "Ghép SLO + resilience + autoscale + chaos: CHỨNG MINH chịu lỗi, không tuyên bố.",
    theory: `<p>Node này ghép SLO (SLO-15), alerting/resilience (ALT-16) và autoscale (SCL-13) thành một tư duy: <b>hệ thống chịu lỗi hay không là thứ phải CHỨNG MINH bằng thực nghiệm, không phải tuyên bố trong slide kiến trúc</b>. "Chúng ta có replica nên HA" là niềm tin cho tới khi bạn kéo phích một node lúc peak và xem điều gì thật sự xảy ra.</p>
<p><b>Chứng minh resilience bằng chaos có kiểm soát + load test:</b></p>
<ul>
<li><b>Chaos engineering</b> — chủ động tiêm lỗi (giết pod, thêm latency, cắt mạng tới DB) trong môi trường kiểm soát, có <i>giả thuyết</i> trước ("giết 1 pod thì SLO vẫn giữ") và <i>blast radius</i> giới hạn. Nếu giả thuyết sai, bạn học được một SPOF khi chưa ai đau.</li>
<li><b>Load test</b> — bơm tải mô phỏng để tìm điểm gãy <i>trước</i> khi user tìm ra.</li>
</ul>
<pre><code>// k6: mô phỏng ramp tới 20k VU và kiểm ngưỡng SLO
import http from "k6/http";
export const options = {
  stages: [
    { duration: "5m", target: 20000 },
    { duration: "10m", target: 20000 },
  ],
  thresholds: { http_req_duration: ["p95&lt;800"] },
};
export default function () { http.get("https://staging.edtech.example/api/lessons"); }</code></pre>
<p><b>SPOF thường gặp + cách gỡ:</b> một DB primary (thêm replica + failover), một AZ (trải nhiều AZ), một cache Redis đơn (cluster/replica + hoạt động được khi cache chết), một NAT/gateway, một secret manager, một CI/CD. Nguyên tắc: đi theo mọi đường request và hỏi "chỗ nào chỉ có một, chết là sập cả".</p>
<p><b>"Load test pass mà prod vẫn sập" — 3 lý do kinh điển:</b></p>
<ul>
<li><b>Môi trường test khác prod</b> — staging nhỏ hơn, ít dữ liệu, cấu hình khác; con số đẹp trên staging vô nghĩa với prod.</li>
<li><b>Kịch bản sai</b> — test đều một endpoint, còn prod là traffic hỗn hợp có spike đột biến (mở cổng đăng ký kỳ thi lúc 8h sáng) mà test không mô phỏng.</li>
<li><b>Phụ thuộc ẩn</b> — test chạy trên dữ liệu cache nóng hoặc bỏ qua bên thứ ba (payment, email, CDN) nên không thấy nút thắt thật.</li>
</ul>
<p><b>Graceful degradation:</b> khi tải vượt sức hoặc một phần chết, hy sinh tính năng phụ để giữ tính năng cốt lõi. Với edtech giờ thi: ưu tiên nộp bài/xem đề; tạm tắt gợi ý, leaderboard, thumbnail. Thà chạy 80% chức năng còn hơn sập 100%.</p>`,
    whenUse: `<p>Áp dụng khi bạn đã có SLO đo được và cơ chế autoscale/resilience, và cần <b>bằng chứng</b> rằng chúng thật sự hoạt động — thường trước một sự kiện tải lớn (mùa thi, khai giảng) hoặc sau một sự cố mà không ai giải thích được. Tinh thần <b>đo trước, tự động sau</b>: chaos/load test là cách "đo" khả năng chịu lỗi. Chống over-engineering: đừng chạy chaos trên prod ngày đầu — bắt đầu ở staging với blast radius nhỏ và giả thuyết rõ; chỉ tiến tới chaos trên prod (game day) khi đội đã trưởng thành về observability và có SLO/error budget làm lưới an toàn.</p>`,
    pros: [
      "Biến 'chắc là chịu được' thành bằng chứng thực nghiệm với giả thuyết và số liệu",
      "Phát hiện SPOF và điểm gãy khi chưa ai đau, thay vì lúc peak thật",
      "Graceful degradation giữ chức năng cốt lõi sống khi một phần hệ thống chết",
      "Load test đúng cách định cỡ được hạ tầng trước mùa cao điểm",
    ],
    cons: [
      "Chaos/load test làm ẩu (blast radius rộng, không giả thuyết) tự gây sự cố thật",
      "Môi trường test giống prod rất tốn kém; test trên môi trường lệch cho niềm tin giả",
    ],
    questions: [
      { q: "Kiến trúc sư nói 'hệ có 3 replica nên chịu lỗi tốt'. Vì sao câu này chưa đủ, và bạn CHỨNG MINH thế nào?",
        a: "Có replica là <strong>tuyên bố</strong>, chưa phải bằng chứng — có thể failover chưa từng chạy, health check sai nên traffic vẫn đổ vào pod chết, hoặc DB phía dưới vẫn là một primary duy nhất. <strong>Cách chứng minh: chaos có kiểm soát</strong> — đặt giả thuyết 'giết 1 trong 3 pod thì SLO p95 vẫn giữ', giới hạn blast radius, rồi thật sự giết pod trong môi trường kiểm soát và đo. Nếu SLO vỡ, bạn vừa tìm ra một SPOF khi chưa ai đau. Nguyên tắc SRE: <strong>resilience là thứ đo được bằng thực nghiệm, không phải khẳng định trong slide</strong>." },
      { q: "Load test trên staging pass hết (p95 dưới ngưỡng), nhưng đúng giờ mở đăng ký kỳ thi prod vẫn sập. Ba nguyên nhân khả dĩ?",
        a: "<strong>(1) Môi trường test khác prod</strong> — staging nhỏ hơn, ít dữ liệu, cấu hình/instance khác, nên số đẹp không đại diện cho prod. <strong>(2) Kịch bản sai</strong> — test bơm tải đều một endpoint, còn prod là spike đột biến dồn vào lúc 8h sáng với traffic hỗn hợp mà test không mô phỏng. <strong>(3) Phụ thuộc ẩn</strong> — test chạy trên cache nóng hoặc bỏ qua bên thứ ba (payment, gửi email xác nhận, CDN) nên bỏ sót nút thắt thật. Bài học: <strong>load test chỉ đáng tin khi môi trường sát prod, kịch bản giống traffic thật, và không giấu phụ thuộc</strong>." },
      { q: "Giờ thi cao điểm, hệ bắt đầu quá tải. Bạn thiết kế graceful degradation cho edtech thế nào — hy sinh gì, giữ gì?",
        a: "Nguyên tắc: <strong>phân loại chức năng theo mức thiết yếu và hy sinh phần phụ để bảo vệ đường đi cốt lõi</strong>. Với giờ thi, cốt lõi là <em>xem đề và nộp bài</em> — phải sống bằng mọi giá. Có thể tạm tắt/giảm chất lượng: leaderboard, gợi ý bài học, thumbnail video, thống kê thời gian thực, thông báo. Kỹ thuật đi kèm: load shedding, hàng đợi cho ghi không khẩn, phục vụ nội dung tĩnh từ CDN, và circuit breaker để một service phụ chết không kéo theo cốt lõi. <strong>Thà 80% chức năng chạy còn hơn 100% sập</strong> — và quyết định 'cái gì được hy sinh' phải chốt <em>trước</em> sự cố, không phải ứng biến lúc 8h sáng." },
      { q: "Bạn muốn bắt đầu chaos engineering cho edtech. Chạy thẳng trên prod để 'thật nhất' có phải ý hay không?",
        a: "<strong>Không nên bắt đầu ở prod</strong> — chaos làm ẩu là tự gây sự cố thật cho 10M user. Trình tự trưởng thành: <strong>bắt đầu ở staging với blast radius nhỏ và giả thuyết rõ ràng</strong>, mỗi thí nghiệm có nút dừng khẩn và tiêu chí thành công/thất bại đo được. Chỉ tiến tới chaos trên prod (game day có lịch, có người trực) khi đội <strong>đã trưởng thành về observability và có SLO/error budget làm lưới an toàn</strong> để biết ngay khi nào vượt ngưỡng và dừng. Chaos trên prod là mục tiêu đáng theo đuổi vì chỉ prod mới lộ hết phụ thuộc ẩn — nhưng là đích đến, không phải điểm khởi đầu." },
    ],
    lab: `<span class="tag">Lab tổng hợp</span><p style="margin-top:8px">Trên môi trường staging của một app có SLO: (1) viết script <code>k6</code> ramp tải tới ngưỡng dự kiến mùa cao điểm, đặt threshold theo đúng SLO p95, và tìm điểm gãy; (2) vẽ sơ đồ đường request và khoanh mọi SPOF (DB primary, cache đơn, AZ đơn) — chọn một cái và lập kế hoạch gỡ; (3) chạy một thí nghiệm chaos nhỏ có giả thuyết (giết 1 pod / thêm 200ms latency tới DB) và kiểm SLO có giữ không; (4) cài một cơ chế graceful degradation (feature flag tắt leaderboard khi tải cao) và chứng minh cốt lõi 'nộp bài' vẫn sống khi phần phụ bị tắt. Viết lại 3 lý do 'test pass nhưng prod sập' áp vào chính hệ của bạn.</p>`,
    links: [
      { t: "Principles of Chaos Engineering", u: "principlesofchaos.org" },
      { t: "Google SRE Book — Embracing Risk & SLOs", u: "sre.google/sre-book/table-of-contents" },
      { t: "k6 — load testing", u: "k6.io/docs" },
      { t: "Netflix — Chaos Monkey / Simian Army", u: "netflix.github.io/chaosmonkey" },
    ],
  },
  {
    id: "BOSS", tier: 7, xp: 500, boss: true,
    prereq: ["LNX-01", "NET-02", "GIT-03", "DKR-04", "CMP-05", "CI-06", "CD-07", "CLD-08", "IAC-09", "CFG-10", "K8S-11", "HLM-12", "SCL-13", "OBS-14", "SLO-15", "ALT-16", "SEC-17", "SUP-18", "SYN-A", "SYN-B"],
    title: "★ BOSS: Platform DevOps cho Edtech 10M",
    sum: "Capstone: thiết kế & vận hành một platform giao hàng đầy đủ, bảo vệ được.",
    theory: `<p>Đây là <b>trận Boss</b> — nơi mọi tầng ghép lại. Không có kiến thức mới; có một nhiệm vụ: <b>thiết kế và BẢO VỆ được một platform DevOps hoàn chỉnh cho edtech 10M user</b>, từ commit tới prod, an toàn và chịu lỗi. Đề bài mô phỏng một buổi phỏng vấn Senior/Staff, nơi mọi lựa chọn của bạn sẽ bị vặn "vì sao không làm khác đi".</p>
<p><b>Phạm vi phải phủ:</b></p>
<ul>
<li><b>Đường đi commit → prod</b> với các cổng an toàn: trunk-based + CI (test, SAST, SCA, image scan) → build artifact bất biến + SBOM + ký → CD có tiến hóa (canary/blue-green) + safety gate + rollback bằng artifact/git revert.</li>
<li><b>Hạ tầng</b>: IaC (Terraform) cho cloud, không thao tác tay; môi trường tái tạo được.</li>
<li><b>Điều phối</b>: Kubernetes + Helm; autoscale theo tải; GitOps (ArgoCD) làm nguồn sự thật.</li>
<li><b>Quan sát</b>: metrics/logs/traces; SLO + error budget; alert dựa trên triệu chứng, không dựa trên nguyên nhân.</li>
<li><b>Bảo mật & chuỗi cung ứng</b>: shift-left, secret manager, least privilege, SBOM, ký + verify lúc deploy.</li>
<li><b>Chịu lỗi</b>: gỡ SPOF, graceful degradation, chứng minh bằng chaos + load test.</li>
</ul>
<p><b>Luật chơi — không có đáp án đúng duy nhất.</b> Boss này không chấm bạn chọn ArgoCD hay Flux, EKS hay tự dựng. Nó chấm <b>chất lượng lập luận trade-off</b>: bạn có nêu được đánh đổi của mỗi lựa chọn không, có biết khi nào KHÔNG cần một thứ không, có neo quyết định vào số liệu (DORA/SLO) và nỗi đau đo được thay vì trend không. Một câu trả lời "dùng K8s vì ai cũng dùng" thua một câu "ở giai đoạn X tôi cố tình chưa dùng K8s vì...".</p>
<p><b>Bốn câu hỏi gốc</b> (từ FND-00) vẫn là kim chỉ nam khi bảo vệ: (1) thay đổi ra tới user bằng đường nào? (2) làm sao biết nó khỏe hay ốm? (3) nó hỏng kiểu gì, tự phục hồi được không? (4) khi nào tôi CHƯA cần thứ này?</p>`,
    whenUse: `<p>Đánh Boss khi đã đủ 20 node tiên quyết — tức là đã có toàn bộ mảnh ghép. Đây là bài tổng duyệt trước khi bạn tự tin nói "tôi thiết kế và vận hành được một platform giao hàng ở quy mô lớn". Cách dùng tốt nhất: nhờ một người vào vai người phỏng vấn vặn từng lựa chọn của bạn, hoặc tự đóng cả hai vai. Tinh thần xuyên suốt: <b>đo trước, tự động sau, chống over-engineering</b> — và luôn biết mình đang cố tình KHÔNG làm gì ở quy mô hiện tại.</p>`,
    pros: [
      "Ép ghép mọi tầng thành một câu chuyện end-to-end mạch lạc, không rời rạc",
      "Rèn khả năng bảo vệ quyết định bằng trade-off và số liệu, đúng kiểu phỏng vấn Senior/Staff",
      "Buộc nói rõ mình cố tình KHÔNG làm gì và vì sao — dấu hiệu của kỹ sư trưởng thành",
    ],
    cons: [
      "Không có checklist đáp án; người mới dễ tưởng cần triển khai tất cả cùng lúc (chính là over-engineering cần tránh)",
      "Trả lời tốt đòi kinh nghiệm vận hành thật; lý thuyết suông sẽ lộ ra khi bị vặn về failure mode",
    ],
    questions: [
      { q: "Hãy phác đường đi commit → prod cho edtech 10M user và bảo vệ từng cổng an toàn bạn đặt. Vì sao đặt cổng đó, và cổng nào bạn cố tình CHƯA thêm ở giai đoạn đầu?",
        a: "<strong>Không có một sơ đồ đúng — chấm ở chất lượng lập luận.</strong> Câu trả lời mạnh nêu được luồng mạch lạc (trunk-based → CI test+SAST+SCA+image scan → artifact bất biến + SBOM + ký → CD canary/blue-green + safety gate + rollback) VÀ giải thích trade-off từng cổng: vì sao SCA trong CI (bắt CVE sớm, rẻ), vì sao canary chứ không big-bang (giới hạn blast radius), rollback bằng artifact chứ không revert+build (nhanh, đã kiểm chứng). Điểm cộng lớn nhất là <strong>nêu được thứ cố tình chưa làm và lý do đo được</strong> — ví dụ 'chưa bật verify-signature chặn cứng cho tới khi có policy controller và quy trình quản khóa, tránh tự khóa mình khỏi prod'. Câu trả lời yếu là liệt kê tool mà không có 'vì sao' và 'khi nào chưa cần'." },
      { q: "Người phỏng vấn hỏi: 'Vì sao dùng Kubernetes + GitOps cho platform này? Chứng minh nó xứng với độ phức tạp.' Bạn bảo vệ thế nào — kể cả khả năng câu trả lời là KHÔNG cần?",
        a: "<strong>Chấm ở việc bạn neo quyết định vào nỗi đau đo được, không vào trend.</strong> Bảo vệ mạnh: ở 10M user với nhiều service, traffic co giãn theo mùa thi và yêu cầu nhiều môi trường/cluster, K8s cho autoscale + self-heal và GitOps cho nguồn sự thật + drift detection + audit — những thứ này giải quyết nỗi đau <em>cụ thể</em> (drift, thao tác tay không truy vết, CI giữ khóa prod). Nhưng câu trả lời trưởng thành cũng thừa nhận <strong>khi nào KHÔNG cần</strong>: nếu chỉ một app một cluster deploy vài lần/tuần thì K8s+ArgoCD là over-engineering, managed container + push CD đơn giản hơn. Điểm trừ nếu trả lời 'vì ai cũng dùng' hoặc không nêu được chi phí vận hành ArgoCD/K8s như một mắt xích phải giám sát." },
      { q: "Lúc 3h sáng mùa thi, hệ đang suy giảm nhưng chưa sập hẳn. Với SLO/error budget, observability, GitOps và graceful degradation bạn đã dựng — bạn ra quyết định theo trình tự nào?",
        a: "<strong>Chấm ở tư duy vận hành dưới áp lực và cách các mảnh ghép phối hợp, không phải một quy trình cố định.</strong> Câu trả lời tốt đi từ triệu chứng: alert dựa trên SLO (không phải CPU) cho biết user có đang đau không → dùng traces/metrics/logs khoanh tầng hỏng → quyết định dựa trên <em>error budget còn lại</em> (còn nhiều thì có thể chờ/rollback từ tốn, cạn thì hành động quyết liệt) → kích graceful degradation để bảo vệ đường cốt lõi 'nộp bài' → nếu do một thay đổi thì rollback bằng git revert manifest (GitOps) có audit; lưu ý auto-heal khi vá tay. Điểm cộng: nói rõ vai trò con người (ai là incident commander) và rằng những quyết định 'hy sinh cái gì' đã được chốt TRƯỚC sự cố. Điểm trừ: nhảy vào sửa nguyên nhân trước khi giảm đau cho user, hoặc bỏ qua error budget như la bàn quyết định." },
      { q: "Bạn tuyên bố platform 'chịu lỗi và bảo mật'. Người phỏng vấn vặn: 'Chứng minh đi — làm sao tôi tin, không phải slide?' Bạn đáp thế nào?",
        a: "<strong>Chấm ở việc phân biệt giữa TUYÊN BỐ và BẰNG CHỨNG.</strong> Câu trả lời mạnh không nhắc lại kiến trúc mà đưa ra cách <em>kiểm chứng thực nghiệm</em>: chịu lỗi thì chứng minh bằng chaos có giả thuyết (giết pod/AZ và đo SLO có giữ) + load test sát prod trước mùa cao điểm, và thẳng thắn về '3 lý do test pass mà prod sập' (môi trường lệch, kịch bản sai, phụ thuộc ẩn); bảo mật thì chứng minh bằng các cổng tự động chạy được (secret scan, SCA, image scan, verify chữ ký chặn image lạ) + diễn tập lộ secret có bấm giờ rotate + tra cứu SBOM kiểu Log4Shell. Điểm cộng lớn: thừa nhận cái gì <em>chưa</em> chứng minh được và kế hoạch để chứng minh. Điểm trừ: khẳng định suông 'có replica nên HA', 'có ký nên an toàn' mà không có bước verify/thực nghiệm nào." },
    ],
    lab: `<span class="tag">Capstone</span><p style="margin-top:8px">Viết một <b>tài liệu thiết kế platform (design doc) 3–5 trang</b> cho edtech 10M user và tự bảo vệ nó: (1) sơ đồ đường đi commit → prod với mọi cổng an toàn, chú thích trade-off từng cổng; (2) sơ đồ hạ tầng + điều phối (IaC, K8s, GitOps) kèm mục "những gì tôi cố tình CHƯA làm ở quy mô này và vì sao"; (3) chiến lược quan sát: liệt kê 3 SLO cốt lõi, error budget policy, và vài alert dựa trên triệu chứng; (4) mục bảo mật & chuỗi cung ứng: secret, least privilege, SBOM, ký + verify; (5) mục "chứng minh chịu lỗi": một kịch bản chaos + một kịch bản load test + kế hoạch graceful degradation cho giờ thi. Cuối cùng, nhờ một người (hoặc tự đóng vai) vặn 5 câu "vì sao không làm khác", và tự chấm câu trả lời của mình theo tiêu chí: có nêu trade-off không, có neo vào số liệu (DORA/SLO) không, có biết khi nào CHƯA cần không.</p>`,
    links: [
      { t: "Google SRE Book & Workbook", u: "sre.google/books" },
      { t: "DORA — State of DevOps & Capabilities", u: "dora.dev" },
      { t: "AWS Well-Architected Framework", u: "aws.amazon.com/architecture/well-architected" },
      { t: "CNCF — Cloud Native Landscape & Trail Map", u: "landscape.cncf.io" },
      { t: "The DevOps Handbook (Gene Kim)", u: "itrevolution.com/product/the-devops-handbook" },
    ],
  },
];
