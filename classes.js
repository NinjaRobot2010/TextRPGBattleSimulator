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
    equipment = [],
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
  constructor({ name = "", slot = "", stats = {} } = {}) {
    super({ name });
    this.slot = slot;
    this.stats = stats;
  }
}

export class Ability {
  constructor({ name = "", energyCost = 0, scope = "", effects = [] } = {}) {
    this.name = name;
    this.energyCost = energyCost;
    this.scope = scope;
    this.effects = effects;
  }
  use(user, targets = []) {
    if (user.energy < this.energyCost) {
      return;
    } else {
      user.energy -= this.energyCost;

      for (const effect of this.effects) {
        effect.execute({ user, targets });
      }
    }
  }

  requiresTarget() {
    return (
      this.scope !== "allEnemies" &&
      this.scope !== "allAllies" &&
      this.scope !== "self"
    );
  }
}

export class Effect {
  execute({ user, targets }) {
    throw new Error("Effect must implement execute()");
  }
}

export class StatusEffect {
  constructor({ name, duration, effects = [] }) {
    this.name = name;
    this.duration = duration;
    this.effects = effects;
  }
  apply(target) {
    target.statusEffects.push(this);
  }
  activate(battle) {
    for (const effect of this.effects) {
      effect.execute({ targets: [battle.currentActor] });
    }
  }
}

export class DamageEffect extends Effect {
  constructor({ amount }) {
    super();
    this.amount = amount;
  }
  execute({ user, targets = [] }) {
    for (const target of targets) {
      target.health -= this.calcDamage(user, target);
      if (target.health < 0) {
        target.health = 0;
      }
    }
  }

  calcDamage(user, target) {
    let damage = this.amount;
    if (user) {
      damage += user.attack;
      damage += user.statusEffectModifiers.attack;
      damage -= target.defense;
    }
    return damage;
  }
}

export class HealEffect extends Effect {
  constructor({ amount }) {
    super();
    this.amount = amount;
  }
  execute({ targets = [] }) {
    for (const target of targets) {
      target.health += this.amount;
      if (target.health > target.maxHealth) {
        target.health = target.maxHealth;
      }
    }
  }
}

export class ApplyStatusEffect extends Effect {
  constructor({ effect }) {
    super();
    this.effect = effect;
  }
  execute({ targets = [] }) {
    for (const target of targets) {
      this.effect.apply(target);
    }
  }
}

export class attackModifierEffect extends Effect {
  constructor({ amount }) {
    super();
    this.amount = amount;
  }
  execute({ targets = [] }) {
    for (const target of targets) {
      target.statusEffectModifiers.attack += this.amount;
    }
  }
}
