import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Skill Tree — Platform cho Edtech 10M users",
  description:
    "Lộ trình tự học DevOps dạng game skill-tree: từ tư duy & Linux tới Docker, CI/CD, Terraform, Kubernetes, Observability/SRE và DevSecOps — kèm câu hỏi, lab và máy tính error budget.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
