//TODO: End refactor, end documentation, finalize footer, add loading screen, correct visual bugs

/** Class representing a Pokémon */
class Pokemon {
    /**
     * Create a Pokémon
     * @param    {int} id - The number that represents the Pokémon on the Pokédex
     * @param   {name} name - The name of the Pokémon
     * @param {string} sprite - The link to the Pokémon sprite
     * @param {Object} stats - All of the Pokémon stats
     */
    constructor(id, name, sprite, stats, types){
        this.id     = id;
        this.name   = name;
        this.sprite = sprite;
        this.stats  = stats;
        this.types  = types
    };
};

// ======================================== VARIABLES ========================================
/**
     * Stores all Pokémon of the pokédex
     * @type {Pokemon[]}
     */
var all_pokemon = [];

/**
 * Initial index to look of the Pokedéx
 * @type {int}
 */
var start_index = 1;

/**
 * Last index to look of the Pokedéx
 * @type {int}
 */
var final_index = 151;

/**
 * Current image being displayed
 * @type {int}
 */
var current_page = 1;

/**
 * The maximum value a pokémon status can be
 * @type {int}
 */
const max_stat_value = 255;
// ===========================================================================================

// ======================================== ELEMENTS =========================================
/**
 * Search bar
 * @type {HTMLInputElement}
 */
const search_bar = document.getElementById('search');

/**
 * Region selector element
 * @type {HTMLSelectElement}
 */
let pokedex_selector = document.getElementById('region');

/**
 * The left arrow element
 * @type {HTMLDivElement}
*/
const leftArrow = document.querySelector('.left-arrow');

/**
 * The right arrow element
 * @type {HTMLDivElement}
 */
const rightArrow = document.querySelector('.right-arrow');

/**
 * The loading screen
 * @type {HTMLDivElement}
 */
const loading = document.querySelector('.loading');

/**
 * Array with all the pages currently rendered on the pokédex
 * @type {HTMLDivElement}
 */
var pokedex_pages = [];

/**
 * The pokedex slider container
 * @type {HTMLDivElement}
 */
const pokedex_slider = document.querySelector('.pokedex-slider');
// ===========================================================================================

// ======================================== FUNCTIONS ========================================

/**
 * Capitalizes the first letter of a word
 * 
 * @function capitalize
 * @param   {string} word - The word to be capitalized
 * @returns {string} Word with the first letter capitalized
 */
