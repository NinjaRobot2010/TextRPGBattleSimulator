import {
  Party,
  Character,
  Enemy,
  Troop,
  CombatCondition,
  targetingSystems,
  conditionSystems,
} from "./classes.js";

import {
  punch,
  darkSpell,
  darkHeal,
  bandage,
  fireBall,
  holyWater,
  poisonDart,
} from "./abilities.js";

import { Battle } from "./battle.js";
import { UI } from "./ui.js";

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
      abilities: [punch, holyWater],
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

const processStatusEffects = function (battle) {
  for (const statusEffect of battle.currentActor.statusEffects) {
    statusEffect.activate(battle);
    statusEffect.duration -= 1;
    if (statusEffect.duration <= 0) {
      fruits.splice(battle.currentActor.statusEffects.indexOf(statusEffect), 1);
    }
  }
};

const determinePlayerMove = async function (battle, ui) {
  const ability = await ui.requestSelectedAbility(battle);
  battle.selectAbility(ability);

  const targets = await ui.requestSelectedTargets(battle);
  battle.selectTargets(targets);

  battle.selectedAbility.use(battle.currentActor, battle.selectedTargets);

  ui.changeDialogueText(
    `${battle.currentActor.name} uses ${battle.selectedAbility.name} on ${battle.selectedTargets[0].name}`,
  );
};

const checkIfDead = function (battle) {
  if (battle.currentActor.health <= 0) {
    battle.changeActor();
  }
};

const playBattle = async function (battle, ui) {
  battle.determineOrder();

  while (battle.battleState === "active") {
    processStatusEffects(battle);
    checkIfDead(battle);
    if (battle.currentActor instanceof Character) {
      await determinePlayerMove(battle, ui);
    } else {
      battle.currentActor.determineEnemyMove(battle);
    }

    battle.removeDeadActors();
    battle.updateBattleState();
    ui.updateCharacterPanel(battle);
    ui.updateEnemyPanel(battle);

    if (battle.battleState === "won") {
      ui.changeDialogueText("You Won!");
      break;
    } else if (battle.battleState === "lost") {
      ui.changeDialogueText("You Lost...");
      break;
    }

    battle.changeActor();
  }
};

currentBattleUI.updateCharacterPanel(currentBattle);
currentBattleUI.updateEnemyPanel(currentBattle);
currentBattleUI.changeDialogueText("Zombies attacked you!");
playBattle(currentBattle, currentBattleUI);
