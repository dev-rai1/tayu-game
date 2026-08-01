import {
  GENDERS, GENDER_BUILD, BODY_TYPES, SKIN_TONES, EYE_SHAPES, EYE_COLORS, HAIR_STYLES, HAIR_COLORS,
  TOP_STYLES, BOTTOM_STYLES, SHIRT_COLORS, PANTS_COLORS, SHOE_COLORS, ACCESSORIES,
} from '../constants/avatarOptions.js'

function Section({ title, hint, children }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-teal">{title}</p>
        {hint && <span className="text-[11px] font-semibold text-white/55">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// Text-label options (build, eye shape, hair style)
function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-[40px] rounded-lg px-3 py-1 text-sm font-semibold transition ${
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
          type="button"
          title={o.label}
          aria-label={o.label}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          style={{ background: o.hex }}
          className={`h-10 w-10 rounded-full border-2 transition ${
            value === o.id ? 'border-teal ring-2 ring-teal' : 'border-white/30 hover:border-white'
          }`}
        />
      ))}
    </div>
  )
}

const CHARACTER_STYLES = GENDERS.map((option) => ({
  ...option,
  label: option.id === 'male' ? 'Broad' : option.id === 'female' ? 'Curved' : 'Balanced',
}))

const BUILD_STYLES = BODY_TYPES.map((option) => ({
  ...option,
  label: {
    thin: 'Slim',
    athletic: 'Sporty',
    average: 'Classic',
    muscular: 'Strong',
    curvy: 'Rounded',
  }[option.id] || option.label,
}))

export default function AvatarCustomizer({ avatar, onChange }) {
  const set = (patch) => onChange(patch)
  const toggleAcc = (id) => {
    const has = avatar.accessories.includes(id)
    set({ accessories: has ? avatar.accessories.filter((a) => a !== id) : [...avatar.accessories, id] })
  }

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="mb-4 rounded-2xl bg-teal/10 px-3 py-2 text-sm font-bold leading-relaxed text-white/85">
        Every choice is optional. Pick a few favorites, or use the quick-start buttons above.
      </div>

      <Section title="Skin tone">
        <Swatches options={SKIN_TONES} value={avatar.skinTone} onChange={(v) => set({ skinTone: v })} />
      </Section>
      <Section title="Hair style">
        <Pills options={HAIR_STYLES} value={avatar.hairStyle} onChange={(v) => set({ hairStyle: v })} />
      </Section>
      <Section title="Hair color">
        <Swatches options={HAIR_COLORS} value={avatar.hairColor} onChange={(v) => set({ hairColor: v })} />
      </Section>
      <Section title="Shirt color">
        <Swatches options={SHIRT_COLORS} value={avatar.shirtColor} onChange={(v) => set({ shirtColor: v })} />
      </Section>

      <details className="rounded-2xl border border-white/15 bg-white/5">
        <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 font-extrabold text-white marker:hidden">
          More character options <span className="ml-1 text-teal">+</span>
        </summary>
        <div className="border-t border-white/10 px-4 pb-1 pt-4">
          <Section title="Character shape" hint="appearance only">
            <Pills
              options={CHARACTER_STYLES}
              value={avatar.gender}
              onChange={(v) => set({
                gender: v,
                hairStyle: GENDER_BUILD[v].defaultHair,
                bottomStyle: GENDER_BUILD[v].defaultBottom,
              })}
            />
          </Section>
          <Section title="Build" hint="appearance only">
            <Pills options={BUILD_STYLES} value={avatar.bodyType} onChange={(v) => set({ bodyType: v })} />
          </Section>
          <Section title="Eye shape">
            <Pills options={EYE_SHAPES} value={avatar.eyeShape} onChange={(v) => set({ eyeShape: v })} />
          </Section>
          <Section title="Eye color">
            <Swatches options={EYE_COLORS} value={avatar.eyeColor} onChange={(v) => set({ eyeColor: v })} />
          </Section>
          <Section title="Top">
            <Pills options={TOP_STYLES} value={avatar.topStyle} onChange={(v) => set({ topStyle: v })} />
          </Section>
          <Section title="Bottom">
            <Pills options={BOTTOM_STYLES} value={avatar.bottomStyle} onChange={(v) => set({ bottomStyle: v })} />
          </Section>
          <Section title="Pants or skirt color">
            <Swatches options={PANTS_COLORS} value={avatar.pantsColor} onChange={(v) => set({ pantsColor: v })} />
          </Section>
          <Section title="Shoe color">
            <Swatches options={SHOE_COLORS} value={avatar.shoeColor} onChange={(v) => set({ shoeColor: v })} />
          </Section>
          <Section title="Accessories">
            <div className="flex flex-wrap gap-1.5">
              {ACCESSORIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={avatar.accessories.includes(a.id)}
                  onClick={() => toggleAcc(a.id)}
                  className={`min-h-[40px] rounded-lg px-3 py-1 text-sm font-semibold transition ${
                    avatar.accessories.includes(a.id) ? 'bg-brandpurple text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </details>
    </div>
  )
}
