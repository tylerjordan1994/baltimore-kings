import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'

export default async function AuditPage() {
  await requireRole('superadmin')
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-zinc-400">System activity log (superadmin only).</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-300">Timestamp</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Actor</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Action</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Target</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {logs?.map((log) => (
              <tr key={log.id} className="bg-zinc-900">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {log.profiles?.full_name ?? log.actor_profile_id?.slice(0, 8) ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {log.target_table && (
                    <span>{log.target_table}{log.target_id ? `:${log.target_id.slice(0, 8)}` : ''}</span>
                  )}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
                  {log.diff_json ? JSON.stringify(log.diff_json) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!logs || logs.length === 0) && (
        <p className="text-center text-sm text-zinc-500">No audit entries.</p>
      )}
    </div>
  )
}
