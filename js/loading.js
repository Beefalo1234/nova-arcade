function changeLoadingTip() {
    const tips = [
        'Welcome to the land of Nothing!',
        'Here there is absolutely nothing for you.',
        'Just gotta wait for it to load',
        "Shouldn't take any longer",
        'Why are you here?',
        'Just one more minute',
        'Go read a book :)',
    ];
    const element = document.getElementsByClassName('loading-tip')[0];

    element.textContent = 'Loading... \n' + tips[Math.floor(Math.random() * tips.length)];
}

changeLoadingTip();
$('#everything-else, #page-loader, .games, .proxy, .settings, .cloaklaunch').hide();

let changeTip = setInterval(() => {
    changeLoadingTip();
}, 3000);

let games = json['games'];
let themes = json['themes'];
let config = json['config'];

let gamesList = $('#gamesList');
for (game in games) {
    const gpath = games[game]['path'].replace(/\//g, '_');
    gamesList.append(
        `<li url="games/${games[game]['path']}" data-name="${game}" ${
            games[game]['aliases'] ? 'aliases="' + games[game]['aliases'].join(',') + '"' : ''
        }><img class="thumb" src="games/thumbnails/${gpath}.jpg" alt="${game}"> <span class="gname">${game}</span> <span class="star">★</span> </li>`,
    );
}

let starredGamesList = JSON.parse(localStorage.getItem('starredGamesList')) || [];
const stars = document.querySelectorAll('.star');
stars.forEach((star) => {
    star.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        star.classList.toggle('filled');

        const gameItem = star.parentNode;
        var gameName = gameItem.textContent;
        const isStarred = starredGamesList.includes(gameName);

        if (isStarred) {
            starredGamesList = starredGamesList.filter((name) => name !== gameName);

            //THIS DOES NOT PUT THE GAME BACK IN ORDER ACCORDING TO THE WAY THE USER SORTED IT
            //so for the weird ppl that sort by reverse alphabetical it should act pretty weird
            //this is bc im layz and copy pasted this alphabetical sort thing, ill implement based off users sort later
            const gameItem = star.closest('li');
            const parent = gameItem.parentNode;

            const originalPosition = Array.from(parent.children)
                .sort((a, b) => a.textContent.localeCompare(b.textContent))
                .findIndex((item) => item === gameItem);

            parent.removeChild(gameItem);

            parent.insertBefore(gameItem, parent.children[originalPosition]);
        } else {
            starredGamesList.unshift(gameName);
        }

        localStorage.setItem('starredGamesList', JSON.stringify(starredGamesList));
        updateGameList();
    });
});
// Pushes all starred games to the top
function updateGameList() {
    const gamesList = document.getElementById('gamesList');
    const children = Array.from(gamesList.children);

    children.forEach((gameItem) => {
        const currentGameName = gameItem.textContent;
        const stars = gameItem.querySelector('.star');

        if (starredGamesList.includes(currentGameName)) {
            stars.classList.add('filled');
            gamesList.insertBefore(gameItem, gamesList.firstChild);
        }
    });
}

updateGameList();

$('#gamesList li').on('click', function () {
    let url = $(this).attr('url');
    if (window.location.protocol === 'file:' && !url.includes('.html')) {
        const searchParamsIndex = url.indexOf('?');
        if (searchParamsIndex !== -1)
            url = url.substring(0, searchParamsIndex) + 'index.html' + url.substring(searchParamsIndex);
        else url += '/index.html';
    }
    inGame = true;
    $('#everything-else').fadeOut();
    $('#page-loader').fadeIn();
    $('#page-loader iframe').attr('src', url);
    $('#page-loader iframe')[0].focus();
    currentMenu = $('#page-loader');
});

let revealed = false;
function reveal() {
    if (revealed) return;
    revealed = true;
    $('.track').attr('stroke', 'url(#grad2)');
    $('.worm1').hide();
    $('.worm2').hide();
    clearInterval(changeTip);

    $('.loading').fadeOut({
        duration: 300,
        complete: () => {
            setTimeout(() => {
                $('#everything-else').fadeIn(
                    {
                        duration: 500,
                        easing: 'swing',
                    },
                    200,
                );
            }, 100);
        },
    });
}

$(window).on('load', reveal);
// Safety net: never trap the user on the loading screen, no matter what
// resource stalls the window load event (blocked CDN, hung font, etc).
setTimeout(reveal, 6000);

jQuery.fn.extend({
    showModal: function () {
        return this.each(function () {
            if (this.tagName === 'DIALOG') {
                this.showModal();
            }
        });
    },
});

(function () {
    // FPS meter removed (dev artifact)
})();
