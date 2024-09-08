import {achievementsData} from "../data/achievements.js";
import {Achievements} from "./achievements.js";
import {sleep} from "../utils.js";

const stuckBtnQuotes = [
  'Halp',
  "I'm so sorry",
  'I did an oopsie',
  '/stuck',
  "I've done goofed up",
  'I accidentally the whole system',
  'I messed up',
  'Everything is horrible',
];

export class Menu {
  game;
  selectedSavePoint = null;

  constructor(game) {
    this.game = game;
  }

  refresh(warm = false) {
    // Adjust text
    if (!warm) {
      const randomInt = Math.floor(Math.random() * stuckBtnQuotes.length);
      document.getElementById('stuck-btn').innerHTML = stuckBtnQuotes[randomInt];
    }

    // Load achievements
    document.getElementById('achievements-list').innerHTML = '';
    for (const [name, achievement] of achievementsData) {
      if (!Achievements.has(name)) continue;
      const achievementElm = document.createElement('div');
      achievementElm.innerHTML = `<h3>${achievement.title}</h3><p>${achievement.description}</p>`;
      document.getElementById('achievements-list').appendChild(achievementElm);
    }
    if (document.getElementById('achievements-list').children.length === 0) {
      document.getElementById('achievements-list').innerHTML = '<p>(None yet.)</p>';
    }

    // Load save points
    const savesMetadataJson = localStorage.getItem('systemsim-saves-metadata');
    const savesMetadata = savesMetadataJson ? JSON.parse(savesMetadataJson) : ({});
    const savePointsListElem = document.getElementById('save-points-list');
    savePointsListElem.innerHTML = '';
    const addSavePointRow = (name, timestamp, id) => {
      const rowElem = document.createElement('p');
      rowElem.innerHTML = `<span class="save-point-time">${timestamp}</span><span class="save-point-name">${name}</span>`;
      if (id) {
        rowElem.attributes['data-id'] = id;
        rowElem.addEventListener('click', () => this.selectSavePoint(id));
      }
      savePointsListElem.appendChild(rowElem);
    };
    addSavePointRow('Title', 'Timestamp');
    addSavePointRow('Current', 'Now');
    for (const [name, metadata] of Object.entries(savesMetadata)) {
      if (name.startsWith('systemsim-save-')) {
        const message = metadata.message;
        const timestamp = new Date(metadata.timestamp).toLocaleString();
        addSavePointRow(message, timestamp, name.replace('systemsim-save-', ''));
      }
    }
  }

  selectSavePoint(n) {
    const savePointsListElem = document.getElementById('save-points-list');
    for (let i = 0; i < savePointsListElem.children.length; i++) {
      const child = savePointsListElem.children[i];
      if (child.attributes['data-id'] === n) {
        child.classList.add('selected');
        this.selectedSavePoint = n;
      } else {
        child.classList.remove('selected');
      }
    }
  }

  async showCredits() {
    await this.game.showDialog({
      title: 'Credits',
      text: `
        <h3>Thanks to:</h3><br />
        <p>(No-one yet, all the stuff here was made by my massive, muscular fingers.)</p><br />
        <h3>Special thanks to:</h3><br />
        <p>Ruurtjan Pul for the <a target="_blank" href="https://www.nslookup.io/dns-course/">DNS for developers course</a>, which was a catalyst for beginning my search.</p>
        <p>Team Fractal Alligator for <a target="_blank" href="https://store.steampowered.com/app/365450/Hacknet/">Hacknet</a>, which was an inspiration for this game.</p>
        <p>Jacob Jackson for <a target="_blank" href="https://supermaven.com/">Supermaven</a>, an excellent (and fast) AI assistant.  // &lt;-- THE ASSISTANT WROTE THIS ASDFASDFASDF HELP</p>
        <p><a target="_blank" href="https://stackoverflow.com/">Stack Overflow</a>, for obvious reasons.</p>
        <p><a target="_blank" href="https://www.jetbrains.com/">Jetbrains</a> for the powerful IDEs they provide.</p>
        <p><a target="_blank" href="https://github.com/PwnzorBot4000/systemsim">GitHub</a>, for hosting the code, and for hosting the game on GitHub pages.</p>
        <p><a target="_blank" href="https://pwnzorbot4000.itch.io/systemsim-prologue">itch.io</a>, for hosting the game on itch.io.</p>
      `,
      buttons: [{ text: 'Close', attributes: { primary: true } }],
    });
  }

  async showDeleteDialog() {
    await this.game.showDialog({
      title: 'Delete data',
      text: 'WARNING: This will reset your progress to zero. Are you sure you want to continue?',
      buttons: [
        { text: 'Cancel', attributes: { primary: true } },
        {
          text: 'Delete everything',
          attributes: { danger: true },
          callback: async () => {
            await this.game.showDialog({
              title: 'Delete data',
              text: 'WARNING: This will delete all your data, including your achievements, save points, and any other saved data.' +
                ' Are you <b>really</b> sure you want to continue?',
              buttons: [
                { text: 'Cancel', attributes: { primary: true } },
                {
                  text: 'Delete everything',
                  attributes: { danger: true },
                  callback: async () => {
                    this.game.cls();
                    this.game.setAsciiArt(undefined);
                    await sleep(800);
                    this.toggle();
                    await sleep(800);
                    setTimeout(async () => {
                      localStorage.clear();
                      await window.game.restart();
                    }, 1600);
                  }
                },
              ],
            });
          }
        },
        { text: 'Delete progress',
          attributes: { danger: true },
          callback: async () => {
            this.game.cls();
            this.game.setAsciiArt(undefined);
            await sleep(1000);
            this.toggle();
            setTimeout(async () => {
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('systemsim-save-')) {
                  localStorage.removeItem(key);
                }
              }
              localStorage.removeItem('systemsim-saves-metadata');
              await window.game.restart();
            }, 1500);
          }
        },
      ],
    });
  }

  async showLicense() {
    const licenseText = await fetch('LICENSE').then(res => res.text());
    await this.game.showDialog({
      title: (elem) => {
        const random = Math.random();
        if (random < 0.33) elem.innerHTML = 'Loicense';
        else elem.innerHTML = 'License';

        setTimeout(() => {
          elem.innerHTML = 'License';
        }, 1000);
      },
      text: licenseText.replace(/\n\n/g, '<br /><br />'),
      buttons: [{ text: 'Close', attributes: { primary: true } }],
    });
  }

  async showSavePointDialog() {
    const labelElm = document.createElement('label');
    labelElm.innerHTML = 'Save point name:';
    labelElm.attributes.for = 'save-point-name';

    const inputElm = document.createElement('input');
    inputElm.name = 'save-point-name';
    inputElm.type = 'text';
    inputElm.placeholder = 'Save point name';

    await this.game.showDialog({
      title: 'Create save point',
      text: (elem) => {
        elem.innerHTML = '';
        elem.className = 'row';
        elem.style.alignItems = 'baseline';
        elem.appendChild(labelElm);
        elem.appendChild(inputElm);
      },
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          attributes: { primary: true },
          callback: async () => {
            const name = inputElm.value.trim();
            if (!name) {
              throw new Error('Invalid save point name.');
            }
            this.game.save('manual', name);
            this.refresh(true);
          }
        },
      ],
    });
  }

  toggle() {
    const menuElm = document.getElementById('menu-ui');
    if (menuElm.style.display === 'none') {
      this.refresh();
      menuElm.style.display = null;
    } else {
      menuElm.style.display = 'none';
    }
  }
}