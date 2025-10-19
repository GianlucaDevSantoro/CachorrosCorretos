const API_URL = "https://api.thedogapi.com/v1/breeds";
const API_SEARCH_URL = "https://api.thedogapi.com/v1/breeds/search?q=";
const API_KEY = "live_nPkHZKWb1welWFepXqWvmZoKi8O78uXpLY2YeM4A5qS6C5T8Q4exkzpRxDlaBZmV";

const headers = new Headers({
  "Content-Type": "application/json",
  "x-api-key": API_KEY
});

const appState = {
  allBreeds: [],
  currentBreeds: [],
  currentDogIndex: 0,
  isEasterEggActive: false,
};

function showDashboardNotification(message, type = 'error') {
    const container = document.getElementById('dashboard-notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function showLoader() {
    uiElements.catalog.innerHTML = '<div class="loader"></div>';
    uiElements.listViewContainer.innerHTML = '<div class="loader"></div>';
}

async function fetchAllBreeds() {
  showLoader();
  try {
    const response = await fetch(API_URL, { method: "GET", headers });
    if (!response.ok) throw new Error('Falha ao buscar as raças.');
    const breeds = await response.json();
    appState.isEasterEggActive = false;
    appState.allBreeds = breeds;
    appState.currentBreeds = appState.allBreeds;
    renderLayout();
  } catch (error) {
    showDashboardNotification(error.message);
    uiElements.catalog.innerHTML = `<p>${error.message}</p>`;
  }
}

async function searchBreeds(query) {
  showLoader();
  try {
    const response = await fetch(`${API_SEARCH_URL}${query}`, { method: "GET", headers });
    if (!response.ok) throw new Error('Nenhuma raça encontrada.');
    if (appState.isEasterEggActive) return;
    const breeds = await response.json();

    const breedIds = breeds.map(b => b.id).join(',');
    let images = [];
    if (breedIds) {
        const imgResponse = await fetch(`https://api.thedogapi.com/v1/images/search?breed_ids=${breedIds}&limit=${breeds.length}`, { headers });
        images = await imgResponse.json();
    }

    const imagesMap = new Map(images.map(img => [img.breeds[0].id, img]));

    const detailedBreeds = breeds.map(breed => ({...breed, 
        image: imagesMap.get(breed.id) || { url: "https://via.placeholder.com/250" }}));
    appState.currentBreeds = detailedBreeds;
    appState.currentDogIndex = 0;
    renderLayout();
  } catch (error) {
    showDashboardNotification(error.message);
    const layout = localStorage.getItem('dog-layout') || 'grid-4';
    if (layout === 'list-view') {
        uiElements.listViewContainer.innerHTML = `<p>${error.message}</p>`;
        uiElements.catalog.innerHTML = '';
    } else {
        uiElements.catalog.innerHTML = `<p>${error.message}</p>`;
    }
  }
}

function renderLayout() {
    const layout = localStorage.getItem('dog-layout') || 'grid-4';
    if (layout === 'list-view') {
        renderListView();
    } else {
        renderGridView();
    }
}

function renderGridView() {
    const { catalog, listViewContainer } = uiElements;
    listViewContainer.classList.remove('list-view-active');
    listViewContainer.innerHTML = '';
    catalog.className = 'catalog-grid'; // Reset classes
    catalog.classList.add(localStorage.getItem('dog-layout') || 'grid-4');

    if (!appState.currentBreeds || appState.currentBreeds.length === 0) {
        catalog.innerHTML = "<p>Nenhuma raça encontrada.</p>";
        return;
    }

    catalog.innerHTML = '';
    appState.currentBreeds.forEach(dog => {
        const card = createDogCard(dog);
        catalog.appendChild(card);
    });
}

function renderListView() {
    const { catalog, listViewContainer } = uiElements;
    catalog.innerHTML = '';
    catalog.classList.remove('easter-egg-active');
    catalog.classList.add('list-view-active');
    listViewContainer.classList.add('list-view-active');
    listViewContainer.innerHTML = '';

    if (!appState.currentBreeds || appState.currentBreeds.length === 0) {
        listViewContainer.innerHTML = "<p>Nenhum cãopanheiro encontrado.</p>";
        return;
    }

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.className = 'nav-arrow'; 
    prevButton.onclick = () => navigateDog(-1);

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.className = 'nav-arrow'; 
    nextButton.onclick = () => navigateDog(1);

    const cardContainer = document.createElement('div');
    listViewContainer.append(prevButton, cardContainer, nextButton);
    displaySingleDog(cardContainer);
}
function renderEasterEgg() {
  const { catalog, listViewContainer } = uiElements;
  listViewContainer.classList.remove('list-view-active');
  listViewContainer.innerHTML = "";
  catalog.classList.remove('list-view-active');
  catalog.classList.add('easter-egg-active');
  appState.isEasterEggActive = true;
  document.body.classList.add('easter-egg-background');
  catalog.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("dog-card");
  card.innerHTML = `
    <img src="../img/perritofeliz.png" alt="perro culiao">
    <h3>perro culiao</h3>
  `;
  catalog.appendChild(card);
}

function createDogCard(dog) {
    const card = document.createElement("div");
    card.className = "dog-card";
    card.dataset.dogId = dog.id;

    const imageUrl = dog.image?.url || "https://via.placeholder.com/250";
    card.innerHTML = `
      <img src="${imageUrl}" alt="${dog.name}">
      <h3><i class="fas fa-paw"></i> ${dog.name}</h3>
      <p><strong>Temperamento:</strong> ${dog.temperament || "Desconhecido"}</p>
      <p><strong>Tempo de vida:</strong> ${dog.life_span || "Não informado"}</p>
    `;
    return card;
}

function displaySingleDog(container) {
    container.innerHTML = '';
    const dog = appState.currentBreeds[appState.currentDogIndex];
    if (!dog) return;
    const card = createDogCard(dog);
    container.appendChild(card);
}

function navigateDog(direction) {
    const newIndex = appState.currentDogIndex + direction;
    if (newIndex >= 0 && newIndex < appState.currentBreeds.length) {
        appState.currentDogIndex = newIndex;
    } else if (newIndex < 0) {
        appState.currentDogIndex = appState.currentBreeds.length - 1;
    } else {
        appState.currentDogIndex = 0;
    }
    displaySingleDog(document.querySelector('.list-view-container > div'));
}

function openModal(dogId) {
    const dog = appState.allBreeds.find(d => d.id === dogId) || appState.currentBreeds.find(d => d.id === dogId);
    if (!dog) return;

    uiElements.modalContent.innerHTML = `
        <h2><i class="fas fa-paw"></i> ${dog.name}</h2>
        <p><strong>Origem:</strong> ${dog.origin || 'Não informada'}</p>
        <p><strong>Grupo de raça:</strong> ${dog.breed_group || 'Não informado'}</p>
        <p><strong>Criado para:</strong> ${dog.bred_for || 'Não informado'}</p>
        <p><strong>Temperamento:</strong> ${dog.temperament || 'Desconhecido'}</p>
        <p><strong>Tempo de vida:</strong> ${dog.life_span || 'Não informado'}</p>
    `;

    uiElements.modal.classList.remove('hidden');
    uiElements.backdrop.classList.remove('hidden');
}

function closeModal() {
    uiElements.modal.classList.add('hidden');
    uiElements.backdrop.classList.add('hidden');
}

const uiElements = {
    welcomeMessage: document.getElementById("welcome-message"),
    searchInput: document.getElementById("searchInput"),
    catalog: document.getElementById("dogCatalog"),
    listViewContainer: document.getElementById('list-view-container'),
    modal: document.getElementById('dog-modal'),
    backdrop: document.getElementById('modal-backdrop'),
    modalContent: document.getElementById('modal-content'),
    closeModalBtn: document.getElementById('close-modal'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsMenu: document.getElementById('settings-menu'),
    logoutButton: document.getElementById("logout-button"),
    layoutButtons: document.querySelectorAll('.layout-btn'),
};

function initModal() {
    uiElements.closeModalBtn.addEventListener('click', closeModal);
    uiElements.backdrop.addEventListener('click', closeModal);
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.dog-card');
        if (card && card.dataset.dogId) {
            openModal(parseInt(card.dataset.dogId));
        }
    });
}

