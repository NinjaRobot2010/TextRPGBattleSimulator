import {
  Ability,
  DamageEffect,
  HealEffect,
  StatusEffect,
  ApplyStatusEffect,
  attackModifierEffect,
} from "./abilityClasses.js";

export const punch = new Ability({
  name: "Punch",
  energyCost: 10,
  scope: "singleEnemy",
  effects: [new DamageEffect({ amount: 20 })],
});

export const darkSpell = new Ability({
  name: "Dark Spell",
  energyCost: 10,
  scope: "singleEnemy",
  effects: [new DamageEffect({ amount: 30 })],
});

export const darkHeal = new Ability({
  name: "Dark Heal",
  energyCost: 10,
  scope: "singleAlly",
  effects: [new HealEffect({ amount: 30 })],
});

export const bandage = new Ability({
  name: "Bandage",
  energyCost: 10,
  scope: "singleAlly",
  effects: [new HealEffect({ amount: 20 })],
});

export const fireBall = new Ability({
  name: "Fireball",
  energyCost: 10,
  scope: "allEnemies",
  effects: [new DamageEffect({ amount: 30 })],
});

export const holyWater = new Ability({
  name: "Holy Water",
  energyCost: 10,
  scope: "self",
  effects: [new HealEffect({ amount: 30 })],
});

export const poison = new StatusEffect({
  name: "poison",
  duration: 3,
  effects: [new DamageEffect({ amount: 5 })],
});

export const poisonDart = new Ability({
  name: "Poison Dart",
  energyCost: 10,
  scope: "singleEnemy",
  effects: [new ApplyStatusEffect({ effect: poison })],
});

export const rage = new StatusEffect({
  name: "rage",
  duration: 3,
  effects: [new attackModifierEffect({ amount: 20 })],
});

export const strength = new StatusEffect({
  name: "strength",
  duration: 2,
  effects: [new attackModifierEffect({ amount: 30 })],
});

export const enrage = new Ability({
  name: "Enrage",
  energyCost: 10,
  scope: "self",
  effects: [new ApplyStatusEffect({ effect: rage })],
});
