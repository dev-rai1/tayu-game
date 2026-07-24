// The 9-step guided walkthrough for Module 1 (kid-friendly, ages 6–8).
// {{name}} is replaced with the player's name at render time.

export const TUTORIAL_STEPS = [
  {
    id: 1,
    emoji: '👋',
    audio: 'Welcome to TAYU, {{name}}!',
    text: "You're about to learn an amazing skill: managing money!",
    button: "Let's go",
  },
  {
    id: 2,
    emoji: '🧑‍🏫',
    audio: "I'm your guide. Let's learn together!",
    text: "This is your guide, Quinn. They'll help you make smart money choices.",
    button: 'Next',
  },
  {
    id: 3,
    emoji: '💵',
    audio: 'Money is how we buy things we need.',
    text: 'Money is special. You can use it to buy things, save for later, or help others.',
    button: 'Next',
  },
  {
    id: 4,
    emoji: '🎉',
    audio: "Here's your first $20!",
    text: 'Congratulations! You earned $20. Now we get to decide what to do with it.',
    button: 'Next',
  },
  {
    id: 5,
    emoji: '🫙',
    audio: 'I have three jars that will help you.',
    text: 'These three jars help you use money wisely:',
    bullets: [
      { label: 'SPEND JAR', desc: 'Money to use right now', color: 'spend' },
      { label: 'SAVE JAR', desc: 'Money to keep for later', color: 'save' },
      { label: 'GIVE JAR', desc: 'Money to help others', color: 'give' },
    ],
    button: 'I understand',
  },
  {
    id: 6,
    emoji: '🧸',
    audio: 'The Spend jar is for things you want now.',
    text: 'The SPEND Jar is for things you want to buy NOW - like a toy, a snack, or a video game.',
    button: 'Next',
  },
  {
    id: 7,
    emoji: '🐷',
    audio: 'The Save jar is for your future dreams.',
    text: "The SAVE Jar is for things you want LATER. Save a little each week and soon you'll have enough for something really special!",
    button: 'Next',
  },
  {
    id: 8,
    emoji: '💝',
    audio: 'The Give jar helps you make a difference.',
    text: 'The GIVE Jar is for helping others - friends, family, or people who need it.',
    button: 'Next',
  },
  {
    id: 9,
    emoji: '🫳',
    audio: "Now it's your turn! Let's allocate your $20.",
    text: 'How much will you put in each jar? Drag your money into the jars!',
    button: 'Start allocating',
  },
]
