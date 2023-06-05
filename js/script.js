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
// ===========================================================================================

// ======================================== ELEMENTS =========================================
/**
 * Search bar
 * @type {HTMLInputElement}
 */
const search_bar = document.querySelector('#search');

/**
 * Region selector element
 * @type {HTMLSelectElement}
 */
const region_selector = document.querySelector('#region');

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
 * @param   {string} word - The word to be capitalized
 * @returns {string} Word with the first letter capitalized
 */
const capitalize = (word) => {
    word = word.replace(/\-[a-z]/g, match => match.toUpperCase()).replace('-', ' ');
    return word.charAt(0).toUpperCase() + word.slice(1);
};

/**
 * Transforms a Pokémon id to the format #XXX
 * @param      {int} id - The nid to be formatted 
 * @returns {string} Id in format #XXX
 */
const formatId = (id) => {
    if(id < 10)
        return `#00${id}`;
    else if(id < 100)
        return `#0${id}`;
    return `#${id}`;
};

/**
 * Gets the current search bar value
 * @returns {string} Value of the search bar
 */
const getFilter = () => {
    return search_bar.value;
};

/**
 * Set the search bar input event listener
 */
const setSearchBarEventListener = () => {
    //Resets the search bar value
    search_bar.value = '';

    //Every time input is changed, render the pokedex with the due filter applied
    search_bar.addEventListener('input', () => {
        renderPokedex(!(getFilter() == ''));
    });
};

/**
 * Set the pokémon cards fronts and backs event listeners to make the turn effect
 */
const setCardsEventListeners = () => {

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
        })
    });

    pokemon_cards_backs.forEach((card, index) => {
        card.addEventListener('click', () => {
            card.classList.add('unturned');
            card.classList.remove('turned');
            pokemon_cards_fronts[index].classList.add('turned');
            pokemon_cards_fronts[index].classList.remove('unturned');
        })
    });

};

/**
 * Sets
 */
const setNameScrollings = () => {
    let names = document.querySelectorAll('.pokemon-name');

    names.forEach((name) => {
        if(name.clientWidth < name.scrollWidth)
            name.classList.add('scroll-name');
    });
}

/**
 * Makes the arrows unclickable
 */
const disbaleArrows = () => {
    rightArrow.style.pointerEvents = 'none';
    leftArrow.style.pointerEvents  = 'none';
};

/**
 * Makes the arrows clickable
 */
const enableArrows = () => {
    rightArrow.style.pointerEvents = 'auto';
    leftArrow.style.pointerEvents  = 'auto';
};

/**
 * Slides the pokedéx slider to the right
 */
const slideRight = () => {

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

    
};

/**
 * Slides the pokedéx slider to the left
 */
