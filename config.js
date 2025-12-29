// ==========================================
// === CONFIGURATION PRINCIPALE DU JEU ===
// ==========================================

// Tailles de grilles
export const GRID_SIZES = [4, 5];
export const DEFAULT_GRID = 4;

// Durées des modes chrono (en secondes)
export const CHRONO_DURATIONS = {
  "4x4": 90,
  "5x5": 90,
  "expert3x3": 120,
  "fun2x2": 120
};

// Configuration Supabase
export const SUPABASE_URL = "https://dtaufxcpiapzdpiqthmu.supabase.co";
export const SUPABASE_KEY = "sb_publishable_GblvazVWGG23qdrX4GEtvw_Ypn01EFa";

// Tables Supabase
export const LEADERBOARD_TABLE = "leaderboard_3x3";
export const SCORES_CHRONO_TABLE = "scores_chrono";

// Dictionnaire
export const MIN_WORD_LENGTH = 4;
export const DICT_URL = "dictionnaire.json";

// Grilles Fun 2x2
export const FUN_COMBOS = ["ERSU","ACER","AILS","AIRS","AIST","EORS","AIRV","AEIM",
  "AELP","AEMR","AIMS","AINS","AEPR","AEPT","AERS","ARST",
  "AERT","ABET","CERU","DERU",
  "EILS","EMSU","EMTU","AEGR","EIRS","EISV","AIMR",
  "AINT","AIPR","EIPR","EPRU","OPST","ASTU"
];

// Grilles Expert 3x3
export const EXPERT_GRIDS = [
  ["T","E","M","R","I","S","D","A","T"],
  ["T","E","R","N","I","R","T","A","T"],
  ["R","A","S","T","I","S","S","N","E"],
  ["A","P","E","I","T","A","S","R","E"],
  ["T","A","O","R","I","S","U","E","L"],
  ["A","R","V","T","I","E","E","S","N"],
  ["M","T","A","A","I","R","N","S","E"],
  ["S","T","N","E","I","A","D","M","R"],
  ["P","R","C","E","A","I","M","T","S"],
  ["I","R","P","T","A","E","M","E","S"],
  ["I","E","S","T","R","I","P","A","M"],
  ["A","P","S","L","I","E","D","E","R"],
  ["T","IN","S","A","E","T","P","R","E"],
  ["T","N","E","I","E","R","S","A","T"],
  ["I","A","R","M","E","T","P","E","S"],
  ["ER","S","E","T","I","M","R","A","N"],
  ["A","T","E","I","R","S","E","S","O"],
  ["T","R","QU","A","I","E","M","N","S"],
  ["M","S","N","A","I","E","T","R","AN"],
  ["T","R","S","E","I","A","S","M","AN"],
  ["T","R","E","A","I","S","M","S","AN"],
  ["S","R","T","E","I","A","N","H","C"],
  ["T","A","P","I","R","H","S","E","C"],
  ["P","R","F","I","A","E","S","T","S"],
  ["F","T","S","I","A","E","C","R","M"],


];


// Mots de secours
export const FALLBACK_WORDS = ["TEST","WORD","GAME","JOUER","GAGNE"];

// Fréquences des lettres (français)
export const FREQUENCIES = [
  { l:"E", w:14.7 },{ l:"A", w:7.6 },{ l:"I", w:7.5 },{ l:"S", w:7.9 },
  { l:"N", w:7.0 },{ l:"R", w:6.6 },{ l:"T", w:7.2 },{ l:"O", w:5.7 },
  { l:"L", w:5.4 },{ l:"U", w:6.3 },{ l:"D", w:3.6 },{ l:"C", w:3.2 },
  { l:"M", w:2.9 },{ l:"P", w:2.5 },{ l:"G", w:1.0 },{ l:"B", w:0.9 },
  { l:"V", w:1.8 },{ l:"H", w:0.7 },{ l:"F", w:1.0 },{ l:"Q", w:1.3 },  
  { l:"Y", w:0.3 },{ l:"X", w:0.3 },{ l:"J", w:0.6 },{ l:"K", w:0.07 },
  { l:"W", w:0.06 },{ l:"Z", w:0.05 }
];

// Voyelles et consonnes
export const VOWELS = ["A","E","I","O","U","Y"];
export const CONSONANTS = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];

// Calcul des poids cumulatifs pour génération aléatoire
export let cumulativeWeights = [];
export let totalWeight = 0;
for (const item of FREQUENCIES) {
  totalWeight += item.w;
  cumulativeWeights.push({ l:item.l, max:totalWeight });
}

// Classes CSS pour contrôle d'affichage
export const BODY_HOME_CLASS = "home";
export const BODY_RANKED_CLASS = "ranked-active";
export const BODY_RANKED_RESULTS_CLASS = "ranked-results";
export const BODY_LEADERBOARD_CLASS = "leaderboard-open";


