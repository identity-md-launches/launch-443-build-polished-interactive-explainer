/**
 * Flavor beats: small "where does your attention go?" choices offered between
 * two scenes. Both options lead to the same next scene; the note is shown as an
 * aside above it. Every note restates something the text itself says, so the
 * reader never leaves the canon path.
 */
export interface BeatOption {
  label: string;
  note: string;
}
export interface Beat {
  id: string;
  chapter: number;
  /** The choice appears after this scene has been read (1-based). */
  afterScene: number;
  prompt: string;
  options: BeatOption[];
}

export const BEATS: Beat[] = [
  {
    id: 'n1-drone',
    chapter: 1,
    afterScene: 1,
    prompt: 'The drone is gone. What stays with you?',
    options: [
      {
        label: 'The green checkmark on the watch',
        note: 'Verified in a blink: the watch learned that the drone was a toy, and nothing else.',
      },
      {
        label: 'The couple who stood up from the bench',
        note: 'The grandmother sat down with her grandchild. Nobody had to ask.',
      },
    ],
  },
  {
    id: 'n1-shout',
    chapter: 1,
    afterScene: 3,
    prompt: 'Someone has shouted. Where do your eyes go?',
    options: [
      {
        label: 'To the nearest exit',
        note: 'Before his mind could catch up, his eyes had already found the nearest exit.',
      },
      {
        label: 'To the man with the hand device',
        note: 'A large, burly man was pointing a hand device straight at his face.',
      },
    ],
  },
  {
    id: 'n2-motto',
    chapter: 2,
    afterScene: 1,
    prompt: 'The class is about to begin. Which line do you carry into the room?',
    options: [
      {
        label: '"Grow roots, no head"',
        note: 'gie fe kiu kai ci bin hu: the strategy Dzego has used for half a century to grow and stay protected.',
      },
      {
        label: '"A nation learning will make the nation great"',
        note: 'The motto of Decentralized University, held up by an inflatable pig and hamster.',
      },
    ],
  },
  {
    id: 'n4-team',
    chapter: 4,
    afterScene: 2,
    prompt: 'Team Zau: Zei and Bai. The initiation phase begins. What do you do?',
    options: [
      {
        label: 'Leave her the rock formations on her side',
        note: 'Neither spoke a word. Zei aimed his gliders away from a few rock formations, and Bai took the hint.',
      },
      {
        label: 'Wait for her to speak first',
        note: 'The audio channel stayed silent. The closest thing to communication was the rock formations each left the other.',
      },
    ],
  },
  {
    id: 'n7-rehearse',
    chapter: 7,
    afterScene: 2,
    prompt: 'The final starts in fifty ticks. Rehearse one last thing:',
    options: [
      {
        label: 'Walls, gliders, spaceships',
        note: 'Zei recited his strategies in his head for the last time.',
      },
      {
        label: 'How to adapt when the rule changes',
        note: 'Every game there is a new rule, and the most important tactic of all is knowing how to adapt.',
      },
    ],
  },
  {
    id: 'n12-crowd',
    chapter: 12,
    afterScene: 4,
    prompt: 'The elevator opens on thousands of faces. Steady yourself:',
    options: [
      {
        label: 'Breathe. If I lose, there are other games.',
        note: 'This match was not decisive. That fact scared Zei more: would his mind stay fully on the game with an excuse ready?',
      },
      {
        label: 'Breathe. Play it like the final.',
        note: 'Zei closed his eyes, breathed in and out, and waited for the announcement.',
      },
    ],
  },
  {
    id: 'n15-news',
    chapter: 15,
    afterScene: 1,
    prompt: 'The broadcast ends. Who do you think of first?',
    options: [
      {
        label: "Seila's friend Jahn, in the United Cities",
        note: 'In Meldan, Seila is already typing to Jahn.',
      },
      {
        label: 'Deluin, who flew home for his parents’ birthdays',
        note: 'In Sadzu Du, Zei has sent Deluin a fifth message with no reply.',
      },
    ],
  },
  {
    id: 'n19-burn',
    chapter: 19,
    afterScene: 1,
    prompt: 'Someone burned four hundred zipcoins to reach one eighteen-year-old. What does that tell you?',
    options: [
      {
        label: 'That the message is worth the effort to understand',
        note: 'The burn was a signal to the courtyard, to their local AIs and to them: this is worth the trouble.',
      },
      {
        label: 'That very few people were meant to see it',
        note: 'The description was calibrated: wide enough to contain Zei, narrow enough that not many would ever find out.',
      },
    ],
  },
  {
    id: 'n21-arctics',
    chapter: 21,
    afterScene: 1,
    prompt: 'Zven has blurted it out. Is it the Arctics?',
    options: [
      {
        label: 'Say nothing. Add it up first.',
        note: 'The table went silent.',
      },
      {
        label: 'It has been them all along.',
        note: 'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      },
    ],
  },
  {
    id: 'n26-rescue',
    chapter: 26,
    afterScene: 2,
    prompt: 'Tomorrow morning: the rescue of Tafindel. Rehearse it once more.',
    options: [
      {
        label: 'The mainline: balcony, rope, fly out',
        note: 'Their man inside asks the target onto the balcony; a drone drops a rope; they fly before the Arctics can react.',
      },
      {
        label: 'The contingencies: what if the rope drone is shot down',
        note: 'A second rope drone, then the combat drones. The only dangerous window is the few ticks right after pickup.',
      },
    ],
  },
  {
    id: 'n29-sundown',
    chapter: 29,
    afterScene: 3,
    prompt: 'The sun is halfway below the horizon. Fi le gei fa. What do you think of?',
    options: [
      {
        label: 'Every Minpentai game that led here',
        note: 'From practice to championship, all that time Zei had been training for the one game that really mattered: tonight.',
      },
      {
        label: 'The printers riding on the drones',
        note: 'Boxes of printers, stick-on paper and shirts, in case the Arctic algorithms need a visual attack.',
      },
    ],
  },
];

export function beatAfter(chapter: number, scene: number): Beat | undefined {
  return BEATS.find((b) => b.chapter === chapter && b.afterScene === scene);
}

/** The beat whose choice was made right before `scene` (used to show the aside). */
export function beatBefore(chapter: number, scene: number): Beat | undefined {
  return BEATS.find((b) => b.chapter === chapter && b.afterScene === scene - 1);
}
