# DevOps Skill Tree — Platform cho Edtech 10M user

App tự học **DevOps** dạng game skill-tree: mỗi node gồm lý thuyết · khi nào dùng · ưu/nhược · câu hỏi + đáp án gợi ý · lab · nguồn, có **cơ chế khóa** (clear node → mở khóa node phụ thuộc), **XP/rank**, và **máy tính Error Budget** cho phần SRE.

Lộ trình 8 tầng: Tư duy & DORA → Linux/Networking/Git → Docker → CI/CD → IaC (Cloud/Terraform/Ansible) → Kubernetes → Observability/SRE → DevSecOps + Boss capstone. Tinh thần xuyên suốt: **đo trước, tự động sau, chống over-engineering**.

- **Stack:** Next.js (App Router) + TypeScript + Supabase (Postgres + Auth magic link).
- **Deploy:** Vercel (frontend) + Supabase (DB/Auth).
- Chạy được ngay **không cần Supabase** (chế độ *local-only*, lưu tiến độ trong `localStorage`). Cắm key Supabase để bật đăng nhập + đồng bộ đa thiết bị.

---

## 1. Chạy local

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Không có `.env.local` → app chạy local-only. Muốn bật đồng bộ:

```bash
cp .env.local.example .env.local   # rồi điền URL + anon key Supabase
```

---

## 2. Tạo project Supabase (miễn phí)

1. Vào <https://supabase.com> → **New project** (chọn region gần VN như *Southeast Asia (Singapore)*).
2. Mở **SQL Editor** → dán toàn bộ `supabase/schema.sql` → **Run**. (Tạo bảng `user_progress` + RLS.)
3. Vào **Project Settings → API**, lấy `Project URL` và `anon public` key → điền vào `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Authentication → URL Configuration**: thêm **Site URL** = `http://localhost:3000` (và domain Vercel sau này). Thêm cùng URL vào **Redirect URLs** kèm `/auth/callback`.
5. Chạy lại `pnpm dev`, đăng nhập bằng email để test đồng bộ.

---

## 3. Deploy lên Vercel

1. Push repo lên GitHub → <https://vercel.com> → **Add New → Project** → chọn repo.
2. Framework tự nhận **Next.js**. Thêm 2 env var Supabase ở bước **Environment Variables**.
3. **Deploy**. Sau khi có domain, quay lại Supabase thêm domain đó vào **Site URL** + **Redirect URLs**.

---

## Cấu trúc

```
app/
  layout.tsx             # layout gốc + metadata
  page.tsx               # render <SkillTree/>
  auth/callback/route.ts # đổi magic-link code → session
  globals.css            # toàn bộ style (blueprint console theme)
components/SkillTree.tsx  # UI: tree, drawer, error-budget calculator, auth bar
lib/
  content.ts             # DỮ LIỆU node DevOps (sửa nội dung học ở đây)
  content.en.ts          # dataset EN (đang tái dùng VI)
  i18n.ts                # chuỗi UI + getData theo ngôn ngữ
  useProgress.ts         # hook tiến độ: localStorage + đồng bộ Supabase
  supabase/{client,server}.ts
proxy.ts                 # refresh session cookie (Next 16)
supabase/schema.sql      # bảng user_progress + RLS
```

Muốn thêm/sửa nội dung học: chỉ cần sửa mảng `NODES` trong `lib/content.ts`.
