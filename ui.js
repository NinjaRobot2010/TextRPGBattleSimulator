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