const slideLeft = () => {

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
    if(current_page == 0)
    {
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

};

/**
 * Hides arrows if there's less than 2 pages rendered
 */
const handleArrows = () => {
    if(pokedex_pages.length <= 1)
    {
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
const refreshSlides = () => {
    pokedex_pages = Array.from(document.querySelectorAll('.pokedex-page'));
    current_page = 1;

    handleArrows();
};

/**
 * Converts a set of JSON format Pokémon data into Pokémon objects and insert them into the all_pokemon array
 * @param {JSON[]} results - a set of Pokémon in JSON format
 */
const fillPokemonArray = (results) => {
    results.map((pokemon, index) => {
        let id      = index + 1;
        let name    = capitalize(pokemon.name);
        let sprite  = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        let stats   = {
            'HP':  pokemon.stats[0].base_stat,
            'ATK': pokemon.stats[1].base_stat,
            'DEF': pokemon.stats[2].base_stat,
            'SPE': pokemon.stats[5].base_stat,
            'SPA': pokemon.stats[3].base_stat,
            'SPD': pokemon.stats[4].base_stat
        };
        let types = pokemon.types.map((types => types.type.name.toUpperCase()));
        all_pokemon.push(new Pokemon(id, name, sprite, stats, types));        
    });
};

/**
 * Generate an array of Pokémon based in a filter (can be name or id)
 * @param      {string} filter
 * @returns {Pokemon[]} Filtered Pokémon 
 */
const filterPokemon = (filter) => {
    return(
        all_pokemon.filter((pokemon => {
            return (
                pokemon.name.toLowerCase().includes(filter) ||
                pokemon.id == filter
            );
        }))
    );
};

/**
 * 
 * @param {int} region_id - The ID of the region
 * @returns {Promise} - Promise that resolves when the region's pokédex fetch is complete
 */
const fetchRegionPokedex = (region_id) => {

    return new Promise((resolve, reject) => {
        /**
         * Base URL of PokéAPI
         * @type {string}
         */
        let base_url = "https://pokeapi.co/api/v2/pokedex/";

        /**
         * Pokémon entries for the selected region
         * @type {JSON[]}
         */
        let region_pokedex = [];

        fetch(`${base_url}${region_id}`)
            .then(results => results.json())
            .then(r => {
                region_pokedex = r.pokemon_entries;
                console.log(region_pokedex);
                fetchPokemon(region_pokedex)
                    .then(resolve())
                    .catch(err => {
                        console.log(err);
                        reject(new Error("Ocorreu um problema ao obter os dados..."));
                    })
            });
    });

};

/**
 * Fetches all Pokémon from PokéAPI and uses fillPokemonArray to insert them into the all_pokemon array
 * @returns {Promise} Promise resolved when all_pokemon array is filled
 */
const fetchPokemon = (region_pokedex) => {

    return new Promise(async (resolve, reject) => {

        /**
         * Array of the promises generated by the PokéAPI fetch operation
         * @type {Promise[]}
         */
        let promises = [];

        let base_url = "https://pokeapi.co/api/v2/pokemon/";

        region_pokedex.forEach(entry => {
            promises.push(fetch(entry.pokemon_species.url.replace('pokemon-species', 'pokemon')));
        });

        //Resolve all promises and fill the all_pokemon array
        Promise.all(promises)
        .then(results => Promise.all(results.map(r => r.json())))
        .then(results => {
            console.log(results);
            fillPokemonArray(results);
            resolve();
        })
        .catch(err => {
            console.log(err);
            reject(new Error("Ocorreu um problema ao obter os dados..."));
        });

    });

};

/**
 * Returns a Pokémon card based on it's information
 * @param {Pokemon} pokemon - The Pokémon which card is being created
 * @returns {HTMLDivElement} The Pokémon card
 */
const createPokemonCard = (pokemon) => {

    /**
     * The Pokémon card
     * @type {HTMLDivElement}
     */
    let card = document.createElement("div");
    card.className = `pokemon-card`;
    card.id        = `${pokemon.name}-card`;

    card.innerHTML = `
        <div class="pokemon-front" id="${pokemon.name}-front">
            <div class="img-wrapper img-${pokemon.types[0].toLowerCase()}">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" />
            </div>
            <div class="pokemon-description">
                <div class="pokemon-number"><span>${formatId(pokemon.id)}</span></div>
                <div class="pokemon-name"><span>${pokemon.name}</span></div>  
                <div class="type type-${pokemon.types[0].toLowerCase()}"><span>${pokemon.types[0]}</span></div>
                ${pokemon.types[1] == undefined ? '' : `<div class="type type-${pokemon.types[1].toLowerCase()}"><span>${pokemon.types[1]}</span></div>`}
            </div>
        </div>

        <div class="pokemon-back type-${pokemon.types[0].toLowerCase()}">
            <div class="pokemon-name"><span>${pokemon.name.toUpperCase()}</span></div>
            ${Object.entries(pokemon.stats).map(([stat, value]) => {
                return `
                    <div class="stat">
                        <span class="stat-title">${stat}</span>
                        <div class="stat-bar type-${pokemon.types[0].toLowerCase()}">
                            <div class="stat-value value-${pokemon.types[0].toLowerCase()}">${value}</div>
                            <div class="stat-bar-inner" style="width: ${value/255 * 100}%;"></div>
                        </div>
                    </div>
                `
            }).join('')}
        </div>
    `

    return card;
};


/**
 * Returns a page of the pokédex based on it's number
 * @param       {int} page - The current page to be created
 * @param {Pokemon[]} pokemon_render_list - The list of pokémon being rendered
 * @returns {HTMLDivElement} The page div with all it's pokémon
 */
const createPokedexPage = (page_number, pokemon_render_list) => {
    /**
     * The first Pokémon index of the page
     * @type {int}
     */
    let start = (page_number - 1) * 12 + 1;

    /**
     * The last Pokémon index of the page
     * @type {int}
     */
    let end   = Math.min((page_number * 12), pokemon_render_list.length);

    /**
     * The pokédex page
     * @type {HTMLDivElement}
     */
    let page = document.createElement("div");
    page.className = "pokedex-page";
    page.id = `page-${page_number}`;

    for(let pokemon_index = start; pokemon_index <= end; pokemon_index++)
        page.appendChild(createPokemonCard(pokemon_render_list[pokemon_index - 1]));

    return page;

};

/**
 * Sets the visibility of the loading div
 * @param {boolean} isLoading - The state of the page (if it's loading or not)
 */
const setLoading = (isLoading) => {
    if(isLoading) loading.style.display = 'block';
    else loading.style.display = 'none';
}


/**
 * Render the Pokémon cards on the document from the Pokémon array
 * @param {boolean} isSearchActive - Defines if render must be made from a filtered Pokémon array
 */
const renderPokedex = (isSearchActive) => {

    /**
     * List of Pokémon to be rendered
     * @type {Pokemon[]}
     */
    let pokemon_render_list = [];

    let n_pages;
    
    setLoading(true);

    if(isSearchActive)
        pokemon_render_list = filterPokemon(getFilter());
    else
        pokemon_render_list = all_pokemon;

    n_pages = Math.ceil(pokemon_render_list.length / 12);

    pokedex_slider.innerHTML = '';

    for(let page = 1; page <= n_pages; page++)
        pokedex_slider.appendChild(createPokedexPage(page, pokemon_render_list));

    setCardsEventListeners();
    setNameScrollings();
    refreshSlides();

    setLoading(false);

};
// ===========================================================================================

const fetchAndRender = (region) => {
    fetchRegionPokedex(region).then(setTimeout(() => {
        renderPokedex(!(getFilter() == ''));
    }, 5000));
};

// ====================================== MAIN PROGRAM =======================================
window.onload = () => {
    fetchAndRender(1);
}
// ===========================================================================================