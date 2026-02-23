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
    li.classList.add("favorites-card");
    
    const title = document.createElement("div");
    title.textContent = name || id;
    title.classList.add("fav-title");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.classList.add("delete-btn");

    li.appendChild(title);
    li.appendChild(deleteBtn);
    list.appendChild(li);

    deleteBtn.onclick = () => {
      favorites = favorites.filter(favId => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    };

    li.appendChild(deleteBtn);
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

const typeJa = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  electric: "でんき",
  grass: "くさ",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー"
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

    // ①図鑑番号から　species　取る
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
    const speciesData = await speciesRes.json();

    const japaneseName = speciesData.names.find(
      n => n.language.name ===  "ja"
    ).name;

    // ②進化情報取得
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const evolutions = [];
    let evo = evoData.chain;

    while (evo) {
      evolutions.push(evo.species.name);
      evo = evo.evolves_to[0];
    }
    // ③　全フォーム取得
    const forms = speciesData.varieties;
    
    //　④　表示用HTML
    let html = "";

    //　⑤　フォーム全部回す
    for (const form of forms) {
      const formName = form.pokemon.name;

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formName}`);
      const data = await res.json();

      const image = data.sprites.front_default;
      const weight = data.weight / 10;

      const typesHTML = data.types.map(t => {
        const typeName = t.type.name;
        const color = typeColors[typeName];
        const japaneseType = typeJa[typeName];
        
        return `<span class="type" style="background:${color}">
                  ${japaneseType}
                </span>`;

      }).join("");

      const japaneseName = pokemonDict[data.name];

      html += `
        <div class="card">
            <img src="${image}" class="poke-img">
            <h2>${japaneseName}</h2>
            <p>${typesHTML}</p>
            <p>体重: ${weight} kg </p>
            <p>進化: ${evolutions.join("->")}</p>
            <button class="fav-inside-btn">お気に入り登録</button>  
        </div>
        
      `;
    }

    // ⑥　表示
    document.getElementById("result").innerHTML = html;
     
    document.querySelector(".fav-inside-btn").onclick = () => {
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