function capitalize(word) {
    word = word.replace(/\-[a-z]/g, match => match.toUpperCase()).replace('-', ' ');
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Transforms a Pokémon id to the format #XXX
 * @param      {int} id - The nid to be formatted 
 * @returns {string} Id in format #XXX
 */
function formatId(id) {
    if (id < 10)
        return `#00${id}`;
    else if (id < 100)
        return `#0${id}`;
    return `#${id}`;
}

/**
 * Gets the current search bar value
 * @returns {string} Value of the search bar
 */
function getFilter() {
    return search_bar.value;
}

/**
 * Set the search bar input event listener
 */
function setSearchBarEventListener() {
    //Resets the search bar value
    search_bar.value = '';

    //Every time input is changed, render the pokedex with the due filter applied
    search_bar.addEventListener('input', () => {
        renderPokedex(!(getFilter() == ''));
    });
}

/**
 * Set the pokémon cards fronts and backs event listeners to make the turn effect
 */
async function setCardsEventListeners() {

    try {
        /**
             * Array of pokémon cards fronts
             * @type {HTMLDivElement[]}
             */
        let pokemon_cards_fronts = document.querySelectorAll('.pokemon-front');

        /**
         * Array of pokémon cards backs
         * @type {HTMLDivElement[]}
         */
        let pokemon_cards_backs = document.querySelectorAll('.pokemon-back');

        pokemon_cards_fronts.forEach((card, index) => {
            card.addEventListener('click', () => {
                card.classList.add('unturned');
                card.classList.remove('turned');
                pokemon_cards_backs[index].classList.add('turned');
                pokemon_cards_backs[index].classList.remove('unturned');
            });
        });

        pokemon_cards_backs.forEach((card, index) => {
            card.addEventListener('click', () => {
                card.classList.add('unturned');
                card.classList.remove('turned');
                pokemon_cards_fronts[index].classList.add('turned');
                pokemon_cards_fronts[index].classList.remove('unturned');
            });
        });
    } catch (e) {
        console.error(e);
    };

}

/**
 * Sets
 */
async function setNameScrollings() {

    let names = document.querySelectorAll('.pokemon-name');

    names.forEach((name) => {
        if (name.clientWidth < name.scrollWidth)
            name.classList.add('scroll-name');
    });
}

/**
 * Makes the arrows unclickable
 */
function disbaleArrows() {
    rightArrow.style.pointerEvents = 'none';
    leftArrow.style.pointerEvents = 'none';
}

/**
 * Makes the arrows clickable
 */
function enableArrows() {
    rightArrow.style.pointerEvents = 'auto';
    leftArrow.style.pointerEvents = 'auto';
}

/**
 * Slides the pokedéx slider to the right
 */
function slideRight() {

    /**
     * The offset that should be taken by the slider
     * @type {int}
     */
    let offset = pokedex_pages[0].offsetWidth;

    /**
     * The last index of the currently rendered list of pages
     * @type {int}
     */
    let last_index = pokedex_pages.length;

    //Disables arrows click until animation is finished
    disbaleArrows();

    //Enables animation and moves slider
    pokedex_slider.classList.add('slide-right');
    pokedex_slider.style.left = -offset + "px";

    //After the amovement is complete, remove the animation, reset slider position and reorder the pages
    setTimeout(() => {
        pokedex_slider.classList.remove('slide-right');
        pokedex_pages[current_page - 1].style.order = last_index;
        pokedex_slider.style.left = 0;
        current_page++;
        if (current_page > pokedex_pages.length) {
            current_page = 1;
            pokedex_pages.forEach((page) => {
                page.style.order = "initial";
            });
        };
        enableArrows();
    }, 700);


}

/**
 * Slides the pokedéx slider to the left
 */
function slideLeft() {

    //Disables arrow clicks until the animation is finished
    disbaleArrows();

    /**
     * The offset that should be taken by the slider
     * @type {int}
     */
    let offset = pokedex_pages[0].offsetWidth;

    //Disable animation and update current_page value
    pokedex_slider.classList.remove('slide-right');
    current_page--;
    if (current_page == 0) {
        pokedex_pages.forEach(page => {
            page.style.order = 'initial';
        });
        current_page = pokedex_pages.length;
    };

    //Reorder the pages and set offset to prevent slider from moving
    pokedex_pages[current_page - 1].style.order = '-1';
    pokedex_slider.style.left = -offset + 'px';

    //Enable animation and move slider
    setTimeout(() => {
        pokedex_slider.classList.add('slide-right');
        pokedex_slider.style.left = 0;
    }, 1);

    //Enable arrows after animation is complete
    setTimeout(() => {
        enableArrows();
    }, 700);

}

/**
 * Hides arrows if there's less than 2 pages rendered
 */
function handleArrows() {
    if (pokedex_pages.length <= 1) {
        rightArrow.style.visibility = 'hidden';
        leftArrow.style.visibility = 'hidden';
    }
    else {
        rightArrow.style.visibility = 'visible';
        leftArrow.style.visibility = 'visible';
    }
}

/**
 * Refresh the pokedex_pages array with all the pages currently rendered
 */
function refreshSlides() {
    pokedex_pages = Array.from(document.querySelectorAll('.pokedex-page'));
    current_page = 1;

    handleArrows();
}

/**
 * Converts a set of JSON format Pokémon data into Pokémon objects and insert them into the all_pokemon array
 * @param {JSON[]} results - a set of Pokémon in JSON format
 */
async function fillPokemonArray(results) {

    all_pokemon = [];

    results.forEach((pokemon, index) => {
        let id = index + 1;
        let name = capitalize(pokemon.name);
        let sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        let stats = {
            'HP': pokemon.stats[0].base_stat,
            'ATK': pokemon.stats[1].base_stat,
            'DEF': pokemon.stats[2].base_stat,
            'SPE': pokemon.stats[5].base_stat,
            'SPA': pokemon.stats[3].base_stat,
            'SPD': pokemon.stats[4].base_stat
        };

        let types = [];
        Promise.all(pokemon.types.map((types => types.type.name.toUpperCase())))
            .then(results => {
                results.forEach(type => {
                    types.push(type);
                });
            });
        //let types = pokemon.types.map((types => types.type.name.toUpperCase()));
        all_pokemon.push(new Pokemon(id, name, sprite, stats, types));
    });

    console.log(all_pokemon);

}

/**
 * Generate an array of Pokémon based in a filter (can be name or id)
 * @param      {string} filter
 * @returns {Pokemon[]} Filtered Pokémon 
 */
function filterPokemon(filter) {
    return (
        all_pokemon.filter((pokemon => {
            return (
                pokemon.name.toLowerCase().includes(filter) ||
                pokemon.id == filter
            );
        }))
    );
}

/**
 * 
 * @param {int} pokedex_id - The ID of the pokedex
 * @returns {Promise} - Promise that resolves when the pokédex's fetch is complete
 */
async function fetchPokedex(pokedex_id) {

    /**
     * Base URL of PokéAPI
     * @type {string}
     */
    let base_url = "https://pokeapi.co/api/v2/pokedex/";

    /**
     * Pokémon entries for the selected region
     * @type {JSON[]}
     */
    let response = await fetch(`${base_url}${pokedex_id}`);
    let region_pokedex = (await response.json()).pokemon_entries;

    await fetchPokemon(region_pokedex);

}

/**
 * Fetches all Pokémon from PokéAPI and uses fillPokemonArray to insert them into the all_pokemon array
 * @returns {Promise} Promise resolved when all_pokemon array is filled
 */
async function fetchPokemon(region_pokedex) {

    /**
     * Array of the promises generated by the PokéAPI fetch operation
     * @type {Promise[]}
     */
    let promises = [];

    region_pokedex.forEach((entry) => {
        promises.push(
            fetch(entry.pokemon_species.url.replace("pokemon-species", "pokemon"))
        );
    });

    //Resolve all promises and fill the all_pokemon array
    let results = await Promise.all((await Promise.all(promises)).map((r) => r.json()));
    fillPokemonArray(results);

}

async function loadImage(src) {

    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Erro ao carregar a imagem..."));
        img.src = src;
    }) 
    
};

