
import { Client, MindfulnessTheme } from './types';

/**
 * USER MANAGEMENT:
 * To ADD a user: Add a new object to the array below.
 * To REMOVE a user: Delete the object from the array below.
 */
export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    code: '1234',
    name: 'Alex Johnson',
    summary: 'Working on emotional regulation and anxiety management through cognitive reframing.',
    goals: [
      'Practice grounding 3x daily',
      'Identify 2 positive triggers per week',
      'Maintain sleep hygiene routine'
    ],
    homework: 'Reflect on a situation this week where you felt successful in setting a boundary.',
    lastSession: 'Oct 24, 2024',
    nextSession: 'Oct 31, 2024',
    currentSpring: 'Authentic Self Discovery'
  },
  {
    id: '2',
    code: '4321',
    name: 'Sam Taylor',
    summary: 'Focusing on career-related stress and self-worth affirmations.',
    goals: [
      'Morning gratitude journaling',
      'Delegating one task at work each day',
      'Mindful eating during lunch'
    ],
    homework: 'Write a letter to your past self acknowledging three hardships you overcame.',
    lastSession: 'Oct 22, 2024',
    nextSession: 'Nov 05, 2024',
    currentSpring: 'Confidence & Worth'
  },
  {
    id: '3',
    code: '5555',
    name: 'Jordan Lee',
    summary: 'Exploring mindfulness techniques for focus and work-life balance.',
    goals: [
      'Digital detox 1 hour before bed',
      'Take a 10-minute walk without phone',
      'Practice active listening'
    ],
    homework: 'Identify three times this week you felt "flow" state at work.',
    lastSession: 'Nov 01, 2024',
    nextSession: 'Nov 08, 2024',
    currentSpring: 'Presence & Focus'
  }
];

export const MINDFULNESS_THEMES: { value: MindfulnessTheme; label: string; description: string }[] = [
  { 
    value: 'Peace', 
    label: 'Inner Peace', 
    description: 'Find stillness in the middle of chaos.' 
  },
  { 
    value: 'Compassion', 
    label: 'Self-Compassion', 
    description: 'Nurture a kinder voice within yourself.' 
  },
  { 
    value: 'Resilience', 
    label: 'Inner Strength', 
    description: 'Build capacity to bounce back from challenges.' 
  }
];
