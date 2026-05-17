"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"

// basePath handled by next.config.ts

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  nickname: z.string().nullable(),
  hometown: z.string().nullable(),
  school: z.string().nullable(),
  position_primary: z.string().nullable(),
  position_secondary: z.string().nullable(),
  bio: z.string().nullable(),
  photo_url: z.string().url().nullable().or(z.literal("")),
  jersey_number: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().min(0).max(99).nullable()
  ),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userRole, setUserRole] = useState<string>("player")
  const [alsoPlays, setAlsoPlays] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
  })

  const photoUrl = watch("photo_url")

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setMessage(null)
    setUploading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      return
    }

    const ext = file.name.split(".").pop() || "jpg"
    const path = `profile-photos/${user.id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { contentType: file.type, upsert: true })

    if (uploadError) {
      setMessage({ type: "error", text: `Upload failed: ${uploadError.message}` })
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path)
    setValue("photo_url", urlData.publicUrl, { shouldValidate: true })
    setMessage({
      type: "success",
      text: "Photo uploaded. Click Save Changes to apply.",
    })
    setUploading(false)
  }

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserRole(profile.role)
        setAlsoPlays(profile.also_plays)
        reset({
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          nickname: profile.nickname,
          hometown: profile.hometown,
          school: profile.school,
          position_primary: profile.position_primary,
          position_secondary: profile.position_secondary,
          bio: profile.bio,
          photo_url: profile.photo_url,
          jersey_number: profile.jersey_number,
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [reset])

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const updatePayload: Record<string, unknown> = {
      full_name: values.full_name,
      phone: values.phone || null,
      date_of_birth: values.date_of_birth || null,
      nickname: values.nickname || null,
      hometown: values.hometown || null,
      school: values.school || null,
      position_primary: values.position_primary || null,
      position_secondary: values.position_secondary || null,
      bio: values.bio || null,
      photo_url: values.photo_url || null,
      jersey_number: values.jersey_number,
    }

    if (userRole === "coach" || userRole === "superadmin") {
      updatePayload.also_plays = alsoPlays
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Profile</h1>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit as any)}
        className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <Field label="Full Name" error={errors.full_name?.message}>
          <input
            {...register("full_name")}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <Field label="Date of Birth" error={errors.date_of_birth?.message}>
          <input
            {...register("date_of_birth")}
            type="date"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <Field label="Nickname" error={errors.nickname?.message}>
          <input
            {...register("nickname")}
            placeholder="What teammates call you"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hometown" error={errors.hometown?.message}>
            <input
              {...register("hometown")}
              placeholder="e.g. Baltimore, MD"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </Field>
          <Field label="School" error={errors.school?.message}>
            <input
              {...register("school")}
              placeholder="School or university"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Primary Position"
            error={errors.position_primary?.message}
          >
            <input
              {...register("position_primary")}
              placeholder="e.g. GK, Defender, Forward"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </Field>

          <Field
            label="Secondary Position"
            error={errors.position_secondary?.message}
          >
            <input
              {...register("position_secondary")}
              placeholder="e.g. Midfielder"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </Field>
        </div>

        <Field label="Jersey Number" error={errors.jersey_number?.message}>
          <input
            {...register("jersey_number")}
            type="number"
            min={0}
            max={99}
            className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <Field label="Bio" error={errors.bio?.message}>
          <textarea
            {...register("bio")}
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </Field>

        <Field label="Profile Photo" error={errors.photo_url?.message}>
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                  No photo
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Upload an image file
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                />
                {uploading && (
                  <p className="mt-1 text-xs text-zinc-500">Uploading...</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Or paste an image URL
                </label>
                <input
                  {...register("photo_url")}
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Field>

        {(userRole === "coach" || userRole === "superadmin") && (
          <div className="flex items-center gap-3">
            <input
              id="also_plays"
              type="checkbox"
              checked={alsoPlays}
              onChange={(e) => setAlsoPlays(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="also_plays" className="text-sm font-medium text-zinc-300">
              Also rostered as a player
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
