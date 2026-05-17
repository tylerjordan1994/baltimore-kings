'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type {
  Requirement,
  RequirementSignature,
  Profile,
  Team,
  ContractKind,
  ContractAppliesTo,
} from '@/types/database'

type Tab = 'requirements' | 'contracts'
type ContractTab = 'active' | 'pending' | 'expiring' | 'expired' | 'drafts'

const requirementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body_markdown: z.string().min(1, 'Body is required'),
  version: z.coerce.number().int().min(1).default(1),
})

type RequirementForm = z.infer<typeof requirementSchema>

interface RequirementWithSigs extends Requirement {
  signatures?: (RequirementSignature & { profiles?: Profile })[]
}

export default function RequirementsPage() {
  const [tab, setTab] = useState<Tab>('requirements')
  const [requirements, setRequirements] = useState<RequirementWithSigs[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingSigs, setViewingSigs] = useState<string | null>(null)

  // Contracts (merged in from the former admin/contracts page)
  const [contractTab, setContractTab] = useState<ContractTab>('active')
  const [contracts, setContracts] = useState<any[]>([])
  const [contractLoading, setContractLoading] = useState(true)
  const [showContractForm, setShowContractForm] = useState(false)
  const [showAssign, setShowAssign] = useState<string | null>(null)
  const [cPlayers, setCPlayers] = useState<Profile[]>([])
  const [cTeams, setCTeams] = useState<Team[]>([])
  const [assignCounts, setAssignCounts] = useState<Record<string, number>>({})
  const [cTitle, setCTitle] = useState('')
  const [cBody, setCBody] = useState('')
  const [cKind, setCKind] = useState<ContractKind>('player_agreement')
  const [cAppliesTo, setCAppliesTo] = useState<ContractAppliesTo>('individual')
  const [cTeamId, setCTeamId] = useState('')
  const [cExpiration, setCExpiration] = useState('')
  const [cSubmitting, setCSubmitting] = useState(false)
  const [assignProfileId, setAssignProfileId] = useState('')

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RequirementForm>({
    resolver: zodResolver(requirementSchema) as any,
    defaultValues: { version: 1 },
  })

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from('requirements')
      .select('*, requirement_signatures(*, profiles(*))')
      .order('created_at', { ascending: false })

    if (data) {
      setRequirements(
        data.map((r: any) => ({
          ...r,
          signatures: r.requirement_signatures,
        }))
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Contracts (merged from admin/contracts) ───────────────────
  const fetchContracts = useCallback(async () => {
    setContractLoading(true)
    let query = supabase.from('contracts').select('*')

    const now = new Date().toISOString()
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    if (contractTab === 'active') {
      query = query.eq('is_active', true).or(`expiration_date.is.null,expiration_date.gt.${now}`)
    } else if (contractTab === 'pending') {
      query = query.eq('is_active', true)
    } else if (contractTab === 'expiring') {
      query = query.eq('is_active', true).lte('expiration_date', thirtyDays).gt('expiration_date', now)
    } else if (contractTab === 'expired') {
      query = query.lt('expiration_date', now)
    } else {
      query = query.eq('is_active', false)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setContracts(data || [])

    if (data && data.length > 0) {
      const ids = data.map((c: any) => c.id)
      const { data: counts } = await supabase
        .from('contract_assignments')
        .select('contract_id')
        .in('contract_id', ids)
      const map: Record<string, number> = {}
      counts?.forEach((row: any) => {
        map[row.contract_id] = (map[row.contract_id] || 0) + 1
      })
      setAssignCounts(map)
    }
    setContractLoading(false)
  }, [contractTab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  useEffect(() => {
    async function loadContractRefs() {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('full_name')
      setCPlayers((p as Profile[]) || [])
      const { data: t } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setCTeams((t as Team[]) || [])
    }
    loadContractRefs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateContract() {
    setCSubmitting(true)
    const res = await fetch('/api/admin/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_contract',
        title: cTitle,
        body_markdown: cBody,
        kind: cKind,
        applies_to: cAppliesTo,
        team_id: cAppliesTo === 'team' ? cTeamId : null,
        expiration_date: cExpiration || null,
      }),
    })
    if (res.ok) {
      setShowContractForm(false)
      setCTitle('')
      setCBody('')
      setCExpiration('')
      fetchContracts()
    }
    setCSubmitting(false)
  }

  async function handleAssignContract(contractId: string) {
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract) return
    setCSubmitting(true)
    const res = await fetch('/api/admin/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign',
        contract_id: contractId,
        applies_to: contract.applies_to,
        profile_id: contract.applies_to === 'individual' ? assignProfileId : undefined,
        team_id: contract.team_id,
      }),
    })
    if (res.ok) {
      setShowAssign(null)
      setAssignProfileId('')
      fetchContracts()
    }
    setCSubmitting(false)
  }

  const contractTabs: { key: ContractTab; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending Signature' },
    { key: 'expiring', label: 'Expiring Soon' },
    { key: 'expired', label: 'Expired' },
    { key: 'drafts', label: 'Drafts' },
  ]

  const contractKindOptions: ContractKind[] = [
    'player_agreement', 'coach_agreement', 'tryout_waiver',
    'tournament_release', 'code_of_conduct', 'other',
  ]

  async function onSubmit(data: RequirementForm) {
    if (editingId) {
      await supabase.from('requirements').update(data).eq('id', editingId)
    } else {
      await supabase.from('requirements').insert(data)
    }
    reset()
    setShowForm(false)
    setEditingId(null)
    loadData()
  }

  function handleEdit(r: Requirement) {
    setEditingId(r.id)
    setValue('title', r.title)
    setValue('body_markdown', r.body_markdown)
    setValue('version', r.version)
    setShowForm(true)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('requirements').update({ is_active: !current }).eq('id', id)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this requirement?')) return
    await supabase.from('requirements').delete().eq('id', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Player Agreements</h1>
          <p className="text-zinc-400">
            Manage requirements, waivers, and contracts members must sign.
          </p>
        </div>
        {tab === 'requirements' ? (
          <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm) }}>
            {showForm ? 'Cancel' : 'Add Requirement'}
          </Button>
        ) : (
          <Button onClick={() => setShowContractForm(true)}>Create Contract</Button>
        )}
      </div>

      {/* Top-level tabs */}
      <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
        {([
          { key: 'requirements', label: 'Requirements & Waivers' },
          { key: 'contracts', label: 'Contracts' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requirements' && showForm && (
        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
              <input
                {...register('title')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Version</label>
              <input
                type="number"
                min={1}
                {...register('version')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Body (Markdown)</label>
            <textarea
              {...register('body_markdown')}
              rows={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white font-mono"
            />
            {errors.body_markdown && <p className="mt-1 text-xs text-red-400">{errors.body_markdown.message}</p>}
          </div>
          <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
        </form>
      )}

      {tab === 'requirements' && (
        <div className="space-y-3">
          {requirements.map((r) => (
            <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{r.title}</span>
                    <span className="text-[10px] text-zinc-500">v{r.version}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${r.is_active ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {r.signatures?.length ?? 0} signatures
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-zinc-200 hover:text-white" onClick={() => setViewingSigs(viewingSigs === r.id ? null : r.id)}>
                    Signatures
                  </Button>
                  <Button size="sm" variant="ghost" className="text-zinc-200 hover:text-white" onClick={() => toggleActive(r.id, r.is_active)}>
                    {r.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-zinc-200 hover:text-white" onClick={() => handleEdit(r)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Delete</Button>
                </div>
              </div>

              {viewingSigs === r.id && (
                <div className="mt-3 border-t border-zinc-800 pt-3">
                  {r.signatures && r.signatures.length > 0 ? (
                    <div className="space-y-1">
                      {r.signatures.map((sig) => (
                        <div key={sig.id} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300">{sig.profiles?.full_name ?? 'Unknown'}</span>
                          <span className="text-zinc-600">{new Date(sig.signed_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600">No signatures yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {requirements.length === 0 && (
            <p className="text-center text-sm text-zinc-500">No requirements yet.</p>
          )}
        </div>
      )}

      {tab === 'contracts' && (
        <div className="space-y-4">
          {/* Contract status tabs */}
          <div className="flex flex-wrap gap-1 rounded-lg bg-white/5 p-1">
            {contractTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setContractTab(t.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  contractTab === t.key
                    ? 'bg-amber-500 text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {contractLoading ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : contracts.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">No contracts found.</p>
              </div>
            ) : (
              contracts.map((c) => (
                <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{c.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                          {c.kind}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                          {c.applies_to}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {assignCounts[c.id] || 0} assigned
                        </span>
                      </div>
                      {c.expiration_date && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Expires: {new Date(c.expiration_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAssign(c.id)}
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Create Contract</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Body</label>
                <textarea
                  value={cBody}
                  onChange={(e) => setCBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Kind</label>
                  <select
                    value={cKind}
                    onChange={(e) => setCKind(e.target.value as ContractKind)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {contractKindOptions.map((k) => (
                      <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Applies To</label>
                  <select
                    value={cAppliesTo}
                    onChange={(e) => setCAppliesTo(e.target.value as ContractAppliesTo)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                    <option value="all_active">All Active</option>
                  </select>
                </div>
              </div>
              {cAppliesTo === 'team' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Team</label>
                  <select
                    value={cTeamId}
                    onChange={(e) => setCTeamId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select team...</option>
                    {cTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={cExpiration}
                  onChange={(e) => setCExpiration(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateContract}
                  disabled={!cTitle.trim() || !cBody.trim() || cSubmitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {cSubmitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowContractForm(false)}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Contract Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Assign Contract</h2>
            {contracts.find((c) => c.id === showAssign)?.applies_to === 'individual' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Select Player</label>
                  <select
                    value={assignProfileId}
                    onChange={(e) => setAssignProfileId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select player...</option>
                    {cPlayers.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 mb-4">
                This will assign to{' '}
                {contracts.find((c) => c.id === showAssign)?.applies_to === 'team'
                  ? 'all members of the selected team'
                  : 'all active players'}
                .
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleAssignContract(showAssign)}
                disabled={
                  cSubmitting ||
                  (contracts.find((c) => c.id === showAssign)?.applies_to === 'individual' &&
                    !assignProfileId)
                }
                className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {cSubmitting ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => {
                  setShowAssign(null)
                  setAssignProfileId('')
                }}
                className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
