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
    modifiers = {},
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
    this.modifiers = modifiers;
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
    modifiers = {},
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
    this.modifiers = modifiers;
  }

  determineEnemyMove(battle) {
    for (const combatCondition of this.combatConditions) {
      if (combatCondition.condition({ battle: battle })) {
        const targets = combatCondition.targetingSystem(battle);
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
  constructor({ name = "", equipmentStats = {} } = {}) {
    this.name = name;
    this.equipmentStats = equipmentStats;
  }
}

export class Equipment {
  constructor({ name = "", slot = "", stats = {} } = {}) {
    this.name = name;
    this.slot = slot;
    this.stats = stats;
  }
}

export class Battle {
  constructor({
    party,
    troop,
    currentActor,
    selectedAbility,
    selectedTargets,
    order,
    battleState,
  } = {}) {
    this.party = party;
    this.troop = troop;
    this.selectedAbility = selectedAbility;
    ((this.selectedTargets = selectedTargets),
      (this.order = [...this.party.characters, ...this.troop.enemies]));
    this.currentActor = this.order[0];
    this.battleState = "active";
  }

  determineOrder() {
    this.order = [...this.party.characters, ...this.troop.enemies];
  }

  changeActor() {
    if (this.currentActor === this.order[this.order.length - 1]) {
      this.currentActor = this.order[0];
    } else
      this.currentActor = this.order[this.order.indexOf(this.currentActor) + 1];
  }

  getAvailableAbilities() {
    return this.currentActor.abilities;
  }

  getAvailableTargets() {
    switch (this.selectedAbility.scope) {
      default:
        throw new Error(
          `Unsupported targeting scope: ${this.selectedAbility.scope}`,
        );
      case "singleEnemy":
        if (this.currentActor instanceof Character) {
          return this.troop.enemies.filter((enemy) => enemy.health > 0);
        } else {
          return this.party.characters.filter(
            (character) => character.health > 0,
          );
        }
        break;
      case "singleAlly":
        if (this.currentActor instanceof Character) {
          return this.party.characters.filter(
            (character) => character.health > 0,
          );
        } else {
          return this.troop.enemies.filter((enemy) => enemy.health > 0);
        }
        break;
      case "allEnemies":
        if (this.currentActor instanceof Character) {
          return this.troop.enemies;
        } else {
          return this.party.characters;
        }
        break;
      case "self":
        return [this.currentActor];
        break;
    }
  }

  removeDeadActors() {
    this.order = this.order.filter((actor) => actor.health > 0);
  }

  updateBattleState() {
    if (this.party.characters.every((character) => character.health <= 0)) {
      this.battleState = "lost";
    } else if (this.troop.enemies.every((enemy) => enemy.health <= 0)) {
      this.battleState = "won";
    } else {
      this.battleState = "active";
    }
  }

  selectAbility(ability) {
    this.selectedAbility = ability;
  }

  selectTargets(targets) {
    this.selectedTargets = targets;
  }
}

export class UI {
  constructor() {
    this.dialoguePanel = document.querySelector("#dialoguePanel");
    this.characterPanel = document.querySelector("#characterPanel");
    this.enemyPanel = document.querySelector("#enemyPanel");
    this.actionPanel = document.querySelector("#actionPanel");

    this.actionButtons = document.querySelectorAll(".actionButton");
  }

  changeDialogueText(text = "") {
    this.dialoguePanel.innerHTML = text;
  }

  setAction(index, text) {
    this.actionButtons[index].textContent = text;
  }

  createActionButton(text, callback) {
    const button = document.createElement("button");

    button.classList.add("actionButton");
    button.textContent = text;

    button.addEventListener("click", callback);

    this.actionPanel.appendChild(button);
  }

  requestSelectedAbility(battle) {
    let selectedAbility;
    if (battle.currentActor instanceof Character) {
      return new Promise((resolve) => {
        this.actionPanel.innerHTML = "";
        battle.getAvailableAbilities().forEach((ability) => {
          this.createActionButton(ability.name, () => {
            if (battle.currentActor.energy >= ability.energyCost) {
              resolve(ability);
            }
          });
        });
      });
    } else if (battle.currentActor instanceof Enemy) return;
  }

  requestSelectedTargets(battle) {
    return new Promise((resolve) => {
      this.actionPanel.innerHTML = "";
      if (battle.selectedAbility.requiresTarget()) {
        battle.getAvailableTargets().forEach((target) => {
          this.createActionButton(target.name, () => {
            resolve([target]);
          });
        });
      } else {
        resolve(battle.getAvailableTargets());
      }
    });
  }

  updateCharacterPanel(battle) {
    this.characterPanel.innerHTML = "";

    for (const character of battle.party.characters) {
      const characterDiv = document.createElement("div");

      const name = document.createElement("div");
      name.textContent = character.name;

      const health = document.createElement("div");
      health.textContent = `HP: ${character.health}/${character.maxHealth}------`;

      const energy = document.createElement("div");
      energy.textContent = `Energy: ${character.energy}/${character.maxEnergy}--`;

      characterDiv.append(name, health, energy);
      this.characterPanel.append(characterDiv);
    }
  }

  updateEnemyPanel(battle) {
    this.enemyPanel.innerHTML = "";

    for (const enemy of battle.troop.enemies) {
      const enemyDiv = document.createElement("div");

      const name = document.createElement("div");
      name.textContent = enemy.name;

      const health = document.createElement("div");
      health.textContent = `HP: ${enemy.health}/${enemy.maxHealth}--`;

      enemyDiv.append(name, health);
      this.enemyPanel.append(enemyDiv);
    }
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
        console.log(`${user.name} uses ability `);
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
  execute({ user, targets = [] }) {
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
