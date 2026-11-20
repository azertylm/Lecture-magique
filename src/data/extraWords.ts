import { WordItem, WorldId } from '../types';

/**
 * Découpage syllabique pédagogique automatique pour le français (CP / CE1)
 */
export function syllabifyFrench(phrase: string): string[] {
  const words = phrase
    .trim()
    .split(/[\s\-’']+/)
    .filter(Boolean);

  const allSyllables: string[] = [];

  for (const w of words) {
    allSyllables.push(...syllabifySingleWord(w.toLowerCase()));
  }
  return allSyllables.length > 0 ? allSyllables : [phrase];
}

function isVowelChar(c: string): boolean {
  return /^[aeiouyéèêëàâîïôùûœæ]$/i.test(c);
}

function syllabifySingleWord(word: string): string[] {
  if (word.length <= 3) return [word];

  // Tokenize into vowel clusters (eau, ou, oi, ai, ei, eu, au, ui...) and consonant units (ch, ph, gn, th, qu, gu, br, cr, dr, fr, gr, pr, tr, vr, bl, cl, fl, gl, pl)
  const tokens: { text: string; type: 'V' | 'C' }[] = [];
  let i = 0;

  while (i < word.length) {
    const rem = word.slice(i);

    // 1. Special trigraphs / digraphs that act as vowel nuclei or semi-vowel nuclei
    const vowelMatch = rem.match(/^(eaux|eau|œu|ou|oi|ai|ei|eu|au|ui|ie|ia|io|iu|éo|éa)/i);
    if (vowelMatch) {
      tokens.push({ text: vowelMatch[0], type: 'V' });
      i += vowelMatch[0].length;
      continue;
    }

    if (isVowelChar(word[i])) {
      tokens.push({ text: word[i], type: 'V' });
      i++;
      continue;
    }

    // 2. Inseparable consonant digraphs (ch, ph, gn, th, qu, gu before vowel)
    const consDigraph = rem.match(/^(ch|ph|gn|th|qu|gu(?=[eéèêiîy]))/i);
    if (consDigraph) {
      tokens.push({ text: consDigraph[0], type: 'C' });
      i += consDigraph[0].length;
      continue;
    }

    tokens.push({ text: word[i], type: 'C' });
    i++;
  }

  // Group into syllables: each syllable needs a vowel nucleus 'V'
  const syllables: string[] = [];
  let current = '';
  let hasVowel = false;

  for (let idx = 0; idx < tokens.length; idx++) {
    const tok = tokens[idx];
    if (tok.type === 'V') {
      current += tok.text;
      hasVowel = true;
    } else {
      // Consonant token
      if (!hasVowel) {
        current += tok.text;
      } else {
        // Count how many consonants follow before the next vowel
        let consRun: string[] = [];
        let j = idx;
        while (j < tokens.length && tokens[j].type === 'C') {
          consRun.push(tokens[j].text);
          j++;
        }
        const hasNextVowel = j < tokens.length;

        if (!hasNextVowel) {
          // Trailing consonants at end of word attach to the final syllable
          current += consRun.join('');
          break;
        } else if (consRun.length === 1) {
          // V - C - V => V | CV
          syllables.push(current);
          current = consRun[0];
          hasVowel = false;
        } else {
          // Check liquid clusters (br, cr, dr, fr, gr, pr, tr, vr, bl, cl, fl, gl, pl)
          const lastTwo = consRun.slice(-2).join('');
          const isLiquid = /^(b|c|d|f|g|p|t|v)[rl]$/i.test(lastTwo);
          if (consRun.length === 2 && isLiquid) {
            syllables.push(current);
            current = lastTwo;
            hasVowel = false;
            idx += 1; // consumed 2 consonants
          } else {
            // Split between first consonant(s) and onset of next syllable
            const splitPoint = isLiquid ? consRun.length - 2 : consRun.length - 1;
            current += consRun.slice(0, splitPoint).join('');
            syllables.push(current);
            current = consRun.slice(splitPoint).join('');
            hasVowel = false;
            idx += consRun.length - 1;
          }
        }
      }
    }
  }

  if (current) {
    // If trailing 'e' or 'es' is very short, keep as syllable for CP reading
    syllables.push(current);
  }

  return syllables.length > 0 ? syllables : [word];
}

/**
 * Détecte le son vedette [phonème] d'un mot français en distinguant [èr] et [ier]
 */
export function detectPhonemeHelp(word: string): string {
  const w = word.toLowerCase();
  if (w.includes('ouille')) return 'ouille';
  if (w.includes('eille')) return 'eille';
  if (w.includes('aille')) return 'aille';
  if (w.includes('euil') || w.includes('œuil')) return 'euil';
  if (w.includes('gn')) return 'gn';
  if (w.includes('ph')) return 'ph';
  if (w.includes('ch')) return 'ch';
  if (w.includes('eau')) return 'eau';
  if (w.includes('oin')) return 'oin';
  if (w.includes('ien')) return 'ien';
  if (w.includes('ier') || w.includes('iers')) return 'ier';
  if (w.includes('ill')) return 'ill';
  if (w.includes('oi') || w.includes('oî') || w.includes('oy')) return 'oi';
  if (w.includes('ou') || w.includes('oû') || w.includes('où')) return 'ou';
  if (w.includes('on') || w.includes('om')) return 'on';
  if (w.includes('an') || w.includes('am') || w.includes('en') || w.includes('em')) return 'an';
  if (w.includes('in') || w.includes('im') || w.includes('ain') || w.includes('ein') || w.includes('yn')) return 'in';
  if (w.includes('eur') || w.includes('œur')) return 'eur';
  if (w.includes('eu') || w.includes('œu')) return 'eu';
  if (w.includes('au')) return 'au';
  if (w.includes('ai') || w.includes('ei')) return 'ai';
  if (w.includes('ui')) return 'ui';
  if (w.includes('err') || w.includes('ert') || w.includes('erb') || w.includes('erc') || /er$/.test(w)) return 'èr';
  if (w.includes('é')) return 'é';
  if (w.includes('è') || w.includes('ê')) return 'è';
  if (w.includes('ar')) return 'ar';
  if (w.includes('or')) return 'or';
  if (w.includes('a') || w.includes('â')) return 'a';
  if (w.includes('o') || w.includes('ô')) return 'o';
  if (w.includes('i') || w.includes('î')) return 'i';
  if (w.includes('u') || w.includes('û')) return 'u';
  return 'e';
}

/**
 * Détecte une lettre finale muette courante pour l'aide à la lecture CP
 */
export function detectSilentLetter(word: string, art: string): string | undefined {
  const w = word.toLowerCase();
  if (w.includes(' ')) return undefined; // Ne pas souligner sur les groupes composés
  if (art === 'les' && w.endsWith('s')) return 's';
  if (art === 'les' && w.endsWith('x')) return 'x';
  if (/(chat|rat|plat|chocolat|avocat|soldat|matelas|bras|tapis|radis|souris|brebis|loup|drap|sirop|galop|camp|champ|temps|printemps|renard|canard|lézard|brouillard|foulard|homard|billard|retard|hasard|nid|pied|froid|chaud|noeud|nœud|crapaud|artichaut|abricot|haricot|escargot|paquebot|robot|chariot|sabot|hublot|grelot| maillot|matelot|mulot|cachalot|manchot|chiot|abricot|lit|nuit|fruit|biscuit|bruit|puits|toit|doigt|forêt|intérêt|prêt|arrêt|filet|poulet|volet|sifflet|bracelet|gilet|chalet|bouquet|perroquet|tabouret|bonnet|carnet|jouet|fouet|muet|bleuet|navet|chevet|robinet|cabinet|martinet|chardonneret|furet| béret|galet|palet|billet|oeillet|œillet|juillet|criquet|briquet|parquet|bosquet|casquet|hochet|pichet|guichet|croquet|piquet|loquet|hoquet|blanc|banc|tronc|flanc|jonc|franc|porc|accroc|estomac|tabac|plomb|aplomb|étang|rang|sang|poing|hareng|long|gant|éléphant|flamant|diamant|aimant|croissant|volant|géant|enfant|marchand|brigand|gourmand|étudiant|habitant|passant|combattant|serpent|vent|dent|client|parent|torrent|couvent|moment|jument|vêtement|médicament|monument|instrument|document|bâtiment|appartement|aliment|élément|compliment|sentiment|mouvement|pont|front|mont)$/.test(w)) {
    return w.slice(-1);
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// DICTIONNAIRES ÉTENDUS PAR MONDE (NOMS DE BASE + EXPRESSIONS CP/CE1)
// Format compact : "emoji|art|mot|photoQuery(optionnel)"
// ═══════════════════════════════════════════════════════════════════════════

const EXTRA_ANIMAUX_BASE: string[] = [
  "🐱|le|chaton|chat domestique", "🐕|le|chiot|chien", "🐕|le|berger allemand|berger allemand", "🐩|le|caniche|caniche",
  "🐕|le|teckel|teckel", "🐕|le|lévrier|lévrier", "🐕|le|saint-bernard|saint-bernard (chien)", "🐕|le|dalmatien|dalmatien",
  "🐕|le|labrador|labrador retriever", "🐕|le|husky|husky sibérien", "🐕|le|bouledogue|bouledogue", "🐕|le|beagle|beagle",
  "🐈|le|chat siamois|siamois (chat)", "🐈|le|chat persan|persan (chat)", "🐈|le|lynx|lynx", "🐆|le|léopard|léopard",
  "🐆|le|guépard|guépard", "🐆|la|panthère|panthère noire", "🐆|le|jaguar|jaguar", "🦁|le|lionceau|lion",
  "🦁|la|lionne|lionne", "🐯|le|tigreau|tigre", "🦊|le|renardeau|renard", "🦊|le|fennec|fennec",
  "🐺|la|louve|loup", "🐺|le|louveteau|loup", "🐺|le|coyote|coyote", "🐺|le|chacal|chacal",
  "🐻|l'|ourson|ours", "🐻‍❄️|l'|ours polaire|ours polaire", "🐻|l'|ours brun|ours brun", "🐼|le|panda roux|panda roux",
  "🦡|le|blaireau|blaireau", "🦦|la|belette|belette", "🦦|le|furet|furet", "🦦|l'|hermine|hermine",
  "🦦|la|fouine|fouine", "🦦|la|martre|martre", "🦡|le|raton laveur|raton laveur", "🦨|la|moufette|moufette",
  "🦫|le|castor|castor", "🐿️|la|marmotte|marmotte", "🐿️|le|campagnol|campagnol", "🐿️|le|loir|loir",
  "🐿️|le|lérot|lérot", "🐭|le|mulot|mulot", "🐀|le|rat|rat", "🐹|le|cochon d'Inde|cochon d'Inde",
  "🐹|le|chinchilla|chinchilla", "🐹|la|gerbille|gerbille", "🦔|le|porc-épic|porc-épic", "🐰|le|lièvre|lièvre",
  "🐰|le|lapereau|lapin", "🦌|le|cerf|cerf", "🦌|la|biche|biche", "🦌|le|faon|faon",
  "🦌|le|chevreuil|chevreuil", "🦌|le|renne|renne", "🦌|l'|élan|élan", "🦌|le|caribou|caribou",
  "🦌|le|daim|daim", "🦌|le|chamois|chamois", "🐐|le|bouquetin|bouquetin", "🐐|le|chevreau|chèvre",
  "🐐|le|bouc|bouc", "🐑|la|brebis|brebis", "🐑|l'|agneau|agneau", "🐑|le|bélier|bélier",
  "🐑|le|mouflon|mouflon", "🐮|le|veau|veau", "🐮|le|taureau|taureau", "🐮|le|bœuf|bœuf",
  "🦬|le|bison|bison", "🐃|le|buffle|buffle", "🐃|le|yak|yak", "🐃|le|zébu|zébu",
  "🐴|la|jument|jument", "🐴|le|poulain|poulain", "🐴|le|poney|poney", "🐴|l'|étalon|cheval",
  "🫏|l'|ânesse|âne", "🫏|l'|ânon|âne", "🫏|le|mulet|mulet", "🐷|la|truie|cochon",
  "🐷|le|porcelet|porcelet", "🐗|le|sanglier|sanglier", "🐗|le|marcassin|sanglier", "🐗|le|phacochère|phacochère",
  "🦙|le|lama|lama", "🦙|l'|alpaga|alpaga", "🦙|la|vigogne|vigogne", "🦒|le|girafon|girafe",
  "🦒|l'|okapi|okapi", "🦓|la|gazelle|gazelle", "🦌|l'|antilope|antilope", "🦌|le|gnou|gnou",
  "🦘|le|wallaby|wallaby", "🐨|le|wombat|wombat", "🦘|l'|ornithorynque|ornithorynque", "🦥|le|paresseux|paresseux",
  "🦔|le|tatou|tatou", "🐜|le|fourmilier|fourmilier", "🐒|le|chimpanzé|chimpanzé", "🐒|le|babouin|babouin",
  "🐒|le|macaque|macaque", "🐒|l'|orang-outan|orang-outan", "🐒|le|ouistiti|ouistiti", "🐒|le|lémurien|lémurien",
  "🐒|le|gibbon|gibbon", "🐒|le|mandrill|mandrill", "🦇|la|chauve-souris|chauve-souris", "🦔|la|taupe|taupe",
  "🦔|la|musaraigne|musaraigne", "🦎|le|caméléon|caméléon", "🦎|l'|iguane|iguane", "🦎|le|gecko|gecko",
  "🦎|le|varan|varan", "🐍|le|boa|boa", "🐍|le|python|python", "🐍|la|vipère|vipère",
  "🐍|la|couleuvre|couleuvre", "🐍|le|cobra|cobra", "🐍|l'|anaconda|anaconda", "🐊|l'|alligator|alligator",
  "🐊|le|caïman|caïman", "🐢|la|tortue marine|tortue marine", "🐸|le|crapaud|crapaud", "🐸|le|têtard|têtard",
  "🐸|la|rainette|rainette", "🦎|la|salamandre|salamandre", "🦎|le|triton|triton", "🦎|l'|axolotl|axolotl",
  "🐟|la|truite|truite", "🐟|le|saumon|saumon", "🐟|la|sardine|sardine", "🐟|le|thon|thon",
  "🐟|le|cabillaud|cabillaud", "🐟|la|carpe|carpe", "🐟|le|brochet|brochet", "🐟|le|goujon|goujon",
  "🐟|la|dorade|dorade", "🐟|le|maquereau|maquereau", "🐟|le|hareng|hareng", "🐟|l'|anchois|anchois",
  "🐟|la|sole|sole", "🐟|le|turbot|turbot", "🐟|le|bar|bar (poisson)", "🐟|le|rouget|rouget",
  "🐟|le|merlan|merlan", "🐟|l'|espadon|espadon", "🐟|le|barracuda|barracuda", "🐟|la|murène|murène",
  "🐟|l'|anguille|anguille", "🐟|le|piranha|piranha", "🐠|le|poisson-clown|poisson-clown", "🐡|le|poisson-globe|poisson-globe",
  "🐠|l'|hippocampe|hippocampe", "🦈|la|raie|raie", "🦈|le|requin-marteau|requin-marteau", "🦈|le|requin-baleine|requin-baleine",
  "🐋|le|cachalot|cachalot", "🐋|l'|orque|orque", "🐋|le|béluga|béluga", "🐋|le|narval|narval",
  "🐋|le|marsouin|marsouin", "🦭|le|morse|morse", "🦭|l'|otarie|otarie", "🦭|le|lamantin|lamantin",
  "🦞|le|homard|homard", "🦞|la|langouste|langouste", "🦞|la|langoustine|langoustine", "🦀|l'|écrevisse|écrevisse",
  "🦀|le|bernard-l'ermite|bernard-l'ermite", "🦀|l'|araignée de mer|araignée de mer", "🦑|le|calmar|calmar", "🦑|la|seiche|seiche",
  "🦪|l'|huître|huître", "🐚|la|moule|moule", "🐚|la|palourde|palourde", "🐚|le|bigorneau|bigorneau",
  "🐚|la|coquille Saint-Jacques|coquille Saint-Jacques", "⭐|l'|étoile de mer|étoile de mer", "🪼|l'|oursin|oursin", "🪼|l'|anémone de mer|anémone de mer",
  "🐦|le|moineau|moineau", "🐦|le|rouge-gorge|rouge-gorge", "🐦|la|mésange|mésange", "🐦|l'|hirondelle|hirondelle",
  "🐦|le|merle|merle", "🐦|la|pie|pie bavarde", "🐦|le|corbeau|corbeau", "🐦|la|corneille|corneille",
  "🐦|le|pigeon|pigeon", "🕊️|la|tourterelle|tourterelle", "🐦|le|pinson|pinson", "🐦|le|chardonneret|chardonneret",
  "🐦|le|rossignol|rossignol", "🐦|l'|alouette|alouette", "🐦|le|coucou|coucou", "🐦|le|pivert|pivert",
  "🐦|le|martin-pêcheur|martin-pêcheur", "🐦|le|colibri|colibri", "🐦|le|geai|geai des chênes", "🐦|l'|étourneau|étourneau",
  "🐦|le|bouvreuil|bouvreuil", "🐦|le|roitelet|roitelet", "🐦|le|martinet|martinet", "🐦|la|bergeronnette|bergeronnette",
  "🐦|le|canari|canari", "🦜|le|toucan|toucan", "🦜|le|cacatoès|cacatoès", "🦜|la|perruche|perruche",
  "🦜|l'|ara|ara (oiseau)", "🦩|la|cigogne|cigogne", "🦩|le|héron|héron", "🦩|la|grue|grue (oiseau)",
  "🦩|le|pélican|pélican", "🦩|l'|ibis|ibis", "🦩|le|cormoran|cormoran", "🦆|l'|oie|oie",
  "🦆|le|jars|oie", "🦆|le|caneton|caneton", "🦆|la|sarcelle|sarcelle", "🦅|le|faucon|faucon",
  "🦅|le|vautour|vautour", "🦅|l'|épervier|épervier", "🦅|la|buse|buse", "🦅|le|condor|condor",
  "🦅|le|milan|milan (oiseau)", "🦉|le|hibou|hibou", "🦉|la|hulotte|chouette hulotte", "penguins|le|manchot|manchot",
  "🐦|l'|albatros|albatros", "🐦|la|mouette|mouette", "🐦|le|goéland|goéland", "🐦|le|macareux|macareux",
  "🦤|l'|autruche|autruche", "🦤|l'|émeu|émeu", "🦤|le|casoar|casoar", "🦤|le|kiwi|kiwi (oiseau)",
  "🦚|le|faisan|faisan", "🐔|la|caille|caille", "🐔|la|perdrix|perdrix", "🐔|la|pintade|pintade",
  "🦋|la|libellule|libellule", "🐝|le|bourdon|bourdon", "🐝|la|guêpe|guêpe", "🐝|le|frelon|frelon",
  "🦗|la|sauterelle|sauterelle", "🦗|le|criquet|criquet", "🦗|le|grillon|grillon", "🦗|la|cigale|cigale",
  "🦗|la|mante religieuse|mante religieuse", "🦗|le|phasme|phasme", "🪲|le|scarabée|scarabée", "🪲|le|hanneton|hanneton",
  "🪲|le|lucane|lucane cerf-volant", "🪲|la|luciole|luciole", "🪲|le|bousier|bousier", "🪲|le|gendarme|gendarme (insecte)",
  "🪰|la|mouche|mouche", "🦟|le|moustique|moustique", "🪰|le|taon|taon", "🐜|le|termite|termite",
  "🐛|le|mille-pattes|mille-pattes", "🐛|le|cloporte|cloporte", "🪱|le|ver de terre|ver de terre", "🐌|la|limace|limace",
  "🦂|le|scorpion|scorpion", "🕷️|la|mygale|mygale", "🕷️|la|tarentule|tarentule", "🦋|le|sphynx|sphinx (papillon)",
  "🦋|le|machaon|machaon", "🦋|le|paon-du-jour|paon-du-jour"
];

const EXTRA_ALIMENTS_BASE: string[] = [
  "🍑|l'|abricot|abricot", "🍒|la|griotte|cerise", "🍓|la|framboise|framboise", "🫐|la|mûre|mûre (fruit)",
  "🫐|le|cassis|cassis (fruit)", "🍒|la|groseille|groseille", "🍑|la|prune|prune", "🍑|la|mirabelle|mirabelle",
  "🍑|la|quetsche|quetsche", "🍑|le|pruneau|pruneau", "🍑|la|nectarine|nectarine", "🍑|le|brugnon|brugnon",
  "🍊|la|clémentine|clémentine", "🍊|la|mandarine|mandarine", "🍊|le|pamplemousse|pamplemousse", "🍋|le|citron vert|citron vert",
  "🍊|le|kumquat|kumquat", "🍊|la|bergamote|bergamote", "🍐|le|coing|coing", "🍈|la|figue|figue",
  "🌴|la|datte|datte", "🍎|la|grenade|grenade (fruit)", "🍅|le|kaki|kaki", "🍒|le|litchi|litchi",
  "🥭|la|papaye|papaye", "🥭|la|goyave|goyave", "🥭|le|fruit de la passion|fruit de la passion", "⭐|la|carambole|carambole",
  "🐉|le|fruit du dragon|pitaya", "🌿|la|rhubarbe|rhubarbe", "🌰|la|noix|noix", "🌰|la|noisette|noisette",
  "🌰|l'|amande|amande", "🥜|la|pistache|pistache", "🥜|la|noix de cajou|noix de cajou", "🥜|la|noix de pécan|noix de pécan",
  "🌰|le|pignon de pin|pignon de pin", "🥬|le|chou|chou", "🥦|le|chou-fleur|chou-fleur", "🥬|le|chou rouge|chou rouge",
  "🥬|le|chou de Bruxelles|chou de Bruxelles", "🥬|la|laitue|laitue", "🥬|la|mâche|mâche", "🥬|la|roquette|roquette",
  "🥬|l'|endive|endive", "🥬|l'|épinard|épinard", "🥬|le|cresson|cresson", "🥬|la|blette|blette",
  "🥒|la|courgette|courgette", "🎃|la|citrouille|citrouille", "🎃|le|potiron|potiron", "🎃|le|potimarron|potimarron",
  "🎃|la|courge|courge", "🥕|le|navet|navet", "🥕|le|panais|panais", "🍠|la|patate douce|patate douce",
  "🫜|la|betterave|betterave", "🥬|le|céleri|céleri", "🥬|le|fenouil|fenouil", "🥬|le|poireau|poireau",
  "🥬|l'|asperge|asperge", "🥬|l'|artichaut|artichaut", "🧅|l'|échalote|échalote", "🌿|la|ciboulette|ciboulette",
  "🌿|le|persil|persil", "🌿|le|basilic|basilic", "🌿|la|menthe|menthe", "🌿|le|thym|thym",
  "🌿|le|romarin|romarin", "🌿|la|coriandre|coriandre", "🌿|l'|estragon|estragon", "🌿|l'|aneth|aneth",
  "🌿|le|laurier|laurier", "🫛|le|petit pois|petit pois", "🫛|la|lentille|lentille cultivée", "🫛|le|pois chiche|pois chiche",
  "🫛|la|fève|fève", "🫛|le|haricot vert|haricot vert", "🫛|le|haricot rouge|haricot rouge", "🫛|le|haricot blanc|haricot blanc",
  "🫛|le|soja|soja", "🍄|la|chanterelle|chanterelle", "🍄|le|cèpe|cèpe", "🍄|la|morille|morille",
  "🍄|la|truffe|truffe (champignon)", "🫒|l'|olive|olive", "🥒|le|cornichon|cornichon", "🥖|la|baguette|baguette (pain)",
  "🍞|le|pain complet|pain complet", "🍞|le|pain de mie|pain de mie", "🍞|le|pain aux céréales|pain", "🍞|la|ficelle|baguette",
  "🍞|la|biscotte|biscotte", "🥐|le|pain au chocolat|pain au chocolat", "🥐|le|pain aux raisins|pain aux raisins", "🥐|le|chausson aux pommes|chausson aux pommes",
  "🥐|la|chouquette|chouquette", "🧁|l'|éclair au chocolat|éclair (pâtisserie)", "🧁|la|religieuse|religieuse (pâtisserie)", "🥧|le|mille-feuille|mille-feuille",
  "🥧|le|macaron|macaron", "🧁|la|madeleine|madeleine (cuisine)", "🧁|le|financier|financier (pâtisserie)", "🧁|le|canelé|canelé",
  "🧁|la|meringue|meringue", "🧁|le|muffin|muffin", "🍪|le|cookie|cookie", "🍪|le|sablé|sablé (biscuit)",
  "🍪|le|spéculoos|spéculoos", "🍪|le|palmier|palmier (pâtisserie)", "🍪|le|boudoir|boudoir (biscuit)", "🍪|la|gaufrette|gaufrette",
  "🍫|le|brownie|brownie", "🍰|le|flan|flan pâtissier", "🍰|le|clafoutis|clafoutis", "🍰|la|charlotte|charlotte (dessert)",
  "🍰|la|bûche|bûche de Noël", "🥧|la|galette|galette des rois", "🍰|le|tiramisu|tiramisu", "🍮|la|mousse au chocolat|mousse au chocolat",
  "🍮|le|riz au lait|riz au lait", "🍮|la|compote|compote", "🍨|le|sorbet|sorbet", "🍨|l'|esquimau|crème glacée",
  "🥛|le|yaourt|yaourt", "🥛|le|fromage blanc|fromage blanc", "🥛|le|petit-suisse|petit-suisse", "🧀|le|camembert|camembert",
  "🧀|le|gruyère|gruyère", "🧀|le|comté|comté (fromage)", "🧀|l'|emmental|emmental", "🧀|le|roquefort|roquefort",
  "🧀|le|brie|brie (fromage)", "🧀|le|reblochon|reblochon", "🧀|la|mozzarella|mozzarella", "🧀|le|parmesan|parmesan",
  "🧀|la|feta|feta", "🧀|le|chèvre|fromage de chèvre", "🧀|le|cantal|cantal (fromage)", "🧀|la|raclette|raclette",
  "🧀|la|fondue|fondue au fromage", "🍖|la|saucisse|saucisse", "🍖|le|saucisson|saucisson", "🍖|le|pâté|pâté",
  "🥓|le|lard|lard", "🍖|le|rôti|rôti", "🥩|le|steak|steak", "🍖|la|côtelette|côtelette",
  "🍖|la|boulette|boulette de viande", "🍗|la|dinde|dinde", "🍗|le|canard rôti|magret", "🐟|le|poisson pané|poisson pané",
  "🍤|le|beignet de crevette|crevette", "🥚|l'|omelette|omelette", "🥚|l'|œuf au plat|œuf au plat", "🥚|l'|œuf à la coque|œuf à la coque",
  "🥚|l'|œuf dur|œuf dur", "🥧|la|quiche|quiche lorraine", "🥪|le|croque-monsieur|croque-monsieur", "🍔|le|hamburger|hamburger",
  "🌭|le|hot-dog|hot-dog", "🌮|le|taco|taco", "🥙|la|galette de sarrasin|galette de sarrasin", "🥔|la|purée|purée de pommes de terre",
  "🥔|le|gratin|gratin dauphinois", "🍲|le|potage|potage", "🍲|le|bouillon|bouillon", "🍲|la|ratatouille|ratatouille",
  "🍲|le|couscous|couscous", "🥘|la|paella|paella", "🍝|les|spaghettis|spaghetti", "🍝|les|macaronis|macaroni",
  "🍝|les|coquillettes|coquillette", "🍝|les|raviolis|ravioli", "🍝|les|lasagnes|lasagne", "🍝|les|gnocchis|gnocchi",
  "🍚|la|semoule|semoule", "🌾|le|blé|blé", "🌾|l'|avoine|flocon d'avoine", "🥣|les|céréales|céréales de petit-déjeuner",
  "🧂|le|sel|sel alimentaire", "🧂|le|poivre|poivre", "🧂|le|sucre|sucre", "🌾|la|farine|farine",
  "🫒|l'|huile d'olive|huile d'olive", "🍶|le|vinaigre|vinaigre", "🥫|la|moutarde|moutarde (condiment)", "🥫|la|mayonnaise|mayonnaise",
  "🥫|le|ketchup|ketchup", "🥫|la|sauce tomate|sauce tomate", "🍫|le|cacao|cacao", "🍦|la|vanille|vanille",
  "🪵|la|cannelle|cannelle", "🍬|le|caramel|caramel", "🍬|la|guimauve|guimauve", "🍬|le|nougat|nougat",
  "🍬|la|réglisse|réglisse", "🍬|la|dragée|dragée", "🍬|le|praliné|praliné", "🌰|la|pâte à tartiner|pâte à tartiner",
  "🍯|le|sirop d'érable|sirop d'érable", "🍹|le|sirop de fraise|sirop", "🍋|la|limonade|limonade", "🍎|le|jus de pomme|jus de pomme",
  "🍊|le|jus d'orange|jus d'orange", "🍇|le|jus de raisin|jus de raisin", "🥛|le|chocolat chaud|chocolat chaud", "🍵|le|thé|thé"
];

const EXTRA_NATURE_BASE: string[] = [
  "🌳|le|chêne|chêne", "🌳|le|hêtre|hêtre", "🌳|le|bouleau|bouleau", "🌳|le|peuplier|peuplier",
  "🌳|le|saule pleureur|saule pleureur", "🌳|le|tilleul|tilleul", "🌳|le|platane|platane", "🌳|le|marronnier|marronnier",
  "🌳|le|châtaignier|châtaignier", "🌳|l'|érable|érable", "🌳|le|frêne|frêne", "🌳|l'|orme|orme",
  "🌳|l'|olivier|olivier", "🌳|le|figuier|figuier", "🌳|le|pommier|pommier", "🌳|le|poirier|poirier",
  "🌳|le|cerisier|cerisier", "🌳|le|pêcher|pêcher", "🌳|l'|abricotier|abricotier", "🌳|le|prunier|prunier",
  "🌳|l'|amandier|amandier", "🌳|le|noyer|noyer", "🌳|le|noisetier|noisetier", "🌳|l'|oranger|oranger",
  "🌳|le|citronnier|citronnier", "🌲|le|pin|pin (arbre)", "🌲|le|cèdre|cèdre", "🌲|le|cyprès|cyprès",
  "🌲|le|mélèze|mélèze", "🌲|le|séquoia|séquoia", "🌴|le|cocotier|cocotier", "🌴|le|bananier|bananier",
  "🌳|le|baobab|baobab", "🌳|l'|eucalyptus|eucalyptus", "🌳|le|mimosa|mimosa", "🌿|le|buisson|buisson",
  "🌿|l'|arbuste|arbuste", "🌿|la|haie|haie", "🌿|la|ronce|ronce", "🌿|le|lierre|lierre",
  "🌿|la|fougère|fougère", "🌿|la|mousse|mousse (botanique)", "🌿|le|lichen|lichen", "🌿|le|roseau|roseau",
  "🌿|le|jonc|jonc", "🌿|l'|ortie|ortie", "🌿|le|chardon|chardon", "🌼|le|pissenlit|pissenlit",
  "🌼|la|pâquerette|pâquerette", "🌺|le|coquelicot|coquelicot", "🪻|le|bleuet|bleuet (plante)", "🪻|la|lavande|lavande",
  "🪻|la|violette|violette", "🪻|le|lilas|lilas", "🌸|le|muguet|muguet de mai", "🌼|la|jonquille|jonquille",
  "🌼|le|narcisse|narcisse", "🪻|l'|iris|iris (genre végétal)", "🌸|l'|œillet|œillet", "🌸|le|géranium|géranium",
  "🌸|la|pivoine|pivoine", "🌸|le|dahlia|dahlia", "🌸|l'|hortensia|hortensia", "🌸|le|camélia|camélia",
  "🌸|le|magnolia|magnolia", "🌸|le|jasmin|jasmin", "🌸|le|chèvrefeuille|chèvrefeuille", "🪻|la|glycine|glycine",
  "🌺|l'|hibiscus|hibiscus", "🌺|l'|orchidée|orchidée", "🪷|le|nénuphar|nénuphar", "🌼|le|bouton-d'or|bouton-d'or",
  "🌸|le|myosotis|myosotis", "🌸|la|pensée|pensée (fleur)", "🌸|la|primevère|primevère", "🌸|le|cyclamen|cyclamen",
  "🌸|le|glaïeul|glaïeul", "🌸|le|lys|lys", "🌿|la|bruyère|bruyère", "🌿|le|genêt|genêt",
  "🌿|le|houx|houx", "🌿|le|gui|gui", "🪵|le|tronc|tronc (botanique)", "🪵|l'|écorce|écorce",
  "🌱|la|racine|racine (botanique)", "🌱|la|tige|tige", "🌸|le|pétale|pétale", "🌸|le|pollen|pollen",
  "🌹|l'|épine|épine (botanique)", "🌲|la|pomme de pin|cône (botanique)", "🌰|le|gland|gland", "🌰|le|marron|marron",
  "🌾|la|paille|paille", "🌾|le|foin|foin", "🌾|l'|épi de blé|épi", "🌊|l'|océan|océan",
  "🏞️|le|lac|lac", "🏞️|l'|étang|étang", "🏞️|la|mare|mare", "🏞️|le|marais|marais",
  "🏞️|le|fleuve|fleuve", "🏞️|le|ruisseau|ruisseau", "🏞️|le|torrent|torrent", "🌊|la|marée|marée",
  "🌊|l'|écume|écume", "🌊|le|tourbillon|tourbillon", "🏖️|la|dune|dune", "🏖️|le|sable|sable",
  "🪨|le|galet|galet", "⛰️|la|falaise|falaise", "🏖️|la|crique|crique", "🏖️|la|baie|baie (géographie)",
  "🏝️|la|presqu'île|presqu'île", "🏝️|l'|archipel|archipel", "🪸|le|récif|récif", "🏝️|le|lagon|lagon",
  "🧊|l'|iceberg|iceberg", "🧊|la|banquise|banquise", "🏔️|le|glacier|glacier", "🏔️|le|sommet|sommet",
  "🏔️|le|pic|pic", "🏞️|la|vallée|vallée", "🏞️|le|canyon|canyon", "🏞️|le|ravin|ravin",
  "🏞️|la|plaine|plaine", "🏞️|la|prairie|prairie", "🏞️|le|pré|pré", "🌾|le|champ|champ",
  "🌳|la|clairière|clairière", "🌳|le|sous-bois|sous-bois", "🌴|la|jungle|jungle", "🦁|la|savane|savane",
  "🏜️|l'|oasis|oasis", "🌋|le|cratère|cratère", "🌋|la|lave|lave", "🪨|la|pierre|pierre",
  "🪨|le|granit|granit", "🪨|le|calcaire|calcaire", "🪨|l'|ardoise|ardoise", "🪨|l'|argile|argile",
  "🪨|la|boue|boue", "🪨|la|terre|terre", "🪨|le|gravier|gravier", "💎|le|cristal|cristal",
  "💎|le|quartz|quartz", "💎|l'|émeraude|émeraude", "💎|le|rubis|rubis", "💎|le|saphir|saphir",
  "🐚|l'|ambre|ambre", "🦴|le|fossile|fossile", "🐚|l'|algue|algue", "🌤️|le|ciel|ciel",
  "🌅|l'|horizon|horizon", "🌅|l'|aube|aube", "🌇|le|crépuscule|crépuscule", "☀️|le|zénith|zénith",
  "🌑|l'|éclipse|éclipse", "⭐|la|constellation|constellation", "🌠|l'|étoile filante|étoile filante", "☄️|la|météorite|météorite",
  "🪐|l'|astéroïde|astéroïde", "🌌|le|cosmos|cosmos", "🌌|la|Voie lactée|Voie lactée", "🌬️|la|brise|brise",
  "🌬️|la|rafale|rafale", "⛈️|la|tempête|tempête", "🌀|l'|ouragan|ouragan", "🌀|le|cyclone|cyclone",
  "⛈️|le|tonnerre|tonnerre", "⛈️|la|foudre|foudre", "🌧️|l'|averse|averse", "🌧️|la|bruine|bruine",
  "🌨️|la|grêle|grêle", "❄️|le|givre|givre", "❄️|le|verglas|verglas", "💧|la|rosée|rosée",
  "🌫️|la|brume|brume", "☀️|la|canicule|canicule", "❄️|le|gel|gel", "🌸|le|printemps|printemps",
  "☀️|l'|été|été", "❄️|l'|hiver|hiver", "🌡️|la|chaleur|chaleur", "☀️|le|rayon de soleil|soleil",
  "👤|l'|ombre|ombre", "🌊|le|reflet|reflet", "⛰️|l'|écho|écho"
];

const EXTRA_MAISON_BASE: string[] = [
  "🏠|le|toit|toit", "🧱|la|cheminée|cheminée", "🧱|le|mur|mur", "🏠|le|plafond|plafond",
  "🪵|le|plancher|plancher", "🪵|le|parquet|parquet", "🧱|le|carrelage|carrelage", "🪜|l'|escalier|escalier",
  "🪜|la|marche|escalier", "🪜|la|rampe|escalier", "🏠|le|couloir|couloir", "🏠|l'|entrée|entrée",
  "🛋️|le|salon|salon", "🍽️|la|salle à manger|salle à manger", "🍳|la|cuisine|cuisine", "🛏️|la|chambre|chambre à coucher",
  "🛁|la|salle de bain|salle de bains", "🏠|le|grenier|grenier", "🏠|la|cave|cave", "🚗|le|garage|garage",
  "🌿|le|balcon|balcon", "☀️|la|terrasse|terrasse", "🌻|le|jardin|jardin", "栅|la|clôture|clôture",
  "🚪|le|portail|portail", "📬|la|boîte aux lettres|boîte aux lettres", "🔔|la|sonnette|sonnette", "🚪|le|paillasson|paillasson",
  "🪟|le|volet|volet", "🪟|le|rideau|rideau", "🪟|le|store|store", "🛋️|le|fauteuil|fauteuil",
  "🪑|le|tabouret|tabouret", "🪑|le|banc|banc", "🪑|la|table|table", "🪑|la|table basse|table basse",
  "🖥️|le|bureau|bureau (meuble)", "🗄️|l'|armoire|armoire", "🗄️|le|placard|placard", "🗄️|la|commode|commode",
  "🗄️|le|tiroir|tiroir", "📚|l'|étagère|étagère", "🛏️|le|berceau|berceau", "🛏️|le|matelas|matelas",
  "🛏️|l'|oreiller|oreiller", "🛏️|le|traversin|traversin", "🛏️|le|coussin|coussin", "🛏️|la|couette|couette",
  "🛏️|le|drap|drap", "🛏️|la|couverture|couverture", "🛏️|le|plaid|plaid", "🧶|le|tapis|tapis",
  "🧶|la|moquette|moquette", "🕯️|le|lustre|lustre", "💡|l'|abat-jour|abat-jour", "💡|l'|ampoule|ampoule électrique",
  "🔌|l'|interrupteur|interrupteur", "🔌|la|prise|prise électrique", "🔥|le|radiateur|radiateur", "🌀|le|ventilateur|ventilateur",
  "🧊|le|réfrigérateur|réfrigérateur", "🧊|le|congélateur|congélateur", "🔥|le|four|four", "🔥|le|micro-ondes|four à micro-ondes",
  "🍳|la|plaque de cuisson|plaque de cuisson", "🧺|le|lave-vaisselle|lave-vaisselle", "🧺|le|lave-linge|lave-linge", "🧺|le|sèche-linge|sèche-linge",
  "🍞|le|grille-pain|grille-pain", "☕|la|cafetière|cafetière", "🫖|la|bouilloire|bouilloire", "🥣|le|mixeur|mixeur",
  "🥣|le|robot de cuisine|robot de cuisine", "⚖️|la|balance|balance de cuisine", "🍲|la|marmite|marmite", "🍲|la|cocotte|cocotte",
  "🥗|le|saladier|saladier", "🍽️|le|plat|plat", "🥧|le|moule à gâteau|moule (cuisine)", "🍽️|le|plateau|plateau",
  "🫗|la|carafe|carafe", "🫗|le|pichet|pichet", "☕|le|mug|mug", "🍷|le|verre à pied|verre",
  "🥄|la|petite cuillère|cuillère", "🥄|la|louche|louche", "🍳|la|spatule|spatule", "🥣|le|fouet|fouet (cuisine)",
  "🥖|le|rouleau à pâtisserie|rouleau à pâtisserie", "🧀|la|râpe|râpe", "🍝|la|passoire|passoire", "🔪|l'|économe|économe",
  "🥫|l'|ouvre-boîte|ouvre-boîte", "🍾|le|tire-bouchon|tire-bouchon", "🪵|la|planche à découper|planche à découper", "🧻|la|serviette|serviette de table",
  "🍽️|la|nappe|nappe", "🧣|le|torchon|torchon", "🧤|le|tablier|tablier", "🗑️|la|poubelle|poubelle",
  "🧹|le|balai-brosse|balai", "🧹|la|pelle|pelle", "🧹|la|serpillière|serpillière", "🧹|l'|aspirateur|aspirateur",
  "🧹|le|chiffon|chiffon", "🧹|le|plumeau|plumeau", "🧺|la|lessive|lessive", "🧺|la|pince à linge|pince à linge",
  "🧺|l'|étendoir|étendoir", "熨|le|fer à repasser|fer à repasser", "🚰|le|lavabo|lavabo", "🚰|l'|évier|évier",
  "🚰|le|robinet|robinet", "🛁|le|tapis de bain|tapis", "🛁|la|serviette de bain|serviette", "👘|le|peignoir|peignoir",
  "🧴|le|shampoing|shampoing", "🪥|le|dentifrice|dentifrice", "🪮|le|peigne|peigne", "🪮|la|brosse à cheveux|brosse à cheveux",
  "💨|le|sèche-cheveux|sèche-cheveux", "🧻|le|mouchoir|mouchoir", "👕|le|pyjama|pyjama", "👕|la|chemise|chemise",
  "👕|le|tee-shirt|tee-shirt", "🧶|le|pull|pull-over", "🧥|le|gilet|gilet", "🧥|la|veste|veste",
  "🧥|l'|anorak|anorak", "🧥|l'|imperméable|imperméable", "👗|la|jupe|jupe", "🩳|le|short|short",
  "👖|la|salopette|salopette", "🧦|le|collant|collant", "🥿|le|chausson|chausson", "🥿|la|pantoufle|pantoufle",
  "👡|la|sandale|sandale", "👒|la|casquette|casquette", "🧶|le|bonnet|bonnet", "👒|le|béret|béret",
  "🎀|la|ceinture|ceinture", "👔|la|cravate|cravate", "🎀|le|nœud papillon|nœud papillon", "⌚|la|montre|montre",
  "📿|le|collier|collier", "📿|le|bracelet|bracelet", "👜|le|sac à main|sac à main", "👛|le|porte-monnaie|porte-monnaie",
  "Portefeuille|le|portefeuille|portefeuille", "🔒|la|serrure|serrure", "🔒|le|cadenas|cadenas", "🪴|l'|arrosoir|arrosoir",
  "🪴|le|tuyau d'arrosage|tuyau d'arrosage", "🌱|la|tondeuse|tondeuse à gazon", "🍂|le|râteau|râteau", "🌱|la|bêche|bêche",
  "🛒|la|brouette|brouette", "🪴|le|pot de fleurs|pot de fleurs", "🏖️|le|parasol|parasol", "🏖️|le|transat|transat",
  "🌴|le|hamac|hamac", "🤸|la|balançoire|balançoire", "🏠|la|niche|niche"
];

const EXTRA_TRANSPORTS_BASE: string[] = [
  "🚗|la|berline|automobile", "🚗|le|cabriolet|cabriolet", "🚙|le|monospace|monospace", "🚙|la|fourgonnette|fourgonnette",
  "🚙|la|camionnette|camionnette", "🚐|le|camping-car|camping-car", "🚐|la|caravane|caravane", "🚗|la|limousine|limousine",
  "🚙|le|tout-terrain|véhicule tout-terrain", "🏎️|le|karting|karting", "🏎️|le|bolide|voiture de course", "🚌|l'|autocar|autocar",
  "🚌|le|minibus|minibus", "🚌|le|bus scolaire|autobus scolaire", "🚎|le|trolleybus|trolleybus", "🚚|le|poids lourd|poids lourd",
  "🚛|le|semi-remorque|semi-remorque", "🚚|le|camion-benne|camion-benne", "🚚|le|camion-citerne|camion-citerne", "🚚|le|camion-poubelle|benne à ordures",
  "🚜|la|dépanneuse|dépanneuse", "🚜| la|pelleteuse|pelleteuse", "🚜|le|bulldozer|bulldozer", "🏗️|la|grue|grue (engin)",
  "🚜|le|rouleau compresseur|rouleau compresseur", "🚜|la|bétonnière|bétonnière", "🚜|le|chariot élévateur|chariot élévateur", "🚜|la|moissonneuse-batteuse|moissonneuse-batteuse",
  "🚜|le|chasse-neige|chasse-neige", "🏍️|la|mobylette|mobylette", "🏍️|le|cyclomoteur|cyclomoteur", "🏍️|le|side-car|side-car",
  "🏍️|le|quad|quad", "🚲|le|tricycle|tricycle", "🚲|le|tandem|tandem", "🚲|le|monocycle|monocycle",
  "🚲|le|VTT|vélo tout-terrain", "🚲|la|draisienne|draisienne", "🛼|le|roller|roller", "👶|la|poussette|poussette",
  "🦽|le|fauteuil roulant|fauteuil roulant", "🚂|la|locomotive|locomotive", "🚃|la|micheline|autorail", "🚆|le|train de marchandises|train",
  "🚇|le|funiculaire|funiculaire", "🚡|la|télécabine|télécabine", "🎿|le|télésiège|télésiège", "🎿|le|téléski|téléski",
  "✈️|l'|avion de ligne|avion de ligne", "🛩️|l'|avion de chasse|avion de chasse", "🛩️|l'|hydravion|hydravion", "🛩️|le|planeur|planeur",
  "🛩️|le|biplan|biplan", "🛩️|l'|ULM|ultra-léger motorisé", "🎈|le|dirigeable|ballon dirigeable", "🪂|le|deltaplane|deltaplane",
  "🪂|le|parapente|parapente", "🚀|la|navette spatiale|navette spatiale", "🛰️|la|sonde spatiale|sonde spatiale", "🛰️|la|station spatiale|station spatiale",
  "🚀|le|module lunaire|module lunaire", "🤖|le|rover|astromobile", "⛵|le|catamaran|catamaran", "⛵|le|trimaran|trimaran",
  "⛵|la|planche à voile|planche à voile", "🛥️|le|yacht|yacht", "🚢|le|ferry|ferry (bateau)", "🚢|le|cargo|navire cargo",
  "🚢|le|porte-conteneurs|porte-conteneurs", "🚢|le|pétrolier|pétrolier", "🚢|le|chalutier|chalutier", "🚢|le|remorqueur|remorqueur",
  "🚢|la|péniche|péniche", "🛶|la|barque|barque", "🛶|le|kayak|kayak", "🛶|la|pirogue|pirogue",
  "🛶|la|gondole|gondole", "🛶|le|pédalo|pédalo", "🚤|le|jet-ski|moto-marine", "🚤|le|zodiac|bateau pneumatique",
  "🚢|le|sous-marin|sous-marin", "🚢|le|bathysphère|bathysphère", "🚢|le|porte-avions|porte-avions", "⛵|le|galion|galion",
  "⛵|la|caravelle|caravelle", "🛷|le|traîneau|traîneau", "🛷|le|bobsleigh|bobsleigh", "🛷|la|motoneige|motoneige",
  "🏂|le|snowboard|snowboard", "🥾|la|raquette à neige|raquette à neige", "🐎|la|diligence|diligence", "🐎|le|char|char",
  "🪑|le|palanquin|palanquin", "🚲|le|pousse-pousse|pousse-pousse", "🛺|le|tuk-tuk|tuk-tuk", "🛞|le|volant|volant (direction)",
  "🛞|le|guidon|guidon", "🛞|la|pédale|pédale", "🛞|le|frein|frein", "🛞|le|pneu|pneu",
  "⚙️|le|moteur|moteur", "⚙️|l'|hélice|hélice", "✈️|l'|aile|aile (aéronautique)", "⛵|la|voile|voile (navigation)",
  "⛵|le|mât|mât", "⛵|le|gouvernail|gouvernail", "🛶|la|rame|rame", "🛶|la|pagaie|pagaie",
  "🚗|le|pare-brise|pare-brise", "🚗|l'|essuie-glace|essuie-glace", "🚗|le|rétroviseur|rétroviseur", "🚗|le|clignotant|clignotant",
  "🚗|le|klaxon|klaxon", "🚗|le|coffre|coffre", "🚗|le|capot|capot", "🚗|le|pare-chocs|pare-chocs",
  "🚗|la|ceinture de sécurité|ceinture de sécurité", "💺|le|siège auto|siège enfant", "🛣️|l'|autoroute|autoroute", "🛣️|le|chemin|chemin",
  "🛣️|le|sentier|sentier", "🛣️|le|trottoir|trottoir", "🚸|le|passage piéton|passage piéton", "🔄|le|rond-point|carrefour giratoire",
  "🛣️|le|carrefour|carrefour", "🚇|le|tunnel|tunnel", "🌉|le|viaduc|viaduc", "🌉|la|passerelle|passerelle",
  "🅿️|le|parking|parking", "✈️|l'|aéroport|aéroport", "✈️|la|piste d'atterrissage|piste", "⚓|le|port|port",
  "⚓|le|quai|quai", "⚓|la|jetée|jetée", "🚢|l'|écluse|écluse", "🏞️|le|canal|canal",
  "🚉|le|guichet|guichet", "🧳|le|bagage|bagage", "🛂|le|passeport|passeport"
];

const EXTRA_ECOLE_BASE: string[] = [
  "🧽|la|gomme|gomme", "✏️|le|taille-crayon|taille-crayon", "🖍️|le|feutre|stylo-feutre", "🖍️|le|surligneur|surligneur",
  "✏️|le|crayon de couleur|crayon de couleur", "🖍️|la|craie|craie", "⬛|l'|ardoise|ardoise", "⬛|le|tableau noir|tableau noir",
  "🧽|l'|éponge|éponge", "🎒|la|trousse|trousse", "📁|le|classeur|classeur", "📄|la|feuille|feuille de papier",
  "📋|la|copie|papier", "✉️|l'|enveloppe|enveloppe", "🏷️|l'|étiquette|étiquette", "🧴|la|colle|colle",
  "テープ|le|scotch|ruban adhésif", "📎|l'|agrafeuse|agrafeuse", "📐|le|compas|compas (géométrie)", "📐|le|rapporteur|rapporteur",
  "🎨|la|gouache|gouache", "🎨|l'|aquarelle|aquarelle", "🧶|la|pâte à modeler|pâte à modeler", "📄|l'|origami|origami",
  "📖|le|dictionnaire|dictionnaire", "📚|l'|encyclopédie|encyclopédie", "🗺️|l'|atlas|atlas", "🦸|la|bande dessinée|bande dessinée",
  "📖|le|conte|conte", "📜|la|poésie|poésie", "📖|la|fable|fable", "📰|le|magazine|magazine",
  "🔤|l'|alphabet|alphabet", "🔤|la|lettre|lettre (alphabet)", "🔤|la|voyelle|voyelle", "🔤|la|consonne|consonne",
  "🔤|la|syllabe|syllabe", "🔤|le|mot|mot", "🔤|la|phrase|phrase", "🔤|la|majuscule|majuscule",
  "🔤|la|minuscule|minuscule", "🔢|le|chiffre|chiffre", "🔢|le|nombre|nombre", "➕|l'|addition|addition",
  "➖|la|soustraction|soustraction", "✖️|la|multiplication|multiplication", "⚪|le|cercle|cercle", "🟦|le|carré|carré",
  "🔺|le|triangle|triangle", "🟦|le|rectangle|rectangle", "🔶|le|losange|losange", "⭐|l'|étoile|étoile",
  "🧊|le|cube|cube", "🔮|la|sphère|sphère", "🏫|la|salle de classe|salle de classe", "🪑|le|pupitre|pupitre",
  "🤸|la|cour de récréation|cour de récréation", "🍽️|la|cantine|cantine", "🤸|le|gymnase|gymnase", "🏃|le|stade|stade",
  "🏊|la|piscine|piscine", "🎼|la|harpe|harpe", "🎻|le|violoncelle|violoncelle", "🎻|la|contrebasse|contrebasse",
  "🪈|la|clarinette|clarinette", "🪈|le|hautbois|hautbois", "🎺|le|cor|cor d'harmonie", "🎺|le|tuba|tuba",
  "🎹|le|xylophone|xylophone", "🥁|le|tambourin|tambourin", "🔺|le|triangle|triangle (instrument)", "🥁|les|cymbales|cymbale",
  "🎸|le|banjo|banjo", "🎸|le|ukulélé|ukulélé", "🎸|la|mandoline|mandoline", "🪗|l'|harmonica|harmonica",
  "🪗|la|cornemuse|cornemuse", "🎹|l'|orgue|orgue", "🥁|le|djembé|djembé", "🎼|la|partition|partition",
  "🎼|la|mélodie|mélodie", "🎵|la|chanson|chanson", "🎶|la|chorale|chorale", "🎻|l'|orchestre|orchestre",
  "🏉|le|rugby|rugby", "🏐|le|volley|volley-ball", "🤾|le|handball|handball", "⛳|le|golf|golf",
  "🏒|le|hockey|hockey", "🏸|le|badminton|badminton", "🏓|le|ping-pong|tennis de table", "🥋|le|judo|judo",
  "🥋|le|karaté|karaté", "🤺|l'|escrime|escrime", "🤸|la|gymnastique|gymnastique", "💃|la|danse|danse",
  "🩰|le|ballet|ballet", "🏊|la|natation|natation", "🤿|la|plongée|plongée sous-marine", "🏃|l'|athlétisme|athlétisme",
  "🏃|la|course|course à pied", "🧗|l'|escalade|escalade", "🏇|l'|équitation|équitation", "🚴|le|cyclisme|cyclisme",
  "🥅|le|filet|filet", "⏱️|le|sifflet|sifflet", "⏱️|le|chronomètre|chronomètre", "🎽|le|maillot|maillot",
  "👟|les|baskets|chaussure de sport", "♟️|les|échecs|échecs", "⚪|les|dames|jeu de dames", "🁣|le|domino|domino",
  "🃏|la|carte à jouer|carte à jouer", "🔮|la|bille|bille", "🪢|la|corde à sauter|corde à sauter", "⭕|le|cerceau|cerceau",
  "🪁|le|frisbee|frisbee", "🎈|le|ballon sauteur|ballon", "🎭|la|marionnette|marionnette", "🎭|le|guignol|Guignol",
  "🧱|le|cube de construction|jeu de construction", "🚂|le|petit train|train miniature", "🏠|la|maison de poupée|maison de poupée", "🏰|le|château fort|château fort",
  "🎭|le|déguisement|déguisement", "🌸|le|rose|rose (couleur)", "🍊|l'|orange|orange (couleur)", "⚪|le|gris|gris",
  "🩵|le|turquoise|turquoise", "🟦|l'|indigo|indigo", "🟡|le|doré|or (couleur)", "⚪|l'|argenté|argent (couleur)",
  "🟫|le|beige|beige"
];

const EXTRA_METIERS_BASE: string[] = [
  "🥖|le|boulanger|boulanger", "🎂|le|pâtissier|pâtissier", "🥩|le|boucher|boucher", "🐟|le|poissonnier|poissonnier",
  "🧀|le|fromager|fromager", "🍎|l'|épicier|épicier", "💐|le|fleuriste|fleuriste", "💊|le|pharmacien|pharmacien",
  "🦷|le|dentiste|dentiste", "🐾|le|vétérinaire|vétérinaire", "🩺|l'|infirmier|infirmier", "🩺|le|chirurgien|chirurgien",
  "👓|l'|opticien|opticien", "✂️|le|coiffeur|coiffeur", "🧵|le|couturier|couturier", "👞|le|cordonnier|cordonnier",
  "💍|le|bijoutier|bijoutier", "⌚|l'|horloger|horloger", "🪵|le|menuisier|menuisier", "🪵|le|charpentier|charpentier",
  "🧱|le|maçon|maçon", "🔧|le|plombier|plombier", "💡|l'|électricien|électricien", "🏠|le|couvreur|couvreur",
  "🔑|le|serrurier|serrurier", "🌻|le|jardinier|jardinier", "🌲|le|bûcheron|bûcheron", "🎣|le|pêcheur|pêcheur",
  "⚓|le|marin|marin", "⚓|le|capitaine|capitaine", "📮|le|facteur|facteur", "🚒|le|sauveteur|sauveteur",
  "⚖️|l'|avocat|avocat (métier)", "📚|le|bibliothécaire|bibliothécaire", "📖|le|libraire|libraire", "✍️|l'|écrivain|écrivain",
  "📰|le|journaliste|journaliste", "📷|le|photographe|photographe", "🎬|le|réalisateur|réalisateur", "🎭|l'|acteur|acteur",
  "🎭|le|comédien|comédien", "💃|le|danseur|danseur", "🎻|le|musicien|musicien", "🎼|le|chef d'orchestre|chef d'orchestre",
  "🗿|le|sculpteur|sculpteur", "📐|l'|architecte|architecte", "🏺|le|potier|potier", "🔨|le|forgeron|forgeron",
  "🔭|l'|astronome|astronome", "🪨|le|géologue|géologue", "🏺|l'|archéologue|archéologue", "🌿|le|botaniste|botaniste",
  "🧪|le|chimiste|chimiste", "💡|l'|inventeur|inventeur", "🧭|l'|explorateur|explorateur", "🧗|l'|alpiniste|alpiniste",
  "🤿|le|plongeur|plongeur", "🤸|l'|acrobate|acrobate", "🤹|le|jongleur|jongleur", "🎪|le|trapéziste|trapéziste",
  "👸|la|princesse|princesse", "🤴|le|prince|prince", "👑|l'|empereur|empereur", "🏹|l'|archer|archer",
  "🎺|le|troubadour|troubadour", "🃏|le|bouffon|bouffon", "🧙|l'|enchanteur|magicien", "🧙‍♀️|la|sorcière|sorcière",
  "🧌|l'|ogre|ogre", "巨人|le|géant|géant", "🧝|l'|elfe|elfe", "⛏️|le|nain|nain (créature)",
  "🧌|le|troll|troll", "🦅|le|griffon|griffon (mythologie)", "🔥|le|phénix|phénix", "🐎|le|pégase|Pégase",
  "🏛️|la|mairie|mairie", "📮|la|poste|bureau de poste", "🏛️|le|musée|musée", "🎭|le|théâtre|théâtre",
  "🎬|le|cinéma|cinéma", "🏟️|le|cirque|cirque", "🦁|le|zoo|parc zoologique", "🐠|l'|aquarium|aquarium public",
  "🌳|le|parc|parc", "🛒|le|marché|marché", "🛒|le|supermarché|supermarché", "🍽️|le|restaurant|restaurant",
  "🏨|l'|hôtel|hôtel", "🏦|la|banque|banque", "🏭|l'|usine|usine", "🌾|la|ferme|ferme (agriculture)",
  "🏚️|la|grange|grange", "🐄|l'|étable|étable", "🐎|l'|écurie|écurie", "🐔|le|poulailler|poulailler",
  "🐑|la|bergerie|bergerie", "🐝|la|ruche|ruche", "🏰|la|tour|tour (architecture)", "🏰|le|donjon|donjon",
  "🏰|le|pont-levis|pont-levis", "🏰|le|rempart|rempart", "🏛️|le|palais|palais", "🏛️|le|temple|temple",
  "🏟️|l'|arène|arène", "⛲|la|fontaine|fontaine", "🏠|l'|igloo|igloo", "⛺|le|tipi|tipi",
  "⛺|la|yourte|yourte", "🛖|la|hutte|hutte", "🪚|la|scie|scie", "🔧|la|clé à molette|clé à molette",
  "钳|la|pince|pince", "🔩|la|vis|vis", "📌|le|clou|clou", "🔩|l'|écrou|écrou",
  "🔩|le|boulon|boulon", "📏|le|mètre|mètre ruban", "📏|le|niveau|niveau à bulle", "🖌️|le|rouleau|rouleau à peinture",
  "🪣|le|pot de peinture|peinture", "🧰|la|boîte à outils|boîte à outils", "🪵|l'|établi|établi", "⛓️|la|chaîne|chaîne",
  "🪢|la|corde|corde", "🪢|le|nœud|nœud", "🔦|la|lanterne|lanterne", "🕯️|le|flambeau|torche",
  "🔭|la|longue-vue|longue-vue", "⏳|le|sablier|sablier", "🌡️|le|thermomètre|thermomètre", "⚖️|la|balance|balance",
  "🛡️|le|bouclier|bouclier (arme)", "⚔️|l'|épée|épée", "🏹|l'|arc|arc (arme)", "🏹|la|flèche|flèche",
  "🪖|le|heaume|heaume", "🛡️|l'|armure|armure", "🪄|la|baguette magique|baguette magique", "🧪|le|chaudron|chaudron",
  "🧪|la|potion|potion", "📜|le|grimoire|grimoire", "📜|le|parchemin|parchemin", "👑|le|sceptre|sceptre",
  "🪑|le|trône|trône", "🗝️|le|coffre au trésor|coffre", "💎|la|perle|perle", "👑|le|diadème|diadème"
];

// Modificateurs thématiques CP/CE1 permettant de générer des groupes nominaux réalistes de lecture (ex: "le petit chaton", "la pomme rouge", "le vélo bleu")
interface AdjectiveVariant {
  mascPrefix?: string;
  femPrefix?: string;
  mascSuffix?: string;
  femSuffix?: string;
}

const WORLD_VARIANTS: Record<WorldId, AdjectiveVariant[]> = {
  animaux: [
    { mascPrefix: 'petit', femPrefix: 'petite' },
    { mascPrefix: 'grand', femPrefix: 'grande' },
    { mascSuffix: 'sauvage', femSuffix: 'sauvage' },
    { mascSuffix: 'agile', femSuffix: 'agile' }
  ],
  aliments: [
    { mascSuffix: 'frais', femSuffix: 'fraîche' },
    { mascSuffix: 'sucré', femSuffix: 'sucrée' },
    { mascSuffix: 'gourmand', femSuffix: 'gourmande' },
    { mascPrefix: 'bon', femPrefix: 'bonne' }
  ],
  nature: [
    { mascPrefix: 'grand', femPrefix: 'grande' },
    { mascPrefix: 'joli', femPrefix: 'jolie' },
    { mascSuffix: 'sauvage', femSuffix: 'sauvage' },
    { mascSuffix: 'paisible', femSuffix: 'paisible' }
  ],
  maison: [
    { mascPrefix: 'petit', femPrefix: 'petite' },
    { mascPrefix: 'joli', femPrefix: 'jolie' },
    { mascSuffix: 'solide', femSuffix: 'solide' },
    { mascSuffix: 'propre', femSuffix: 'propre' }
  ],
  transports: [
    { mascSuffix: 'rapide', femSuffix: 'rapide' },
    { mascSuffix: 'solide', femSuffix: 'solide' },
    { mascPrefix: 'petit', femPrefix: 'petite' },
    { mascPrefix: 'grand', femPrefix: 'grande' }
  ],
  ecole: [
    { mascPrefix: 'petit', femPrefix: 'petite' },
    { mascPrefix: 'joli', femPrefix: 'jolie' },
    { mascSuffix: 'pratique', femSuffix: 'pratique' },
    { mascSuffix: 'neuf', femSuffix: 'neuve' }
  ],
  metiers: [
    { mascPrefix: 'grand', femPrefix: 'grande' },
    { mascSuffix: 'courageux', femSuffix: 'courageuse' },
    { mascSuffix: 'habile', femSuffix: 'habile' },
    { mascSuffix: 'célèbre', femSuffix: 'célèbre' }
  ]
};

const WORLD_DISTRACTOR_POOLS: Record<WorldId, string[]> = {
  animaux: ['🐱', '🐶', '🐸', '🦋', '🐘', '🦁', '🐬', '🦜', '🐰', '🦊', '🐢', '🦆'],
  aliments: ['🍎', '🍌', '🍕', '🍰', '🥕', '🍦', '🍓', '🧀', '🍫', '🥖', '🥐', '🍐'],
  nature: ['☀️', '🌲', '🌸', '🌙', '⭐', '🌧️', '⛰️', '🌊', '🌈', '❄️', '🌋', '🌻'],
  maison: ['🛏️', '🪑', '🚪', '🪟', '🧸', '🔑', '🧹', '💡', '🛋️', '🛁', '🚿', '🪞'],
  transports: ['🚀', '🚗', '🚲', '🚂', '✈️', '⛵', '🚁', '🚌', '🚓', '🚑', '🚒', '🚜'],
  ecole: ['📖', '✏️', '🎒', '✂️', '📏', '🎨', '🖌️', '🖍️', '📓', '📚', '🔬', '🔭'],
  metiers: ['🧑‍🚒', '🧑‍⚕️', '🧑‍🍳', '🧑‍🚀', '👮', '🧑‍🏫', '🧑‍🌾', '🧑‍🎨', '🧑‍🔬', '🧑‍🔧', '🧑‍✈️', '🧙']
};

// Fix non-emoji placeholders in raw arrays if any
function cleanEmoji(raw: string, world: WorldId): string {
  if (raw.length > 8 || /^[a-zA-Z]+$/.test(raw)) {
    return WORLD_DISTRACTOR_POOLS[world][0];
  }
  return raw;
}

function buildExpandedWorldWords(
  world: WorldId,
  rawList: string[],
  existingWordsSet: Set<string>
): WordItem[] {
  const result: WordItem[] = [];
  const pool = WORLD_DISTRACTOR_POOLS[world];
  const variants = WORLD_VARIANTS[world];

  const parsedEntries: {
    emoji: string;
    art: 'le' | 'la' | "l'" | 'les';
    word: string;
    photoQuery: string;
  }[] = [];

  for (const line of rawList) {
    const parts = line.split('|');
    if (parts.length < 3) continue;
    const emoji = cleanEmoji(parts[0].trim(), world);
    const art = parts[1].trim() as 'le' | 'la' | "l'" | 'les';
    const word = parts[2].trim();
    const photoQuery = (parts[3] || word).trim();

    if (existingWordsSet.has(word.toLowerCase())) continue;
    existingWordsSet.add(word.toLowerCase());

    parsedEntries.push({ emoji, art, word, photoQuery });

    const idSlug = word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_');

    const silentLetter = detectSilentLetter(word, art);
    const phonemeHelp = detectPhonemeHelp(word);
    const distractors = pool.filter((e) => e !== emoji).slice(0, 6);

    result.push({
      id: `${world}_ext_${idSlug}_${result.length}`,
      emoji,
      art,
      word,
      syllables: syllabifyFrench(word),
      ...(silentLetter ? { silentLetter } : {}),
      phonemeHelp,
      photoQuery,
      preferPhoto: true,
      distractors,
      world
    });
  }

  // Generate CP/CE1 reading variations (adjective + noun) so every category reaches ~600 rich reading items
  let vIdx = 0;
  for (const variant of variants) {
    for (const entry of parsedEntries) {
      if (result.length >= 545) break;
      if (entry.word.includes(' ') || entry.art === 'les') continue;

      const isFem = entry.art === 'la';
      let newArt: 'le' | 'la' | "l'" | 'les' = isFem ? 'la' : 'le';
      let newWord = '';

      if (variant.mascPrefix && variant.femPrefix) {
        const pref = isFem ? variant.femPrefix : variant.mascPrefix;
        newWord = `${pref} ${entry.word}`;
      } else if (variant.mascSuffix && variant.femSuffix) {
        const suff = isFem ? variant.femSuffix : variant.mascSuffix;
        newArt = entry.art;
        newWord = `${entry.word} ${suff}`;
      }

      if (!newWord || existingWordsSet.has(newWord.toLowerCase())) continue;
      existingWordsSet.add(newWord.toLowerCase());

      const idSlug = newWord
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_');

      const phonemeHelp = detectPhonemeHelp(newWord);
      const distractors = pool.filter((e) => e !== entry.emoji).slice(0, 6);

      result.push({
        id: `${world}_var_${idSlug}_${vIdx++}`,
        emoji: entry.emoji,
        art: newArt,
        word: newWord,
        syllables: syllabifyFrench(newWord),
        phonemeHelp,
        photoQuery: entry.photoQuery, // Use the base noun so Wikipedia returns the exact photo!
        preferPhoto: true,
        distractors,
        world
      });
    }
  }

  return result;
}

export function generateAllExtraWords(baseWords: WordItem[]): WordItem[] {
  const existingSet = new Set(baseWords.map((w) => w.word.toLowerCase()));
  return [
    ...buildExpandedWorldWords('animaux', EXTRA_ANIMAUX_BASE, existingSet),
    ...buildExpandedWorldWords('aliments', EXTRA_ALIMENTS_BASE, existingSet),
    ...buildExpandedWorldWords('nature', EXTRA_NATURE_BASE, existingSet),
    ...buildExpandedWorldWords('maison', EXTRA_MAISON_BASE, existingSet),
    ...buildExpandedWorldWords('transports', EXTRA_TRANSPORTS_BASE, existingSet),
    ...buildExpandedWorldWords('ecole', EXTRA_ECOLE_BASE, existingSet),
    ...buildExpandedWorldWords('metiers', EXTRA_METIERS_BASE, existingSet)
  ];
}
