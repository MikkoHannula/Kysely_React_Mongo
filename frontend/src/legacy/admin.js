// User role and session check
const userRole = sessionStorage.getItem('userRole');
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
} else if (userRole !== 'admin') {
    document.querySelector('[data-tab="users"]').style.display = 'none';
    document.getElementById('users').style.display = 'none';
}

// Ota data localStorage:sta tai käytä mock dataa
let questions = JSON.parse(localStorage.getItem('questions')) || mockQuestions;
let categories = JSON.parse(localStorage.getItem('categories')) || mockCategories;
let results = JSON.parse(localStorage.getItem('results')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, username: 'Pasi', password: 'Taitaja25!', role: 'admin' }
];

// Tuo vanha kysymysdata, jos se on olemassa
function migrateResultsCategoryId() {
    let results = JSON.parse(localStorage.getItem('results')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || mockCategories;
    let updated = false;
    results.forEach(result => {
        if (!result.categoryId && result.category) {
            const cat = categories.find(c => c.name === result.category);
            if (cat) {
                result.categoryId = cat.id;
                updated = true;
            }
        }
    });
    if (updated) {
        localStorage.setItem('results', JSON.stringify(results));
    }
}

// Sivujen hallinta
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Kysymysten lataus ja näyttäminen
function loadQuestions() {
    const questionList = document.getElementById('questionList');
    
    // Tee osio jokaiselle kategorialle
    questionList.innerHTML = categories.map(category => {
        // Hae kysymykset kategoriasta
        // Jos kysymyksiä ei ole, palauta tyhjää
        const categoryQuestions = questions[category.id] || [];
        
        // Näytä kategoria vain, jos siinä on kysymyksiä
        // Jos kysymyksiä ei ole, palauta tyhjää
        if (categoryQuestions.length === 0) return '';
        return `
            <div class="category-section">
                <div class="category-header" onclick="toggleCategory(${category.id})">
                    <div class="header-content">
                        <span class="folder-icon">📁</span>
                        <h2>${category.name}</h2>
                        <span class="question-count">(${categoryQuestions.length} kysymystä)</span>
                    </div>
                </div>
                <div class="questions-grid" id="category-${category.id}">
                    ${categoryQuestions.map((question, index) => `
                        <div class="question-item">
                            <h3>${question.question}</h3>
                            <div class="options">
                                ${question.options.map((option, optIndex) => `
                                    <div class="option ${optIndex === question.correctAnswer ? 'correct' : ''}">
                                        ${option}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="question-actions">
                                <button class="btn-secondary" onclick="editQuestion(${category.id},${index})">Muokkaa</button>
                                <button class="btn-danger" onclick="deleteQuestion(${category.id},${index})">Poista</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Lisää tyylit kysymysosioille
    // Varmista, että tyylit lisätään vain kerran
    if (!document.getElementById('categoryStyles')) {
        const style = document.createElement('style');
        style.id = 'categoryStyles';
        style.textContent = `
            .category-section { margin-bottom: 1rem; background: var(--container-bg); border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid var(--border-color); overflow: hidden; }
            .category-header { padding: 1.25rem 1.5rem; cursor: pointer; transition: all 0.3s ease; background: var(--card-bg); border-bottom: 1px solid var(--border-color); }
            .category-header:hover { background-color: var(--hover-color); }
            .header-content { display: flex; align-items: center; gap: 1rem; }
            .folder-icon { font-size: 1.5rem; transition: transform 0.3s ease; }
            .category-header.open .folder-icon { transform: rotate(-5deg); }
            .question-count { color: #6b7280; font-size: 0.9rem; font-weight: 500; }
            .category-header h2 { color: var(--primary-color); margin: 0; flex-grow: 1; font-size: 1.25rem; }
            .questions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; padding: 1.5rem; border-top: 1px solid var(--border-color); opacity: 0; max-height: 80px; overflow-y: auto; transition: all 0.3s ease; }
            .questions-grid.open { opacity: 1; max-height: 1200px; }
            .question-item { background: var(--background-color); padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--border-color); transition: all 0.2s ease; }
            .question-item:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .question-item h3 { font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-color); }
            .options { margin-bottom: 1.25rem; }
            .option { padding: 0.75rem; margin: 0.5rem 0; border-radius: 0.5rem; background: white; border: 1px solid var(--border-color); transition: all 0.2s ease; }
            .option.correct { background: #ecfdf5; border-color: var(--primary-color); color: var(--secondary-color); }
            .question-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
            .question-actions button { flex: 1; }
            .btn-danger { background-color: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
            .btn-danger:hover { background-color: #fecaca; }
        `;
        document.head.appendChild(style);
    }
}

// Päivitä kysymysosion tilat
// Kun käyttäjä klikkaa kategoriaotsikkoa
function toggleCategory(categoryId) {
    const questionsGrid = document.getElementById(`category-${categoryId}`);
    const categoryHeader = questionsGrid.previousElementSibling;
    const isHidden = !questionsGrid.classList.contains('open');
    
    // Gridin ja otsikon tilan päivitys
    questionsGrid.classList.toggle('open');
    categoryHeader.classList.toggle('open');
    
    // päivitä kysymysosion ikoni
    // Jos kysymysosio on piilotettu, näytä kansi-ikoni
    const folderIcon = categoryHeader.querySelector('.folder-icon');
    folderIcon.textContent = isHidden ? '📂' : '📁';
}

function addQuestion() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kysymys</h2>
            <form id="questionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}">${cat.name}</option>
                        `).join('')}
                    </select>
                    <div id="questionCountInfo" style="font-size:0.95rem; margin-top:0.5rem;"></div>
                </div>
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" required>
                </div>
                ${Array.from({length: 4}, (_, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${Array.from({length: 4}, (_, i) => `
                            <option value="${i}">Vaihtoehto ${i + 1}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Näytä kysymysosion kysymysten määrä
    // Kun käyttäjä valitsee kategorian
    function updateQuestionCountInfo() {
        const catId = document.getElementById('category').value;
        const count = (questions[catId] || []).length;
        const info = document.getElementById('questionCountInfo');
        if (count < 5) {
            info.textContent = `Tässä kategoriassa on nyt ${count} kysymystä. Kategoria tulee pelattavaksi, kun kysymyksiä on vähintään 5.`;
            info.style.color = '#ef4444';
        } else {
            info.textContent = '';
        }
    }
    document.getElementById('category').addEventListener('change', updateQuestionCountInfo);
    updateQuestionCountInfo();

    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('category').value;
        const newQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        if (!questions[categoryId]) {
            questions[categoryId] = [];
        }
        questions[categoryId].push(newQuestion);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        // Scrollaa kysymysosion loppuun
        // Kun kysymys on lisätty
        setTimeout(() => {
            const grid = document.getElementById(`category-${categoryId}`);
            if (grid) {
                grid.scrollTop = grid.scrollHeight;
            }
        }, 100);
        closeModal();
    });
}

function editQuestion(categoryId, index) {
    const question = questions[categoryId][index];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kysymystä</h2>
            <form id="editQuestionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${cat.id === parseInt(categoryId) ? 'selected' : ''}>
                                ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" value="${question.question}" required>
                </div>
                ${question.options.map((option, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" value="${option}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${question.options.map((_, i) => `
                            <option value="${i}" ${i === question.correctAnswer ? 'selected' : ''}>
                                Vaihtoehto ${i + 1}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editQuestionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategoryId = document.getElementById('category').value;
        const updatedQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        // Poista kysymys vanhasta kategoriasta
        questions[categoryId].splice(index, 1);
        
        // lisää kysymys uuteen kategoriaan
        if (!questions[newCategoryId]) {
            questions[newCategoryId] = [];
        }
        questions[newCategoryId].push(updatedQuestion);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        closeModal();
    });
}

function deleteQuestion(categoryId, index) {
    if (confirm('Haluatko varmasti poistaa tämän kysymyksen?')) {
        questions[categoryId].splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }
}

// Kategoriat ja niiden hallinta
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => `
        <div class="category-item">
            <h3>${category.name}</h3>
            <div class="category-actions">
                <button class="btn-secondary" onclick="editCategory(${category.id})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteCategory(${category.id})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addCategory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kategoria</h2>
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" required>
                </div>
                <div style="color:#ef4444; font-size:0.95rem; margin-bottom:1rem;">
                    Kategoria tulee pelattavaksi vasta, kun siihen on lisätty vähintään 5 kysymystä.
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategory = {
            id: categories.length + 1,
            name: document.getElementById('categoryName').value
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        // Jos kysymysten lisäys on käytössä, päivitetään kysymysosion valikko
        const questionCategorySelect = document.querySelector('.modal-content #category');
        if (questionCategorySelect) {
            questionCategorySelect.innerHTML = categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
            `).join('');
        }
        closeModal();
    });
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kategoriaa</h2>
            <form id="editCategoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" value="${category.name}" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories[index].name = document.getElementById('categoryName').value;
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
            closeModal();
        }
    });
}

