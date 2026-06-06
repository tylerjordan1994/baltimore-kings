import { redirect } from "next/navigation"

// Fees were merged into the Payments page.
export default function FeesRedirect() {
  redirect("/app/payments")
}
