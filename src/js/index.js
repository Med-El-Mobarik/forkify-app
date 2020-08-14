import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listViews';
import * as likesView from './views/likesView';
import { elements, renderloader, clearloader } from './views/base';

const state = {};

/**
 *Search Controller 
**/
const controlsearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput(); 

    if (query) {
        // 2) New search object 
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearinput();
        searchView.clearResults();
        renderloader(elements.searchRes);

        // 4) Search for recipes 
        await state.search.getResults();

        // 5) Render results on UI 
        clearloader();
        searchView.renderResults(state.search.result);
    }
};

elements.searchForm.addEventListener ('submit', e => {
    e.preventDefault();
    controlsearch();
});

elements.searchRespages.addEventListener('click', e => {
    // console.log(e);
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage); 
    }
});

/**
 *Recipe Controller 
**/
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {

        elements.shopping.innerHTML = '';
        recipeView.clearRecipe();
        renderloader(elements.recipe);

        if(state.search) searchView.highlightSelected(id);

        state.recipe = new Recipe(id);

        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            clearloader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        }catch (err) {
            alert(err);
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//List controller

const controlList = () => {
    if(!state.list) state.list = new List();
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
};

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }else if ('.shopping__count-value') {
        const val = parseFloat(e.target.value , 10);
        state.list.updateCount(id, val);
    }
})

const controlLike = () => {

    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if(!state.likes.isLiked(currentID)) {
        const newlike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newlike);
        
    }else {
        state.likes.deleteLike(currentID);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsingredients(state.recipe);
        }
    }else if (e.target.matches('.btn-increase, .btn-increase *')) {
        if(state.recipe.servings < 25){
            state.recipe.updateServings('inc');
            recipeView.updateServingsingredients(state.recipe);           
        }
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        elements.shopping.innerHTML = '';
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});





























// URl : forkify-api.herokuapp.com
// search example : https://forkify-api.herokuapp.com/api/search?q=pizza
// Example get : https://forkify-api.herokuapp.com/api/get?rId=47746