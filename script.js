/*
  Jeu de Mémory
  Copyright © 2026 Dubarre Arnaud. Tous droits réservés.
  Aucune copie, modification, redistribution ou réutilisation sans autorisation écrite.
*/

let moves = 0;
let firstCard = null;
let secondCard = null;
let locked = false;

let seconds = 0;
let timerInterval = null;

let currentPlayerName = "";
let currentSelectedImages = [];
let currentLevel = 0;

const imageLibrary = [
  { id: 1, src: "images/image1.jpg", name: "Image 1" },
  { id: 2, src: "images/image2.jpg", name: "Image 2" },
  { id: 3, src: "images/image3.jpg", name: "Image 3" },
  { id: 4, src: "images/image4.jpg", name: "Image 4" },
  { id: 5, src: "images/image5.jpg", name: "Image 5" },
  { id: 6, src: "images/image6.jpg", name: "Image 6" },
  { id: 7, src: "images/image7.jpg", name: "Image 7" },
  { id: 8, src: "images/image8.jpg", name: "Image 8" },
  { id: 9, src: "images/image9.jpg", name: "Image 9" },
  { id: 10, src: "images/image10.jpg", name: "Image 10" }
];

const showRankingButton = document.getElementById("show-ranking-button");
const generalRankingPanel = document.getElementById("general-ranking-panel");
const generalRankingList = document.getElementById("general-ranking-list");
const timerDisplay = document.getElementById("timer");

const homeScreen = document.getElementById("home-screen");
const playerScreen = document.getElementById("player-screen");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const validateNameButton = document.getElementById("validate-name-button");
const backButton = document.getElementById("back-button");
const playButton = document.getElementById("play-button");
const newGameButton = document.getElementById("new-game-button");

const playerNameInput = document.getElementById("player-name-input");
const playerInfo = document.getElementById("player-info");
const levelSelect = document.getElementById("level-select");
const gameInfo = document.getElementById("game-info");
const moveCounter = document.getElementById("move-counter");

const rankingPanel = document.getElementById("ranking-panel");
const rankingList = document.getElementById("ranking-list");

const adminResetButton = document.getElementById("admin-reset-button");

startButton.addEventListener("click", () => {
  homeScreen.classList.remove("active");
  playerScreen.classList.add("active");
});

validateNameButton.addEventListener("click", () => {
  const name = playerNameInput.value.trim();

  if (name === "") {
    alert("Entre un nom pour continuer.");
    return;
  }

  const players = getPlayers();

  const existingPlayer = players.find(
    (player) => player.toLowerCase() === name.toLowerCase()
  );

  if (existingPlayer) {
    currentPlayerName = existingPlayer;
    alert(`Bon retour ${currentPlayerName} !`);
  } else {
    players.push(name);
    savePlayers(players);

    currentPlayerName = name;
    alert(`Bienvenue ${currentPlayerName} !`);
  }

  playerInfo.textContent = `Joueur : ${currentPlayerName}`;

  playerScreen.classList.remove("active");
  setupScreen.classList.add("active");
});

showRankingButton.addEventListener("click", () => {
  displayGeneralRanking();
});

backButton.addEventListener("click", () => {
  setupScreen.classList.remove("active");
  playerScreen.classList.add("active");
});

playButton.addEventListener("click", () => {
  currentLevel = Number(levelSelect.value);
  const pairsNeeded = currentLevel / 2;

  if (imageLibrary.length < pairsNeeded) {
    alert(`Il n'y a pas assez d'images dans la bibliothèque pour ce niveau.`);
    return;
  }

  currentSelectedImages = getRandomImages(imageLibrary, pairsNeeded);

  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");

  gameInfo.textContent = `Niveau choisi : ${currentLevel} cartes`;

  resetGame();
  createCards(currentSelectedImages);
  startTimer();
});

newGameButton.addEventListener("click", () => {
  resetGame();
  createCards(currentSelectedImages);
  startTimer();
});

function getPlayers() {
  const savedPlayers = localStorage.getItem("memoryPlayers");

  if (savedPlayers) {
    return JSON.parse(savedPlayers);
  }

  return [];
}

