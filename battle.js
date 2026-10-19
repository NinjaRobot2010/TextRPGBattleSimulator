import { Character } from "./classes.js";

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
    this.selectedItem;
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

  selectItem(item) {
    this.selectedItem = item;
  }

  executeSelectedAbility() {
    this.selectedAbility.use(this.currentActor, this.selectedTargets);
  }

  useSelectedItem() {
    this.selectedItem.use([this.currentActor]);
  }

  removeSelectedItem() {
    this.party.items.splice(this.party.items.indexOf(this.selectedItem), 1);
  }

  clearStatusEffectModifiers() {
    for (let key of Object.keys(this.currentActor.statusEffectModifiers)) {
      this.currentActor.statusEffectModifiers[key] = 0;
    }
  }

  processStatusEffects() {
    for (const statusEffect of this.currentActor.statusEffects) {
      const statusEffects = this.currentActor.statusEffects;
      statusEffect.activate(this);
      statusEffect.duration -= 1;
      if (statusEffect.duration <= 0) {
        statusEffects.splice(statusEffects.indexOf(statusEffect), 1);
      }
    }
  }

  checkIfCurrentActorDead() {
    if (this.currentActor.health <= 0) {
      this.changeActor();
    }
  }
}