async function createPokemonCardFront(pokemon) {

    let card_front = document.createElement("div");
    let img_wrapper = document.createElement("div");
    let img = await loadImage(pokemon.sprite);
    let pokemon_description = document.createElement("div");
    let pokemon_number = document.createElement("div");
    let pokemon_name = document.createElement("div");

    card_front.classList.add('pokemon-front');
    card_front.id = `${pokemon.name}-front`;

    img_wrapper.classList.add('img-wrapper');
    img_wrapper.classList.add(`img-${pokemon.types[0].toLowerCase()}`);
    img_wrapper.appendChild(img);
    
    pokemon_number.classList.add('pokemon-number');
    pokemon_number.innerHTML = `<span>${formatId(pokemon.id)}</span>`;

    pokemon_name.classList.add('pokemon-name');
    pokemon_name.innerHTML   = `<span>${pokemon.name}</span>`;
    
    pokemon_description.classList.add('pokemon-description');
    pokemon_description.appendChild(pokemon_number);
    pokemon_description.appendChild(pokemon_name);

    pokemon.types.forEach(type => {
        let type_div = document.createElement('div');
        type_div.classList.add('type');
        type_div.classList.add(`type-${type.toLowerCase()}`);
        type_div.innerHTML = `<span>${type}</span>`;
        
        pokemon_description.appendChild(type_div);
    });

    card_front.appendChild(img_wrapper);
    card_front.appendChild(pokemon_description);

    return card_front;

};

