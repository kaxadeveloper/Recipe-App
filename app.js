const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById('close-popup');
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

// Initial Load
getRandomMeal();
fetchFavMeals();

// Get a random meal
async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

// Get meal by ID
async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();
    return respData.meals[0];
}

// Search meals
async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const data = await resp.json();
    return data.meals;
}

// Add meal to the main list
function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ''}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector('.fav-btn');

    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove('active');
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add('active');
        }

        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

// Add meal to Local Storage
function addMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

// Remove meal from Local Storage
function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

// Get meals from Local Storage
function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

// Fetch and display favorite meals
async function fetchFavMeals() {
    favoriteContainer.innerHTML = "";
    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);
        addMealFav(meal);
    }
}

// Add meal to favorites list
function addMealFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');

    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

// Show meal details in popup
function showMealInfo(mealData) {
    mealInfoEl.innerHTML = '';

    const mealEl = document.createElement('div');
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        if (mealData[`strIngredient${i}`]) {
            ingredients.push(
                `${mealData[`strIngredient${i}`]} - ${mealData[`strMeasure${i}`]}`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);
    mealPopup.classList.remove('hidden');
}

// Close popup
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
});

// Search functionality
searchBtn.addEventListener("click", async () => {
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});