function savePlayers(players) {
  localStorage.setItem("memoryPlayers", JSON.stringify(players));
}

function getScores() {
  resetRankingAfterFiveDays();

  const savedScores = localStorage.getItem("memoryScores");

  if (savedScores) {
    return JSON.parse(savedScores);
  }

  return [];
}

function saveScore() {
  const scores = getScores();

  scores.push({
    player: currentPlayerName,
    level: currentLevel,
    moves: moves,
    time: seconds,
    date: new Date().toLocaleString("fr-FR")
  });

  localStorage.setItem("memoryScores", JSON.stringify(scores));
}

function resetGame() {
  moves = 0;
  seconds = 0;
  firstCard = null;
  secondCard = null;
  locked = false;

  moveCounter.textContent = "Coups : 0";
  timerDisplay.textContent = "Temps : 00:00";

  rankingPanel.style.display = "none";
  rankingList.innerHTML = "";
}

function createCards(selectedImages) {
  const gameBoard = document.getElementById("game-board");

  gameBoard.innerHTML = "";

  const numberOfCards = selectedImages.length * 2;

  if (numberOfCards === 4) {
    gameBoard.style.gridTemplateColumns = "repeat(2, 80px)";
  } else if (numberOfCards === 8) {
    gameBoard.style.gridTemplateColumns = "repeat(4, 80px)";
  } else if (numberOfCards === 12) {
    gameBoard.style.gridTemplateColumns = "repeat(4, 80px)";
  } else if (numberOfCards === 16) {
    gameBoard.style.gridTemplateColumns = "repeat(4, 80px)";
  } else if (numberOfCards === 20) {
    gameBoard.style.gridTemplateColumns = "repeat(5, 80px)";
  }

  let cards = [];

  selectedImages.forEach((image) => {
    cards.push(image);
    cards.push(image);
  });

  cards = shuffleCards(cards);

  cards.forEach((image) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = image.id;

    const cardBack = document.createElement("span");
    cardBack.className = "card-back";
    cardBack.textContent = "?";

    const cardImage = document.createElement("img");
    cardImage.src = image.src;
    cardImage.alt = image.name;
    cardImage.style.display = "none";

    card.appendChild(cardBack);
    card.appendChild(cardImage);

    card.addEventListener("click", () => {
      flipCard(card);
    });

    gameBoard.appendChild(card);
  });
}

function shuffleCards(cards) {
  return cards.sort(() => Math.random() - 0.5);
}

function getRandomImages(images, numberNeeded) {
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);
  return shuffledImages.slice(0, numberNeeded);
}

function flipCard(card) {
  if (locked) return;
  if (card.classList.contains("found")) return;
  if (card === firstCard) return;

  showCard(card);

  if (firstCard === null) {
    firstCard = card;
    return;
  }

  secondCard = card;
  locked = true;

  moves++;
  moveCounter.textContent = `Coups : ${moves}`;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    firstCard.classList.add("found");
    secondCard.classList.add("found");

    firstCard = null;
    secondCard = null;
    locked = false;

    checkWin();
  } else {
    setTimeout(() => {
      hideCard(firstCard);
      hideCard(secondCard);

      firstCard = null;
      secondCard = null;
      locked = false;
    }, 1000);
  }
}

function showCard(card) {
  const back = card.querySelector(".card-back");
  const image = card.querySelector("img");

  card.classList.add("flipped");
  back.style.display = "none";
  image.style.display = "block";
}

function hideCard(card) {
  const back = card.querySelector(".card-back");
  const image = card.querySelector("img");

  card.classList.remove("flipped");
  image.style.display = "none";
  back.style.display = "block";
}

function checkWin() {
  const allCards = document.querySelectorAll(".card");
  const foundCards = document.querySelectorAll(".card.found");

  if (allCards.length === foundCards.length) {
    stopTimer();
    saveScore();

    setTimeout(() => {
      alert(`Bravo ${currentPlayerName}, tu as gagné en ${moves} coups !`);

      gameScreen.classList.remove("active");
      setupScreen.classList.add("active");

      displayGeneralRanking();
    }, 300);
  }
}