async function createPokemonCardBack(pokemon) {

    let card_back  = document.createElement('div');
    let pokemon_name = document.createElement('div');

    card_back.classList.add('pokemon-back');
    card_back.classList.add(`type-${pokemon.types[0].toLowerCase()}`);

    pokemon_name.classList.add('pokemon-name');
    pokemon_name.innerHTML = `<span>${pokemon.name.toUpperCase()}</span>`;

    card_back.appendChild(pokemon_name);
    Object.entries(pokemon.stats).forEach(([stat, value]) => {
        let stat_div       = document.createElement('div');
        let stat_title = document.createElement('span');
        let stat_bar   = document.createElement('div');
        let stat_value = document.createElement('div');
        let stat_bar_inner = document.createElement('div');

        stat_bar_inner.classList.add('stat-bar-inner');
        stat_bar_inner.style.width = `${value / max_stat_value * 100}%`;

        stat_value.classList.add('stat-value');
        stat_value.classList.add(`value-${pokemon.types[0].toLowerCase()}`);
        stat_value.innerHTML = value;

        stat_bar.classList.add('stat-bar');
        stat_bar.classList.add(`type-${pokemon.types[0].toLowerCase()}`);
        stat_bar.appendChild(stat_value);
        stat_bar.appendChild(stat_bar_inner);

        stat_title.classList.add('stat-title');
        stat_title.innerHTML = stat;

        stat_div.classList.add('stat');
        stat_div.appendChild(stat_title);
        stat_div.appendChild(stat_bar);

        card_back.appendChild(stat_div);
    });

    return card_back;

    /*<div class="pokemon-back type-${pokemon.types[0].toLowerCase()}">
            <div class="pokemon-name"><span>${pokemon.name.toUpperCase()}</span></div>
            ${Object.entries(pokemon.stats).map(([stat, value]) => {
        return `
                    <div class="stat">
                        <span class="stat-title">${stat}</span>
                        <div class="stat-bar type-${pokemon.types[0].toLowerCase()}">
                            <div class="stat-value value-${pokemon.types[0].toLowerCase()}">${value}</div>
                            <div class="stat-bar-inner" style="width: ${value / 255 * 100}%;"></div>
                         </div>
                    </div>
                `;
    }).join('')}
        </div>*/
    
};

/**
 * Returns a Pokémon card based on it's information
 * @param {Pokemon} pokemon - The Pokémon which card is being created
 * @returns {HTMLDivElement} The Pokémon card
 */
async function createPokemonCard(pokemon) {

    /**
    * The Pokémon card
    * @type {HTMLDivElement}
    */
    let card = document.createElement("div");
    card.className = `pokemon-card`;
    card.id = `${pokemon.name}-card`;

    card.appendChild(await createPokemonCardFront(pokemon));
    card.appendChild(await createPokemonCardBack(pokemon));

    return card;

}


/**
 * Returns a page of the pokédex based on it's number
 * @param       {int} page - The current page to be created
 * @param {Pokemon[]} pokemon_render_list - The list of pokémon being rendered
 * @returns {HTMLDivElement} The page div with all it's pokémon
 */
async function createPokedexPage(page_number, pokemon_render_list) {

    /**
     * The first Pokémon index of the page
     * @type {int}
     */
    let start = (page_number - 1) * 12 + 1;

    /**
     * The last Pokémon index of the page
     * @type {int}
     */
    let end = Math.min((page_number * 12), pokemon_render_list.length);

    /**
     * The pokédex page
     * @type {HTMLDivElement}
     */
    let page = document.createElement("div");
    page.className = "pokedex-page";
    page.id = `page-${page_number}`;

    let promises = [];

    for (let pokemon_index = start; pokemon_index <= end; pokemon_index++)
        promises.push(createPokemonCard(pokemon_render_list[pokemon_index - 1]));

    let cards = await Promise.all(promises);

    cards.forEach(card => {
        page.appendChild(card);
    });

    return page;

}

/**
 * Sets the visibility of the loading div
 * @param {boolean} isLoading - The state of the page (if it's loading or not)
 */
function setLoading(isLoading) {
    if (isLoading)
        loading.style.display = 'flex';
    else
        loading.style.display = 'none';
}

/**
 * Render the Pokémon cards on the document from the Pokémon array
 * @param {boolean} isSearchActive - Defines if render must be made from a filtered Pokémon array
 */
