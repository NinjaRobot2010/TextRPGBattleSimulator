import { Character } from "./classes.js";

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

      if (user instanceof Character) {
        damage += user.equipmentModifiers.attack;
      }
      if (target instanceof Character) {
        damage -= target.equipmentModifiers.defense;
      }
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
