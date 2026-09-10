import type { SkillNode } from "./skill-types";

export const TIER4: SkillNode[] = [
  {
    id: "CLD-08", tier: 4, xp: 100, prereq: ["NET-02"],
    title: "Cloud căn bản (VPC · IAM · Compute)",
    sum: "Nền cloud: VPC/subnet/security group, IAM least-privilege, managed service.",
    theory: `<p>Cloud không phải 'server của người khác' — nó là một bộ khối lego mạng, tính toán và quyền hạn mà bạn phải hiểu để không tự bắn vào chân. Ba trụ nền: <b>mạng (VPC)</b>, <b>quyền (IAM)</b>, <b>tính toán (compute)</b>.</p>
<p><b>VPC & subnet.</b> VPC là mạng riêng ảo của bạn trong cloud. Trong đó chia <b>subnet public</b> (có đường ra Internet qua Internet Gateway — đặt load balancer, bastion) và <b>subnet private</b> (không có IP public — đặt web server, và nhất là <b>database</b>). Nguyên tắc cho edtech: <b>web ở private subnet, chỉ nhận traffic từ load balancer; DB ở private subnet sâu hơn, chỉ nhận từ web</b>. DB không bao giờ có IP công khai — đây là lỗi rò rỉ dữ liệu kinh điển.</p>
<p><b>Security group / firewall.</b> Là firewall trạng thái gắn ở tầng instance: khai báo cổng nào, từ nguồn nào được vào. Least-privilege: DB security group chỉ mở cổng 5432 <i>từ security group của web</i>, không mở <code>0.0.0.0/0</code>. Phần lớn lỗi 'service A không gọi được B' trong cloud là do security group chặn cổng (nhớ NET-02).</p>
<p><b>IAM least-privilege.</b> Đây là phần dễ làm ẩu nhất và nguy hiểm nhất:</p>
<ul>
<li><b>Không dùng tài khoản root</b> cho việc hằng ngày — chỉ để khẩn cấp, bật MFA, cất kỹ.</li>
<li><b>Không tạo long-lived access key</b> nhét vào code/CI. Thay bằng <b>IAM role</b> gắn vào compute, và <b>OIDC</b> để CI/CD lấy credential ngắn hạn tự hết hạn.</li>
<li>Cấp quyền theo nhu cầu tối thiểu, không <code>Action: "*"</code> cho tiện.</li>
</ul>
<p><b>Region & AZ.</b> Region là vùng địa lý (đặt gần user — với edtech VN thì Singapore/ap-southeast gần hơn us-east). Mỗi region có nhiều <b>Availability Zone</b> — trung tâm dữ liệu tách biệt về điện/mạng. <b>Multi-AZ</b> nghĩa là trải instance/DB qua 2+ AZ để một AZ chết không kéo sập cả hệ thống — đây là mức HA tối thiểu cho prod.</p>
<p><b>Managed vs self-hosted.</b> RDS/managed database, object storage (S3) lo giúp bạn backup, patch, failover, replica. Tự dựng Postgres trên VM nghĩa là tự trực 3h sáng khi đĩa đầy, tự lo replica, tự lo nâng cấp. Với team edtech nhỏ, <b>managed gần như luôn thắng</b> ở giai đoạn đầu.</p>
<p><b>Cost cơ bản:</b> <b>on-demand</b> (trả theo giờ, linh hoạt, đắt nhất) · <b>reserved/savings plan</b> (cam kết 1–3 năm, rẻ hơn 30–70%, cho tải nền ổn định) · <b>spot</b> (rẻ tới 90% nhưng bị thu hồi bất kỳ lúc nào — chỉ cho việc chịu được gián đoạn như batch xử lý video, không cho DB).</p>`,
    whenUse: `<p>Đây là nền cho mọi thứ ở TẦNG 4–7: Terraform dựng chính những khối này, K8s chạy trên VPC này. Mức 'đủ dùng' cho một senior: vẽ được sơ đồ VPC (public/private subnet, LB → web → DB), viết được security group least-privilege, và giải thích được vì sao không nhét access key vào CI. <b>Khi nào CHƯA cần bận tâm sâu:</b> nếu đang chạy trên PaaS (Render/Railway/Fly) ở giai đoạn vài nghìn user, phần lớn VPC/IAM đã được ẩn đi — đừng tự dựng cả VPC phức tạp khi chưa có nhu cầu đo được. Chỉ xuống tầng cloud thô khi cần kiểm soát mạng/chi phí/tuân thủ.</p>`,
    pros: [
      "Managed service cắt phần lớn gánh vận hành (backup, patch, failover) cho team nhỏ",
      "Multi-AZ cho HA thật với chi phí và độ phức tạp hợp lý",
      "IAM role + OIDC loại bỏ credential dài hạn — giảm mạnh rủi ro rò rỉ",
    ],
    cons: [
      "Bề mặt cấu hình rộng, dễ cấu hình sai bảo mật (DB public, security group mở toang)",
      "Chi phí dễ leo thang nếu không đo và không chọn đúng mô hình mua (on-demand vs reserved vs spot)",
    ],
    questions: [
      { q: "Team đặt Postgres của app edtech trên một EC2 có IP public để 'dev truy cập cho tiện'. Vì sao đây là bom hẹn giờ và bố trí đúng là gì?",
        a: "DB có IP public tức là cả Internet có thể quét và tấn công cổng 5432 — chỉ cần một mật khẩu yếu hoặc lỗ hổng là toàn bộ dữ liệu học viên bị lộ. Bố trí đúng: đặt DB trong <strong>private subnet không có route ra Internet</strong>, security group chỉ mở cổng từ <strong>security group của web</strong>, và dev truy cập qua <strong>bastion/SSM/VPN</strong> chứ không phơi cổng ra ngoài. Nguyên tắc gốc: <strong>DB không bao giờ có IP công khai</strong>." },
      { q: "CI/CD của bạn cần deploy lên cloud. Vì sao KHÔNG tạo một access key dài hạn cắm vào biến môi trường của pipeline?",
        a: "Access key dài hạn là bí mật <strong>không tự hết hạn</strong>: nó nằm trong log, trong biến môi trường, dễ rò qua fork/PR, và nếu lộ thì kẻ tấn công có quyền cho tới khi ai đó phát hiện và thu hồi thủ công. Cách đúng là <strong>OIDC</strong> — CI trình một token danh tính, cloud đổi lấy credential <strong>ngắn hạn tự hết sau vài phút</strong>, gắn đúng role quyền tối thiểu cho việc deploy. <strong>Không có secret tĩnh nào để rò rỉ.</strong>" },
      { q: "Khi nào bạn chọn managed RDS thay vì tự cài Postgres trên VM, và khi nào ngược lại?",
        a: "Với team edtech nhỏ, <strong>managed RDS gần như luôn thắng ở giai đoạn đầu</strong>: nó lo backup tự động, patch, Multi-AZ failover, đọc replica — những thứ tốn hàng tuần để tự làm đúng. Bạn trả phí cao hơn để đổi lấy việc không phải trực 3h sáng. Chỉ tự host khi có nhu cầu <strong>đo được</strong>: cần extension đặc thù RDS không hỗ trợ, cần tối ưu chi phí ở quy mô rất lớn, hoặc ràng buộc tuân thủ bắt dữ liệu ở nơi managed không phủ. Đừng tự host vì 'rẻ hơn trên giấy' rồi trả bằng thời gian on-call." },
      { q: "Đội xử lý transcode video bài giảng chạy hàng đêm, chịu được gián đoạn. Còn database chính phục vụ 10 triệu học viên. Mỗi cái nên dùng mô hình mua nào?",
        a: "Transcode video là tải <strong>batch, chịu được bị ngắt</strong> → dùng <strong>spot instance</strong>, rẻ tới ~90%, nếu bị thu hồi thì job chạy lại — hoàn hảo cho tối ưu chi phí. Database chính là <strong>tải nền, chạy 24/7, không được chết</strong> → tuyệt đối <strong>không dùng spot</strong> (bị thu hồi = sập DB); dùng <strong>reserved/savings plan</strong> để cam kết dài hạn lấy giá rẻ hơn 30–70% so với on-demand. Nguyên tắc: khớp mô hình mua với đặc tính chịu lỗi của tải, không mua một mô hình cho tất cả." },
      { q: "Một AZ ở region của bạn mất điện. Với kiến trúc Multi-AZ thì chuyện gì xảy ra, và Multi-AZ có phải là disaster recovery không?",
        a: "Multi-AZ nghĩa là instance/DB được trải qua ≥2 trung tâm dữ liệu tách biệt trong cùng region; một AZ chết thì load balancer chuyển traffic sang AZ còn sống và managed DB tự failover sang standby — user gần như không thấy gì. Nhưng <strong>Multi-AZ KHÔNG phải disaster recovery</strong>: nó chống lỗi <em>một AZ</em>, không chống <em>cả region sập</em> hay <em>lỡ tay xóa DB</em>. DR thật cần <strong>backup ở region/tài khoản khác</strong> và kế hoạch khôi phục đã tập dượt. Đừng nhầm HA (chống hỏng hạ tầng) với DR (chống mất dữ liệu/thảm họa)." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên một tài khoản cloud (dùng free tier hoặc ngân sách nhỏ, nhớ đặt budget alert trước): (1) tạo một VPC với 1 public subnet và 1 private subnet; (2) đặt một web instance ở private subnet sau một load balancer ở public subnet, và một DB ở private subnet; (3) cấu hình security group least-privilege — LB nhận 443 từ Internet, web nhận từ LB, DB nhận 5432 <b>chỉ từ security group web</b>; (4) chứng minh: <code>curl</code> vào LB thì được, nhưng không thể kết nối thẳng vào DB từ ngoài; (5) tạo một IAM role quyền tối thiểu gắn vào web instance thay cho access key. Viết lại: bạn đã cố tình từ chối những quyền/đường mạng nào và vì sao.</p>`,
    links: [
      { t: "AWS — VPC concepts (subnet, route table, security group)", u: "docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" },
      { t: "AWS Well-Architected Framework — Security & Cost pillars", u: "aws.amazon.com/architecture/well-architected" },
      { t: "AWS IAM — best practices (least privilege, no root, roles)", u: "docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
      { t: "GitHub Actions — OIDC to cloud (không dùng long-lived key)", u: "docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect" },
      { t: "Google Cloud — regions and zones", u: "cloud.google.com/compute/docs/regions-zones" },
    ],
  },
  {
    id: "IAC-09", tier: 4, xp: 100, prereq: ["CLD-08"],
    title: "Terraform & Infrastructure as Code",
    sum: "Hạ tầng khai báo bằng mã: state, plan/apply, module, drift.",
    theory: `<p><b>Infrastructure as Code (IaC)</b> nghĩa là bạn khai báo hạ tầng mong muốn bằng mã, cho vào Git, review qua PR, và dựng lại được y hệt — thay vì bấm chuột trên console rồi không ai nhớ đã bấm gì. Terraform là công cụ <b>khai báo</b>: bạn mô tả <i>trạng thái đích</i>, nó tự tính ra các bước để đạt tới, không phải bạn viết từng lệnh.</p>
<pre><code>resource "aws_db_instance" "edtech" {
  identifier        = "edtech-prod"
  engine            = "postgres"
  instance_class    = "db.r6g.large"
  allocated_storage = 100
  multi_az          = true          # HA: chống chết 1 AZ
  storage_encrypted = true
  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.db.id]
}</code></pre>
<p><b>State file — trái tim, và cũng là quả bom.</b> Terraform lưu một file <code>terraform.tfstate</code> ánh xạ 'mã của bạn' ↔ 'tài nguyên thật ngoài cloud'. Nó <b>cực kỳ quan trọng</b>: mất state thì Terraform không biết nó đã tạo gì, apply lần sau có thể tạo trùng hoặc đòi xóa nhầm. Nó cũng <b>cực kỳ nguy hiểm</b>: state chứa <b>giá trị nhạy cảm ở dạng plain text</b> (mật khẩu DB, key). Vì vậy:</p>
<ul>
<li><b>Không bao giờ để state trong Git</b> hay trên máy cá nhân.</li>
<li>Dùng <b>remote backend</b> (S3 + mã hóa, hoặc Terraform Cloud) để cả team dùng chung một nguồn sự thật.</li>
<li><b>Bật state locking</b> (DynamoDB lock / lock của backend): nếu không, hai người <code>apply</code> cùng lúc sẽ ghi đè state của nhau → hỏng state, hạ tầng lệch không cứu được.</li>
</ul>
<p><b>plan trước apply — luôn luôn.</b> <code>terraform plan</code> in ra chính xác cái gì sẽ được <i>tạo / sửa / phá</i> trước khi động vào thật. Đọc kỹ dòng <code>destroy</code>: đổi một thuộc tính tưởng vô hại có thể buộc thay mới (recreate) một database — mất dữ liệu. Trong CI, bắt buộc plan hiện lên PR để review, chỉ apply sau khi merge.</p>
<p><b>Module + tách môi trường.</b> Gói hạ tầng lặp lại thành <b>module</b> (vd module 'service' gồm compute + LB + security group), rồi dùng lại cho <b>dev / staging / prod</b> với tham số khác nhau (size, số lượng). DRY: sửa một chỗ, mọi môi trường hưởng. Nhưng đừng trừu tượng hóa quá sớm — chỉ tách module khi đã lặp ≥2–3 lần, không viết framework module cho hạ tầng mới có một service.</p>
<p><b>Immutable infrastructure vs SSH vá nóng.</b> Khi prod có sự cố, cám dỗ lớn nhất là SSH vào server sửa tay. Làm thế tạo <b>configuration drift</b>: server thật giờ khác mã trong Git, lần apply sau Terraform sẽ 'sửa lại' và xóa bản vá của bạn — hoặc tệ hơn là không ai biết drift tồn tại tới khi dựng lại thì vỡ. Tư duy đúng: hạ tầng <b>bất biến</b> — muốn đổi thì sửa mã, apply, thay mới; không vá tay. Nếu buộc phải vá nóng để cứu hỏa, ngay sau đó phải đưa thay đổi vào mã và <code>plan</code> để hết drift.</p>
<p><b>Terraform vs Pulumi/CDK.</b> Terraform dùng HCL (ngôn ngữ khai báo riêng) — dễ đọc, ép bạn suy nghĩ khai báo. Pulumi/CDK cho viết hạ tầng bằng TypeScript/Python — quen thuộc với dev và mạnh khi cần logic phức tạp, nhưng dễ lạm dụng vòng lặp/điều kiện tới mức không ai đọc nổi hạ tầng. Chọn theo team: team quen một ngôn ngữ và cần logic → CDK/Pulumi; team muốn hạ tầng dễ audit, ít ma thuật → Terraform.</p>`,
    whenUse: `<p>Dùng IaC ngay khi hạ tầng vượt quá 'một VM bấm tay' và có ≥2 người hoặc ≥2 môi trường — tức gần như mọi dự án nghiêm túc. Nó là điều kiện để dựng lại sau thảm họa, để review thay đổi hạ tầng như review code, và để bỏ thao tác console không truy vết. <b>Khi nào CHƯA cần:</b> một prototype cuối tuần, một VM duy nhất chạy thử — viết Terraform lúc đó là nghi lễ tốn thời gian. Và <b>đừng</b> quản mọi thứ bằng Terraform bằng mọi giá: những thứ đổi liên tục ở tầng ứng dụng (config app, feature flag) không thuộc về Terraform — dùng đúng công cụ cho đúng tầng.</p>`,
    pros: [
      "Hạ tầng dựng lại được y hệt, review qua PR, có lịch sử trong Git",
      "plan cho xem trước tác động phá hủy trước khi động vào thật",
      "Module + tách môi trường giúp dev/staging/prod nhất quán, đỡ lệch",
    ],
    cons: [
      "State là điểm chết người: mất/khóa/lộ state gây hậu quả nặng, cần backend + lock kỷ luật",
      "Đường cong học và cám dỗ SSH vá nóng gây drift; dễ over-engineer module quá sớm",
    ],
    questions: [
      { q: "Một kỹ sư lỡ xóa file terraform.tfstate cục bộ (không có remote backend). Điều gì xảy ra ở lần apply tiếp theo và bài học là gì?",
        a: "Terraform mất bản đồ 'mã ↔ tài nguyên thật': nó nghĩ chưa có gì tồn tại nên lần <code>apply</code> sau sẽ cố <strong>tạo lại từ đầu</strong> — trùng lặp tài nguyên, hoặc xung đột tên, hoặc (nếu bạn <code>import</code> sai) xóa nhầm. Cứu chữa phải <code>terraform import</code> thủ công từng tài nguyên về state — cực khổ và dễ sai. Bài học: <strong>state phải nằm ở remote backend có versioning + mã hóa</strong> (vd S3 bật versioning) để không bao giờ phụ thuộc một file trên máy cá nhân." },
      { q: "Hai kỹ sư chạy 'terraform apply' cùng lúc trên cùng hạ tầng mà không bật state locking. Hỏng thế nào?",
        a: "Cả hai đọc state cũ, mỗi người tính plan riêng rồi <strong>ghi đè state của nhau</strong> — state cuối cùng chỉ phản ánh một người, phần thay đổi của người kia biến mất khỏi state nhưng vẫn tồn tại thật trên cloud → hạ tầng 'mồ côi' không được quản lý, và state hỏng có thể khiến apply sau đòi phá/tạo bừa. Phòng: <strong>bật state locking</strong> (DynamoDB lock hoặc lock của Terraform Cloud) để lần apply thứ hai phải chờ, không chạy song song. Đây là lý do remote backend + lock là bắt buộc cho làm việc nhóm." },
      { q: "terraform plan trên một thay đổi 'nhỏ' (đổi một tham số của DB) lại hiện dòng 'destroy and recreate'. Bạn làm gì tiếp?",
        a: "<strong>Dừng lại, không apply.</strong> Recreate một database nghĩa là xóa DB cũ và tạo mới → <strong>mất toàn bộ dữ liệu học viên</strong>. Đây chính là lý do <code>plan</code> tồn tại — để bắt được tác động phá hủy trước khi nó xảy ra. Cần điều tra: tham số đó có phải 'force new resource' không (một số thuộc tính không sửa tại chỗ được), có cách đổi khác không (đổi qua nhiều bước, hoặc dùng <code>create_before_destroy</code>), và nếu buộc phải recreate thì phải có kế hoạch snapshot/migrate dữ liệu trước. <strong>Luôn đọc kỹ dòng destroy trong plan trước khi apply lên prod.</strong>" },
      { q: "Prod đang cháy, một kỹ sư SSH vào server sửa tay config để cứu hỏa. Vì sao đây vừa đúng vừa nguy hiểm, và phải làm gì sau đó?",
        a: "Cứu hỏa tức thì thì chấp nhận được — user quan trọng hơn sự trong sạch của IaC. Nhưng nó tạo <strong>configuration drift</strong>: server thật giờ khác mã trong Git, và lần <code>terraform apply</code> sau sẽ <strong>âm thầm hoàn tác bản vá</strong> của bạn, làm sự cố quay lại đúng lúc không ai ngờ. Bắt buộc sau khi hết cháy: <strong>đưa thay đổi vào mã Terraform và chạy plan để xác nhận không còn drift</strong>. Nguyên tắc immutable: máy thật phải luôn khớp mã; SSH vá nóng chỉ là ngoại lệ khẩn cấp phải được 'hợp thức hóa' ngay." },
      { q: "State file chứa mật khẩu DB ở plain text. Vì sao đây là rủi ro bảo mật và bạn giảm thiểu thế nào?",
        a: "Bất kỳ ai đọc được state là đọc được <strong>toàn bộ secret ở dạng rõ</strong> — nên state trong Git hay trong Slack là rò rỉ nghiêm trọng. Giảm thiểu: (1) <strong>remote backend có mã hóa at-rest + kiểm soát truy cập chặt</strong> (S3 SSE + bucket policy, hoặc Terraform Cloud); (2) không bao giờ commit state vào Git (thêm vào <code>.gitignore</code> nhưng tốt hơn là dùng backend nên nó không nằm ở local); (3) ưu tiên để secret do <strong>secret manager</strong> quản lý và Terraform chỉ tham chiếu, hạn chế secret 'đọng' trong state. Coi state như một secret hạng nhất, không phải file bình thường." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên tài khoản cloud nhỏ: (1) viết Terraform dựng VPC + một web instance từ node CLD-08, chạy <code>terraform plan</code> rồi <code>apply</code>; (2) cấu hình <b>remote backend</b> (S3 bật versioning + khóa state) và migrate state local lên đó; (3) tự tạo drift: SSH vào server đổi tay một thứ, rồi chạy <code>terraform plan</code> để thấy Terraform phát hiện lệch và đòi hoàn tác; (4) tách thành <b>module</b> và dùng lại cho hai môi trường dev/prod với size khác nhau; (5) cố tình đổi một thuộc tính buộc recreate và đọc kỹ dòng <code>destroy</code> trong plan — <b>đừng apply</b>, chỉ ghi lại tác động. Cuối cùng chạy <code>terraform destroy</code> để dọn và tránh tốn tiền.</p>`,
    links: [
      { t: "HashiCorp — Terraform docs & tutorials", u: "developer.hashicorp.com/terraform" },
      { t: "Terraform — remote state & backends (S3, locking)", u: "developer.hashicorp.com/terraform/language/backend" },
      { t: "Terraform — state (sensitive data, import)", u: "developer.hashicorp.com/terraform/language/state" },
      { t: "Gruntwork — Terraform best practices / module patterns", u: "terraform-best-practices.com" },
      { t: "Pulumi — so sánh với Terraform (IaC bằng ngôn ngữ lập trình)", u: "pulumi.com/docs/concepts/vs/terraform" },
    ],
  },
  {
    id: "CFG-10", tier: 4, xp: 100, prereq: ["LNX-01", "IAC-09"],
    title: "Ansible & Config Management",
    sum: "Cấu hình bên trong máy: idempotent, push-based, khi nào cần.",
    theory: `<p>Có một ranh giới quan trọng dễ lẫn: <b>Terraform provision hạ tầng</b> (tạo VM, network, DB — 'cái máy tồn tại và ở đúng chỗ'), còn <b>Ansible cấu hình bên trong máy</b> (cài package, đặt file config, tạo user, khởi động service — 'bên trong máy có đúng thứ cần'). Terraform lo <i>máy có mặt</i>; Ansible lo <i>máy được setup đúng</i>. Dùng nhầm lẫn hai vai là nguồn gốc của nhiều mớ hỗn độn.</p>
<p><b>Idempotency — tính chất cốt lõi.</b> Một playbook Ansible viết đúng phải chạy được <b>nhiều lần cho cùng kết quả</b>: lần đầu tạo ra trạng thái mong muốn, các lần sau nếu đã đúng rồi thì không làm gì (báo <code>ok</code> thay vì <code>changed</code>). Ansible mô tả <i>trạng thái đích</i> ('package X phải hiện diện') chứ không phải mệnh lệnh ('chạy apt install') — nên chạy lại an toàn, không cộng dồn tác dụng phụ.</p>
<pre><code>- name: Cau hinh Nginx cho edtech
  hosts: web
  become: true
  tasks:
    - name: Cai nginx
      ansible.builtin.package:
        name: nginx
        state: present        # idempotent: da co thi bo qua
    - name: Dat file config
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: reload nginx     # chi reload khi file thay doi
  handlers:
    - name: reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded</code></pre>
<p><b>Agentless push vs pull.</b> Ansible là <b>push-based, agentless</b>: nó chỉ cần SSH tới máy đích và chạy, không phải cài agent thường trú. Ngược lại Puppet/Chef là <b>pull-based</b>: mỗi máy chạy một agent định kỳ tự kéo cấu hình từ server trung tâm về. Push (Ansible) đơn giản để bắt đầu, dễ kiểm soát thời điểm; pull hợp đội máy rất lớn cần tự hội tụ liên tục mà không cần ai bấm nút. Với team edtech nhỏ–vừa, agentless push của Ansible thường là lựa chọn ít ma sát nhất.</p>
<p><b>Câu hỏi thật: với immutable infra + container, còn cần config management không?</b> Đây là chỗ tư duy trade-off. Nếu bạn đã đi theo <b>hạ tầng bất biến</b> (build image chuẩn rồi thay mới thay vì sửa máy đang chạy) và <b>container</b>, thì phần lớn việc 'cấu hình máy đang chạy' biến mất — bạn <b>nướng (bake) cấu hình vào image</b> lúc build (dùng Dockerfile, hoặc Packer + Ansible để tạo image chuẩn), rồi triển khai image bất biến đó. Ansible-chạy-liên-tục-trên-máy-sống trở nên ít cần thiết. Nó vẫn hữu ích cho: tạo golden image (Packer gọi Ansible), cấu hình những thứ <b>không</b> đóng gói được vào container (host của K8s node, thiết bị mạng, cơ sở dữ liệu bare-metal), và các hệ thống legacy chưa container hóa. <b>Kết luận:</b> đừng mặc định dựng cả một tầng config management nếu bạn đã bake image — chỉ thêm khi có phần thật sự nằm ngoài container.</p>
<p><b>Secrets trong Ansible.</b> Không nhét mật khẩu/khóa vào playbook dạng plain text. Dùng <b>Ansible Vault</b> để mã hóa biến/file nhạy cảm, giải mã lúc chạy bằng password/key. Tốt hơn nữa ở prod: kéo secret từ một <b>secret manager</b> trung tâm lúc chạy, để không có secret nào đọng trong repo — cùng tinh thần least-privilege và xoay vòng đã học ở CLD-08.</p>`,
    whenUse: `<p>Dùng config management khi bạn có <b>máy sống lâu</b> cần setup nhất quán mà chưa/không container hóa được: golden image (qua Packer+Ansible), host của node, thiết bị mạng, DB bare-metal, hệ legacy. <b>Khi nào KHÔNG cần (hoặc cần rất ít):</b> nếu toàn bộ workload đã chạy trong container trên hạ tầng bất biến, phần lớn cấu hình nên <b>bake vào image</b> lúc build, không quản bằng Ansible chạy liên tục — dựng một tầng Ansible đầy đủ lúc đó là over-engineering. Nguyên tắc: Terraform tạo máy, image mang sẵn cấu hình, Ansible chỉ lấp phần còn lại thật sự nằm ngoài container.</p>`,
    pros: [
      "Agentless push (chỉ cần SSH) — dễ bắt đầu, không phải nuôi agent trên mỗi máy",
      "Idempotent + khai báo trạng thái đích: chạy lại an toàn, cấu hình nhất quán trên nhiều máy",
      "Ghép tốt với Packer để bake golden image thay vì cấu hình máy sống",
    ],
    cons: [
      "Cấu hình máy đang chạy dễ tạo drift; với container thì phần lớn việc này nên chuyển sang bake image",
      "Push-based khó tự hội tụ ở quy mô rất lớn bằng pull (Puppet/Chef); quản secret cần kỷ luật (Vault/secret manager)",
    ],
    questions: [
      { q: "Đồng nghiệp dùng Ansible để tạo cả VM lẫn network trên cloud, và dùng Terraform để cài package bên trong VM. Vì sao đây là dùng sai công cụ?",
        a: "Đảo ngược vai trò. <strong>Terraform mạnh ở provision hạ tầng</strong> (VM, network, DB) vì nó theo dõi state và biết tài nguyên cloud tồn tại/thay đổi ra sao; ép Terraform cài package bên trong máy khiến nó không quản được trạng thái nội bộ và dễ drift. <strong>Ansible mạnh ở cấu hình bên trong máy</strong> (package, file, service) với idempotency; ép Ansible tạo hạ tầng thì mất khả năng plan/track state của Terraform. Ranh giới đúng: <strong>Terraform lo 'máy tồn tại', Ansible/image lo 'bên trong máy đúng'</strong>." },
      { q: "Một playbook có task 'chạy lệnh apt install nginx' bằng module command. Vì sao vi phạm idempotency và sửa thế nào?",
        a: "Module <code>command</code>/<code>shell</code> là <strong>mệnh lệnh</strong>, Ansible không biết trạng thái đích nên mỗi lần chạy đều thực thi lại và luôn báo <code>changed</code> — không idempotent, và các lệnh có tác dụng phụ (append vào file, tạo trùng) sẽ cộng dồn khi chạy lại. Sửa bằng cách dùng <strong>module khai báo trạng thái</strong>: <code>package: name=nginx state=present</code> — Ansible kiểm tra, đã có thì báo <code>ok</code> và không làm gì. Nguyên tắc: <strong>mô tả trạng thái đích, đừng ra lệnh từng bước</strong>; chỉ dùng command/shell khi không có module phù hợp và tự thêm điều kiện <code>creates:</code>/<code>when:</code> để giữ idempotent." },
      { q: "Team đã container hóa toàn bộ app edtech và chạy trên hạ tầng bất biến. Có nên dựng một tầng Ansible để cấu hình các container đang chạy không?",
        a: "<strong>Không</strong> — đó là đi ngược tinh thần bất biến. Với container + immutable infra, cấu hình nên được <strong>bake vào image lúc build</strong> (Dockerfile, hoặc Packer+Ansible tạo golden image), rồi triển khai image bất biến và thay mới khi đổi, chứ không sửa container đang sống. Dựng cả tầng config management chạy liên tục lúc này là <strong>over-engineering</strong> và tạo hai nguồn sự thật mâu thuẫn. Ansible vẫn có chỗ, nhưng cho phần <strong>nằm ngoài container</strong>: host của K8s node, image building, thiết bị mạng, DB bare-metal, hệ legacy — không phải cho bên trong container." },
      { q: "Khác biệt cốt lõi giữa push-based (Ansible) và pull-based (Puppet/Chef), và mỗi cái hợp cảnh nào?",
        a: "<strong>Push (Ansible)</strong>: máy điều khiển SSH tới đích và đẩy cấu hình khi bạn chạy — <strong>agentless</strong>, đơn giản, bạn kiểm soát chính xác thời điểm áp dụng; hợp team nhỏ–vừa và thao tác có chủ đích. <strong>Pull (Puppet/Chef)</strong>: mỗi máy chạy <strong>agent</strong> định kỳ tự kéo cấu hình từ server về và tự hội tụ về trạng thái mong muốn — hợp <strong>đội máy rất lớn</strong> cần liên tục tự sửa drift mà không ai bấm nút, và máy mới bật lên tự cấu hình. Trade-off: push ít hạ tầng nền hơn nhưng khó tự hội tụ ở quy mô lớn; pull mạnh ở quy mô nhưng phải nuôi agent + server trung tâm." },
      { q: "Bạn cần đưa mật khẩu DB vào cấu hình qua Ansible. Cách sai và cách đúng là gì?",
        a: "Cách sai: viết mật khẩu <strong>plain text thẳng trong playbook/biến rồi commit vào Git</strong> — bất kỳ ai clone repo là thấy secret. Cách đúng ở mức cơ bản: dùng <strong>Ansible Vault</strong> mã hóa file/biến nhạy cảm, chỉ giải mã lúc chạy bằng vault password/key được bảo vệ ngoài repo. Tốt hơn ở prod: <strong>kéo secret từ secret manager trung tâm lúc runtime</strong> (không để secret đọng trong repo, có xoay vòng và audit) — đúng tinh thần least-privilege và credential ngắn hạn đã học ở CLD-08. Nguyên tắc: <strong>không secret nào ở dạng rõ trong version control</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên 2 VM Linux (từ CLD-08/IAC-09): (1) viết một playbook Ansible cấu hình Nginx + một app nhỏ với các module khai báo trạng thái (<code>package</code>, <code>template</code>, <code>service</code>), dùng handler chỉ reload khi config đổi; (2) chạy playbook <b>hai lần</b> và xác nhận lần hai báo toàn <code>ok</code> chứ không <code>changed</code> — đó là idempotency; (3) đưa một mật khẩu giả vào bằng <b>Ansible Vault</b> và xác nhận file mã hóa không lộ khi xem thô; (4) so sánh: viết lại cùng cấu hình đó dưới dạng một <code>Dockerfile</code> (bake vào image) và tự trả lời — với app này, bạn nên dùng Ansible-trên-máy-sống hay bake image, vì sao. Ghi lại ranh giới Terraform ↔ image ↔ Ansible cho dự án của bạn.</p>`,
    links: [
      { t: "Ansible — documentation (playbooks, modules)", u: "docs.ansible.com/ansible/latest" },
      { t: "Ansible — best practices & idempotency", u: "docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html" },
      { t: "Ansible Vault — mã hóa secret", u: "docs.ansible.com/ansible/latest/vault_guide/index.html" },
      { t: "HashiCorp Packer — bake golden image (với Ansible)", u: "developer.hashicorp.com/packer" },
      { t: "Puppet vs Chef vs Ansible — push/pull, agent", u: "redhat.com/en/topics/automation/what-is-configuration-management" },
    ],
  },
];