function displayRanking() {
  const scores = getScores();

  const scoresForCurrentLevel = scores
    .filter((score) => score.level === currentLevel)
    .sort((a, b) => a.moves - b.moves)
    .slice(0, 10);

  rankingPanel.style.display = "block";

  if (scoresForCurrentLevel.length === 0) {
    rankingList.innerHTML = "<p>Aucun score pour ce niveau.</p>";
    return;
  }

  let tableHTML = `
    <p>Classement pour le niveau ${currentLevel} cartes</p>

    <table>
      <thead>
        <tr>
          <th>Rang</th>
          <th>Nom</th>
          <th>Coups</th>
          <th>Temps</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
  `;

  scoresForCurrentLevel.forEach((score, index) => {
    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${score.player}</td>
        <td>${score.moves}</td>
        <td>${formatTime(score.time)}</td>
        <td>${score.date}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  rankingList.innerHTML = tableHTML;
}

function displayGeneralRanking() {
  const scores = getScores();

  generalRankingPanel.style.display = "block";

  if (scores.length === 0) {
    generalRankingList.innerHTML = "<p>Aucun score enregistré pour le moment.</p>";
    return;
  }

  const levels = [4, 8, 12, 16, 20];

  let html = `<div class="ranking-tables">`;

  levels.forEach((level) => {
    const scoresForLevel = scores
      .filter((score) => score.level === level)
      .sort((a, b) => {
        if (a.moves !== b.moves) {
          return a.moves - b.moves;
        }

        return (a.time || 0) - (b.time || 0);
      })
      .slice(0, 5);

    html += `
      <div class="ranking-table-box">
        <h4>${level} cartes</h4>
    `;

    if (scoresForLevel.length === 0) {
      html += `<p>Aucun score.</p>`;
    } else {
      html += `
        <table>
          <thead>
            <tr>
              <th>Rang</th>
              <th>Nom</th>
              <th>Coups</th>
              <th>Temps</th>
            </tr>
          </thead>
          <tbody>
      `;

      scoresForLevel.forEach((score, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${score.player}</td>
            <td>${score.moves}</td>
            <td>${score.time !== undefined ? formatTime(score.time) : "-"}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    }

    html += `</div>`;
  });

  html += `</div>`;

  generalRankingList.innerHTML = html;
}

function displayImageLibrary() {
  const imageLibraryContainer = document.getElementById("image-library");

  if (!imageLibraryContainer) {
    return;
  }

  imageLibraryContainer.innerHTML = "";

  imageLibrary.forEach((image) => {
    const label = document.createElement("label");
    label.className = "image-option";

    label.innerHTML = `
      <input type="checkbox" value="${image.id}">
      <img src="${image.src}" alt="${image.name}">
      <span>${image.name}</span>
    `;

    imageLibraryContainer.appendChild(label);
  });
}

function startTimer() {
  stopTimer();

  seconds = 0;
  timerDisplay.textContent = "Temps : 00:00";

  timerInterval = setInterval(() => {
    seconds++;
    timerDisplay.textContent = `Temps : ${formatTime(seconds)}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function resetRankingAfterFiveDays() {
  const rankingStartDate = localStorage.getItem("memoryRankingStartDate");
  const now = Date.now();

  if (!rankingStartDate) {
    localStorage.setItem("memoryRankingStartDate", now);
    return;
  }

  const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;
  const timePassed = now - Number(rankingStartDate);

  if (timePassed >= fiveDaysInMilliseconds) {
    localStorage.removeItem("memoryScores");
    localStorage.setItem("memoryRankingStartDate", now);
  }
}

adminResetButton.addEventListener("click", () => {
  const code = prompt("Code administrateur :");

  if (code === null) {
    return;
  }

  if (code === "0606") {
    const confirmation = confirm("Confirmer la remise à zéro de tous les classements ?");

    if (confirmation) {
      localStorage.removeItem("memoryScores");
      localStorage.setItem("memoryRankingStartDate", Date.now());

      alert("Tous les classements ont été remis à zéro.");

      displayGeneralRanking();
    }
  } else {
    alert("Code incorrect.");
  }
});

resetRankingAfterFiveDays();
displayImageLibrary();
