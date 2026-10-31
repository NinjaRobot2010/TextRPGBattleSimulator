export class Party {
  constructor({ characters = [], level = 1, items = [] } = {}) {
    this.characters = characters;
    this.level = level;
    this.items = items;
  }
}

export class Character {
  constructor({
    name = "",
    maxHealth = 0,
    maxEnergy = 0,
    abilities = [],
    equipment = {
      armor: "",
      weapon: "",
    },
    attack = 0,
    defense = 0,
    statusEffects = [],
    statusEffectModifiers = {
      attack: 0,
      defense: 0,
    },
  } = {}) {
    this.name = name;

    this.maxHealth = maxHealth;
    this.health = maxHealth;

    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;

    this.abilities = abilities;
    this.equipment = equipment;

    this.attack = attack;
    this.defense = defense;

    this.statusEffects = statusEffects;
    this.statusEffectModifiers = statusEffectModifiers;

    this.equipmentModifiers = {
      attack: 0,
      defense: 0,
    };
  }

  calcEquipmentModifiers() {
    this.equipmentModifiers = {
      attack: 0,
      defense: 0,
    };

    for (const equipment of Object.values(this.equipment)) {
      if (!equipment) continue;

      for (const [key, value] of Object.entries(equipment.stats)) {
        this.equipmentModifiers[key] += value;
      }
    }
  }

  equipEquipment(item) {
    this.equipment[item.slot] = item;
  }
}

export class CharacterClass {
  constructor({ name = "", abilities = [] } = {}) {
    this.name = name;
    this.abilities = abilities;
  }
}

export class Enemy {
  constructor({
    name = "",
    maxHealth = 0,
    abilities = [],
    energy = 100,
    attack = 0,
    defense = 0,
    combatConditions = [],
    statusEffects = [],
    statusEffectModifiers = {
      attack: 0,
      defense: 0,
    },
  } = {}) {
    this.name = name;

    this.maxHealth = maxHealth;
    this.health = maxHealth;

    this.abilities = abilities;
    this.energy = energy;

    this.attack = attack;
    this.defense = defense;

    this.combatConditions = combatConditions;

    this.statusEffects = statusEffects;
    this.statusEffectModifiers = statusEffectModifiers;
  }

  determineEnemyMove(battle) {
    for (const combatCondition of this.combatConditions) {
      if (combatCondition.condition({ battle: battle })) {
        battle.selectAbility(combatCondition.move);
        const targets = combatCondition.targetingSystem(battle);
        battle.selectTargets(targets);
        combatCondition.move.use(this, targets);
        return;
      }
    }
  }
}

export class CombatCondition {
  constructor(condition, move, targetingSystem) {
    this.condition = condition;
    this.move = move;
    this.targetingSystem = targetingSystem;
  }
}

export const conditionSystems = {
  always: function () {
    return true;
  },

  healthBelowNum: function ({ num }) {
    return ({ battle }) => battle.currentActor.health < num;
  },
};

export const targetingSystems = {
  getFirstEnemy: function (battle) {
    return battle.party.characters
      .filter((character) => character.health > 0)
      .slice(0, 1);
  },
  getSelf: function (battle) {
    return [battle.currentActor];
  },
};

export class Troop {
  constructor({ enemies = [] } = {}) {
    this.enemies = enemies;
  }
}

export class Item {
  constructor({ name = "" } = {}) {
    this.name = name;
  }
}

export class Consumable extends Item {
  constructor({ name = "", effects = [] } = {}) {
    super({ name });
    this.effects = effects;
  }

  use(targets = []) {
    for (const effect of this.effects) {
      effect.execute({ targets });
    }
  }
}

export class Equipment extends Item {
  constructor({
    name = "",
    slot = "",
    stats = {
      attack: 0,
      defense: 0,
    },
  } = {}) {
    super({ name });
    this.slot = slot;
    this.stats = stats;
  }
}
