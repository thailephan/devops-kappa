import type { SkillNode } from "./skill-types";

export const TIER3: SkillNode[] = [
  {
    id: "CI-06", tier: 3, xp: 100, prereq: ["GIT-03", "DKR-04"],
    title: "CI — Build · Test · Scan tự động",
    sum: "Mỗi push tự động build/test/lint/scan — rút ngắn vòng phản hồi.",
    theory: `<p><b>CI (Continuous Integration) là hợp đồng: mỗi lần push code, một pipeline tự động chạy để trả lời một câu duy nhất — 'thay đổi này có an toàn để merge không?'</b> Vòng phản hồi càng ngắn, developer càng dám merge batch nhỏ thường xuyên (đúng tinh thần DORA: Lead Time ngắn, CFR thấp). Một pipeline chạy 40 phút thì không ai dám push nhiều lần/ngày — nó âm thầm ép team quay lại batch to.</p>
<p><b>Pipeline as code:</b> pipeline phải nằm trong repo, versioned cùng code, review qua PR — không phải cấu hình bấm tay trong UI. Ví dụ GitHub Actions:</p>
<pre><code>name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm          # cache node_modules theo hash lock file
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --shard=1/2   # unit test nhanh, gate merge</code></pre>
<p><b>Build image MỘT lần → tái dùng artifact.</b> Sai lầm kinh điển: mỗi stage (test, staging, prod) build lại image từ đầu — vừa chậm vừa nguy hiểm vì 3 lần build có thể ra 3 image khác nhau (dependency đổi, base image đổi). Đúng: build image một lần, gắn digest bất biến, các job sau <b>pull đúng digest đó</b>. Cái được test chính xác là cái sẽ chạy trên prod.</p>
<p><b>Song song hóa + cache để cắt pipeline 40 phút.</b> Chia job độc lập chạy song song (lint | unit | build), shard test suite (chia đôi 2000 test cho 2 runner), và cache lớp phụ thuộc (node_modules, layer Docker). Một pipeline 40 phút thường rút còn 8-10 phút chỉ nhờ cache + song song, chưa cần tối ưu code test.</p>
<p><b>Phân tầng test theo tốc độ:</b> unit test nhanh (giây) → gate merge, chạy mọi push; integration test → chạy sau khi merge vào main; e2e/nightly (chậm, hay flaky) → chạy theo lịch hoặc trước release, KHÔNG chặn PR. Đặt e2e vào cổng merge là cách chắc chắn nhất để developer học thói quen 'retry cho tới khi xanh'.</p>
<p><b>Fail-fast:</b> xếp bước rẻ và hay hỏng lên trước (lint, typecheck) để pipeline chết sớm trong 30 giây thay vì báo lỗi format sau khi đã build 8 phút.</p>
<p><b>Secret trong CI:</b> ưu tiên <b>OIDC token ngắn hạn</b> (CI đổi lấy token cloud sống vài phút, tự hết hạn) thay vì nhét static access key vào secret store — key dài hạn bị lộ là thảm họa. Không bao giờ <code>echo</code> secret ra log; mask chúng và giả định log là công khai.</p>`,
    whenUse: `<p>Dựng CI <b>ngay khi có hơn một người commit</b> vào cùng repo — đây là bước tự động hóa có ROI cao nhất, làm trước cả CD. Nhưng chống over-engineering: với edtech giai đoạn đầu, một job <code>lint + unit + build</code> chạy dưới 5 phút là quá đủ; <b>chưa</b> cần matrix build 6 phiên bản Node, chưa cần self-hosted runner, chưa cần e2e trên mọi PR. Chỉ thêm tầng test khi có sự cố đo được lọt qua tầng hiện tại. Đo trước (bug loại nào lọt lưới?), thêm gate sau.</p>`,
    pros: [
      "Vòng phản hồi ngắn: biết code hỏng trong phút, không phải sau khi merge",
      "Pipeline as code nên versioned, review được, tái tạo được — không drift như bấm tay UI",
      "Build một lần rồi tái dùng artifact: cái được test đúng là cái chạy trên prod",
      "Song song + cache cắt pipeline hàng chục phút xuống còn vài phút, khuyến khích batch nhỏ",
    ],
    cons: [
      "Test flaky làm xói mòn niềm tin: pipeline đỏ vô cớ khiến team quen bỏ qua cả lỗi thật",
      "Pipeline chậm ngầm ép team quay lại batch to; phải coi thời gian CI là một chỉ số cần theo dõi",
      "Quản lý secret sai (static key, echo ra log) biến CI thành lỗ hổng bảo mật lớn",
    ],
    questions: [
      { q: "Pipeline CI của team chạy 40 phút, developer bắt đầu gộp nhiều thay đổi vào một PR để đỡ phải chờ. Bạn chẩn đoán và sửa theo thứ tự nào?",
        a: "Đây là ví dụ pipeline chậm âm thầm phá tinh thần batch nhỏ: chờ lâu nên team gom batch to, kéo Lead Time và CFR đi ngược DORA. Trước khi tối ưu code test, hãy khai thác cái rẻ nhất: <strong>chạy song song các job độc lập và bật cache</strong> (node_modules, layer Docker) — thường cắt hơn nửa thời gian. Tiếp theo <strong>shard test suite</strong> ra nhiều runner và <strong>đẩy e2e ra khỏi cổng PR</strong> (chạy nightly). Nguyên tắc: coi thời gian pipeline là một chỉ số phải đo và giữ dưới ngưỡng (vd 10 phút), vì nó điều khiển hành vi merge của cả team." },
      { q: "Có người đề xuất mỗi môi trường (test, staging, prod) tự build lại image từ Dockerfile để 'luôn mới nhất'. Vì sao đây là bẫy và bạn làm khác thế nào?",
        a: "Build lại ở mỗi tầng nghĩa là ba lần build có thể cho ra <strong>ba image khác nhau</strong> — base image vừa cập nhật, dependency 'latest' vừa đổi, mirror khác nhau — nên cái bạn test ở staging không còn là cái chạy trên prod, phá vỡ toàn bộ giá trị của CI. Cách đúng: <strong>build image đúng một lần, gắn digest bất biến, các tầng sau pull chính digest đó</strong>. Immutable artifact là điều kiện để test có ý nghĩa và để rollback tin cậy — đúng nguyên tắc đã học ở GIT-03." },
      { q: "E2e test của dịch vụ thi/chấm điểm hay đỏ ngẫu nhiên rồi xanh khi retry. Developer bắt đầu bấm 'rerun' theo phản xạ. Rủi ro là gì và bạn xử lý ra sao?",
        a: "Test flaky nguy hiểm không phải vì nó đỏ, mà vì nó <strong>dạy cả team bỏ qua màu đỏ</strong> — tới khi một lỗi thật xuất hiện, phản xạ vẫn là bấm rerun và lỗi lọt lên prod. Xử lý: <strong>cách ly flaky test khỏi cổng merge ngay lập tức</strong> (quarantine), gắn issue truy nguyên nguyên nhân (thường là chờ cứng theo thời gian, phụ thuộc thứ tự, hoặc dữ liệu dùng chung), rồi sửa hoặc xóa. Giữ cổng merge chỉ gồm test nhanh và tin cậy; một cổng xanh phải thật sự có nghĩa là 'an toàn'. Với dịch vụ chấm điểm, niềm tin vào test là tài sản không được để rẻ đi." },
      { q: "Pipeline cần deploy image lên registry của cloud. Một bạn đề xuất lưu access key dài hạn của cloud vào GitHub Secrets. Bạn phản biện và đề xuất gì?",
        a: "Static access key là secret dài hạn: nếu lộ (log, fork PR chạy được workflow, người rời team) thì kẻ tấn công có quyền cho tới khi ai đó nhớ ra mà xoay vòng — blast radius lớn và khó phát hiện. Nên dùng <strong>OIDC: CI xuất trình danh tính workflow, cloud cấp lại token sống vài phút rồi tự hết hạn</strong>, không có secret nào nằm im để bị đánh cắp. Kèm theo: giới hạn quyền token theo repo/nhánh, mask mọi giá trị nhạy cảm, và không bao giờ <code>echo</code> secret ra log vì phải giả định log là công khai. Đây là ứng dụng least privilege ở tầng CI." },
      { q: "Với edtech mới ra mắt, sếp muốn CI 'chuẩn chỉnh': matrix 6 phiên bản Node, e2e đầy đủ trên mọi PR, quét bảo mật sâu mọi lần push. Bạn có làm ngay không?",
        a: "Không làm hết ngay — đây là over-engineering nếu chưa có nỗi đau đo được. Ở giai đoạn đầu, giá trị lớn nhất là <strong>một cổng nhanh (lint + unit + build) chạy dưới 5 phút</strong> để team dám merge nhiều lần/ngày. Matrix 6 phiên bản chỉ có nghĩa nếu bạn thật sự hỗ trợ 6 phiên bản; e2e trên mọi PR sẽ làm pipeline chậm và flaky, phản tác dụng. Cách đúng: <strong>bắt đầu tối giản, đo xem loại bug nào đang lọt lưới, rồi thêm đúng tầng chặn được loại bug đó</strong>. Quét bảo mật nên có nhưng có thể chạy song song và không chặn PR ở giai đoạn đầu. Thêm gate theo bằng chứng, không theo nghi lễ." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Trên một repo edtech mẫu (vd service enrollment): (1) viết một workflow GitHub Actions chạy <code>lint</code> + <code>unit test</code> + <code>build image</code> trên mỗi push và pull_request; (2) đo thời gian pipeline lần đầu; (3) bật cache dependency và tách các job độc lập cho chạy song song, đo lại — ghi lại cắt được bao nhiêu phút; (4) build image một lần, đẩy lên registry theo digest, và cho một job 'deploy giả' pull đúng digest đó thay vì build lại; (5) cố tình thêm một test <b>flaky</b> (sleep ngẫu nhiên) để thấy nó phá cổng merge thế nào, rồi thực hành cách ly nó. Bonus: đổi credential deploy từ static key sang OIDC và xác nhận không secret nào bị in ra log.</p>`,
    links: [
      { t: "GitHub Actions — tài liệu workflow", u: "docs.github.com/actions" },
      { t: "GitHub — OIDC hardening với cloud providers", u: "docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect" },
      { t: "Martin Fowler — Continuous Integration", u: "martinfowler.com/articles/continuousIntegration.html" },
      { t: "Google Testing Blog — Flaky Tests", u: "testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
      { t: "DORA — CI capability", u: "dora.dev/capabilities/continuous-integration" },
    ],
  },
  {
    id: "CD-07", tier: 3, xp: 100, prereq: ["CI-06", "CMP-05"],
    title: "CD & Chiến lược triển khai",
    sum: "Tự động đưa artifact qua môi trường; blue-green/canary/rollback.",
    theory: `<p><b>CD (Continuous Delivery) là phần nối tiếp CI: sau khi có artifact bất biến đã test, tự động đưa nó qua chuỗi môi trường dev → staging → prod một cách lặp lại được.</b> Mục tiêu không phải 'deploy càng nhanh càng tốt' mà là 'deploy an toàn tới mức deploy trở nên nhàm chán'. Deploy nhàm chán = MTTR thấp + CFR thấp.</p>
<p><b>Chuỗi môi trường và cổng phê duyệt:</b> dev tự động; staging tự động sau khi CI xanh; prod có thể thêm <b>manual approval gate</b> ở giai đoạn đầu (một người bấm duyệt), rồi bỏ dần khi niềm tin vào pipeline tăng. Quan trọng: các môi trường phải <b>giống nhau nhất có thể (environment parity)</b> — cùng loại DB, cùng version, cùng cấu hình hạ tầng — nếu không 'chạy tốt ở staging, sập ở prod' sẽ là chuyện thường ngày.</p>
<p><b>Ba chiến lược triển khai — chọn theo trade-off:</b></p>
<ul>
<li><b>Rolling</b>: thay dần từng phần instance. Đơn giản, không tốn gấp đôi tài nguyên, nhưng trong lúc rollout có hai phiên bản chạy song song và rollback chậm (phải cuộn ngược).</li>
<li><b>Blue-green</b>: dựng full môi trường mới (green) song song với cũ (blue), test xong thì chuyển toàn bộ traffic sang green; lỗi thì trỏ ngược về blue tức thì. Rollback nhanh nhất nhưng <b>tốn gấp đôi tài nguyên</b> trong lúc chuyển.</li>
<li><b>Canary</b>: đưa phiên bản mới cho một lát nhỏ traffic (1% → 5% → 25% → 100%), <b>quan sát metric</b> (lỗi, latency) ở mỗi bước, tự dừng/rollback nếu xấu.</li>
</ul>
<p><b>Vì sao chọn canary cho mùa cao điểm thi:</b> mùa thi là lúc traffic đỉnh và rủi ro cao nhất — một bug ở dịch vụ chấm điểm lúc này ảnh hưởng hàng triệu học viên. Canary giới hạn <b>blast radius</b>: nếu bản mới hỏng, chỉ 1% học viên bị ảnh hưởng và hệ thống tự rollback trước khi lan rộng. Blue-green thì 'được ăn cả ngã về không' — chuyển 100% traffic cùng lúc, nếu lỗi chỉ lộ dưới tải thật thì cả 10M user dính ngay. Canary đánh đổi tốc độ rollout lấy an toàn — đúng thứ ta cần lúc cao điểm.</p>
<p><b>Rollback = redeploy artifact cũ</b>, không phải hotfix vội (đúng nguyên tắc GIT-03). Ví dụ canary GitHub Actions + kubectl:</p>
<pre><code>steps:
  - name: deploy canary 10%
    run: kubectl set image deploy/grading grading=registry/grading:v2.0.0@sha256:abc
  - name: quan sat 5 phut
    run: ./scripts/check-slo.sh --error-rate-max 0.5 --p99-ms-max 800
  - name: rollback neu SLO xau
    if: failure()
    run: kubectl rollout undo deploy/grading   # tro ve artifact cu da chay</code></pre>
<p><b>Migration DB không downtime — mẫu expand/contract:</b> đây là điểm chết người nhất của CD vì DB không rollback dễ như code. Nguyên tắc: mỗi thay đổi schema phải <b>tương thích ngược</b> để code cũ và code mới cùng chạy được trong lúc rollout. Đổi tên cột không làm một phát mà chia 3 bước: (1) <b>expand</b> — thêm cột mới, code ghi cả hai; (2) <b>migrate</b> — chép dữ liệu, code đọc cột mới; (3) <b>contract</b> — bỏ cột cũ sau khi chắc chắn không ai dùng. Không bao giờ deploy đồng thời 'đổi schema phá vỡ' + 'code phụ thuộc schema mới'.</p>
<p><b>Feature flag tách 'deploy' khỏi 'release':</b> deploy code lên prod (flag tắt) không đồng nghĩa phát hành tính năng. Bật flag dần cho nhóm nhỏ, tắt tức thì nếu hỏng — không cần rollback cả artifact. Với edtech, có thể bật tính năng thi mới cho 1 trường trước khi mở toàn quốc.</p>`,
    whenUse: `<p>Dựng CD tự động tới staging <b>ngay sau khi có CI</b>; tới prod thì thêm approval gate lúc đầu rồi nới dần. Chọn chiến lược theo rủi ro và chi phí, không theo trend: <b>rolling</b> là mặc định hợp lý cho hầu hết service nội bộ; <b>blue-green</b> khi cần rollback tức thì và đủ tài nguyên gấp đôi tạm thời; <b>canary</b> khi thay đổi rủi ro cao trên đường traffic nóng (mùa thi, thanh toán). Chống over-engineering: canary cần <b>metric/observability tốt để tự động đánh giá</b> — nếu chưa có SLO đo được thì canary chỉ là rolling chậm hơn, chưa nên làm. Feature flag rất mạnh nhưng flag tồn dư lâu ngày là nợ kỹ thuật; phải có kỷ luật dọn flag chết.</p>`,
    pros: [
      "Canary giới hạn blast radius: bug chỉ chạm một lát traffic nhỏ trước khi tự rollback",
      "Blue-green cho rollback gần như tức thì bằng cách trỏ traffic về môi trường cũ",
      "Feature flag tách deploy khỏi release: bật/tắt tính năng không cần redeploy, giảm MTTR",
      "Expand/contract cho phép đổi schema mà không downtime và vẫn rollback code được",
    ],
    cons: [
      "Blue-green tốn gấp đôi tài nguyên khi chuyển và không hợp nếu migration DB không tương thích ngược",
      "Canary vô nghĩa nếu thiếu metric/SLO để tự động đánh giá — thành rolling phức tạp hóa",
      "Feature flag tồn dư sinh nợ kỹ thuật và nhánh logic rối nếu không có kỷ luật dọn dẹp",
      "Migration DB sai (không backward-compatible) là loại lỗi khó rollback nhất, dễ gây mất dữ liệu",
    ],
    questions: [
      { q: "Sắp vào mùa thi cao điểm (traffic gấp 5 lần), team cần deploy bản mới của dịch vụ chấm điểm. Bạn chọn blue-green hay canary, và vì sao?",
        a: "Chọn <strong>canary</strong>. Mùa thi là lúc rủi ro và tải cao nhất; một số bug (rò rỉ bộ nhớ, chậm dưới tải, sai cạnh biên khi chấm) chỉ lộ ra dưới traffic thật. Canary đưa bản mới cho 1% rồi 5% traffic và <strong>quan sát metric thật ở mỗi bước</strong>, nên nếu hỏng chỉ một lát nhỏ học viên bị ảnh hưởng và hệ thống tự rollback trước khi lan tới 10M user. Blue-green chuyển 100% traffic cùng lúc — rollback nhanh nhưng lỗi chỉ-lộ-dưới-tải sẽ chạm toàn bộ user ngay lập tức. Ở đây ta <strong>đánh đổi tốc độ rollout lấy blast radius nhỏ</strong>, đúng thứ cần lúc cao điểm." },
      { q: "Team muốn đổi tên cột 'score' thành 'final_score' trong bảng điểm thi. Vì sao KHÔNG deploy một phát, và mẫu expand/contract chạy thế nào?",
        a: "Deploy một phát 'đổi schema phá vỡ + code mới phụ thuộc nó' nghĩa là trong lúc rollout, các instance code cũ vẫn tìm cột <code>score</code> đã biến mất → lỗi hàng loạt, và nếu phải rollback code thì schema đã đổi không lùi được — đây là loại lỗi khó cứu nhất vì DB không rollback dễ như code. Mẫu <strong>expand/contract</strong> chia làm ba deploy tách biệt: (1) <strong>expand</strong> — thêm cột <code>final_score</code>, code ghi cả hai cột, đọc cột cũ; (2) <strong>migrate</strong> — backfill dữ liệu và chuyển code sang đọc cột mới; (3) <strong>contract</strong> — khi chắc chắn không còn ai đọc/ghi <code>score</code> mới bỏ nó. Nguyên tắc bất di: mỗi bước phải <strong>tương thích ngược</strong> để code cũ và mới cùng sống trong lúc rollout." },
      { q: "Bản mới đang chạy prod thì phát hiện lỗi. Đồng đội định 'sửa nhanh rồi push thẳng lên prod'. Bạn phản biện và làm gì?",
        a: "Hotfix vội trong lúc cháy nhà là cách sinh thêm lỗi: code chưa qua pipeline đầy đủ, sửa dưới áp lực dễ sai, và không tái tạo được. Ưu tiên vận hành là <strong>rollback = redeploy artifact/version cũ đã chạy tốt</strong> (<code>kubectl rollout undo</code> hoặc trỏ traffic về blue) — nhanh, đã được kiểm chứng, MTTR thấp. Nếu lỗi nằm sau một feature flag thì còn nhanh hơn: <strong>tắt flag</strong> mà không cần đụng tới artifact. Sau khi đã dập lửa và hệ ổn định, mới bình tĩnh sửa gốc, cho qua CI đầy đủ rồi mới deploy lại. Cứu hỏa trước, sửa code sau — đúng tinh thần GIT-03." },
      { q: "Team muốn phát hành tính năng thi mới, nhưng còn lo nó chưa ổn ở quy mô lớn. Làm sao tách rủi ro 'deploy' khỏi rủi ro 'release'?",
        a: "Dùng <strong>feature flag</strong> để tách hai việc: deploy code chứa tính năng lên prod với <strong>flag mặc định tắt</strong> — code đã ở prod nhưng học viên chưa thấy gì, nên rủi ro deploy được kiểm chứng riêng. Sau đó <strong>bật flag dần</strong>: một trường thí điểm → vài tỉnh → toàn quốc, quan sát metric ở mỗi bước; nếu hỏng thì <strong>tắt flag tức thì</strong> mà không cần rollback artifact hay deploy lại. Lợi ích: giảm MTTR, cho phép thử nghiệm A/B, và không còn cảnh 'deploy đêm khuya cho ít user thấy'. Cái giá phải trả: flag là nợ kỹ thuật — phải có kỷ luật dọn flag chết sau khi tính năng đã ổn định toàn quốc." },
      { q: "Một service đơn giản, ít rủi ro, chưa có SLO/observability tốt. Có nên áp canary cho 'chuẩn chỉnh' không?",
        a: "Không — đây là over-engineering. Canary chỉ phát huy giá trị khi có <strong>metric/SLO tự động để đánh giá mỗi bước</strong> (error rate, p99 latency); thiếu cái đó thì canary chỉ là rolling nhưng phức tạp và chậm hơn, lại tạo ảo giác an toàn. Với service ít rủi ro, <strong>rolling deploy là mặc định hợp lý</strong>: đơn giản, không tốn tài nguyên gấp đôi, đủ tốt. Lộ trình đúng là: dựng rolling + rollback tin cậy trước, <strong>đầu tư observability/SLO</strong> (tầng 6), rồi mới nâng lên canary cho đúng những service rủi ro cao trên đường traffic nóng. Chọn chiến lược theo rủi ro đo được, không theo trend." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Với một service edtech (vd grading) đã có image bất biến từ CI-06: (1) dựng chuỗi deploy dev → staging tự động, thêm một manual approval gate trước prod; (2) triển khai <b>rolling</b> rồi <b>blue-green</b> cho cùng service, đo thời gian rollback của mỗi cách; (3) viết một script canary đơn giản: đẩy bản mới cho 10% traffic, gọi <code>check-slo.sh</code> kiểm error rate + p99, tự <code>rollout undo</code> nếu vượt ngưỡng — cố tình deploy một bản 'lỗi' để thấy nó tự rollback; (4) thực hành đổi tên một cột DB theo mẫu <b>expand/contract</b> qua ba deploy tách biệt, xác nhận không có downtime; (5) bọc một tính năng sau feature flag, deploy với flag tắt, rồi bật dần và tắt tức thì. Ghi lại: mỗi chiến lược đánh đổi gì (tài nguyên, tốc độ rollback, blast radius).</p>`,
    links: [
      { t: "Martin Fowler — BlueGreenDeployment", u: "martinfowler.com/bliki/BlueGreenDeployment.html" },
      { t: "Martin Fowler — CanaryRelease", u: "martinfowler.com/bliki/CanaryRelease.html" },
      { t: "Martin Fowler — Evolutionary Database Design (expand/contract)", u: "martinfowler.com/articles/evodb.html" },
      { t: "Martin Fowler — Feature Toggles", u: "martinfowler.com/articles/feature-toggles.html" },
      { t: "DORA — Deployment automation & Continuous Delivery", u: "dora.dev/capabilities/deployment-automation" },
    ],
  },
];
