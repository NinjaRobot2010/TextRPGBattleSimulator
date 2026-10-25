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
  HealEffect,
  ApplyStatusEffect,
} from "./classes.js";

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

import { Battle } from "./battle.js";
import { UI } from "./ui.js";

class Zombie extends Enemy {
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

class DarkMage extends Enemy {
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

const healthPotion = new Consumable({
  name: "Health Potion",
  effects: [new HealEffect({ amount: 50 })],
});

const strengthPotion = new Consumable({
  name: "Strength Potion",
  effects: [new ApplyStatusEffect({ effect: strength })],
});

const bronzeSword = new Equipment({
  name: "Bronze Sword",
  slot: "weapon",
  stats: {
    attack: 5,
  },
});
const plateArmor = new Equipment({
  name: "Plate Armor",
  slot: "armor",
  stats: {
    defense: 5,
  },
});

const heroParty = new Party({
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

const zombieTroop = new Troop({
  enemies: [new Zombie(), new Zombie(), new Zombie()],
});

const darkMageTroop = new Troop({
  enemies: [new DarkMage(), new DarkMage(), new DarkMage()],
});

const currentBattle = new Battle({
  party: heroParty,
  troop: darkMageTroop,
  abilities: [punch],
});

const currentBattleUI = new UI({ battle: currentBattle });

export const delay = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function processActorMove(battle, ui) {
  if (battle.currentActor instanceof Character) {
    await processPlayerMove(battle, ui);
  } else {
    battle.currentActor.determineEnemyMove(battle);
    ui.displayAbilityMove(battle);
  }
}

const processPlayerMove = async function (battle, ui) {
  let selectedActionType = await ui.requestSelectedActionType();
  if (selectedActionType === "ability") {
    const ability = await ui.requestSelectedAbility(battle);
    battle.selectAbility(ability);

    const targets = await ui.requestSelectedTargets(battle);
    battle.selectTargets(targets);

    battle.executeSelectedAbility();

    ui.displayAbilityMove(battle);
  } else if (selectedActionType === "item") {
    const item = await ui.requestSelectedItem(battle);
    battle.selectItem(item);
    battle.useSelectedItem();
    battle.removeSelectedItem(item);
    ui.displayItemMove(battle);
  }
};

const playBattle = async function (battle, ui) {
  ui.updateCharacterPanel(battle);
  ui.updateEnemyPanel(battle);
  ui.changeDialogueText("Enemies attacked you!");

  battle.determineOrder();
  battle.calcEquipmentModifiers();
  while (battle.battleState === "active") {
    battle.clearStatusEffectModifiers();
    battle.processStatusEffects();
    battle.checkIfCurrentActorDead();
    await processActorMove(battle, ui);
    battle.removeDeadActors();
    battle.updateBattleState();
    ui.clearActionPanel();
    await delay(1700);

    if (battle.battleState !== "active") {
      ui.displayBattleResult();
      break;
    }

    battle.changeActor();
    ui.updateCharacterPanel(battle);
    ui.updateEnemyPanel(battle);
  }
};

heroParty.characters[0].equipEquipment(bronzeSword);
heroParty.characters[0].equipEquipment(plateArmor);
playBattle(currentBattle, currentBattleUI);