function initSettings(currentUser) {
    if (uiElements.welcomeMessage) {
        uiElements.welcomeMessage.textContent = `Bem-vindo, ${currentUser.name} ${currentUser.lastname}`;
    }

    uiElements.logoutButton?.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.add("fade-out");
        setTimeout(() => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        }, 300);
    });

    uiElements.settingsToggle.addEventListener('click', () => {
        uiElements.settingsMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!uiElements.settingsMenu.contains(e.target) && !uiElements.settingsToggle.contains(e.target)) {
            uiElements.settingsMenu.classList.add('hidden');
        }
    });
}

function initLayoutControls() {
  const savedLayout = localStorage.getItem('dog-layout') || 'grid-4';
  uiElements.catalog.classList.add(savedLayout);
  document.querySelector(`.layout-btn[data-layout="${savedLayout}"]`)?.classList.add('active');

  uiElements.layoutButtons.forEach(button => {
      button.addEventListener('click', () => {
          const layout = button.dataset.layout;
          localStorage.setItem('dog-layout', layout);

          uiElements.layoutButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          renderLayout();
      });
  });
}

function initSearch() {
    let debounceTimer;
    uiElements.searchInput?.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.toLowerCase() === "surpresa") {
            renderEasterEgg();
            return;
        }

        debounceTimer = setTimeout(() => {
            document.body.classList.remove('easter-egg-background');
            if (query.length > 1) {
                appState.currentDogIndex = 0;
                searchBreeds(query);
            } else if (query.length === 0) {
                appState.currentBreeds = appState.allBreeds;
                appState.isEasterEggActive = false;
                document.body.classList.remove('easter-egg-background');
                renderLayout();
            }
        }, 300);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    initSettings(currentUser);
    initLayoutControls();
    initModal();
    initSearch();

    fetchAllBreeds();
});
