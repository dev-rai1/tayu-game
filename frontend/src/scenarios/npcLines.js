// v9 SECTION 5: THE TWO-LINE RULE. Every NPC's FIRST line is short and
// unique to them (personality). The SECOND line is shared and points the
// child onward. No NPC repeats another NPC's first line. Repeat chats cycle
// through each NPC's small pool so the world never sounds canned.

export const SHARED_SECOND = 'Follow your arrow to get to the next place!'

const NEXT_STOP = {
  1: 'the ALLOWANCE BANK and the jars',
  2: 'the LEMONADE STAND',
  3: 'BUDGET TOWN',
  4: 'the BANK OF TAYU',
  5: 'the MONEY GARDEN',
  done: 'the FINALE AREA',
}

export function nextStopLabel(week, gameComplete) {
  return gameComplete ? NEXT_STOP.done : NEXT_STOP[week] || NEXT_STOP[1]
}

// v9 starter set + the extended cast - every first line UNIQUE.
const FIRST_LINES = {
  wanderer: ['Hey, glad you are here. Let us learn some money stuff together.', 'I walk this ring road every single day. Best loop in the world.'],
  penny: ['Payday! Your allowance is ready at the mailbox.', 'Three jars, one plan - you have got this.'],
  bram: ['Welcome in. Everything has a price, so pick what is worth it to you.', 'Needs first, treats second - shopkeeper wisdom.'],
  keeper: ['In this town we plan before we spend. Smart move.', 'A good plan makes a good week.'],
  theo: ['Uh oh, a flat tire. Good thing you kept a little in your pocket.', 'My bike and I are ready for anything.'],
  mia: ['Nice backpack. Saving up for something big?', 'The shelter says hi - giving feels amazing.'],
  bea: ['Welcome to the bank. We keep your money safe and help it grow.', 'Paying on time builds trust. Remember that.'],
  sprout: ['Plant your coins and give them time. Gardens grow slow, and so does money.', 'A busy store is a healthy company. Detective tip.'],
  scoop: ['Patience is the trick here. Little by little, it adds up.', 'EXTRA EXTRA! Kid learns money, town amazed!'],
  nea: ['I walk the loop backwards. Same circle, new view.', 'The palm trees are my favorite part of town.'],
  teller: ['The vault door weighs more than a hippo. True fact.', 'Coins in, coins out - I love this job.'],
  clerk: ['Fresh snacks! The tap terminal goes BEEP.', 'Cards are keys to your own money, you know.'],
  mailer: ['Mail never stops. Neither do bills - pay them whole and on time.', 'A letter a day keeps the late fees away!'],
  helper: ['One payment beats six fees. That is my motto.', 'Asking for help is the brave move, always.'],
  scammer: ['...no prizes today. Fine. FINE. I am leaving.', 'You would not happen to have five dollars? No? Smart kid.'],
}

const AMBIENT_FIRST = {
  'amb-dana': ['Dance with us! The lake sparkles when you spin.'],
  'amb-rio': ['Best dance floor in town: right here on the grass.'],
  'amb-lulu': ['Shhh... the ducks are doing laps.'],
  'amb-finn': ['I counted nine lily pads today. New record.'],
  'amb-pip': ['Picnic day! I budgeted for extra apples.'],
  'amb-momo': ['The disco at the Finale Area is going to be LEGENDARY.'],
}

const counters = {}

// line 1: unique personality. (the store follows with the SHARED second line)
export function npcFirstLine(id) {
  const pool = FIRST_LINES[id] || AMBIENT_FIRST[id] || ['Nice day on the loop, friend!']
  const i = (counters[id] = ((counters[id] ?? -1) + 1) % pool.length)
  return pool[i]
}

// legacy compat (guidance line with the stop baked in)
export function npcLine(id, week, gameComplete) {
  return npcFirstLine(id)
}