async function renderPokedex(isSearchActive) {

    /**
     * List of Pokémon to be rendered
     * @type {Pokemon[]}
     */
    let pokemon_render_list = [];

    let promises = [];

    let n_pages;

    if (isSearchActive)
        pokemon_render_list = filterPokemon(getFilter());
    else
        pokemon_render_list = all_pokemon;

    console.log("All Pokémon when renderPokédex is called:");
    console.log(all_pokemon);

    n_pages = Math.ceil(pokemon_render_list.length / 12);

    pokedex_slider.innerHTML = "";

    for (let page = 1; page <= n_pages; page++)
        promises.push(createPokedexPage(page, pokemon_render_list));

    let pages = await Promise.all(promises);

    pages.forEach(page => {
        pokedex_slider.appendChild(page);
    });

    await setCardsEventListeners();
    await setNameScrollings();

    refreshSlides();

}

/**
 * Extracts the Pokédex ID from it's PokéAPI URL
 * @param {string} url - The original URL of the pokédex
 * @returns  {int} - The id of the pokédex
 */
function extractIdFromURL(url) {

    let id = url.split('https://pokeapi.co/api/v2/pokedex/').slice(1, 2)[0].replace('/', '');
    return id;

};

function getOptGroups(pokedexes) {
    let removeStrings = ['Original', 'Updated', 'Extended', 'Central', 'Coastal', 'Mountain', 'Letsgo'];
    let opt_groups = [];

    pokedexes.forEach(pokedex => {
        let str = removeStrings.find(str => pokedex.name.includes(str));

        if (str) {
            opt_groups.push(pokedex.name.replace(str, '').replace(' ', ''));
        }
        else opt_groups.push(pokedex.name);
    });

    opt_groups = [...new Set(opt_groups)];
    return opt_groups;
};

/**
 * Fill the pokedéx selector with the available options
 * 
 * @async
 * @function fillPokedexSelector
 * @param {JSON[]} pokedexes - The avaiable pokédexes
 */
async function fillPokedexSelector(pokedexes) {

    pokedexes.forEach(pokedex => {
        pokedex.name = capitalize(pokedex.name);
    });

    let opt_groups = getOptGroups(pokedexes);

    opt_groups.forEach(group => {
        let pokedex_group = document.createElement('optgroup');
        pokedex_group.label = group;

        pokedexes.forEach(pokedex => {
            if(pokedex.name.includes(group))
            {
                let pokedex_item = document.createElement('option');
                let pokedex_id = extractIdFromURL(pokedex.url)
                if (pokedex_id == 1)
                pokedex_item.selected = 'selected';

                pokedex_item.value = pokedex_id;
                pokedex_item.innerHTML = `${pokedex.name.replace('Original ', '')}`;

                pokedex_group.appendChild(pokedex_item);
            };
        });

        pokedex_selector.appendChild(pokedex_group);
    });
};


/**
 * Fetches all pokedexes and fill the region pokedex selector
 * 
 * @async
 * @function fetchAllPokedexes
 * @returns {Promise} - A Promise that is resolved when all Pokedexes are fetched
 */
async function fetchAllPokedexes() {
    let data = await (await fetch('https://pokeapi.co/api/v2/pokedex?offset=0&limit=30')).json();
    await fillPokedexSelector(data.results);
};

/**
 * Fetches the respective pokédex of the selected region and renders it
 * @param {int} region - The ID of the region to be rendered
 */
async function fetchAndRender(region) {

    setLoading(true);

    try {
        await fetchPokedex(region);
        await renderPokedex(!(getFilter() == ""));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        console.log("Function fetchAndRender completed succesfully!");
        setLoading(false);
    };
};

/**
 * Returns the selected region ID
 * @returns {int} The ID of the selected region of the selector
 */
function getSelectedPokedex() {
    return pokedex_selector.options[pokedex_selector.selectedIndex].value;
};

// ====================================== MAIN PROGRAM =======================================
document.addEventListener('DOMContentLoaded',async () => {
    await fetchAllPokedexes()
    await fetchAndRender(getSelectedPokedex());
});
// ===========================================================================================

