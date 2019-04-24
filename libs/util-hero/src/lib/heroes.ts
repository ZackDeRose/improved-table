import { Hero } from './hero.interface';

export const HEROES: { [index: string]: Hero } = {
  'Hammerer Maccabeus': {
    name: 'Hammerer Maccabeus',
    types: ['Holy', 'Fire'],
    stats: {
      attack: 286,
      defense: 255,
      speed: 230,
      healing: 103,
      recovery: 154,
      health: 766
    }
  },
  'Ethereal Moodmorph': {
    name: 'Ethereal Moodmorph',
    types: ['Water', 'Fire'],
    stats: {
      attack: 206,
      defense: 203,
      speed: 254,
      healing: 102,
      recovery: 178,
      health: 1115
    }
  },
  'Dwarf Bronnis': {
    name: 'Dwarf Bronnis',
    types: ['Rock', 'Fire'],
    stats: {
      health: 869,
      attack: 255,
      defense: 255,
      healing: 128,
      recovery: 153,
      speed: 179
    }
  },
  'Lady Sabrina': {
    name: 'Lady Sabrina',
    types: ['Water'],
    stats: {
      health: 1336,
      attack: 317,
      defense: 205,
      healing: 122,
      recovery: 105,
      speed: 139
    }
  },
  'Techno Fox': {
    name: 'Techno Fox',
    types: ['Electric'],
    stats: {
      health: 712,
      attack: 301,
      defense: 133,
      healing: 159,
      recovery: 184,
      speed: 256
    }
  },
  'Cleric Typh': {
    name: 'Cleric Typh',
    types: ['Holy'],
    stats: {
      health: 716,
      attack: 117,
      defense: 137,
      healing: 283,
      recovery: 272,
      speed: 229
    }
  },
  'Technician Dustin': {
    name: 'Technician Dustin',
    types: ['Electric', 'Arcane'],
    stats: {
      health: 916,
      attack: 282,
      defense: 150,
      healing: 123,
      recovery: 144,
      speed: 286
    }
  },
  'Dancer Galileo': {
    name: 'Dancer Galileo',
    types: ['Air', 'Holy'],
    stats: {
      health: 517,
      attack: 116,
      defense: 180,
      healing: 229,
      recovery: 168,
      speed: 405
    }
  }
};
