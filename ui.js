import { Character } from "./classes.js";
import { delay } from "./main.js";

export class UI {
  constructor() {
    this.dialoguePanel = document.querySelector("#dialoguePanel");
    this.characterPanel = document.querySelector("#characterPanel");
    this.enemyPanel = document.querySelector("#enemyPanel");
    this.actionPanel = document.querySelector("#actionPanel");

    this.actionButtons = document.querySelectorAll(".actionButton");
  }

  async changeDialogueText(text = "") {
    this.dialoguePanel.textContent = "";

    for (const letter of text) {
      this.dialoguePanel.textContent += letter;
      await delay(40);
    }
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

  clearActionPanel() {
    this.actionPanel.innerHTML = "";
  }

  requestSelectedAbility(battle) {
    let selectedAbility;
    if (battle.currentActor instanceof Character) {
      return new Promise((resolve) => {
        this.clearActionPanel();
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
      characterDiv.classList.add("character__container");

      const name = document.createElement("div");
      name.textContent = character.name;
      if (battle.currentActor === character) {
        name.style.color = "yellow";
      }

      const health = document.createElement("div");
      health.textContent = `HP: ${character.health}/${character.maxHealth}`;

      const energy = document.createElement("div");
      energy.textContent = `Energy: ${character.energy}/${character.maxEnergy}`;

      characterDiv.append(name, health, energy);
      this.characterPanel.append(characterDiv);
    }
  }

  updateEnemyPanel(battle) {
    this.enemyPanel.innerHTML = "";

    for (const enemy of battle.troop.enemies) {
      const enemyDiv = document.createElement("div");
      enemyDiv.classList.add("enemy__container");

      const name = document.createElement("div");
      name.textContent = enemy.name;
      if (battle.currentActor === enemy) {
        name.style.color = "yellow";
      }

      const health = document.createElement("div");
      health.textContent = `HP: ${enemy.health}/${enemy.maxHealth}`;

      enemyDiv.append(name, health);
      this.enemyPanel.append(enemyDiv);
    }
  }

  displayMove(battle) {
    this.changeDialogueText(
      `${battle.currentActor.name} uses ${battle.selectedAbility.name} on ${battle.selectedTargets[0].name}`,
    );
  }
  displayBattleResult(battle) {
    if (battle.battleState === "won") {
      this.changeDialogueText("You Won!");
    } else if (battle.battleState === "lost") {
      this.changeDialogueText("You Lost...");
    }
  }
}
