import {
  punch,
  darkSpell,
  darkHeal,
  bandage,
  fireBall,
  holyWater,
  poisonDart,
  enrage,
  strength,
} from "./abilities.js";

import {
  Party,
  Character,
  Enemy,
  Troop,
  CombatCondition,
  targetingSystems,
  conditionSystems,
  Consumable,
  Equipment,
} from "./classes.js";

import { HealEffect, ApplyStatusEffect } from "./abilityClasses.js";

export class Zombie extends Enemy {
  constructor({
    name = "Zombie",
    maxHealth = 100,
    abilities = [punch],
    energy = 100,
    combatConditions = [
      new CombatCondition(
        conditionSystems.always,
        punch,
        targetingSystems.getFirstEnemy,
      ),
    ],
  } = {}) {
    super({
      name,
      maxHealth,
      abilities,
      energy,
      combatConditions,
    });
  }
}

export class DarkMage extends Enemy {
  constructor({
    name = "Dark Mage",
    maxHealth = 100,
    abilities = [darkSpell, darkHeal],
    energy = 100,
    combatConditions = [
      new CombatCondition(
        conditionSystems.healthBelowNum({ num: 50 }),
        darkHeal,
        targetingSystems.getSelf,
      ),
      new CombatCondition(
        conditionSystems.always,
        darkSpell,
        targetingSystems.getFirstEnemy,
      ),
    ],
  } = {}) {
    super({
      name,
      maxHealth,
      abilities,
      energy,
      combatConditions,
    });
  }
}

export const healthPotion = new Consumable({
  name: "Health Potion",
  effects: [new HealEffect({ amount: 50 })],
});

export const strengthPotion = new Consumable({
  name: "Strength Potion",
  effects: [new ApplyStatusEffect({ effect: strength })],
});

export const bronzeSword = new Equipment({
  name: "Bronze Sword",
  slot: "weapon",
  stats: {
    attack: 5,
  },
});
export const plateArmor = new Equipment({
  name: "Plate Armor",
  slot: "armor",
  stats: {
    defense: 5,
  },
});

export const heroParty = new Party({
  characters: [
    new Character({
      name: "Hero",
      maxHealth: 100,
      health: 100,
      maxEnergy: 100,
      energy: 100,
      attack: 10,
      defense: 10,
      abilities: [punch, holyWater, enrage],
    }),
    new Character({
      name: "Priest",
      maxHealth: 100,
      health: 100,
      maxEnergy: 100,
      energy: 100,
      abilities: [bandage, poisonDart],
    }),
    new Character({
      name: "Mage",
      maxHealth: 100,
      health: 100,
      maxEnergy: 100,
      energy: 100,
      abilities: [punch, fireBall],
    }),
  ],
  items: [healthPotion, healthPotion, strengthPotion],
});

export const zombieTroop = new Troop({
  enemies: [new Zombie(), new Zombie(), new Zombie()],
});

export const darkMageTroop = new Troop({
  enemies: [new DarkMage(), new DarkMage(), new DarkMage()],
});
