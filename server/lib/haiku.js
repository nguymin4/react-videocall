var adjs = [
	"autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
	"summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
	"patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
	"billowing", "broken", "cold", "damp", "falling", "frosty", "green",
	"long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
	"red", "rough", "still", "small", "sparkling", "throbbing", "shy",
	"wandering", "withered", "wild", "black", "young", "holy", "solitary",
	"fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
	"polished", "ancient", "purple", "lively", "nameless"
];

var nouns = [
    "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
    "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
    "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
    "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
    "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
    "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
    "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
    "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
    "frog", "smoke", "star"
];

module.exports = function () {
    var adj = adjs[Math.floor(Math.random() * adjs.length)];
    var noun = nouns[Math.floor(Math.random() * nouns.length)];
    const MIN = 1000;
    const MAX = 9999;
    var num = Math.floor(Math.random() * ((MAX + 1) - MIN)) + MIN;

    return `${adj}-${noun}-${num}`;
};