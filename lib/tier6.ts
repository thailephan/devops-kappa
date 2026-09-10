import type { SkillNode } from "./skill-types";

export const TIER6: SkillNode[] = [
  {
    id: "OBS-14", tier: 6, xp: 100, prereq: ["K8S-11"],
    title: "Observability — Metrics · Logs · Traces",
    sum: "3 trụ cột metrics/logs/traces; Prometheus/Grafana/OpenTelemetry; RED/USE.",
    theory: `<p><b>Monitoring khác Observability.</b> Monitoring trả lời câu hỏi bạn <i>đã biết trước</i> — dashboard dựng sẵn cho các lỗi bạn lường được (known-knowns). Observability là khả năng đặt câu hỏi <i>mới</i> về hệ thống mà không phải deploy lại code — để điều tra những thứ bạn chưa từng nghĩ tới (unknown-unknowns). Với edtech 10 triệu user, sự cố đắt tiền nhất luôn là loại thứ hai.</p>
<p><b>Cạm bẫy kinh điển:</b> mọi biểu đồ CPU/RAM/disk đều xanh, nhưng học viên vẫn không nộp được bài, không xem được video. Vì bạn đo <i>sức khỏe của máy</i> chứ không đo <i>trải nghiệm của user</i>. Máy khỏe không có nghĩa dịch vụ khỏe. Đây là lý do phải chuyển từ 'đo tài nguyên' sang 'đo hành trình người dùng'.</p>
<p><b>Ba trụ cột — dùng khi nào:</b></p>
<ul>
<li><b>Metrics</b> — số đo tổng hợp theo thời gian (request/s, error rate, p99 latency). Rẻ, gọn, hợp để <i>phát hiện</i> 'có gì đó sai' và bắn alert. Trả lời <i>bao nhiêu / có sai không</i>.</li>
<li><b>Logs</b> — sự kiện rời rạc có ngữ cảnh (dòng log của một request lỗi). Hợp để <i>xác nhận chi tiết</i> chuyện gì xảy ra. Trả lời <i>chuyện gì đã diễn ra</i>.</li>
<li><b>Traces</b> — dòng đời một request đi qua nhiều service (user → API gateway → service bài học → DB). Hợp để trả lời <i>chậm/hỏng ở đâu trong chuỗi</i> — thứ mà metrics và logs lẻ tẻ không chỉ ra được.</li>
</ul>
<p><b>Bộ công cụ tham chiếu:</b> <code>Prometheus</code> thu thập metrics (pull model, scrape endpoint <code>/metrics</code>), <code>Grafana</code> vẽ dashboard + alert, <code>OpenTelemetry</code> (OTel) là chuẩn trung lập để phát metrics/logs/traces từ code (tránh khóa cứng vào một nhà cung cấp), và log tập trung qua <code>Loki</code> hoặc <code>ELK</code> (Elasticsearch/Logstash/Kibana). Đừng để log nằm rải trên từng pod — pod chết là log bay.</p>
<p><b>Hai phương pháp chọn chỉ số, đừng đo bừa:</b></p>
<ul>
<li><b>RED</b> — cho service xử lý request: <b>R</b>ate (số request/s), <b>E</b>rrors (tỉ lệ lỗi), <b>D</b>uration (latency, xem p99 chứ không xem trung bình).</li>
<li><b>USE</b> — cho tài nguyên: <b>U</b>tilization, <b>S</b>aturation (hàng đợi đang dồn ứ — dấu hiệu sớm nhất của quá tải), <b>E</b>rrors.</li>
</ul>
<p>Một câu PromQL đo tỉ lệ lỗi 5 phút gần nhất cho service bài học:</p>
<pre><code>sum(rate(http_requests_total{service="lesson",code=~"5.."}[5m]))
  /
sum(rate(http_requests_total{service="lesson"}[5m]))</code></pre>
<p><b>Nguy hiểm high-cardinality:</b> đừng bao giờ đặt <code>user_id</code> làm nhãn (label) của metric. Mỗi giá trị nhãn khác nhau tạo một chuỗi thời gian riêng; 10 triệu user = 10 triệu chuỗi → Prometheus nổ RAM và sập. Nhãn phải là tập hữu hạn nhỏ (service, endpoint, status code, region). Danh tính cá nhân thuộc về <i>logs/traces</i>, không thuộc về metrics.</p>
<p><b>Trace sampling:</b> lưu 100% trace của 10 triệu user thì chi phí lưu trữ khổng lồ. Nên lấy mẫu (sampling) — ví dụ giữ 1% trace bình thường nhưng <i>giữ toàn bộ trace của request lỗi/chậm</i> (tail-based sampling). Đo trước để biết ngân sách, rồi mới chỉnh tỉ lệ.</p>`,
    whenUse: `<p>Dựng observability <b>ngay khi hệ có nhiều hơn một service</b> và có user thật — đúng tinh thần 'đo trước, tự động sau': không có số đo thì mọi autoscale, SLO, alert phía sau đều là đoán mò. Bắt đầu bằng RED cho các service đường-người-dùng và USE cho tài nguyên nền. Chưa cần distributed tracing đầy đủ khi còn là monolith một tiến trình; nhưng có 10 triệu user và nhiều service thì tracing là bắt buộc để trả lời 'chậm ở đâu'. Luôn đo hành trình user, đừng dừng ở CPU/RAM.</p>`,
    pros: [
      "Trả lời được câu hỏi mới lúc điều tra sự cố mà không phải deploy lại code",
      "Đo đúng trải nghiệm user, bắt được lỗi mà biểu đồ CPU/RAM không thấy",
      "OpenTelemetry là chuẩn trung lập, tránh khóa cứng vào một nhà cung cấp",
      "RED/USE cho khung chọn chỉ số có kỷ luật thay vì dựng dashboard bừa bãi",
    ],
    cons: [
      "High-cardinality (nhãn user_id) làm Prometheus nổ RAM nếu thiếu kỷ luật",
      "Lưu trữ log và trace ở quy mô 10 triệu user tốn kém, phải sampling hợp lý",
      "Quá nhiều dashboard nhưng không ai đọc cũng vô dụng như không có gì",
    ],
    questions: [
      { q: "Dashboard báo CPU, RAM, disk của toàn cụm đều xanh, nhưng bộ phận hỗ trợ ngập tin nhắn học viên không xem được video. Vì sao và bạn sửa cách đo thế nào?",
        a: "Bạn đang đo <strong>sức khỏe của máy</strong> chứ không đo <strong>trải nghiệm của user</strong> — máy khỏe không đồng nghĩa dịch vụ khỏe (ví dụ CDN hết credit, token hết hạn, hay một downstream chậm mà CPU vẫn nhàn). Sửa bằng cách bổ sung chỉ số theo <strong>hành trình người dùng</strong> theo phương pháp RED: rate, error rate và p99 latency của chính luồng 'phát video'. Nguyên tắc cốt lõi của observability là <strong>đo triệu chứng người dùng cảm nhận được, không dừng ở tài nguyên hạ tầng</strong>." },
      { q: "Một kỹ sư muốn thêm nhãn user_id vào metric http_requests_total để 'biết user nào bị lỗi'. Vì sao bạn từ chối, và giải pháp đúng là gì?",
        a: "Đó là <strong>high-cardinality</strong>: mỗi giá trị nhãn tạo một chuỗi thời gian riêng, 10 triệu user sẽ đẻ ra 10 triệu chuỗi khiến Prometheus <strong>ngốn RAM tới mức sập</strong> — chính hệ giám sát lại thành điểm chết. Metric chỉ nên mang nhãn thuộc <strong>tập hữu hạn nhỏ</strong> (service, endpoint, status code, region). Muốn truy ra user cụ thể thì dùng <strong>logs hoặc traces</strong>, nơi danh tính cá nhân thuộc về đó — mỗi trụ cột có một việc riêng, đừng nhét việc của trụ này sang trụ kia." },
      { q: "Khi nào dùng metrics, khi nào dùng logs, khi nào dùng traces? Kể một tình huống edtech dùng cả ba.",
        a: "<strong>Metrics</strong> để phát hiện và bắn alert (rẻ, tổng hợp): error rate luồng nộp bài tăng vọt. <strong>Traces</strong> để định vị chậm/hỏng ở đâu trong chuỗi service: request nộp bài mất 8 giây, trace chỉ ra 7 giây nằm ở lời gọi service chấm điểm. <strong>Logs</strong> để xác nhận chi tiết: dòng log của service chấm điểm cho thấy đang timeout kết nối tới DB. Trình tự điển hình là <strong>metric báo động → trace khoanh vùng → log xác nhận nguyên nhân</strong>; ba trụ cột bổ trợ nhau chứ không thay thế nhau." },
      { q: "Vì sao khi đo Duration trong RED bạn nhìn p99 chứ không nhìn latency trung bình? Liên hệ 10 triệu user.",
        a: "Trung bình <strong>giấu đuôi</strong>: 99% request nhanh 50ms nhưng 1% mất 5 giây thì trung bình vẫn đẹp, trong khi 1% của 10 triệu user là <strong>100 nghìn học viên</strong> đang khổ. <strong>p99 (và p999)</strong> phơi bày đúng nhóm user tệ nhất mà trung bình che đi. Quyết định đúng là <strong>đặt mục tiêu và alert theo phân vị đuôi</strong>, vì ở quy mô lớn phần trăm nhỏ vẫn là số người khổng lồ — đây cũng là nền cho SLO ở node sau." },
      { q: "Sếp bảo cứ lưu 100% trace mọi request cho chắc. Bạn phản biện và đề xuất gì?",
        a: "Ở 10 triệu user, lưu 100% trace tạo <strong>chi phí lưu trữ và băng thông khổng lồ</strong> mà 99% trace của request thành công gần như không ai đọc. Đề xuất <strong>sampling</strong>: giữ tỉ lệ nhỏ trace bình thường (ví dụ 1%) nhưng <strong>giữ toàn bộ trace của request lỗi hoặc chậm</strong> (tail-based sampling) — vì đó mới là thứ cần điều tra. Đúng tinh thần 'đo trước, tự động sau': <strong>đo dung lượng và giá trị thực tế trước, rồi chỉnh tỉ lệ mẫu</strong>, thay vì mặc định lưu tất cả." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Dựng bộ observability tối thiểu cho một app nhỏ: (1) thêm endpoint <code>/metrics</code> và phát chỉ số RED (dùng thư viện OpenTelemetry hoặc client Prometheus); (2) chạy Prometheus scrape app đó và Grafana vẽ 3 panel: rate, error rate, p99 duration; (3) viết câu PromQL tính tỉ lệ lỗi 5 phút và tự gây lỗi 500 để thấy đồ thị nhảy; (4) cố tình thêm nhãn có cardinality cao (ví dụ một id ngẫu nhiên mỗi request) rồi quan sát số chuỗi thời gian phình ra trong Prometheus — hiểu vì sao user_id là điều cấm. Ghi lại: mỗi trụ cột metrics/logs/traces bạn sẽ dùng vào lúc nào.</p>`,
    links: [
      { t: "Google SRE Book — Monitoring Distributed Systems", u: "sre.google/sre-book/monitoring-distributed-systems" },
      { t: "Prometheus — Querying basics (PromQL)", u: "prometheus.io/docs/prometheus/latest/querying/basics" },
      { t: "OpenTelemetry — Docs & concepts", u: "opentelemetry.io/docs/concepts" },
      { t: "Grafana Loki — log aggregation", u: "grafana.com/docs/loki/latest" },
      { t: "Brendan Gregg — The USE Method", u: "brendangregg.com/usemethod.html" },
    ],
  },
  {
    id: "SLO-15", tier: 6, xp: 100, prereq: ["OBS-14"], calc: true,
    title: "SLI · SLO · Error Budget",
    sum: "Biến 'ổn định vs tốc độ' thành quyết định dựa trên số, không phải cảm tính.",
    theory: `<p>Node này biến cuộc tranh cãi muôn thuở giữa <b>Dev muốn ship nhanh</b> và <b>Ops muốn hệ ổn định</b> thành một con số ai cũng đồng ý trước. Ba khái niệm xếp tầng:</p>
<ul>
<li><b>SLI (Service Level Indicator)</b> — chỉ số đo <i>trải nghiệm thật của user</i>. Chọn theo <b>hành trình người dùng</b>, không phải theo CPU. Ví dụ edtech: 'tỉ lệ request xem bài học trả về 200 dưới 300ms'. CPU 80% không phải SLI vì user không cảm nhận CPU — user cảm nhận trang có mở được không.</li>
<li><b>SLO (Service Level Objective)</b> — mục tiêu bạn <i>tự</i> đặt cho SLI đó, ví dụ '99.9% request xem bài học thành công trong 30 ngày'. Là lời hứa nội bộ.</li>
<li><b>Error Budget</b> — phần được phép hỏng: <code>100% − SLO</code>. SLO 99.9% cho ngân sách lỗi 0.1%. Đây là thứ biến cuộc cãi vã thành phép tính.</li>
</ul>
<p><b>Error budget hóa giải xung đột Dev↔Ops thế nào:</b> thay vì cãi 'ship hay không', cả hai nhìn vào ngân sách. <i>Còn budget → Dev cứ ship tính năng mới, chấp nhận rủi ro trong hạn mức.</i> <i>Hết budget → đóng băng tính năng, cả team dồn vào ổn định cho tới khi hồi budget.</i> Ops không còn là người 'luôn nói không', Dev không còn ship bừa — luật chơi là con số, không phải cảm tính hay chức vụ.</p>
<p><b>Cái giá của mỗi số 9 — đây là bậc thang chi phí, không tuyến tính:</b></p>
<pre><code>SLO       downtime/tháng   downtime/năm
99%       ~7 giờ 18 phút    ~3.65 ngày
99.9%     ~43 phút          ~8.77 giờ
99.99%    ~4 phút 23 giây   ~52.6 phút
99.999%   ~26 giây          ~5.26 phút</code></pre>
<p>Nhảy từ 99.9% (43 phút/tháng) lên 99.99% (4 phút/tháng) nghe chỉ 'thêm một số 9' nhưng thường <b>đội chi phí gấp nhiều lần</b>: phải multi-region, dự phòng nóng, tự động failover, on-call gắt hơn. Câu hỏi trade-off: user edtech có thực sự cần 99.99% không, hay 99.9% là đủ và tiền nên dồn vào việc khác? Đừng mua số 9 vì sĩ diện.</p>
<p><b>CFR 0% là tốt hay xấu — nối lại tư duy DORA:</b> Change Failure Rate 0% thường là <i>dấu hiệu xấu</i> — nghĩa là team deploy quá hiếm vì sợ, hoặc không đo. Nếu bạn <i>chưa từng</i> tiêu error budget, có thể SLO đặt quá lỏng hoặc bạn đang ship quá chậm; budget dư là 'giấy phép để đi nhanh hơn'. Mục tiêu không phải không bao giờ hỏng, mà là hỏng <i>trong hạn mức</i> đã thỏa thuận.</p>
<p><b>SLO nội bộ vs SLA hợp đồng:</b> <b>SLA</b> là cam kết <i>pháp lý</i> với khách hàng, vi phạm thì đền tiền/phạt. <b>SLO nội bộ</b> luôn đặt <i>chặt hơn SLA</i> (ví dụ SLA 99.9% thì SLO nội bộ 99.95%) để có vùng đệm — khi SLO cảnh báo, bạn còn thời gian sửa <i>trước khi</i> chạm ngưỡng vi phạm hợp đồng. Đừng để khách hàng là người phát hiện sự cố thay bạn.</p>`,
    whenUse: `<p>Đặt SLO ngay khi có observability (OBS-14) và trước khi bàn autoscale/alert nghiêm túc — vì SLO là thứ định nghĩa 'khỏe' nghĩa là gì. Với edtech 10 triệu user, đặt SLO riêng cho từng hành trình lõi (đăng nhập, xem bài học, nộp bài, thanh toán) thay vì một SLO chung chung. Dùng error budget để làm luật chơi giữa Dev và Ops. Đừng đặt SLO theo cảm tính hay theo 'con số đẹp' — đặt theo mức user thực sự cần và bạn thực sự đo được.</p>
<p><b>Máy tính Error Budget:</b> node này có công cụ tương tác 'Máy tính Error Budget' hiển thị <b>ngay bên dưới phần ưu/nhược điểm trong drawer</b>. Bạn nhập <b>SLO %</b>, <b>số ngày của cửa sổ (window)</b>, <b>số request/ngày</b> và <b>error rate thực tế</b>; máy tính sẽ ra <b>downtime cho phép</b> tương ứng và <b>phần budget còn lại</b>. Hãy thử tự tay đổi SLO từ 99.9% lên 99.99% để thấy downtime cho phép sụt thế nào — cảm nhận bậc thang chi phí bằng con số của chính bạn.</p>`,
    pros: [
      "Biến tranh cãi ổn định vs tốc độ thành một con số cả team đồng ý trước",
      "Ops hết vai 'luôn nói không', Dev hết ship bừa: luật chơi là error budget",
      "SLO nội bộ chặt hơn SLA cho vùng đệm để sửa trước khi vi phạm hợp đồng",
      "SLI theo hành trình user phản ánh đúng cái người dùng thực sự cảm nhận",
    ],
    cons: [
      "Đặt SLO sai (quá chặt hoặc quá lỏng) làm sai lệch mọi quyết định phía sau",
      "Thêm mỗi số 9 đội chi phí phi tuyến, dễ mua thừa độ tin cậy không ai cần",
      "Cần văn hóa kỷ luật để thực sự đóng băng tính năng khi hết budget",
    ],
    questions: [
      { q: "Dev muốn ship gấp 3 tính năng cuối tháng, Ops chặn vì sợ mất ổn định. Error budget giải quyết bế tắc này ra sao?",
        a: "Thay vì cãi theo cảm tính hay chức vụ, cả hai nhìn vào <strong>error budget còn lại</strong> của tháng. Nếu SLO 99.9% và hệ mới tiêu 40% budget thì <strong>vẫn còn dư → Dev được ship</strong>, chấp nhận rủi ro trong hạn mức. Nếu budget đã cạn thì <strong>đóng băng tính năng</strong>, cả team dồn vào ổn định tới khi hồi budget. Quyết định dựa trên <strong>một con số thỏa thuận trước</strong>, nên Ops không còn là người 'luôn nói không' và Dev không ship bừa — đúng tinh thần biến trade-off thành số." },
      { q: "Khách hàng doanh nghiệp đòi SLA 99.99% cho nền tảng thi cử. Trước khi gật, bạn cân nhắc những gì?",
        a: "99.99% chỉ cho phép <strong>~4 phút downtime/tháng</strong> — bậc thang chi phí rất dốc so với 99.9% (~43 phút): cần <strong>multi-region, failover tự động, dự phòng nóng và on-call gắt</strong>, tốn gấp nhiều lần. Phải hỏi user/khách có <em>thực sự</em> cần mức đó không, hay 99.9% là đủ. Nếu ký SLA 99.99% thì <strong>SLO nội bộ phải chặt hơn nữa (ví dụ 99.995%)</strong> để có đệm cảnh báo sớm. Quyết định đúng là <strong>chỉ mua số 9 khi user thật sự cần và doanh thu bù được chi phí</strong>, đừng mua vì sĩ diện." },
      { q: "SLI nào bạn chọn cho hành trình 'xem bài học' của edtech, và vì sao KHÔNG chọn 'CPU dưới 80%'?",
        a: "Chọn SLI phản ánh <strong>trải nghiệm thật</strong>, ví dụ 'tỉ lệ request tải bài học trả về thành công dưới 300ms'. <strong>CPU dưới 80% không phải SLI</strong> vì user không cảm nhận CPU — họ cảm nhận trang có mở được và có nhanh không; CPU có thể 95% mà dịch vụ vẫn ngon, hoặc CPU nhàn mà trang vẫn hỏng. Nguyên tắc: <strong>SLI đo theo hành trình người dùng, không theo tài nguyên hạ tầng</strong>, để SLO thật sự bảo vệ điều người dùng quan tâm." },
      { q: "Cuối quý nhìn lại thấy error budget gần như còn nguyên, chưa hề chạm. Đây là tin tốt không?",
        a: "Thường là <strong>tín hiệu đáng ngờ</strong>, giống CFR 0% trong tư duy DORA: có thể team <strong>deploy quá ít vì sợ</strong>, hoặc <strong>SLO đặt quá lỏng</strong> so với thực tế user chịu được. Budget dư là <strong>'giấy phép để đi nhanh hơn'</strong> — nên xem lại có đang ship quá chậm không, hoặc siết SLO cho sát mức user thực sự cần. Mục tiêu không phải không bao giờ tiêu budget, mà là <strong>dùng nó có chủ đích để cân bằng tốc độ và độ tin cậy</strong>." },
      { q: "Phân biệt SLO nội bộ và SLA hợp đồng. Vì sao SLO nên chặt hơn SLA?",
        a: "<strong>SLA</strong> là cam kết <strong>pháp lý</strong> với khách hàng, vi phạm là đền tiền hoặc mất hợp đồng; <strong>SLO</strong> là mục tiêu <strong>nội bộ</strong> bạn tự đặt để lái công việc. SLO phải <strong>chặt hơn SLA</strong> (ví dụ SLA 99.9% thì SLO 99.95%) để tạo <strong>vùng đệm</strong>: khi SLO báo động, bạn còn thời gian sửa <em>trước khi</em> chạm ngưỡng vi phạm hợp đồng. Quyết định cốt lõi: <strong>đừng để khách hàng là người đầu tiên phát hiện sự cố</strong> — hệ cảnh báo của bạn phải kêu trước cả điều khoản phạt." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Định nghĩa SLO cho một hành trình lõi của edtech (ví dụ 'xem bài học'): (1) chọn 1 SLI theo trải nghiệm user (tỉ lệ request thành công dưới ngưỡng latency), viết đúng công thức đo bằng metric bạn đã có ở OBS-14; (2) đặt SLO 99.9% cho cửa sổ 30 ngày, tính tay error budget ra phút downtime cho phép; (3) mở <b>Máy tính Error Budget</b> ngay dưới phần ưu/nhược điểm trong drawer, nhập SLO %, số ngày, request/ngày và error rate thực tế để xem downtime cho phép và budget còn lại — rồi đổi SLO lên 99.99% để cảm nhận bậc thang chi phí; (4) viết chính sách 1 đoạn: 'khi error budget cạn thì team làm gì' và 'SLO nội bộ chặt hơn SLA bao nhiêu'.</p>`,
    links: [
      { t: "Google SRE Book — Service Level Objectives", u: "sre.google/sre-book/service-level-objectives" },
      { t: "Google SRE Workbook — Implementing SLOs", u: "sre.google/workbook/implementing-slos" },
      { t: "Google SRE Book — Embracing Risk (error budget)", u: "sre.google/sre-book/embracing-risk" },
      { t: "Atlassian — SLA vs SLO vs SLI", u: "atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli" },
      { t: "Uptime / downtime cheat sheet (nines)", u: "uptime.is" },
    ],
  },
  {
    id: "ALT-16", tier: 6, xp: 100, prereq: ["OBS-14"],
    title: "Alerting · On-call · Postmortem",
    sum: "Alert theo triệu chứng, on-call bền vững, postmortem không đổ lỗi.",
    theory: `<p>Có observability rồi thì câu hỏi kế là: <b>khi nào đánh thức con người dậy lúc 3h sáng?</b> Alert sai cách còn tệ hơn không có alert.</p>
<p><b>Alert theo triệu chứng, không theo nguyên nhân.</b> Cảnh báo phải phản ánh thứ <i>user cảm nhận</i>: p99 latency của luồng xem bài học vượt ngưỡng, error rate luồng nộp bài tăng vọt. <b>Đừng</b> alert 'CPU &gt; 80%' — CPU cao chưa chắc user khổ (có thể đang chạy batch), và CPU thấp chưa chắc user sướng (có thể downstream chết). Alert theo nguyên nhân (CPU, RAM, số pod...) đẻ ra <b>alert fatigue</b>: người trực bị dội quá nhiều báo động vô hại nên bắt đầu <i>ngó lơ</i> — rồi bỏ sót đúng cái alert thật. Ít alert, mỗi alert phải <i>đáng để thức dậy</i>.</p>
<p>Ví dụ một quy tắc alert theo triệu chứng, gắn với SLO ở node trước:</p>
<pre><code>- alert: LessonErrorRateHigh
  expr: |
    sum(rate(http_requests_total{service="lesson",code=~"5.."}[5m]))
      / sum(rate(http_requests_total{service="lesson"}[5m])) &gt; 0.01
  for: 5m
  labels:
    severity: page
  annotations:
    summary: "Ti le loi luong xem bai hoc vuot 1% trong 5 phut"
    runbook: "wiki/runbooks/lesson-error-rate"</code></pre>
<p><b>Page vs Ticket — phân tầng mức độ:</b></p>
<ul>
<li><b>Page</b> (gọi điện, rung, đánh thức): chỉ dành cho việc <i>ảnh hưởng user ngay và cần người xử lý trong vài phút</i>. Nếu không cần hành động ngay thì đừng page.</li>
<li><b>Ticket / warning</b>: việc quan trọng nhưng <i>chờ được tới giờ hành chính</i> (đĩa sẽ đầy trong 5 ngày, chứng chỉ hết hạn trong 2 tuần). Vào hàng đợi, không đánh thức ai.</li>
</ul>
<p><b>Runbook &amp; giảm toil:</b> mỗi alert cần <b>runbook</b> — hướng dẫn từng bước để người trực (kể cả người mới) xử lý mà không phải đoán lúc 3h sáng. <b>Toil</b> là việc tay lặp đi lặp lại, thủ công, không tạo giá trị lâu dài (restart service bằng tay mỗi đêm). Nguyên tắc SRE: khi một việc lặp đủ nhiều, <i>tự động hóa nó</i> thay vì chịu đựng — đúng tinh thần 'đo trước, tự động sau'. Runbook lặp lại 3 lần là ứng viên để biến thành script/tự động.</p>
<p><b>Postmortem không đổ lỗi (blameless) — vì sao 'không đổ lỗi'?</b> Sau sự cố, viết lại điều gì xảy ra, tác động, dòng thời gian, và <i>vì sao</i> — nhưng <b>tập trung vào hệ thống và quy trình, không truy tội cá nhân</b>. Lý do rất thực dụng: nếu ai gây lỗi bị trừng phạt, lần sau mọi người sẽ <i>giấu</i> sự cố và che thông tin → bạn mất luôn cơ hội học và cùng một lỗi sẽ lặp lại. Con người hầu như luôn hành động hợp lý với thông tin họ có lúc đó; lỗi thật nằm ở hệ thống <i>cho phép</i> một thao tác sai gây hậu quả lớn. Câu hỏi đúng là 'làm sao hệ thống ngăn được lần sau', không phải 'ai đã bấm nút'.</p>
<p><b>On-call bền vững, chống burnout:</b> lịch trực <i>xoay vòng</i> công bằng (mỗi người một tuần rồi nghỉ), số người đủ để không ai trực liên miên, và trực đêm nhiều thì phải bù nghỉ. On-call mà kiệt sức → người giỏi nghỉ việc → càng ít người trực → càng kiệt sức: vòng xoáy chết. Số lượng alert ít và runbook tốt chính là điều khiến ca trực <i>ngủ được</i>.</p>`,
    whenUse: `<p>Thiết lập alert &amp; on-call ngay khi có SLO (SLO-15) — vì alert tốt nhất là alert bắn khi <b>đang đốt error budget quá nhanh</b>, tức gắn trực tiếp với thứ user cảm nhận. Với edtech 10 triệu user cần trực 24/7, đầu tư vào chất lượng alert (theo triệu chứng, có runbook) trước khi mở rộng đội trực. Chưa cần page 3h sáng cho thứ chờ được tới sáng — phân tầng page/ticket ngay từ đầu. Và luôn chạy postmortem blameless sau mỗi sự cố đáng kể, coi đó là tài sản học tập chứ không phải phiên tòa.</p>`,
    pros: [
      "Alert theo triệu chứng cắt alert fatigue: mỗi báo động đều đáng để thức dậy",
      "Phân tầng page/ticket bảo vệ giấc ngủ đội trực, chỉ đánh thức khi user thật sự khổ",
      "Postmortem blameless biến sự cố thành bài học thay vì che giấu và lặp lại",
      "Runbook + tự động hóa toil giúp ca trực xử lý nhanh và bền sức",
    ],
    cons: [
      "Định nghĩa ngưỡng alert theo triệu chứng khó hơn, cần lặp lại và tinh chỉnh",
      "Văn hóa blameless đòi cam kết thật từ lãnh đạo, dễ trôi về đổ lỗi khi áp lực",
      "On-call luôn có chi phí con người; thiết kế kém là con đường nhanh tới burnout",
    ],
    questions: [
      { q: "Đội trực phàn nàn bị đánh thức 20 lần/đêm bởi alert 'CPU > 80%' mà chẳng lần nào user gặp vấn đề. Chẩn đoán và cách sửa?",
        a: "Đây là <strong>alert fatigue do alert theo nguyên nhân thay vì triệu chứng</strong>: CPU cao không đồng nghĩa user khổ (có thể đang chạy batch bình thường), nên báo động này vô hại và làm người trực <strong>mất niềm tin, bắt đầu ngó lơ</strong> — nguy cơ bỏ sót alert thật. Sửa bằng cách <strong>alert theo thứ user cảm nhận</strong>: error rate và p99 latency của các luồng lõi, lý tưởng là gắn với tốc độ đốt error budget. Nguyên tắc: <strong>ít alert, mỗi cái phải đáng để thức dậy</strong>; CPU nên là chỉ số để điều tra, không phải để page." },
      { q: "Phân biệt severity 'page' và 'ticket'. Cho ví dụ edtech mỗi loại và tiêu chí quyết định.",
        a: "<strong>Page</strong> = đánh thức người ngay, chỉ dùng khi <strong>user đang bị ảnh hưởng và cần xử lý trong vài phút</strong>: luồng thanh toán học phí lỗi hàng loạt lúc 2h sáng. <strong>Ticket/warning</strong> = việc quan trọng nhưng <strong>chờ được tới giờ hành chính</strong>: đĩa sẽ đầy trong 5 ngày, chứng chỉ TLS hết hạn trong 2 tuần. Tiêu chí quyết định là <strong>'có cần hành động của con người ngay bây giờ không'</strong> — nếu không thì đưa vào hàng đợi chứ đừng đánh thức ai, vì mỗi lần page sai làm mòn giấc ngủ và niềm tin của đội trực." },
      { q: "Một junior gõ nhầm lệnh xóa nhầm bảng dữ liệu bài tập, gây sự cố lớn. Postmortem blameless nên tập trung vào gì thay vì kỷ luật bạn đó?",
        a: "Tập trung vào <strong>vì sao hệ thống cho phép một thao tác tay gây hậu quả lớn đến vậy</strong>, không truy tội cá nhân: vì sao có quyền xóa thẳng trên prod, vì sao không có xác nhận/backup/soft-delete, vì sao lệnh nguy hiểm không được bọc bởi công cụ an toàn. Lý do rất thực dụng: <strong>nếu trừng phạt cá nhân, lần sau mọi người sẽ giấu sự cố</strong> và bạn mất cơ hội học, lỗi sẽ lặp lại với người khác. Câu hỏi đúng là <strong>'làm sao hệ thống ngăn được lần sau'</strong> — hành động sửa là thêm rào chắn (bỏ quyền, thêm xác nhận, backup tự động), không phải khiển trách." },
      { q: "Người trực đêm nào cũng phải SSH vào restart một service treo. Đây là dấu hiệu gì và bạn xử lý theo tinh thần SRE ra sao?",
        a: "Đây là <strong>toil</strong> điển hình: việc tay, lặp lại, không tạo giá trị lâu dài, lại còn bào mòn giấc ngủ đội trực. Tinh thần SRE là <strong>khi việc lặp đủ nhiều thì tự động hóa nó</strong> thay vì chịu đựng: trước mắt cho hệ tự khởi động lại (health check + auto-restart như liveness probe), nhưng quan trọng hơn là <strong>điều tra vì sao service treo</strong> (rò rỉ bộ nhớ? deadlock?) để sửa gốc. 'Đo trước, tự động sau': đo tần suất và nguyên nhân treo, rồi vừa tự động hóa vừa sửa gốc để xóa hẳn ca trực đêm này." },
      { q: "Sau sự cố lớn, sếp muốn 'tìm người chịu trách nhiệm để làm gương'. Vì sao điều này phản tác dụng và bạn đề xuất thay bằng gì?",
        a: "Trừng phạt cá nhân tạo <strong>văn hóa sợ hãi</strong>: người ta sẽ <strong>giấu lỗi, không báo sự cố sớm, không dám thử nghiệm</strong> — chính là công thức để cùng một lỗi âm thầm lặp lại và MTTR tệ đi. Đề xuất <strong>postmortem không đổ lỗi</strong>: coi sự cố là tài sản học tập, phân tích chuỗi nguyên nhân ở tầng hệ thống/quy trình và ra <strong>danh sách hành động sửa gốc có người phụ trách</strong>. Con người gần như luôn làm điều hợp lý với thông tin lúc đó; <strong>trách nhiệm nằm ở việc cải thiện hệ thống, không phải ở việc chọn vật tế thần</strong>." },
    ],
    lab: `<span class="tag">Lab</span><p style="margin-top:8px">Xây bộ 'phản ứng sự cố' tối thiểu: (1) từ SLO ở node trước, viết 1 quy tắc alert theo <b>triệu chứng</b> (error rate hoặc p99 latency của một luồng lõi) trong Prometheus/Alertmanager, gắn nhãn <code>severity: page</code> và trường <code>runbook</code>; (2) cố tình phân loại lại một alert 'CPU cao' xuống mức ticket để tự thấy khác biệt page vs ticket; (3) viết 1 runbook ngắn cho alert đó — các bước một người mới có thể theo lúc 3h sáng; (4) mô phỏng một sự cố nhỏ rồi viết <b>postmortem blameless</b>: điều gì xảy ra, tác động, dòng thời gian, nguyên nhân gốc ở tầng hệ thống, và 3 hành động sửa gốc kèm người phụ trách — tuyệt đối không có tên ai bị 'quy tội'.</p>`,
    links: [
      { t: "Google SRE Book — Being On-Call", u: "sre.google/sre-book/being-on-call" },
      { t: "Google SRE Book — Postmortem Culture: Learning from Failure", u: "sre.google/sre-book/postmortem-culture" },
      { t: "Google SRE Workbook — Alerting on SLOs", u: "sre.google/workbook/alerting-on-slos" },
      { t: "Prometheus — Alerting rules", u: "prometheus.io/docs/prometheus/latest/configuration/alerting_rules" },
      { t: "PagerDuty — Incident Response docs", u: "response.pagerduty.com" },
    ],
  },
];
