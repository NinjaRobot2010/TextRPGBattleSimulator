import { Character } from "./classes.js";

import {
  heroParty,
  darkMageTroop,
  zombieTroop,
  bronzeSword,
  plateArmor,
} from "./battleData.js";

import { Battle } from "./battle.js";
import { UI } from "./ui.js";

const currentBattle = new Battle({
  party: heroParty,
  troop: darkMageTroop,
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
