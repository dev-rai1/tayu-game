import {
  GENDERS, GENDER_BUILD, BODY_TYPES, SKIN_TONES, EYE_SHAPES, EYE_COLORS, HAIR_STYLES, HAIR_COLORS,
  TOP_STYLES, BOTTOM_STYLES, SHIRT_COLORS, PANTS_COLORS, SHOE_COLORS, ACCESSORIES,
} from '../constants/avatarOptions.js'

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-bold text-teal">{title}</p>
      {children}
    </div>
  )
}

// Text-label options (body type, eye shape, hair style)
function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-2.5 py-1 text-sm transition ${
            value === o.id ? 'bg-electric text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Color swatches (skin, eye color, hair color, clothing)
function Swatches({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          title={o.label}
          aria-label={o.label}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          style={{ background: o.hex }}
          className={`h-8 w-8 rounded-full border-2 transition ${
            value === o.id ? 'border-teal ring-2 ring-teal' : 'border-white/30 hover:border-white'
          }`}
        />
      ))}
    </div>
  )
}

export default function AvatarCustomizer({ avatar, onChange }) {
  const set = (patch) => onChange(patch)
  const toggleAcc = (id) => {
    const has = avatar.accessories.includes(id)
    set({ accessories: has ? avatar.accessories.filter((a) => a !== id) : [...avatar.accessories, id] })
  }

  return (
    <div className="h-full overflow-y-auto pr-2">
      <Section title="Gender">
        {/* picking a gender also sets a fitting default hairstyle */}
        <Pills
          options={GENDERS}
          value={avatar.gender}
          onChange={(v) => set({ gender: v, hairStyle: GENDER_BUILD[v].defaultHair, bottomStyle: GENDER_BUILD[v].defaultBottom })}
        />
      </Section>
      <Section title="Body Type">
        <Pills options={BODY_TYPES} value={avatar.bodyType} onChange={(v) => set({ bodyType: v })} />
      </Section>
      <Section title="Skin Tone">
        <Swatches options={SKIN_TONES} value={avatar.skinTone} onChange={(v) => set({ skinTone: v })} />
      </Section>
      <Section title="Eye Shape">
        <Pills options={EYE_SHAPES} value={avatar.eyeShape} onChange={(v) => set({ eyeShape: v })} />
      </Section>
      <Section title="Eye Color">
        <Swatches options={EYE_COLORS} value={avatar.eyeColor} onChange={(v) => set({ eyeColor: v })} />
      </Section>
      <Section title="Hair Style">
        <Pills options={HAIR_STYLES} value={avatar.hairStyle} onChange={(v) => set({ hairStyle: v })} />
      </Section>
      <Section title="Hair Color">
        <Swatches options={HAIR_COLORS} value={avatar.hairColor} onChange={(v) => set({ hairColor: v })} />
      </Section>
      <Section title="Top">
        <Pills options={TOP_STYLES} value={avatar.topStyle} onChange={(v) => set({ topStyle: v })} />
      </Section>
      <Section title="Bottom">
        <Pills options={BOTTOM_STYLES} value={avatar.bottomStyle} onChange={(v) => set({ bottomStyle: v })} />
      </Section>
      <Section title="Shirt">
        <Swatches options={SHIRT_COLORS} value={avatar.shirtColor} onChange={(v) => set({ shirtColor: v })} />
      </Section>
      <Section title="Pants">
        <Swatches options={PANTS_COLORS} value={avatar.pantsColor} onChange={(v) => set({ pantsColor: v })} />
      </Section>
      <Section title="Shoes">
        <Swatches options={SHOE_COLORS} value={avatar.shoeColor} onChange={(v) => set({ shoeColor: v })} />
      </Section>
      <Section title="Accessories">
        <div className="flex flex-wrap gap-1.5">
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              aria-pressed={avatar.accessories.includes(a.id)}
              onClick={() => toggleAcc(a.id)}
              className={`rounded-lg px-2.5 py-1 text-sm transition ${
                avatar.accessories.includes(a.id) ? 'bg-brandpurple text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