function deleteCategory(categoryId) {
    if (confirm('Haluatko varmasti poistaa tämän kategorian? Kaikki kategorian kysymykset poistetaan myös.')) {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories.splice(index, 1);
            delete questions[categoryId];
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('questions', JSON.stringify(questions));
            loadCategories();
            loadQuestions();
        }
    }
}

// Käyttäjien hallinta
function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
        <div class="category-item">
            <div>
                <h3>${user.username}</h3>
                <span class="user-role">${user.role}</span>
            </div>
            <div class="category-actions">
                <button class="btn-secondary" onclick="editUser(${user.id})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteUser(${user.id})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addUser() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi käyttäjä</h2>
            <form id="userForm">
                <div class="form-group">
                    <label for="username">Käyttäjätunnus</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Salasana</label>
                    <div class="password-container">
                        <input type="password" id="password" required>
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('password')">
                            👁️
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="role">Rooli</label>
                    <select id="role" required>
                        <option value="teacher">Opettaja</option>
                        <option value="admin">Ylläpitäjä</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('userForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newUser = {
            id: users.length + 1,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        // --- Lisää opettaja opettajalistaan, jos taso on opettaja ---
        if (newUser.role === 'teacher') {
            let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
            teachers.push({ id: newUser.id, name: newUser.username });
            localStorage.setItem('teachers', JSON.stringify(teachers));
        }
        closeModal();
    });
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa käyttäjää</h2>
            <form id="editUserForm">
                <div class="form-group">
                    <label for="username">Käyttäjätunnus</label>
                    <input type="text" id="username" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="password">Salasana</label>
                    <div class="password-container">
                        <input type="password" id="password">
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('password')">
                            👁️
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="role">Rooli</label>
                    <select id="role" required>
                        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Opettaja</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Ylläpitäjä</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const password = document.getElementById('password').value;
            users[index] = {
                ...users[index],
                username: document.getElementById('username').value,
                role: document.getElementById('role').value
            };
            if (password) {
                users[index].password = password;
            }
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
            closeModal();
        }
    });
}

