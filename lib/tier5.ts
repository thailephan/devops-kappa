import type { SkillNode } from "./skill-types";

export const TIER5: SkillNode[] = [
  {
    id: "K8S-11", tier: 5, xp: 100, prereq: ["CMP-05", "CLD-08"],
    title: "Kubernetes — Core Objects",
    sum: "Điều phối container: Pod/Deployment/Service/Ingress, self-heal, probe.",
    theory: `<p>Kubernetes (K8s) là một <b>vòng lặp điều hòa (control loop)</b>: bạn khai báo <i>trạng thái mong muốn</i> bằng YAML, K8s liên tục so sánh với <i>trạng thái thực tế</i> và tự kéo hệ về đúng ý bạn. Đây là bước nhảy tư duy quan trọng nhất — bạn ngừng ra lệnh 'chạy container này', bạn khai báo 'luôn phải có 6 bản sao khỏe mạnh'.</p>
<p><b>Các đối tượng cốt lõi phải nắm:</b></p>
<ul>
<li><b>Pod</b> — đơn vị lịch biểu nhỏ nhất, bọc 1 (hoặc vài) container chia sẻ network/volume. Pod là <i>ephemeral</i>: chết là mất, không tự sống lại một mình.</li>
<li><b>ReplicaSet</b> — giữ đúng số lượng Pod bản sao. Bạn hiếm khi tạo trực tiếp.</li>
<li><b>Deployment</b> — quản lý ReplicaSet, cho phép <b>rolling update</b> và rollback. Đây là thứ bạn khai báo cho app không trạng thái (API catalog, enrollment).</li>
<li><b>Service</b> — địa chỉ ổn định (ClusterIP) trước một tập Pod hay đổi IP; load-balance nội bộ. Vì Pod IP thay đổi, gọi nhau qua Service chứ không qua IP Pod.</li>
<li><b>Ingress</b> — định tuyến HTTP/HTTPS từ ngoài vào các Service theo host/path, gộp TLS termination. Ví dụ <code>api.course.edu</code> vào Service enrollment, <code>video.course.edu</code> vào Service encoding.</li>
<li><b>ConfigMap / Secret</b> — tách cấu hình và bí mật khỏi image (đúng tinh thần 12-Factor). Lưu ý Secret mặc định chỉ base64, KHÔNG phải mã hóa.</li>
<li><b>namespace</b> — ranh giới logic để tách môi trường/nhóm (staging vs prod, hoặc team catalog vs team analytics), gắn quota.</li>
</ul>
<p><b>Self-healing:</b> Pod chết → ReplicaSet tạo lại; node chết → Pod được lên lịch sang node khác. <b>Rolling update</b> thay Pod từ từ theo <code>maxSurge</code> (bao nhiêu Pod thừa được phép tạo thêm) và <code>maxUnavailable</code> (bao nhiêu Pod được phép thiếu) — đây chính là cơ chế deploy không downtime.</p>
<p><b>Probe — chỗ dễ sai nhất và hay gây sự cố nhất:</b></p>
<ul>
<li><b>liveness probe</b> trả lời: 'container còn sống không?' Fail → K8s <b>giết và restart</b> container.</li>
<li><b>readiness probe</b> trả lời: 'sẵn sàng nhận request chưa?' Fail → K8s <b>rút Pod khỏi Service</b> (ngừng gửi traffic) nhưng KHÔNG restart.</li>
</ul>
<p><b>Hậu quả khi cấu hình sai probe:</b> nếu bạn để liveness gọi vào một endpoint phụ thuộc DB, khi DB chậm liveness fail → K8s restart hàng loạt Pod đang khỏe → <b>restart loop (CrashLoopBackOff)</b> làm sập cả service dù app không hề lỗi. Ngược lại, nếu THIẾU readiness, K8s gửi traffic vào Pod chưa nạp xong cache/chưa mở kết nối DB → <b>user nhận 5xx</b> ngay sau mỗi lần deploy. Quy tắc: liveness kiểm tra 'process treo' thật đơn giản; readiness kiểm tra 'phụ thuộc đã sẵn sàng'.</p>
<p><b>resource requests/limits:</b> <code>requests</code> là mức scheduler dùng để đặt Pod (đảm bảo tối thiểu); <code>limits</code> là trần. Bỏ trống là quả bom hẹn giờ: một Pod encoding video ngốn hết CPU/RAM của node → <b>noisy neighbor</b> bóp nghẹt Pod khác, hoặc vượt RAM node gây <b>OOMKill</b> lan sang các Pod vô can trên cùng node.</p>
<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: enrollment-api
  namespace: prod
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0        # 0 =&gt; luôn giữ đủ capacity khi deploy
  selector:
    matchLabels: { app: enrollment-api }
  template:
    metadata:
      labels: { app: enrollment-api }
    spec:
      containers:
        - name: api
          image: registry.course.edu/enrollment:v2.3.1
          ports: [ { containerPort: 8080 } ]
          readinessProbe:               # sẵn sàng nhận traffic chưa?
            httpGet: { path: /ready, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:                # process còn sống không?
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 20
            periodSeconds: 15
            failureThreshold: 3
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "1",    memory: "512Mi" }</code></pre>`,
    whenUse: `<p>Dùng K8s khi bạn thực sự có <b>nhiều service, nhiều bản sao, deploy thường xuyên</b> và cần self-healing/rolling update tự động ở quy mô lớn — ví dụ edtech mùa tựu trường với hàng chục service (catalog, enrollment, encoding, grading, analytics) và hàng triệu user.</p>
<p><b>KHI NÀO KHÔNG dùng K8s — quan trọng không kém:</b> team nhỏ, một app, ~500 user. K8s thêm một mặt phẳng phức tạp khổng lồ (control plane, networking CNI, RBAC, storage class, nâng cấp cluster, YAML) mà bạn phải tự vận hành 3h sáng. Ở quy mô đó, hãy chọn <b>managed container</b> (Cloud Run / ECS Fargate / App Runner) hoặc <b>Docker Compose trên 1-2 VM</b>. Bạn vẫn có container, vẫn rolling deploy, mà không phải nuôi cả một cluster. Câu hỏi gốc: 'nỗi đau đo được nào bắt tôi phải mua độ phức tạp này?' — nếu chưa trả lời được, bạn chưa cần K8s.</p>`,
    pros: [
      "Self-healing và rolling update tự động: Pod/node chết tự phục hồi, deploy không downtime",
      "Khai báo trạng thái mong muốn (declarative): hạ tầng tái tạo được, hợp GitOps",
      "Chuẩn hóa cách chạy nhiều service ở quy mô lớn, hệ sinh thái công cụ khổng lồ",
      "Trừu tượng hóa node: mở rộng ngang bằng thêm bản sao hoặc thêm node",
    ],
    cons: [
      "Độ phức tạp vận hành rất cao: control plane, networking, RBAC, nâng cấp cluster",
      "Over-engineering với team nhỏ hoặc scale thấp: chi phí học và vận hành vượt lợi ích",
      "Nhiều điểm cấu hình sai chết người (probe, resource) gây sự cố khó đoán",
    ],
    questions: [
      { q: "Sau mỗi lần deploy, user báo lỗi 5xx trong khoảng 10-20 giây rồi hết. Deployment không có readiness probe. Chuyện gì xảy ra và sửa thế nào?",
        a: "Thiếu <strong>readiness probe</strong> nên ngay khi container khởi động, K8s coi Pod là sẵn sàng và đưa vào Service — nhưng app chưa nạp xong cache, chưa mở pool kết nối DB, nên request đầu tiên trả 5xx. Trong rolling update, Pod mới liên tục được thêm vào Service quá sớm nên user thấy lỗi từng đợt. Sửa bằng cách thêm <strong>readinessProbe trỏ vào endpoint kiểm tra các phụ thuộc đã sẵn sàng</strong> (DB, cache) — K8s chỉ gửi traffic sau khi probe pass, và trong rolling update Pod cũ chỉ bị rút khi Pod mới đã ready. Đặt thêm <code>maxUnavailable: 0</code> để không bao giờ tụt capacity giữa chừng." },
      { q: "Toàn bộ Pod của service enrollment rơi vào CrashLoopBackOff dù code không đổi. Log app bình thường, chỉ có DB đang chậm. Nghi phạm số 1?",
        a: "Gần như chắc chắn là <strong>liveness probe cấu hình sai</strong>: nó đang trỏ vào endpoint có truy vấn DB. Khi DB chậm, probe timeout và fail liên tiếp quá <code>failureThreshold</code> → K8s tưởng container treo và <strong>giết rồi restart</strong> — nhưng restart không chữa được DB chậm, nên lặp vô hạn thành CrashLoopBackOff, biến một sự cố nhỏ ở DB thành sập toàn service. Nguyên tắc: <strong>liveness phải kiểm tra thứ nhẹ và cục bộ</strong> (process có phản hồi HTTP không), tuyệt đối không phụ thuộc downstream. Việc 'downstream chưa sẵn sàng' là chuyện của readiness (rút khỏi traffic, không restart)." },
      { q: "Một team đặt Deployment không khai báo resources gì cả để 'cho đơn giản'. Vài ngày sau job encoding video làm sập luôn cả các Pod grading trên cùng node. Vì sao?",
        a: "Không có <code>requests</code> nên scheduler không biết Pod cần bao nhiêu và đặt bừa; không có <code>limits</code> nên Pod encoding — vốn ngốn CPU/RAM — được phép nuốt hết tài nguyên node (<strong>noisy neighbor</strong>). Khi tổng RAM vượt dung lượng node, kernel kích hoạt <strong>OOMKiller giết cả những Pod vô can</strong> như grading trên cùng node. Sửa bằng cách đặt <code>requests</code> đúng để scheduler xếp chỗ hợp lý, và <code>limits</code> để chặn trần; cân nhắc tách workload nặng ra node pool riêng hoặc dùng ResourceQuota theo namespace. Bỏ trống resource là một trong những lỗi 'tự bắn vào chân' phổ biến nhất trên K8s." },
      { q: "Startup edtech mới có 500 user, một app monolith, team 2 người. Sếp đọc bài blog và muốn 'lên Kubernetes cho chuẩn'. Bạn phản biện thế nào?",
        a: "K8s giải quyết bài toán <strong>nhiều service, nhiều bản sao, scale lớn</strong> — không phải bài toán của bạn lúc này. Đổi lại bạn phải nuôi cả control plane, networking, RBAC, nâng cấp cluster: một mặt phẳng phức tạp mà team 2 người sẽ phải trực 3h sáng, đúng lúc lẽ ra nên tập trung vào sản phẩm. Với 500 user, <strong>managed container (Cloud Run / ECS Fargate) hoặc Docker Compose trên 1-2 VM là đủ</strong> — vẫn có container, vẫn rolling deploy, vẫn scale được vài lần, mà gần như không có chi phí vận hành cluster. Nguyên tắc chống over-engineering: chỉ mua độ phức tạp khi có <strong>nỗi đau đo được</strong>; hãy để kiến trúc tiến hóa, di trú sang K8s sau khi thật sự chạm trần của giải pháp đơn giản." },
      { q: "Trong K8s, vì sao service A phải gọi service B qua Service (ClusterIP) chứ không phải qua IP của Pod? Và maxSurge/maxUnavailable ảnh hưởng gì tới việc này khi deploy?",
        a: "Pod là <strong>ephemeral</strong>: nó bị giết/tạo lại liên tục (self-heal, rolling update, dời node) và mỗi lần có IP mới, nên hardcode IP Pod sẽ hỏng ngay lần Pod đầu tiên chết. <strong>Service</strong> cho một ClusterIP/DNS name ổn định và tự load-balance tới tập Pod khỏe mạnh (đúng những Pod đang <em>ready</em>). Khi deploy, <code>maxSurge</code>/<code>maxUnavailable</code> quyết định trong lúc thay Pod thì Service còn bao nhiêu endpoint khỏe: đặt <code>maxUnavailable: 0</code> + <code>maxSurge</code> dương để luôn tạo Pod mới ready trước khi rút Pod cũ → service B luôn có đủ backend, A không bao giờ thấy 'không có endpoint'. Đây là lý do readiness probe + Service + chiến lược rolling là ba mảnh khớp nhau tạo nên deploy không downtime." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Dựng một cluster local (kind hoặc minikube). (1) Viết Deployment cho một app nhỏ có endpoint <code>/healthz</code> và <code>/ready</code>, đặt <code>replicas: 3</code>, có readiness + liveness probe và resource requests/limits. (2) Tạo Service (ClusterIP) và Ingress trỏ tới nó. (3) Gây sự cố có chủ đích: xóa 1 Pod bằng <code>kubectl delete pod</code> và xem ReplicaSet tự tạo lại; cố tình cho <code>/ready</code> trả 503 và quan sát Pod bị rút khỏi endpoint của Service (traffic ngừng) nhưng KHÔNG bị restart; rồi cho <code>/healthz</code> fail và xem Pod rơi vào CrashLoopBackOff. (4) Làm một rolling update (đổi image tag) với <code>maxUnavailable: 0</code>, dùng <code>kubectl rollout status</code> và một vòng lặp <code>curl</code> để chứng minh không có downtime. Cuối cùng, viết 1 đoạn ngắn: ở quy mô app của bạn hiện tại, bạn có thật sự cần K8s không, hay Compose/managed container là đủ?</p>`,
    links: [
      { t: "Kubernetes — Concepts (Workloads, Services, Networking)", u: "kubernetes.io/docs/concepts" },
      { t: "Kubernetes — Configure Liveness, Readiness and Startup Probes", u: "kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes" },
      { t: "Kubernetes — Managing Resources for Containers (requests/limits)", u: "kubernetes.io/docs/concepts/configuration/manage-resources-containers" },
      { t: "Google Cloud Run — chạy container không cần cluster", u: "cloud.google.com/run/docs" },
      { t: "Kelsey Hightower — Kubernetes The Hard Way (hiểu bên dưới)", u: "github.com/kelseyhightower/kubernetes-the-hard-way" },
    ],
  },
  {
    id: "HLM-12", tier: 5, xp: 100, prereq: ["K8S-11"],
    title: "Helm & Config theo môi trường",
    sum: "Đóng gói & template manifest theo môi trường; values, release, rollback.",
    theory: `<p>Khi app lên K8s thật, bạn không còn 1 file YAML mà là hàng chục (Deployment, Service, Ingress, ConfigMap, HPA...) nhân với 3 môi trường (dev/staging/prod). Nếu <code>kubectl apply -f</code> từng file thủ công cho từng môi trường, bạn sẽ copy-paste và <b>drift</b>: prod khác staging ở những chỗ không ai nhớ, và không có một 'đơn vị phát hành' rõ ràng để rollback.</p>
<p><b>Helm</b> là trình quản lý gói cho K8s. Nó giải quyết ba việc:</p>
<ul>
<li><b>Template hóa</b> manifest: viết YAML một lần với chỗ trống, điền bằng biến — hết copy-paste.</li>
<li><b>values theo môi trường (DRY):</b> một <b>chart</b> chung, mỗi môi trường một file <code>values-&lt;env&gt;.yaml</code> chỉ chứa phần KHÁC BIỆT (replicas, tài nguyên, host, tag image).</li>
<li><b>release + rollback:</b> mỗi lần cài là một <b>release</b> có số revision. Helm lưu lịch sử nên <code>helm rollback</code> đưa cả bộ manifest về đúng revision trước — một thao tác, không phải sửa tay từng file.</li>
</ul>
<p>Một đoạn template và values tách môi trường:</p>
<pre><code># templates/deployment.yaml (một lần cho mọi môi trường)
spec:
  replicas: REPLICAS_FROM_VALUES
  template:
    spec:
      containers:
        - name: api
          image: IMAGE_REPO:IMAGE_TAG
          resources:
            requests:
              cpu: CPU_REQUEST_FROM_VALUES

# values-staging.yaml   (chỉ phần khác biệt)
replicas: 2
image: { tag: v2.3.1-rc }
resources: { requests: { cpu: "100m" } }

# values-prod.yaml
replicas: 6
image: { tag: v2.3.1 }
resources: { requests: { cpu: "250m" } }</code></pre>
<pre><code>helm upgrade --install enrollment ./chart -n prod -f values-prod.yaml
helm history enrollment -n prod        # xem các revision
helm rollback enrollment 4 -n prod     # về đúng revision 4, một lệnh</code></pre>
<p><b>Rủi ro: template hóa quá đà.</b> Helm dùng text-template; nhồi quá nhiều <code>if/range</code>/hàm vào YAML sẽ tạo ra một 'ngôn ngữ lập trình trong YAML' khó đọc, khó debug (lỗi indent chỉ lộ khi render), và lính mới không dám sửa. Nguyên tắc: <b>chỉ tham số hóa thứ thật sự khác nhau giữa các môi trường</b>; đừng biến mọi giá trị thành biến 'cho chắc'.</p>
<p><b>Helm vs Kustomize — trade-off:</b> <b>Kustomize</b> (tích hợp sẵn <code>kubectl -k</code>) theo hướng <i>overlay</i>: giữ YAML thật, patch phần khác biệt theo từng môi trường, không có template ngôn ngữ — dễ đọc, khó lạm dụng, nhưng không đóng gói/phân phối/versioning như một 'gói' và không có khái niệm release/rollback tích hợp. <b>Helm</b> mạnh ở đóng gói, phân phối (chart repo), templating linh hoạt và release/rollback — đổi lại là độ phức tạp template. Thực dụng: dùng <b>Kustomize</b> khi chỉ cần patch cấu hình theo môi trường cho app nhà; dùng <b>Helm</b> khi cần phân phối chart cho người khác cài (vd cài Prometheus, ingress-nginx) hoặc cần release/rollback có lịch sử.</p>`,
    whenUse: `<p>Dùng Helm khi bạn đã có nhiều manifest và nhiều môi trường, cần một đơn vị phát hành có version + rollback, hoặc khi <b>cài lại phần mềm của bên thứ ba</b> (Prometheus, cert-manager, ingress-nginx) — gần như tất cả đều phân phối dưới dạng Helm chart. Với một app đơn giản một môi trường, <code>kubectl apply</code> hoặc Kustomize là đủ; đừng thêm Helm chỉ vì 'ai cũng dùng'. Với team chưa lên K8s (còn Compose/managed container ở K8S-11), bạn CHƯA cần Helm.</p>`,
    pros: [
      "DRY: một chart dùng chung, mỗi môi trường chỉ khai báo phần khác biệt trong values",
      "Release có version + helm rollback: đưa cả bộ manifest về revision cũ bằng một lệnh",
      "Hệ sinh thái chart khổng lồ: cài phần mềm bên thứ ba (Prometheus, ingress) rất nhanh",
    ],
    cons: [
      "Template text dễ bị lạm dụng thành 'code trong YAML', khó đọc và khó debug",
      "Thêm một lớp trừu tượng: phải render mới biết manifest thật ra sao (helm template)",
      "Với nhu cầu chỉ patch theo môi trường, Kustomize thường đơn giản và an toàn hơn",
    ],
    questions: [
      { q: "Team đang copy toàn bộ thư mục YAML cho mỗi môi trường (dev/staging/prod) rồi sửa tay vài dòng. Vấn đề gì sẽ xảy ra, và Helm sửa thế nào?",
        a: "Đây là công thức của <strong>configuration drift</strong>: ba bản YAML dần khác nhau ở những chỗ không ai ghi lại (ai đó sửa replicas trên prod mà quên staging), nên 'chạy được ở staging' không còn đảm bảo gì cho prod, và không có đơn vị phát hành rõ ràng để rollback. Helm sửa bằng <strong>một chart chung + file values riêng cho mỗi môi trường chỉ chứa phần khác biệt</strong> (DRY): logic manifest chỉ tồn tại một nơi, khác biệt môi trường được khai báo tường minh và review được. Thêm nữa mỗi lần cài là một release có revision nên rollback là một lệnh." },
      { q: "Vì sao 'helm rollback' an toàn và nhanh hơn việc tự sửa YAML về trạng thái cũ rồi kubectl apply lại?",
        a: "Helm lưu <strong>toàn bộ manifest đã render của từng revision</strong>, nên <code>helm rollback enrollment 4</code> khôi phục chính xác trạng thái đã từng chạy — kể cả những thay đổi bạn không nhớ. Tự sửa tay YAML về 'như cũ' dựa vào trí nhớ con người: dễ sót một ConfigMap hay một thay đổi ở HPA, và bạn phải build lại state trong đầu đúng lúc đang cháy. Nguyên tắc như GIT-03: <strong>rollback là trỏ lại một trạng thái bất biến đã kiểm chứng</strong>, không phải tái tạo lại bằng tay. Một lệnh, xác định, và có <code>helm history</code> để audit ai đổi gì." },
      { q: "Một chart Helm của team đầy if/else và range lồng nhau, mỗi giá trị đều thành biến 'cho linh hoạt'. Đây là dấu hiệu gì và bạn khuyên gì?",
        a: "Đây là <strong>over-templating</strong>: chart biến thành một ngôn ngữ lập trình viết trong YAML, khó đọc, lỗi indent chỉ lộ khi render (<code>helm template</code>), và lính mới không dám chạm. 'Linh hoạt cho mọi trường hợp' là chi phí, không phải giá trị — YAML không nên gánh logic. Khuyến nghị: <strong>chỉ tham số hóa những gì thật sự khác nhau giữa các môi trường</strong> (replicas, tag, host, tài nguyên), giữ phần còn lại tĩnh và dễ đọc; nếu nhu cầu chỉ là patch theo môi trường thì cân nhắc chuyển sang <strong>Kustomize overlay</strong> vốn không có template ngôn ngữ nên khó lạm dụng hơn." },
      { q: "Khi nào bạn chọn Kustomize thay vì Helm, và ngược lại? Cho ví dụ trong ngữ cảnh edtech.",
        a: "Chọn <strong>Kustomize</strong> khi bạn chỉ cần <strong>patch cấu hình theo môi trường cho app nhà mình</strong> — ví dụ base cho service grading, rồi overlay prod tăng replicas và đổi host: YAML giữ nguyên hình dạng thật, không template ngôn ngữ nên dễ đọc và khó lạm dụng. Chọn <strong>Helm</strong> khi bạn cần <strong>đóng gói/phân phối một gói có version</strong> (chart repo cho nhiều team cài lại) hoặc cần release/rollback có lịch sử tích hợp, và đặc biệt khi cài <strong>phần mềm bên thứ ba</strong> như Prometheus hay ingress-nginx vốn phân phối bằng Helm chart. Thực tế nhiều team edtech dùng cả hai: Helm để cài hạ tầng bên thứ ba, Kustomize (hoặc Helm gọn nhẹ) cho app nhà. Quyết định theo nhu cầu <strong>phân phối/versioning</strong> chứ không theo trào lưu." },
      { q: "Team chưa lên Kubernetes, còn chạy Docker Compose trên VM cho ~2000 user. Có nên áp Helm để 'quản lý config theo môi trường' không?",
        a: "Không — Helm là công cụ <strong>trên nền Kubernetes</strong>; áp Helm khi chưa có cluster là lắp một lớp trừu tượng vào một bài toán không tồn tại. Ở mức Compose, quản lý config theo môi trường đã giải quyết đủ tốt bằng <strong>file .env riêng cho mỗi môi trường + Compose override</strong> (<code>docker compose -f base.yml -f prod.yml</code>) đúng tinh thần 12-Factor. Chỉ khi bạn thật sự cần lên K8s vì scale/số service (nỗi đau đo được ở K8S-11) thì Helm/Kustomize mới trở thành câu hỏi hợp lý. Đây lại là nguyên tắc chống over-engineering: đừng mua công cụ của tầng trên khi chưa ở tầng đó." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên cluster local (kind/minikube): (1) <code>helm create mychart</code> rồi cắt gọn chart mẫu về đúng Deployment + Service + Ingress cho một app nhỏ. (2) Tạo hai file values: <code>values-staging.yaml</code> (replicas 2, tag rc, tài nguyên nhỏ) và <code>values-prod.yaml</code> (replicas 6, tag release, tài nguyên lớn), chỉ khai báo phần khác biệt. (3) Cài cả hai vào hai namespace bằng <code>helm upgrade --install ... -f values-...</code> và dùng <code>helm template</code> để xem manifest render ra khác nhau đúng như mong đợi. (4) Nâng cấp một revision rồi <code>helm history</code> + <code>helm rollback</code> về revision trước, đo xem nhanh gọn thế nào. (5) So sánh: làm lại phần tách môi trường bằng một <b>Kustomize overlay</b> đơn giản và tự nhận xét cái nào dễ đọc hơn cho nhu cầu của bạn.</p>`,
    links: [
      { t: "Helm — Charts, Values, Releases", u: "helm.sh/docs/topics/charts" },
      { t: "Helm — helm rollback & release history", u: "helm.sh/docs/helm/helm_rollback" },
      { t: "Kustomize — quản lý cấu hình bằng overlay", u: "kubectl.docs.kubernetes.io/references/kustomize" },
      { t: "Kubernetes — Declarative Management với Kustomize", u: "kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization" },
      { t: "Helm vs Kustomize — so sánh của CNCF/cộng đồng", u: "helm.sh/docs/topics/kustomize" },
    ],
  },
  {
    id: "SCL-13", tier: 5, xp: 100, prereq: ["K8S-11"],
    title: "Autoscaling & Service Mesh",
    sum: "HPA/VPA/Cluster Autoscaler + khi nào cần service mesh.",
    theory: `<p>Tự động co giãn trong K8s có <b>ba tầng khác nhau</b>, hay bị nhầm lẫn:</p>
<ul>
<li><b>HPA (Horizontal Pod Autoscaler)</b> — thêm/bớt <i>số Pod</i> của một Deployment theo tải. Phù hợp app không trạng thái. Đây là thứ dùng nhiều nhất.</li>
<li><b>VPA (Vertical Pod Autoscaler)</b> — chỉnh <i>requests/limits</i> của Pod (to/nhỏ hơn). Hữu ích để dò đúng resource, nhưng thường phải restart Pod nên ít dùng chung với HPA trên cùng metric.</li>
<li><b>Cluster Autoscaler</b> — thêm/bớt <i>node</i> khi Pod không có chỗ để lên lịch (Pending) hoặc node thừa. Đây là tầng <b>hạ tầng</b>, khác hẳn HPA (tầng Pod).</li>
</ul>
<p><b>HPA theo CPU vs theo custom metric:</b> mặc định HPA scale theo CPU/RAM. Nhưng với <b>video encoding</b>, CPU chưa chắc phản ánh đúng nhu cầu — thứ đo nhu cầu thật là <b>độ tồn đọng hàng đợi (queue lag)</b>: số job encoding đang chờ. Nếu chỉ scale theo CPU, hàng đợi có thể phình dài trong khi CPU mỗi worker vẫn 'chưa cao lắm', làm video của giáo viên bị chậm xử lý hàng giờ. Giải pháp: scale theo <b>custom/external metric</b> (vd số message trong queue trên mỗi Pod).</p>
<pre><code>apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: video-encoder
  namespace: prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: video-encoder
  minReplicas: 4
  maxReplicas: 60
  metrics:
    - type: External                # scale theo độ tồn đọng hàng đợi
      external:
        metric: { name: queue_messages_per_pod }
        target: { type: AverageValue, averageValue: "30" }
  behavior:
    scaleUp:
      policies: [ { type: Percent, value: 100, periodSeconds: 30 } ]  # tăng nhanh
    scaleDown:
      stabilizationWindowSeconds: 300   # hạ chậm, tránh giật (flapping)</code></pre>
<p><b>Độ trễ autoscale — cạm bẫy mùa tựu trường:</b> autoscale KHÔNG tức thời. Chuỗi phản ứng: metric phải vượt ngưỡng vài chu kỳ → HPA quyết định → Pod mới kéo image, khởi động, chờ readiness → nếu hết node thì còn phải chờ <b>Cluster Autoscaler tạo node mới</b> (thường vài phút). Với đợt tăng dốc lúc 8h sáng ngày khai giảng, tổng độ trễ này đủ để user nhận 5xx/timeout trước khi capacity kịp tới. Xử lý: <b>pre-scale/overprovision theo lịch</b> (biết trước peak thì nâng minReplicas trước giờ G), giữ <b>pause pod</b> để Cluster Autoscaler có node đệm sẵn, và ưu tiên scale-up nhanh + scale-down chậm để không bị giật.</p>
<p><b>Service mesh (Istio/Linkerd) giải quyết gì:</b> chèn một sidecar proxy cạnh mỗi Pod để lo phần <i>giao tiếp giữa service</i> mà không sửa code: <b>mTLS</b> (mã hóa + xác thực nội bộ), <b>retry/timeout/circuit-breaking</b>, <b>traffic split</b> (canary: 5% sang v2), và <b>observability</b> (golden metrics, distributed trace tự động). Đổi lại là <b>cái giá không nhỏ</b>: thêm một proxy trên mọi request (latency + tài nguyên), một control plane phải vận hành và nâng cấp, độ phức tạp debug tăng, và một bề mặt kiến thức mới cho cả team.</p>
<p><b>KHI NÀO CHƯA cần service mesh:</b> ít service, gọi nhau đơn giản, chưa có nhu cầu mTLS bắt buộc hay canary tinh vi. Phần lớn nhu cầu ban đầu (retry, timeout, TLS) làm được bằng <b>thư viện trong app</b> hoặc ingress + cert-manager, rẻ và ít ma sát hơn nhiều. Hãy đợi tới khi số service đủ lớn để việc nhét retry/mTLS/observability vào từng codebase trở thành nỗi đau thật — lúc đó mesh mới đáng giá. Đừng cài Istio cho 3 service.</p>`,
    whenUse: `<p><b>Autoscaling:</b> bật HPA khi tải biến động và app scale ngang được (API catalog, enrollment lúc cao điểm; encoder theo hàng đợi). Bật Cluster Autoscaler khi muốn số node tự co giãn theo Pod. Với peak <b>dự đoán được</b> (khai giảng, hạn nộp bài), ưu tiên <b>pre-scale theo lịch</b> hơn là phó mặc cho autoscale phản ứng. <b>Service mesh:</b> chỉ khi đã có nhiều service và cần mTLS bắt buộc / traffic split / observability đồng nhất mà giải pháp trong app không còn kham nổi. Team nhỏ, ít service: CHƯA cần mesh.</p>`,
    pros: [
      "HPA co giãn số Pod theo tải thật (CPU hoặc custom metric như queue lag) giúp tiết kiệm và chịu peak",
      "Cluster Autoscaler tự thêm/bớt node, tách rõ tầng Pod và tầng hạ tầng",
      "Service mesh cung cấp mTLS, retry, canary và observability đồng nhất mà không sửa code từng service",
    ],
    cons: [
      "Autoscale có độ trễ: peak dốc có thể gây 5xx trước khi capacity kịp tới, cần pre-scale",
      "Scale theo sai metric (chỉ CPU) làm hàng đợi phình mà vẫn không scale",
      "Service mesh thêm sidecar, control plane và độ phức tạp lớn: over-engineering nếu ít service",
    ],
    questions: [
      { q: "Video encoder scale bằng HPA theo CPU, nhưng giáo viên phàn nàn video upload buổi sáng mãi tới chiều mới xử lý xong dù cluster 'không thấy CPU cao'. Vì sao và sửa thế nào?",
        a: "CPU là <strong>sai metric cho workload theo hàng đợi</strong>: mỗi worker encoder có thể chạy ở mức CPU vừa phải trong khi <em>hàng đợi job phình dài</em> — nhu cầu thật nằm ở độ tồn đọng, không ở CPU tức thời, nên HPA không thấy lý do để scale. Sửa bằng cách cho HPA scale theo <strong>custom/external metric là số job đang chờ trên mỗi Pod</strong> (queue lag): khi tồn đọng vượt ngưỡng, HPA thêm worker ngay cả khi CPU chưa cao. Bài học tổng quát: <strong>autoscale phải bám vào metric phản ánh đúng nhu cầu của workload</strong>, với hệ dựa trên hàng đợi thì đó là độ dài/độ trễ hàng đợi chứ không phải CPU." },
      { q: "8h sáng ngày khai giảng, hàng trăm nghìn học viên đăng nhập trong vài phút. Dù đã bật HPA và Cluster Autoscaler, user vẫn gặp 5xx đầu giờ. Vì sao, và bạn làm gì cho lần sau?",
        a: "Vì <strong>autoscale phản ứng, không tức thời</strong>: metric phải vượt ngưỡng vài chu kỳ, HPA mới quyết định, Pod mới còn phải kéo image + khởi động + chờ readiness, và nếu hết chỗ thì phải đợi Cluster Autoscaler <strong>tạo node mới mất vài phút</strong> — tổng độ trễ này dài hơn cú tăng dốc, nên capacity tới sau khi user đã nhận lỗi. Vì đây là peak <strong>dự đoán được</strong>, cách đúng là <strong>pre-scale/overprovision theo lịch</strong>: nâng <code>minReplicas</code> và giữ node đệm (pause pod) trước giờ G, để autoscale chỉ còn xử lý phần dư. Ưu tiên scale-up nhanh, scale-down chậm để không giật. Nguyên tắc: với peak biết trước, đừng phó mặc cho phản ứng thời gian thực." },
      { q: "Phân biệt HPA và Cluster Autoscaler — chúng ở tầng nào và tương tác ra sao? Chỉ bật HPA mà không có Cluster Autoscaler thì sao?",
        a: "<strong>HPA ở tầng Pod</strong>: nó tăng số bản sao Pod của Deployment theo tải. <strong>Cluster Autoscaler ở tầng hạ tầng</strong>: nó tăng số node khi có Pod không xếp được chỗ (Pending). Chúng phối hợp theo chuỗi: tải tăng → HPA tạo thêm Pod → nếu node hiện có không đủ tài nguyên, Pod mới ở trạng thái Pending → Cluster Autoscaler thấy Pending và cấp node mới → Pod được lên lịch. Nếu <strong>chỉ bật HPA mà không có Cluster Autoscaler</strong>, khi node đã cạn tài nguyên, HPA vẫn 'muốn' thêm Pod nhưng chúng kẹt Pending vô thời hạn — bạn tưởng đã autoscale nhưng thực tế chạm trần cứng của cụm node. Hai tầng phải đi cùng nhau thì co giãn mới thật sự thông suốt." },
      { q: "Một service mesh giải quyết những gì, và cái giá phải trả là gì?",
        a: "Mesh chèn <strong>sidecar proxy</strong> cạnh mỗi Pod để lo phần giao tiếp giữa các service mà không đụng code: <strong>mTLS</strong> (mã hóa + xác thực nội bộ zero-trust), <strong>retry/timeout/circuit-breaking</strong> đồng nhất, <strong>traffic split</strong> cho canary (vd 5% traffic sang v2), và <strong>observability</strong> tự động (golden signals, distributed tracing). Cái giá không nhỏ: mỗi request đi qua thêm một proxy (thêm latency và tài nguyên), một <strong>control plane mới phải vận hành và nâng cấp</strong>, việc debug khó hơn vì có thêm một lớp, và cả team phải học một mô hình mới. Đây là đánh đổi kinh điển <strong>tính năng đồng nhất toàn hệ đổi lấy độ phức tạp vận hành</strong> — chỉ đáng khi quy mô đủ lớn để lợi ích vượt cái giá đó." },
      { q: "Edtech của bạn có 4 service gọi nhau, chạy nội bộ trong VPC, chưa có yêu cầu tuân thủ bắt buộc mã hóa nội bộ. Team đề xuất cài Istio 'cho hiện đại'. Bạn quyết thế nào?",
        a: "CHƯA cần mesh. Với 4 service, các nhu cầu ban đầu — <strong>retry/timeout</strong> làm được bằng thư viện client trong app, <strong>TLS ngoài rìa</strong> bằng ingress + cert-manager, <strong>observability cơ bản</strong> bằng metrics/log/trace ở tầng ứng dụng — đều giải quyết rẻ hơn nhiều so với việc gánh một control plane Istio và một sidecar trên mọi request. Cài mesh lúc này là <strong>over-engineering</strong>: thêm latency, thêm thứ phải trực, thêm bề mặt học, đổi lấy lợi ích bạn chưa dùng tới. Quyết định đúng là <strong>đợi tới khi số service đủ lớn để việc nhét mTLS/retry/observability vào từng codebase trở thành nỗi đau đo được</strong> — lúc đó mesh mới trả đủ vốn. Nếu về sau có yêu cầu mTLS zero-trust bắt buộc hoặc canary tinh vi trên hàng chục service, hãy đánh giá lại; còn bây giờ, giữ mọi thứ đơn giản." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên cluster local có metrics-server: (1) Bật một HPA theo CPU cho một app nhỏ (<code>minReplicas: 2</code>, <code>maxReplicas: 10</code>), dùng công cụ tạo tải (hey/k6) và quan sát <code>kubectl get hpa -w</code> khi Pod tăng lên. (2) Đo <b>độ trễ scale</b>: bấm giờ từ lúc bắt đầu bơm tải tới khi Pod mới thật sự Ready và nhận traffic — cảm nhận vì sao peak dốc cần pre-scale. (3) Mô phỏng workload theo hàng đợi: dựng một app đọc job từ một queue, phơi metric 'số job đang chờ' và cấu hình HPA scale theo external metric đó thay vì CPU; so sánh hành vi với scale theo CPU. (4) Viết một đoạn quyết định: với kiến trúc edtech hiện tại của bạn, bạn CÓ hay CHƯA cần service mesh, và ba tính năng của mesh mà bạn đang tự làm được bằng cách nào rẻ hơn.</p>`,
    links: [
      { t: "Kubernetes — Horizontal Pod Autoscaler", u: "kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale" },
      { t: "Kubernetes — Cluster Autoscaler (autoscaler repo)", u: "github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler" },
      { t: "KEDA — event/queue-driven autoscaling cho K8s", u: "keda.sh/docs" },
      { t: "Istio — service mesh concepts (mTLS, traffic, telemetry)", u: "istio.io/latest/docs/concepts" },
      { t: "Linkerd — service mesh gọn nhẹ và khi nào cần mesh", u: "linkerd.io/2/overview" },
    ],
  },
];
