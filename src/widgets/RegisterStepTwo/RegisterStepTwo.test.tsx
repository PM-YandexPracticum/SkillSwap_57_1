import { vi } from 'vitest'

vi.mock('@/shared/ui/AvatarUpload', () => ({
  AvatarUpload: ({
    src,
    onChange,
  }: {
    src: string | null
    onChange: (file: File | null) => void
  }) => (
    <>
      <label>
        Аватар
        <input
          type="file"
          aria-label="Аватар"
          onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
        />
      </label>
      {src && <img src={src} alt="Предпросмотр аватара" />}
    </>
  ),
}))
