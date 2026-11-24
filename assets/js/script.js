
$(document).ready(function () {

    const API_URL = "https://jsonfakery.com/movies/paginated";

    let currentPage = 1;
    let lastPage = 1;
    let allMovies = [];
    let favoriteMovies = JSON.parse(
        localStorage.getItem("favoriteMovies")
    ) || [];

    let showingFavorites = false;

    function escapeHTML(value) {
        return $("<div>").text(value ?? "").html();
    }

    function safeImage(url) {
        if (typeof url === "string" &&
            /^https:\/\//i.test(url)) {
            return url;
        }

        return "https://placehold.co/400x600?text=No+Image";
    }

    function getMovies(page = 1) {

        showingFavorites = false;

        $("#loading").removeClass("hidden");
        $("#error").addClass("hidden");
        $("#empty").addClass("hidden");
        $("#movieContainer").empty();
        $("#pagination").removeClass("hidden");

        $.ajax({
            url: `${API_URL}?page=${page}`,
            method: "GET",
            dataType: "json",

            success: function (response) {

                allMovies = response.data || [];

                currentPage = response.current_page;
                lastPage = response.last_page;

                $("#loading").addClass("hidden");

                $("#pageInfo").text(
                    `Page ${currentPage} of ${lastPage}`
                );

                $("#prevBtn").prop(
                    "disabled",
                    !response.prev_page_url
                );

                $("#nextBtn").prop(
                    "disabled",
                    !response.next_page_url
                );

                $("#sectionTitle").text("Discover Movies");

                applyFilters();
            },

            error: function (xhr) {

                $("#loading").addClass("hidden");

                $("#error")
                    .text("Unable to load movies. Please try again.")
                    .removeClass("hidden");

                console.log(xhr);
            }
        });
    }

    function displayMovies(movies) {

        $("#movieContainer").empty();

        $("#movieCount").text(
            `${movies.length} Movies`
        );

        if (movies.length === 0) {
            $("#empty").removeClass("hidden");
            return;
        }

        $("#empty").addClass("hidden");

        movies.forEach(function (movie) {

            const isFavorite = favoriteMovies.some(
                item => item.id === movie.id
            );

            const card = `
                <article class="movie-card">

                    <div class="poster-wrapper">

                        <img
                            src="${safeImage(movie.poster_path)}"
                            alt="${escapeHTML(movie.original_title)}"
                            loading="lazy"
                        >

                        <span class="rating-badge">
                            ★ ${Number(movie.vote_average || 0).toFixed(1)}
                        </span>

                        <button
                            class="favorite-btn ${isFavorite ? "active" : ""}"
                            data-id="${escapeHTML(movie.id)}"
                            aria-label="Toggle favorite"
                        >
                            ${isFavorite ? "♥" : "♡"}
                        </button>

                    </div>

                    <div class="movie-info">

                        <h3>${escapeHTML(movie.original_title)}</h3>

                        <div class="movie-date">
                            ${escapeHTML(movie.release_date || "Unknown date")}
                        </div>

                        <p>${escapeHTML(movie.overview || "No description available.")}</p>

                        <button
                            class="details-btn"
                            data-id="${escapeHTML(movie.id)}"
                        >
                            View Details
                        </button>

                    </div>

                </article>
            `;

            $("#movieContainer").append(card);
        });
    }

    function applyFilters() {

        let movies = [...allMovies];

        const searchValue = $("#searchInput")
            .val()
            .toLowerCase()
            .trim();

        const minimumRating = $("#ratingFilter").val();
        const sortValue = $("#sortSelect").val();

        if (searchValue) {

            movies = movies.filter(function (movie) {

                const title = (movie.original_title || "")
                    .toLowerCase();

                const overview = (movie.overview || "")
                    .toLowerCase();

                const actors = (movie.casts || [])
                    .map(actor => actor.name || "")
                    .join(" ")
                    .toLowerCase();

                return title.includes(searchValue) ||
                    overview.includes(searchValue) ||
                    actors.includes(searchValue);
            });
        }

        if (minimumRating !== "all") {

            movies = movies.filter(function (movie) {
                return Number(movie.vote_average) >=
                    Number(minimumRating);
            });
        }

        movies.sort(function (a, b) {

            switch (sortValue) {

                case "rating":
                    return Number(b.vote_average) -
                        Number(a.vote_average);

                case "rating-low":
                    return Number(a.vote_average) -
                        Number(b.vote_average);

                case "title":
                    return (a.original_title || "").localeCompare(
                        b.original_title || ""
                    );

                case "newest":
                    return new Date(b.release_date) -
                        new Date(a.release_date);

                case "oldest":
                    return new Date(a.release_date) -
                        new Date(b.release_date);

                default:
                    return 0;
            }
        });

        displayMovies(movies);
    }

    $("#searchBtn").on("click", function () {
        applyFilters();
    });

    $("#searchInput").on("keydown", function (event) {

        if (event.key === "Enter") {
            applyFilters();
        }

    });

    $("#sortSelect, #ratingFilter").on("change", function () {
        applyFilters();
    });

    $("#resetBtn").on("click", function () {

        $("#searchInput").val("");
        $("#sortSelect").val("default");
        $("#ratingFilter").val("all");

        if (showingFavorites) {
            displayMovies(favoriteMovies);
        } else {
            applyFilters();
        }
    });

    $("#nextBtn").on("click", function () {

        if (currentPage < lastPage) {
            getMovies(currentPage + 1);
        }

    });

    $("#prevBtn").on("click", function () {

        if (currentPage > 1) {
            getMovies(currentPage - 1);
        }

    });

    $("#movieContainer").on(
        "click",
        ".favorite-btn",
        function () {

            const movieId = $(this).attr("data-id");

            const movie = allMovies.find(
                item => String(item.id) === String(movieId)
            );

            if (!movie) return;

            const existingIndex = favoriteMovies.findIndex(
                item => String(item.id) === String(movieId)
            );

            if (existingIndex === -1) {

                favoriteMovies.push(movie);

            } else {

                favoriteMovies.splice(existingIndex, 1);

            }

            localStorage.setItem(
                "favoriteMovies",
                JSON.stringify(favoriteMovies)
            );

            if (showingFavorites) {

                displayMovies(favoriteMovies);

            } else {

                applyFilters();

            }

        }
    );

    $("#favoritesNav").on("click", function (event) {

        event.preventDefault();

        showingFavorites = true;

        $("#sectionTitle").text("My Watchlist");

        $("#searchInput").val("");
        $("#sortSelect").val("default");
        $("#ratingFilter").val("all");

        $("#pagination").addClass("hidden");

        displayMovies(favoriteMovies);

        $("#movies")[0].scrollIntoView({
            behavior: "smooth"
        });
    });

    $("#movieContainer").on(
        "click",
        ".details-btn",
        function () {

            const movieId = $(this).attr("data-id");

            const movie = [...allMovies, ...favoriteMovies].find(
                item => String(item.id) === String(movieId)
            );

            if (!movie) return;

            showMovieDetails(movie);
        }
    );

    function showMovieDetails(movie) {

        const backdrop = safeImage(movie.backdrop_path);

        const casts = (movie.casts || []).slice(0, 8);

        const castHTML = casts.length
            ? casts.map(function (actor) {

                return `
                    <div class="cast-card">

                        <img
                            src="${safeImage(actor.profile_path)}"
                            alt="${escapeHTML(actor.name)}"
                            loading="lazy"
                        >

                        <h4>${escapeHTML(actor.name)}</h4>

                        <span>
                            ${escapeHTML(actor.character || "Actor")}
                        </span>

                    </div>
                `;

            }).join("")
            : "<p>No cast information available.</p>";

        const modalHTML = `

            <div
                class="modal-backdrop"
                style="background-image: url('${backdrop}')"
            ></div>

            <div class="modal-details">

                <h2>${escapeHTML(movie.original_title)}</h2>

                <div class="modal-meta">

                    <span>
                        ★ ${Number(movie.vote_average || 0).toFixed(1)}
                    </span>

                    <span>
                        ${escapeHTML(movie.release_date || "Unknown date")}
                    </span>

                    <span>
                        ${Number(movie.vote_count || 0)} Votes
                    </span>

                    <span>
                        ${escapeHTML(movie.original_language || "Unknown")}
                    </span>

                </div>

                <h3>Overview</h3>

                <p>
                    ${escapeHTML(movie.overview || "No description available.")}
                </p>

                <h3>Main Cast</h3>

                <div class="cast-grid">
                    ${castHTML}
                </div>

            </div>
        `;

        $("#modalBody").html(modalHTML);

        $("#movieModal").removeClass("hidden");

        $("body").css("overflow", "hidden");
    }

    function closeModal() {

        $("#movieModal").addClass("hidden");

        $("body").css("overflow", "");
    }

    $("#closeModal").on("click", closeModal);

    $("#movieModal").on("click", function (event) {

        if (event.target === this) {
            closeModal();
        }

    });

    $(document).on("keydown", function (event) {

        if (event.key === "Escape") {
            closeModal();
        }

    });

    getMovies();

});