function deleteUser(userId) {
    if (users.length === 1) {
        alert('Et voi poistaa viimeistä käyttäjää!');
        return;
    }

    if (confirm('Haluatko varmasti poistaa tämän käyttäjän?')) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
        }
    }
}

// Pelin tulosten tallennus
function saveGameResult(playerName, category, score, total) {
    const result = {
        name: playerName,
        category: category,
        score: `${score}/${total}`,
        date: new Date().toISOString().split('T')[0]
    };
    results.push(result);
    localStorage.setItem('results', JSON.stringify(results));
    loadResults();
}

// Etsi filteröityjä tuloksia
let defaultSort = 'date';
let currentCategoryFilter = 'all';

// Tulosten lataus ja näyttäminen
function loadResults() {
    const resultsContent = document.getElementById('results');
    resultsContent.innerHTML = '';

    // Järjestysnappien avittaja
    function createSortButtons(sectionId, onSort) {
        const div = document.createElement('div');
        div.className = 'sort-buttons';
        div.innerHTML = `
            <button class="btn-secondary" onclick="window.sortCategoryResults('${sectionId}', 'score')">Järjestä pisteiden mukaan</button>
            <button class="btn-secondary" onclick="window.sortCategoryResults('${sectionId}', 'date')">Järjestä päivämäärän mukaan</button>
        `;
        return div;
    }

    // Tallenna tulosten järjestys
    // Jos ei ole vielä tallennettu, luo uusi objekti
    if (!window.categorySortStates) window.categorySortStates = {};

    // Kaikki kategoriat (all results)
    const allSectionId = 'all';
    window.categorySortStates[allSectionId] = window.categorySortStates[allSectionId] || { sort: 'date' };
    const allSection = document.createElement('section');
    allSection.innerHTML = `
        <button class="accordion-btn" type="button" onclick="window.toggleAccordion('${allSectionId}')">Kaikki kategoriat</button>
        <div class="accordion-content" id="accordion-${allSectionId}" style="display:block;">
            <div id="sortBtns-${allSectionId}"></div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Käyttäjä</th>
                        <th>Kategoria</th>
                        <th>Pisteet</th>
                        <th>Päivämäärä</th>
                    </tr>
                </thead>
                <tbody id="resultsTableBodyAll"></tbody>
            </table>
        </div>
    `;
    resultsContent.appendChild(allSection);
    document.getElementById(`sortBtns-${allSectionId}`).appendChild(createSortButtons(allSectionId));
    displayResults(sortResultsArray(results, window.categorySortStates[allSectionId].sort), 'resultsTableBodyAll');

    // Jokainen kategoria erikseen
    categories.forEach(cat => {
        const sectionId = `cat${cat.id}`;
        window.categorySortStates[sectionId] = window.categorySortStates[sectionId] || { sort: 'date' };
        const catSection = document.createElement('section');
        catSection.innerHTML = `
            <button class="accordion-btn" type="button" onclick="window.toggleAccordion('${sectionId}')">${cat.name}</button>
            <div class="accordion-content" id="accordion-${sectionId}" style="display:none;">
                <div id="sortBtns-${sectionId}"></div>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Käyttäjä</th>
                            <th>Pisteet</th>
                            <th>Päivämäärä</th>
                        </tr>
                    </thead>
                    <tbody id="resultsTableBodyCat${cat.id}"></tbody>
                </table>
            </div>
        `;
        resultsContent.appendChild(catSection);
        document.getElementById(`sortBtns-${sectionId}`).appendChild(createSortButtons(sectionId));
        const catResults = results.filter(r => r.categoryId === cat.id);
        displayResults(sortResultsArray(catResults, window.categorySortStates[sectionId].sort), `resultsTableBodyCat${cat.id}`, false);
    });
}

