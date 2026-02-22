let pokemonDict = {};
const btn = document.getElementById("btn");
const favBtn = document.getElementById("favBtn");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  list.innerHTML = "" ;

  favorites.forEach(id => {

    //逆引きして日本語探す
    const name = Object.keys(pokemonDict).find(
      key => pokemonDict[key] == id
    );
    const li = document.createElement("li");
    li.textContent = name || id;
    //削除ボタン作成
    const deletBtn = document.createElement("button");
    deletBtn.textContent = "削除";

    deletBtn.onclick = () => {
      favorites = favorites.filter(favId => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    };

    li.appendChild(deletBtn);
    list.appendChild(li);
  });
}

const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};

btn.addEventListener("click", async () => {
  const input = document.getElementById("pokemonName").value;

  try {
    // 辞書取得
    const dictRes = await fetch("./pokemon-ja-full.json");
    pokemonDict = await dictRes.json();
    const pokemonId = pokemonDict[input];
    favorites.push(pokemonId);
    localStorage.setItem("favorites",JSON.stringify(favorites));
    console.log("今のお気に入り;", favorites);

    if (!pokemonId) {
      alert("そのポケモンはいません");
      return;
    }

    // ポケモンデータ取得
    const apiRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    const pokemonData = await apiRes.json();
    console.log("図鑑番号",pokemonData.id);

    // 日本語名取得
    const speciesRes = await fetch(pokemonData.species.url);
    const speciesData = await speciesRes.json();

    const japaneseName = speciesData.names.find(
      n => n.language.name === "ja"
    ).name;

    // 進化情報取得
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const evolutions = [];
    let evo = evoData.chain;

    while (evo) {
      evolutions.push(evo.species.name);
      evo = evo.evolves_to[0];
    }

    // データ整形
    const image = pokemonData.sprites.front_default;
    const weight = pokemonData.weight / 10;

    const typesHTML = pokemonData.types.map(t => {
      const color = typeColors[t.type.name];
      return `<span class="type" style="background:${color}">
                ${t.type.name}
              </span>`;
    }).join("");

    const evoHTML = evolutions.join(" → ");

    // 表示
    document.getElementById("result").innerHTML = `
      <div class="card">
        <h2>${japaneseName}</h2>
        <img src="${image}">
        <div>${typesHTML}</div>
        <p>体重: ${weight} kg</p>
        <p>進化: ${evoHTML}</p>
      </div>
    `;
    favBtn.onclick = () => {
      if (!favorites.includes(pokemonId)) {
        favorites.push(pokemonId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
      
      console.log("今のfavorites:", favorites);
      renderFavorites();
    };
  } catch (error) {
    console.error(error);
  }
});