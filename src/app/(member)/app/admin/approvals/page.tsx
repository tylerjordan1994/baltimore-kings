import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { ApprovalActions } from './approval-actions'

export default async function ApprovalsPage() {
  await requireRole('coach')
  const supabase = await createClient()

  const { data: pendingProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
        <p className="text-zinc-400">Review and approve new member accounts.</p>
      </div>

      {!pendingProfiles || pendingProfiles.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">No pending accounts to review.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Phone</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Applied</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pendingProfiles.map((p) => (
                <tr key={p.id} className="bg-zinc-900">
                  <td className="px-4 py-3 text-white">{p.full_name}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalActions profileId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
