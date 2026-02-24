let pokemonDict = {};
const btn = document.getElementById("btn");
const favBtn = document.getElementById("favBtn");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const list = document.getElementById("favorites");

function renderFavorites() {
  
  list.innerHTML = "";

  favorites.forEach(poke => {
    
    const card = document.createElement("div");
    card.classList.add("fav-card");

    const img = document.createElement("img");
    img.src  = poke.image;
    img.classList.add("fav-img");
    
    const title = document.createElement("div");
    title.textContent = poke.name;
    title.classList.add("fav-title");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.classList.add("delete-Btn");

    deleteBtn.onclick = () => {
      favorites = favorites.filter(fav => fav.id !== poke.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    };

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(deleteBtn);

    list.appendChild(card);
  });
}

const typeColors = {
  normal: "#D3D3D3",
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

const eggJa = {
  monster: "かいじゅう",
  water1: "みず1",
  water2: "みず2",
  water3: "みず3",
  bug: "むし",
  flying: "ひこう",
  ground: "りくじょう",
  fairy: "ようせい",
  grass: "しょくぶつ",
  humanlike: "ひとがた",
  mineral: "こうぶつ",
  amorphous: "ふていけい",
  dragon: "ドラゴン",
  ditto: "メタモン",
 "no-eggs": "タマゴみはっけん"
};

btn.addEventListener("click", async () => {
  const input = document.getElementById("pokemonName").value.trim();

  try {
    // 辞書取得
    const dictRes = await fetch("./pokemon-ja-full.json");
    pokemonDict = await dictRes.json();
    const pokemonId = pokemonDict[input];
    console.log("今のお気に入り;", favorites);
  

    if (!pokemonId) {
      alert("そのポケモンはいません");
      return;
    }

    // ①図鑑番号から　species　取る
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
    const speciesData = await speciesRes.json();
    const genus = speciesData.genera.find(
      g => g.language.name === "ja"
    )?.genus;
    const flavor = speciesData.flavor_text_entries.find(
      f => f.language.name === "ja"
    );
    const description = flavor?.flavor_text.replace(/\f/g, "");
    const captureRate = speciesData.capture_rate;
    const eggGroups =  speciesData.egg_groups.map(g => g.name); 

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    const evolutionTree = getEvolutionTree(evoData.chain);

    const japaneseName = speciesData.names.find(
      n => n.language.name ===  "ja"
    ).name;

    // ②進化情報取得
    const evolutions = [];
    let evo = evoData.chain;

    // ③　全フォーム取得
    const forms = speciesData.varieties;
    
    //　④　表示用HTML
    let html = "";

    const shownImages = new Set (); 

    let leftHTML = `
    <div class="species-info">
      <h2>${japaneseName}</h2>
      <p>${genus}</p>
      <p>${description}</p>
      <p>捕獲率: ${captureRate}</p>
      <p>タマゴグループ: ${eggGroups.map(g => eggJa[g] || g).join(" / ")}</p>
    </div>
    `;

    
    //　⑤　フォーム全部回す
    for (const form of forms) {
      
      const formName = form.pokemon.name;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formName}`);
      const data = await res.json();

      const image = 
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.front_default;
        
      if (!image) continue;

      if (shownImages.has(image)) continue;
      
      const weight = data.weight / 10;
      const height = data.height / 10;
      const typesHTML = data.types.map(t => {
        const typeName = t.type.name;
        const color = typeColors[typeName];
        const japaneseType = typeJa[typeName];
        
        return `<span class="type" style="background:${color}">
                  ${japaneseType}
                </span>`;

      }).join("");

      const japaneseName = Object.keys(pokemonDict).find(
        key => pokemonDict[key] == pokemonId
      );

      let displayName = japaneseName;

      if (formName.includes("gmax")) {
        displayName += " (巨大マックス) ";
      }
      if (formName.includes("alola")) {
        displayName += " (アローらの姿) ";
      }
      if (formName.includes("maga")) {
        displayName += " (メガシンカ) ";
      }
      if (formName.includes("hisui")) {
        displayName += " (ヒスイの姿) ";
      }
      
      const evolutionJa = [];

      for (const stage of evolutionTree) {
        const stageNames = [];

        for (const url of stage) {
          const speciesRes = await fetch(url);
          const speciesData = await speciesRes.json();

          const jaName = speciesData.names.find(
            n => n.language.name === "ja"
          ).name;

          stageNames.push(jaName);
        }

        evolutionJa.push(stageNames.join(" / "));
      }

      html += `
        <div class="card">
            <img src="${image}" class="poke-img">
            <h2>${displayName}</h2>
            <p>${typesHTML}</p>
            <p class="info">体重: ${weight} kg </p>
            <p class="info">身長: ${height}  m </p>
            <p class= "info">進化: ${evolutionJa.join(" -> ")}</p>
            <button 
            class="fav-inside-btn"
            data-id="${formName}"
            data-name="${displayName}"
            data-img="${image}"
            >
            お気に入り登録</button>  
        
        </div>
       `;
    }

    // ⑥　表示
    document.getElementById("speciesInfo").innerHTML = leftHTML;
    document.getElementById("result").innerHTML = html;
    document.querySelectorAll(".fav-inside-btn").forEach(btn => {
      btn.onclick = () => {
        
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const image = btn.dataset.img;

        if (!favorites.some(fav => fav.id === id)) {
          
          favorites.push({
            id: id,
            name: name,
            image: image
          });
        
          localStorage.setItem("favorites", JSON.stringify(favorites));
        }
        renderFavorites();

      };
    });

  } catch (error) {
    console.error(error);  
  }
});

  function getEvolutionTree(chain) {
    const result = [];

    function traverse(node, depth = 0) {
      if (!result[depth]) result[depth] = [];
      result[depth].push(node.species.url);

      node.evolves_to.forEach(next => {
        traverse(next, depth + 1);
      });
    }

    traverse(chain);
    return result;
  }

  const resetBtn = document.getElementById("resetBtn");

  resetBtn.addEventListener("click", () => {
    document.getElementById("pokemonName").value = "";
    document.getElementById("result").innerHTML = ""; 
  });

  const clearFav =document.getElementById("clearFav");

  clearFav.addEventListener("click", () => {
    favorites = [];
    localStorage.removeItem("favorites");
    renderFavorites();
  });

  const inputField = document.getElementById("pokemonName");
    
    inputField.addEventListener("keydown",  (event) => {
      if (event.key === "Enter") {
        btn.click();
      }
    });