// Haitari ja sen toiminta
// Näytä tai piilota kysymysosion sisältö
window.toggleAccordion = function(sectionId) {
    const content = document.getElementById(`accordion-${sectionId}`);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
};

window.sortCategoryResults = function(sectionId, sortType) {
    window.categorySortStates[sectionId].sort = sortType;
    if (sectionId === 'all') {
        displayResults(sortResultsArray(results, sortType), 'resultsTableBodyAll');
    } else {
        const catId = parseInt(sectionId.replace('cat', ''));
        const catResults = results.filter(r => r.categoryId === catId);
        displayResults(sortResultsArray(catResults, sortType), `resultsTableBodyCat${catId}`, false);
    }
};

function displayResults(resultsToDisplay, tbodyId, showCategory = true) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = resultsToDisplay.map(result => `
        <tr>
            <td>${result.name}</td>
            ${showCategory ? `<td>${result.category}</td>` : ''}
            <td>${result.score}</td>
            <td>${result.date}</td>
        </tr>
    `).join('');
}

function filterResultsByCategory(categoryId, sortBy = defaultSort) {
    currentCategoryFilter = categoryId;
    let filteredResults = categoryId === 'all' 
        ? results 
        : results.filter(r => r.categoryId === categoryId);
    if (sortBy) {
        filteredResults = sortResultsArray(filteredResults, sortBy);
    }
    displayResults(filteredResults);
}

function sortResults(criteria) {
    defaultSort = criteria;
    filterResultsByCategory(currentCategoryFilter, criteria);
}

function sortResultsArray(resultsArray, criteria) {
    let sortedResults = [...resultsArray];
    if (criteria === 'score') {
        sortedResults.sort((a, b) => {
            const aScore = typeof a.score === 'string' ? parseInt(a.score) : a.score;
            const bScore = typeof b.score === 'string' ? parseInt(b.score) : b.score;
            return bScore - aScore;
        });
    } else if (criteria === 'date') {
        sortedResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sortedResults;
}

// Aputoiminnallisuuksia
function closeModal() {
    document.querySelector('.modal').remove();
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

// Accordion CSS
if (!document.getElementById('accordionStyles')) {
    const style = document.createElement('style');
    style.id = 'accordionStyles';
    style.textContent = `
        .accordion-btn { width: 100%; text-align: left; padding: 1rem; font-size: 1.1rem; background: #f1f5f9; border: none; border-bottom: 1px solid #e5e7eb; cursor: pointer; outline: none; transition: background 0.2s; }
        .accordion-btn:hover { background: #e2e8f0; }
        .accordion-content { padding: 1rem 0; background: white; }
    `;
    document.head.appendChild(style);
}

// Admin paneelin lataus
document.addEventListener('DOMContentLoaded', () => {
    migrateResultsCategoryId();

    // Näytä opettajan nimi
    // Kun käyttäjä kirjautuu sisään
    const teacherName = sessionStorage.getItem('teacherName');
    document.getElementById('teacherName').textContent = teacherName;

    // Lisää uloskirjautumisnappi
    // Kun käyttäjä on kirjautunut sisään
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('teacherName');
        window.location.href = 'login.html';
    });

    loadQuestions();
    loadCategories();
    loadResults();
    loadUsers();

    // Lisää event listenerit lisäysnappeihin
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('addUserBtn').addEventListener('click', addUser);
});