/* =========================================================================
   Infinite Pantry — app.js
   An Infinite Awesome Studio product. Front-end prototype, no backend.
   Everything runs in the browser on sample data. State persists in
   localStorage. Designed so each block can be swapped for a real agent /
   API later — see the [INTEGRATION] markers throughout.
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     0. CONSTANTS, MOCK DATA & "AGENT" KNOWLEDGE BASE
     In production these become live services:
       [INTEGRATION] Meal Planning Agent  -> MEALS library + generator
       [INTEGRATION] Store Price Agent     -> STORE_MULTIPLIERS -> real pricing API
       [INTEGRATION] Coupon Agent          -> COUPONS -> live coupon API
       [INTEGRATION] Wellness Agent        -> WELLNESS suggestions
     ---------------------------------------------------------------------- */

  // Department order used everywhere the grocery list is grouped.
  var DEPARTMENTS = [
    "Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery",
    "Pantry", "Frozen", "Beverages", "Snacks", "Household & Misc"
  ];

  // Diets we treat as HARD filters (must match) vs SOFT preferences (scored).
  var HARD_DIETS = ["vegetarian", "vegan", "pescatarian", "glutenFree", "dairyFree", "nutFree", "halal", "kosher", "keto", "paleo"];

  // Estimated per-store basket multiplier vs. a baseline list cost.
  // [INTEGRATION] Replace with live per-item pricing from [store API provider].
  var STORE_MULTIPLIERS = {
    "Aldi": 0.82, "Walmart": 0.88, "Food Lion": 0.95, "Giant": 1.02,
    "Target": 1.04, "Costco": 0.90, "Whole Foods": 1.22, "Local market": 1.10
  };

  // Sample coupon/rewards opportunities, keyed loosely by department/theme.
  // [INTEGRATION] Replace with results from [coupon API provider] + loyalty lookups.
  var COUPONS = [
    { dept: "Produce",        ico: "🥬", text: "Store-app produce deal", detail: "Many chains run a weekly produce coupon in their app.", tag: "est. save $2–$4" },
    { dept: "Meat & Seafood", ico: "🍗", text: "Manager's-special proteins", detail: "Check the marked-down meat section early in the day.", tag: "est. save $3–$8" },
    { dept: "Dairy & Eggs",   ico: "🥚", text: "Buy-2 dairy promo", detail: "Eggs & yogurt often have a digital buy-more deal.", tag: "est. save $1–$3" },
    { dept: "Pantry",         ico: "🥫", text: "Stock-up pantry coupon", detail: "Canned beans, rice & pasta frequently clip-to-card.", tag: "est. save $2–$5" },
    { dept: "Frozen",         ico: "❄️", text: "Frozen 5-for-$ bundle", detail: "Frozen veg/fruit bundles beat fresh on price & waste.", tag: "est. save $2–$6" }
  ];

  // Budget substitution rules. Each fires only if the "from" ingredient is on the list.
  var SWAP_RULES = [
    { from: "fresh berries",  to: "frozen berries",          save: 3 },
    { from: "salmon",         to: "canned tuna",             save: 5 },
    { from: "chicken breast", to: "chicken thighs",          save: 3 },
    { from: "pre-cut veggies",to: "whole veggies",           save: 2 },
    { from: "ground beef",    to: "ground turkey or lentils",save: 4 },
    { from: "name-brand pasta", to: "store-brand pasta",     save: 1 },
    { from: "baby spinach",   to: "whole-bunch greens",      save: 1 },
    { from: "shrimp",         to: "white beans or tofu",     save: 5 },
    { from: "parmesan wedge", to: "store-brand grated",      save: 2 }
  ];

  // Optional, GENERAL wellness suggestions. Never clinical. Sourced from public
  // health bodies in spirit (USDA MyPlate, CDC, AHA) — no invented claims.
  var WELLNESS = [
    { ico: "🚶", title: "10-minute walk", body: "A short walk after a meal is an easy, general way to move more. (General guidance, CDC.)" },
    { ico: "💧", title: "Glass of water", body: "Keep a glass by the sink as a simple hydration cue while you cook." },
    { ico: "🧘", title: "2-minute reset", body: "Before dinner prep, take a few slow breaths to take the edge off the rush." },
    { ico: "🤸", title: "Desk stretch", body: "Roll shoulders and stretch wrists between tasks if you sit a lot." },
    { ico: "🥗", title: "Half-plate veggies", body: "Aim to fill half the plate with veg or fruit — the MyPlate rule of thumb." },
    { ico: "🌙", title: "Wind-down prep", body: "Set out tomorrow's breakfast tonight to make mornings calmer." }
  ];

  // Terms that should trigger the medical guardrail + safety routing.
  // [INTEGRATION] Safety Review Agent inspects every plan against this + more.
  var MEDICAL_TERMS = [
    "diabet", "kidney", "renal", "heart disease", "cardiac", "pregnan", "prenatal",
    "eating disorder", "anorexi", "bulimi", "celiac", "crohn", "colitis", "ibd",
    "chemo", "dialysis", "gestational", "hypertension", "blood pressure", "cholesterol",
    "thyroid", "gout", "ulcer", "medication", "prescribed", "doctor said", "feeding tube"
  ];

  // -------- The meal library (the "Recipe Discovery Agent" knowledge base) ------
  // ing: {n:name, d:department, c:approx package cost $}
  // diets: every diet this meal satisfies. allergens: for allergy filtering.
  var MEALS = [
    // ---- BREAKFASTS ----
    { id:"b1", slot:"breakfast", name:"Greek yogurt + berries + oats", time:5, skill:"beginner", kid:true,
      diets:["vegetarian","glutenFree","nutFree","highProtein","kidFriendly","quick","mediterranean","kosher","halal"], allergens:["dairy"], protein:"yogurt",
      ing:[{n:"greek yogurt",d:"Dairy & Eggs",c:4.5},{n:"fresh berries",d:"Produce",c:4},{n:"rolled oats",d:"Pantry",c:3},{n:"honey",d:"Pantry",c:4}],
      steps:["Spoon yogurt into a bowl.","Top with berries and a handful of oats.","Drizzle a little honey and go."] },
    { id:"b2", slot:"breakfast", name:"Veggie scramble + toast", time:12, skill:"comfortable", kid:true,
      diets:["vegetarian","nutFree","highProtein","kidFriendly","mediterranean","halal","kosher"], allergens:["egg","gluten"], protein:"egg",
      ing:[{n:"eggs",d:"Dairy & Eggs",c:3.5},{n:"baby spinach",d:"Produce",c:3},{n:"bell pepper",d:"Produce",c:1.2},{n:"whole-grain bread",d:"Bakery",c:3}],
      steps:["Sauté chopped pepper and spinach 2 min.","Add beaten eggs, scramble soft.","Serve with toast."] },
    { id:"b3", slot:"breakfast", name:"Overnight oats + banana", time:5, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","budget","kidFriendly","quick","halal","kosher"], allergens:[], protein:"oats",
      ing:[{n:"rolled oats",d:"Pantry",c:3},{n:"oat milk",d:"Dairy & Eggs",c:3.5},{n:"banana",d:"Produce",c:1.5},{n:"cinnamon",d:"Pantry",c:3}],
      steps:["Mix oats and oat milk in a jar.","Refrigerate overnight.","Top with sliced banana and cinnamon."] },
    { id:"b4", slot:"breakfast", name:"Avocado toast + egg", time:10, skill:"beginner", kid:false,
      diets:["vegetarian","nutFree","highProtein","mediterranean","halal","kosher"], allergens:["egg","gluten"], protein:"egg",
      ing:[{n:"avocado",d:"Produce",c:2},{n:"whole-grain bread",d:"Bakery",c:3},{n:"eggs",d:"Dairy & Eggs",c:3.5},{n:"lemon",d:"Produce",c:0.7}],
      steps:["Toast bread.","Mash avocado with a squeeze of lemon.","Top with a fried or boiled egg."] },
    { id:"b5", slot:"breakfast", name:"Smoothie: spinach, banana, oats", time:5, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","budget","kidFriendly","quick","halal","kosher"], allergens:[], protein:"oats",
      ing:[{n:"banana",d:"Produce",c:1.5},{n:"baby spinach",d:"Produce",c:3},{n:"oat milk",d:"Dairy & Eggs",c:3.5},{n:"rolled oats",d:"Pantry",c:3},{n:"frozen mango",d:"Frozen",c:3}],
      steps:["Add everything to a blender.","Blend until smooth.","Pour and go."] },
    { id:"b6", slot:"breakfast", name:"Cottage cheese + tomato bowl", time:5, skill:"beginner", kid:false,
      diets:["vegetarian","glutenFree","nutFree","highProtein","lowCarb","keto","mediterranean","kosher","halal"], allergens:["dairy"], protein:"cottage cheese",
      ing:[{n:"cottage cheese",d:"Dairy & Eggs",c:4},{n:"cherry tomatoes",d:"Produce",c:3},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Scoop cottage cheese into a bowl.","Halve tomatoes on top.","Drizzle olive oil, crack pepper."] },
    { id:"b7", slot:"breakfast", name:"Spinach & feta omelet", time:12, skill:"comfortable", kid:false,
      diets:["vegetarian","glutenFree","nutFree","highProtein","lowCarb","keto","mediterranean","kosher","halal"], allergens:["egg","dairy"], protein:"egg",
      ing:[{n:"eggs",d:"Dairy & Eggs",c:3.5},{n:"baby spinach",d:"Produce",c:3},{n:"feta",d:"Dairy & Eggs",c:4},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Beat eggs; heat oil in a pan.","Add spinach, pour eggs, fold in feta.","Cook until just set."] },
    { id:"b8", slot:"breakfast", name:"Egg & avocado plate", time:8, skill:"beginner", kid:false,
      diets:["vegetarian","glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","halal","kosher"], allergens:["egg"], protein:"egg",
      ing:[{n:"eggs",d:"Dairy & Eggs",c:3.5},{n:"avocado",d:"Produce",c:2},{n:"cherry tomatoes",d:"Produce",c:3},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Soft-boil or fry the eggs.","Slice avocado and tomatoes alongside.","Drizzle oil; season well."] },

    // ---- LUNCHES ----
    { id:"l1", slot:"lunch", name:"Hummus & veggie wrap", time:10, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","budget","kidFriendly","quick","mediterranean","halal","kosher"], allergens:["gluten"], protein:"chickpeas",
      ing:[{n:"hummus",d:"Pantry",c:4},{n:"tortillas",d:"Bakery",c:3},{n:"cucumber",d:"Produce",c:1},{n:"bell pepper",d:"Produce",c:1.2},{n:"baby spinach",d:"Produce",c:3}],
      steps:["Spread hummus on a tortilla.","Pile on sliced veg.","Roll, halve, done."] },
    { id:"l2", slot:"lunch", name:"Big Mediterranean salad", time:12, skill:"comfortable", kid:false,
      diets:["vegetarian","glutenFree","nutFree","lowCarb","mediterranean","kosher","halal"], allergens:["dairy"], protein:"feta + chickpeas",
      ing:[{n:"romaine",d:"Produce",c:2.5},{n:"cherry tomatoes",d:"Produce",c:3},{n:"cucumber",d:"Produce",c:1},{n:"canned chickpeas",d:"Pantry",c:1.2},{n:"feta",d:"Dairy & Eggs",c:4},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Chop greens and veg.","Add drained chickpeas and crumbled feta.","Dress with olive oil and lemon."] },
    { id:"l3", slot:"lunch", name:"Turkey & cheese sandwich + fruit", time:7, skill:"beginner", kid:true,
      diets:["nutFree","highProtein","kidFriendly","quick","halal"], allergens:["gluten","dairy"], protein:"turkey",
      ing:[{n:"deli turkey",d:"Meat & Seafood",c:6},{n:"whole-grain bread",d:"Bakery",c:3},{n:"cheddar",d:"Dairy & Eggs",c:4},{n:"apple",d:"Produce",c:1.5}],
      steps:["Build the sandwich.","Add lettuce if you like.","Serve with fruit on the side."] },
    { id:"l4", slot:"lunch", name:"Lentil soup + bread", time:25, skill:"comfortable", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","budget","kidFriendly","mediterranean","halal","kosher"], allergens:["gluten"], protein:"lentils",
      ing:[{n:"dried lentils",d:"Pantry",c:2.5},{n:"carrots",d:"Produce",c:1.5},{n:"onion",d:"Produce",c:1},{n:"canned tomatoes",d:"Pantry",c:1.5},{n:"crusty bread",d:"Bakery",c:3},{n:"vegetable broth",d:"Pantry",c:2.5}],
      steps:["Sauté onion and carrot.","Add lentils, tomatoes, broth.","Simmer 20 min; serve with bread."] },
    { id:"l5", slot:"lunch", name:"Rice & black bean bowl", time:15, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","kidFriendly","quick","halal","kosher"], allergens:[], protein:"black beans",
      ing:[{n:"rice",d:"Pantry",c:3},{n:"canned black beans",d:"Pantry",c:1.2},{n:"corn",d:"Frozen",c:2},{n:"salsa",d:"Pantry",c:3},{n:"avocado",d:"Produce",c:2}],
      steps:["Warm rice and beans.","Top with corn, salsa, avocado.","Squeeze lime if you have it."] },
    { id:"l6", slot:"lunch", name:"Tuna & white bean salad", time:10, skill:"beginner", kid:false,
      diets:["pescatarian","glutenFree","dairyFree","nutFree","highProtein","lowCarb","budget","mediterranean"], allergens:["fish"], protein:"tuna",
      ing:[{n:"canned tuna",d:"Pantry",c:2},{n:"canned white beans",d:"Pantry",c:1.2},{n:"red onion",d:"Produce",c:1},{n:"olive oil",d:"Pantry",c:7},{n:"lemon",d:"Produce",c:0.7}],
      steps:["Drain tuna and beans.","Toss with thin onion, oil, lemon.","Season and serve."] },
    { id:"l7", slot:"lunch", name:"Caprese & pesto flatbread", time:12, skill:"comfortable", kid:true,
      diets:["vegetarian","nutFree","kidFriendly","mediterranean","kosher","halal"], allergens:["gluten","dairy"], protein:"mozzarella",
      ing:[{n:"flatbread",d:"Bakery",c:3.5},{n:"fresh mozzarella",d:"Dairy & Eggs",c:4.5},{n:"cherry tomatoes",d:"Produce",c:3},{n:"basil",d:"Produce",c:2.5},{n:"pesto",d:"Pantry",c:4}],
      steps:["Spread pesto on flatbread.","Add mozzarella and tomatoes.","Bake 8 min; finish with basil."] },
    { id:"l8", slot:"lunch", name:"Chicken & avocado chopped salad", time:15, skill:"comfortable", kid:false,
      diets:["glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","mediterranean","halal","kosher"], allergens:[], protein:"chicken",
      ing:[{n:"chicken breast",d:"Meat & Seafood",c:8},{n:"romaine",d:"Produce",c:2.5},{n:"avocado",d:"Produce",c:2},{n:"cherry tomatoes",d:"Produce",c:3},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Cook and chop the chicken.","Toss with greens, avocado, tomato.","Dress with oil and lemon."] },
    { id:"l9", slot:"lunch", name:"Tuna-stuffed avocado", time:8, skill:"beginner", kid:false,
      diets:["pescatarian","glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","mediterranean"], allergens:["fish"], protein:"tuna",
      ing:[{n:"canned tuna",d:"Pantry",c:2},{n:"avocado",d:"Produce",c:2},{n:"celery",d:"Produce",c:2},{n:"lemon",d:"Produce",c:0.7}],
      steps:["Halve and pit the avocado.","Mix tuna with diced celery and lemon.","Spoon into the avocado."] },

    // ---- DINNERS ----
    { id:"d1", slot:"dinner", name:"Sheet-pan chicken & veggies", time:35, skill:"beginner", kid:true,
      diets:["glutenFree","dairyFree","nutFree","highProtein","paleo","halal","kosher"], allergens:[], protein:"chicken", leftover:"burrito bowls",
      ing:[{n:"chicken breast",d:"Meat & Seafood",c:8},{n:"broccoli",d:"Produce",c:2.5},{n:"carrots",d:"Produce",c:1.5},{n:"potatoes",d:"Produce",c:3},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Heat oven to 425°F.","Toss chicken and chopped veg in oil + salt.","Roast 30–35 min on one pan."] },
    { id:"d2", slot:"dinner", name:"Chicken burrito bowls", time:20, skill:"beginner", kid:true,
      diets:["glutenFree","dairyFree","nutFree","highProtein","kidFriendly","halal","kosher"], allergens:[], protein:"chicken",
      ing:[{n:"chicken breast",d:"Meat & Seafood",c:8},{n:"rice",d:"Pantry",c:3},{n:"canned black beans",d:"Pantry",c:1.2},{n:"salsa",d:"Pantry",c:3},{n:"corn",d:"Frozen",c:2}],
      steps:["Cook and slice chicken.","Build bowls over rice with beans, corn, salsa.","Add avocado if you have it."] },
    { id:"d3", slot:"dinner", name:"Pasta with greens & beans", time:20, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","budget","kidFriendly","quick","mediterranean","halal","kosher"], allergens:["gluten"], protein:"white beans", leftover:"pasta salad",
      ing:[{n:"pasta",d:"Pantry",c:1.5},{n:"canned white beans",d:"Pantry",c:1.2},{n:"baby spinach",d:"Produce",c:3},{n:"garlic",d:"Produce",c:0.8},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Boil pasta.","Sauté garlic, wilt spinach, add beans.","Toss with pasta and a splash of pasta water."] },
    { id:"d4", slot:"dinner", name:"Lentil & veggie soup", time:30, skill:"comfortable", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","kidFriendly","mediterranean","halal","kosher"], allergens:[], protein:"lentils", leftover:"freezer soup",
      ing:[{n:"dried lentils",d:"Pantry",c:2.5},{n:"carrots",d:"Produce",c:1.5},{n:"celery",d:"Produce",c:2},{n:"onion",d:"Produce",c:1},{n:"canned tomatoes",d:"Pantry",c:1.5},{n:"vegetable broth",d:"Pantry",c:2.5}],
      steps:["Sauté onion, carrot, celery.","Add lentils, tomatoes, broth.","Simmer 25 min; blend half for body."] },
    { id:"d5", slot:"dinner", name:"Baked salmon, rice & broccoli", time:25, skill:"comfortable", kid:false,
      diets:["pescatarian","glutenFree","dairyFree","nutFree","highProtein","mediterranean"], allergens:["fish"], protein:"salmon", leftover:"salmon grain bowl",
      ing:[{n:"salmon",d:"Meat & Seafood",c:11},{n:"rice",d:"Pantry",c:3},{n:"broccoli",d:"Produce",c:2.5},{n:"lemon",d:"Produce",c:0.7},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Roast salmon at 400°F, 12–15 min.","Steam broccoli; cook rice.","Finish with lemon."] },
    { id:"d6", slot:"dinner", name:"Veggie stir-fry + tofu", time:25, skill:"comfortable", kid:true,
      diets:["vegetarian","vegan","dairyFree","nutFree","highProtein","kidFriendly","quick","halal","kosher"], allergens:["soy"], protein:"tofu", leftover:"stir-fry rice bowls",
      ing:[{n:"firm tofu",d:"Dairy & Eggs",c:3},{n:"mixed stir-fry veg",d:"Frozen",c:3.5},{n:"rice",d:"Pantry",c:3},{n:"soy sauce",d:"Pantry",c:3},{n:"garlic",d:"Produce",c:0.8}],
      steps:["Crisp cubed tofu in a hot pan.","Add veg and garlic, stir-fry.","Splash soy sauce; serve over rice."] },
    { id:"d7", slot:"dinner", name:"Turkey chili", time:35, skill:"comfortable", kid:true,
      diets:["glutenFree","dairyFree","nutFree","highProtein","budget","kidFriendly","halal","kosher"], allergens:[], protein:"turkey", leftover:"chili-topped potatoes",
      ing:[{n:"ground turkey",d:"Meat & Seafood",c:6},{n:"canned kidney beans",d:"Pantry",c:1.2},{n:"canned tomatoes",d:"Pantry",c:1.5},{n:"onion",d:"Produce",c:1},{n:"chili spices",d:"Pantry",c:3}],
      steps:["Brown turkey with onion.","Add beans, tomatoes, spices.","Simmer 25 min."] },
    { id:"d8", slot:"dinner", name:"Margherita-style flatbread + salad", time:20, skill:"beginner", kid:true,
      diets:["vegetarian","nutFree","kidFriendly","quick","mediterranean","kosher","halal"], allergens:["gluten","dairy"], protein:"mozzarella",
      ing:[{n:"flatbread",d:"Bakery",c:3.5},{n:"fresh mozzarella",d:"Dairy & Eggs",c:4.5},{n:"canned tomatoes",d:"Pantry",c:1.5},{n:"basil",d:"Produce",c:2.5},{n:"romaine",d:"Produce",c:2.5}],
      steps:["Top flatbread with crushed tomato and mozzarella.","Bake 10 min at 450°F.","Serve with a quick side salad."] },
    { id:"d9", slot:"dinner", name:"Shrimp & veggie pasta", time:25, skill:"comfortable", kid:false,
      diets:["pescatarian","nutFree","highProtein","mediterranean"], allergens:["shellfish","gluten"], protein:"shrimp", leftover:"cold pasta salad",
      ing:[{n:"shrimp",d:"Meat & Seafood",c:10},{n:"pasta",d:"Pantry",c:1.5},{n:"zucchini",d:"Produce",c:1.5},{n:"garlic",d:"Produce",c:0.8},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Boil pasta.","Sauté shrimp and zucchini with garlic.","Toss together with oil."] },
    { id:"d10", slot:"dinner", name:"Beef & broccoli over rice", time:30, skill:"comfortable", kid:true,
      diets:["dairyFree","nutFree","highProtein","kidFriendly","halal"], allergens:["soy"], protein:"beef", leftover:"beef fried rice",
      ing:[{n:"beef strips",d:"Meat & Seafood",c:9},{n:"broccoli",d:"Produce",c:2.5},{n:"rice",d:"Pantry",c:3},{n:"soy sauce",d:"Pantry",c:3},{n:"garlic",d:"Produce",c:0.8}],
      steps:["Sear beef strips.","Add broccoli and garlic.","Glaze with soy sauce; serve over rice."] },
    { id:"d11", slot:"dinner", name:"Stuffed sweet potatoes", time:40, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","kidFriendly","paleo","halal","kosher"], allergens:[], protein:"black beans", leftover:"loaded potato bowls",
      ing:[{n:"sweet potatoes",d:"Produce",c:3},{n:"canned black beans",d:"Pantry",c:1.2},{n:"corn",d:"Frozen",c:2},{n:"salsa",d:"Pantry",c:3},{n:"avocado",d:"Produce",c:2}],
      steps:["Bake sweet potatoes at 400°F, 40 min.","Warm beans and corn.","Split potatoes and load up."] },
    { id:"d12", slot:"dinner", name:"Egg fried rice", time:20, skill:"beginner", kid:true,
      diets:["vegetarian","dairyFree","nutFree","budget","kidFriendly","quick","halal","kosher"], allergens:["egg","soy"], protein:"egg", leftover:"fried-rice bowls",
      ing:[{n:"rice",d:"Pantry",c:3},{n:"eggs",d:"Dairy & Eggs",c:3.5},{n:"frozen peas",d:"Frozen",c:2},{n:"carrots",d:"Produce",c:1.5},{n:"soy sauce",d:"Pantry",c:3}],
      steps:["Scramble eggs, set aside.","Fry rice with peas and carrot.","Fold eggs back in; splash soy."] },
    { id:"d13", slot:"dinner", name:"Chickpea coconut curry", time:30, skill:"comfortable", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","mediterranean","halal","kosher"], allergens:[], protein:"chickpeas", leftover:"curry rice bowls",
      ing:[{n:"canned chickpeas",d:"Pantry",c:1.2},{n:"coconut milk",d:"Pantry",c:2.5},{n:"canned tomatoes",d:"Pantry",c:1.5},{n:"onion",d:"Produce",c:1},{n:"curry powder",d:"Pantry",c:3.5},{n:"rice",d:"Pantry",c:3}],
      steps:["Sauté onion and curry powder.","Add chickpeas, tomato, coconut milk.","Simmer 20 min; serve over rice."] },
    { id:"d14", slot:"dinner", name:"Loaded baked-potato bar", time:45, skill:"beginner", kid:true,
      diets:["vegetarian","glutenFree","nutFree","budget","kidFriendly","kosher","halal"], allergens:["dairy"], protein:"cheese + beans",
      ing:[{n:"baking potatoes",d:"Produce",c:3},{n:"cheddar",d:"Dairy & Eggs",c:4},{n:"canned chili beans",d:"Pantry",c:1.5},{n:"broccoli",d:"Produce",c:2.5},{n:"sour cream",d:"Dairy & Eggs",c:2.5}],
      steps:["Bake potatoes 45 min.","Set out toppings.","Let everyone build their own."] },
    { id:"d15", slot:"dinner", name:"Lemon-herb chicken thighs & broccoli", time:35, skill:"beginner", kid:true,
      diets:["glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","halal","kosher"], allergens:[], protein:"chicken", leftover:"chicken chopped salad",
      ing:[{n:"chicken thighs",d:"Meat & Seafood",c:7},{n:"broccoli",d:"Produce",c:2.5},{n:"garlic",d:"Produce",c:0.8},{n:"lemon",d:"Produce",c:0.7},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Heat oven to 425°F.","Toss thighs and broccoli in oil, garlic, lemon.","Roast 30 min."] },
    { id:"d16", slot:"dinner", name:"Garlic steak & green beans", time:25, skill:"comfortable", kid:false,
      diets:["glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","halal"], allergens:[], protein:"beef", leftover:"steak grain-free bowls",
      ing:[{n:"beef strips",d:"Meat & Seafood",c:9},{n:"green beans",d:"Produce",c:2.5},{n:"garlic",d:"Produce",c:0.8},{n:"olive oil",d:"Pantry",c:7}],
      steps:["Sear beef strips hot and fast.","Add green beans and garlic.","Toss in oil; rest 2 min."] },

    // ---- SNACKS ----
    { id:"s1", slot:"snack", name:"Apple slices + peanut butter", time:3, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","budget","kidFriendly","quick","halal","kosher"], allergens:["peanut"], protein:"peanut butter",
      ing:[{n:"apple",d:"Produce",c:1.5},{n:"peanut butter",d:"Pantry",c:4}], steps:["Slice apple.","Serve with a scoop of peanut butter."] },
    { id:"s2", slot:"snack", name:"Hummus & carrot sticks", time:4, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","kidFriendly","quick","mediterranean","halal","kosher"], allergens:[], protein:"chickpeas",
      ing:[{n:"hummus",d:"Pantry",c:4},{n:"carrots",d:"Produce",c:1.5}], steps:["Cut carrots into sticks.","Dip and enjoy."] },
    { id:"s3", slot:"snack", name:"Yogurt + granola cup", time:3, skill:"beginner", kid:true,
      diets:["vegetarian","nutFree","highProtein","kidFriendly","quick","kosher","halal"], allergens:["dairy","gluten"], protein:"yogurt",
      ing:[{n:"greek yogurt",d:"Dairy & Eggs",c:4.5},{n:"granola",d:"Snacks",c:4}], steps:["Layer yogurt and granola in a cup."] },
    { id:"s4", slot:"snack", name:"Cheese & whole-grain crackers", time:3, skill:"beginner", kid:true,
      diets:["vegetarian","nutFree","kidFriendly","quick","kosher","halal"], allergens:["dairy","gluten"], protein:"cheese",
      ing:[{n:"cheddar",d:"Dairy & Eggs",c:4},{n:"whole-grain crackers",d:"Snacks",c:3.5}], steps:["Slice cheese.","Serve with crackers."] },
    { id:"s5", slot:"snack", name:"Trail mix (nut-free option)", time:2, skill:"beginner", kid:true,
      diets:["vegetarian","vegan","glutenFree","dairyFree","nutFree","budget","kidFriendly","quick","halal","kosher"], allergens:[], protein:"seeds",
      ing:[{n:"pumpkin seeds",d:"Snacks",c:4},{n:"dried fruit",d:"Snacks",c:4},{n:"pretzels",d:"Snacks",c:3}], steps:["Mix and portion into bags."] },
    { id:"s6", slot:"snack", name:"Cheese & olives", time:2, skill:"beginner", kid:false,
      diets:["vegetarian","glutenFree","nutFree","lowCarb","keto","mediterranean","kosher","halal"], allergens:["dairy"], protein:"cheese",
      ing:[{n:"cheddar",d:"Dairy & Eggs",c:4},{n:"olives",d:"Pantry",c:3.5}], steps:["Cube cheese.","Serve with olives."] },
    { id:"s7", slot:"snack", name:"Hard-boiled eggs", time:12, skill:"beginner", kid:true,
      diets:["vegetarian","glutenFree","dairyFree","nutFree","highProtein","lowCarb","keto","paleo","halal","kosher"], allergens:["egg"], protein:"egg",
      ing:[{n:"eggs",d:"Dairy & Eggs",c:3.5}], steps:["Boil eggs 10 min.","Cool, peel, salt."] }
  ];

  var DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Diet chips (label -> internal key) for the quick form.
  var DIET_OPTIONS = [
    ["Mediterranean","mediterranean"],["Vegetarian","vegetarian"],["Vegan","vegan"],["Pescatarian","pescatarian"],
    ["Gluten-free","glutenFree"],["Dairy-free","dairyFree"],["Nut-free","nutFree"],["Low-carb","lowCarb"],
    ["High-protein","highProtein"],["Keto","keto"],["Paleo","paleo"],["Halal","halal"],["Kosher","kosher"],
    ["Family-friendly","kidFriendly"],["Budget-friendly","budget"],["Quick meals","quick"]
  ];
  var GOAL_OPTIONS = [
    ["Save money","budget"],["Save time","quick"],["More balanced meals","balanced"],["More vegetables","veggies"],
    ["More protein","highProtein"],["Family dinners","kidFriendly"],["Less food waste","waste"],
    ["Beginner-friendly","beginner"],["Fewer takeout nights","budget"]
  ];
  var REWARD_OPTIONS = ["Giant BonusCard","Food Lion MVP","Target Circle","Walmart+","Costco","Amazon Prime / Whole Foods","Store apps","Digital coupons"];

  /* ----------------------------------------------------------------------
     1. STATE  (persisted to localStorage)
     [INTEGRATION] swap localStorage for [database provider] + [auth provider].
     ---------------------------------------------------------------------- */
  var STORE_KEY = "infinitePantry.v1";
  var state = {
    intake: null,      // last answers used to build a plan
    plan: null,        // generated plan object
    saved: [],         // saved recipe ids
    wellnessOn: false
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) { var s = JSON.parse(raw); state.saved = s.saved || []; state.wellnessOn = !!s.wellnessOn; }
    } catch (e) { /* ignore */ }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ saved: state.saved, wellnessOn: state.wellnessOn })); }
    catch (e) { /* ignore */ }
  }

  /* ----------------------------------------------------------------------
     2. SMALL HELPERS
     ---------------------------------------------------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(n) { return "$" + (Math.round(n * 100) / 100).toFixed(0); }
  function titleCase(s) { return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function parseList(s) { return (s || "").split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean); }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("is-shown");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-shown"); }, 2200);
  }

  /* ----------------------------------------------------------------------
     3. SAFETY REVIEW (mocked agent)  — runs on intake + on generated plan.
     ---------------------------------------------------------------------- */
  function detectMedical(intake) {
    var blob = [intake.allergies, intake.avoid, intake.special, (intake.diets || []).join(" ")].join(" ").toLowerCase();
    for (var i = 0; i < MEDICAL_TERMS.length; i++) { if (blob.indexOf(MEDICAL_TERMS[i]) !== -1) return true; }
    return false;
  }

  /* ----------------------------------------------------------------------
     4. MEAL FILTERING & SCORING
     ---------------------------------------------------------------------- */
  function allergyHits(meal, allergyList) {
    if (!allergyList.length) return false;
    var hay = meal.allergens.join(" ") + " " + meal.ing.map(function (i) { return i.n; }).join(" ") + " " + meal.name.toLowerCase();
    return allergyList.some(function (a) { return hay.indexOf(a) !== -1; });
  }
  function avoidHits(meal, avoidList) {
    if (!avoidList.length) return false;
    var hay = meal.ing.map(function (i) { return i.n; }).join(" ") + " " + meal.name.toLowerCase();
    return avoidList.some(function (a) { return hay.indexOf(a) !== -1; });
  }
  function meetsHardDiets(meal, diets) {
    var hard = diets.filter(function (d) { return HARD_DIETS.indexOf(d) !== -1; });
    return hard.every(function (d) {
      // Diet hierarchy: a pescatarian also eats anything vegetarian (veg + seafood).
      if (d === "pescatarian") return meal.diets.indexOf("pescatarian") !== -1 || meal.diets.indexOf("vegetarian") !== -1;
      return meal.diets.indexOf(d) !== -1;
    });
  }

  // pantrySet: lowercased pantry tokens. Returns count of meal ingredients in pantry.
  function pantryMatchCount(meal, pantrySet) {
    if (!pantrySet.length) return 0;
    return meal.ing.filter(function (i) {
      return pantrySet.some(function (p) { return i.n.indexOf(p) !== -1 || p.indexOf(i.n) !== -1; });
    }).length;
  }

  function scoreMeal(meal, p) {
    var s = Math.random() * 0.5; // light jitter so regenerate feels alive
    var goals = p.goals || [];
    var softDiets = (p.diets || []).filter(function (d) { return HARD_DIETS.indexOf(d) === -1; });
    // pantry-first
    s += pantryMatchCount(meal, p.pantrySet) * 1.6;
    // time budget
    if (meal.time <= p.maxTime) s += 1; else s -= (meal.time - p.maxTime) / 30;
    // skill match
    var skillRank = { beginner: 1, comfortable: 2, confident: 3 };
    if (skillRank[meal.skill] <= skillRank[p.skill]) s += 0.5;
    // goal & soft-diet boosts
    if (goals.indexOf("budget") !== -1 && meal.diets.indexOf("budget") !== -1) s += 1.2;
    if ((goals.indexOf("quick") !== -1 || softDiets.indexOf("quick") !== -1) && meal.diets.indexOf("quick") !== -1) s += 1;
    if ((goals.indexOf("highProtein") !== -1 || softDiets.indexOf("highProtein") !== -1) && meal.diets.indexOf("highProtein") !== -1) s += 1;
    if (goals.indexOf("veggies") !== -1 && meal.diets.indexOf("vegetarian") !== -1) s += 0.8;
    if (goals.indexOf("balanced") !== -1 && meal.diets.indexOf("mediterranean") !== -1) s += 0.6;
    if ((goals.indexOf("kidFriendly") !== -1 || p.kids > 0 || softDiets.indexOf("kidFriendly") !== -1) && meal.kid) s += 0.9;
    if (goals.indexOf("beginner") !== -1 && meal.skill === "beginner") s += 0.7;
    if (softDiets.indexOf("budget") !== -1 && meal.diets.indexOf("budget") !== -1) s += 0.8;
    if (softDiets.indexOf("lowCarb") !== -1 && meal.diets.indexOf("lowCarb") !== -1) s += 0.8;
    if (softDiets.indexOf("mediterranean") !== -1 && meal.diets.indexOf("mediterranean") !== -1) s += 0.8;
    // tight budget favors cheaper meals
    if (p.budget === "tight") s += Math.max(0, 2 - mealCost(meal) / 6);
    return s;
  }

  function mealCost(meal) { return meal.ing.reduce(function (a, i) { return a + i.c; }, 0); }

  // Returns a NON-EMPTY pool for the slot whenever the slot exists in the
  // library. The allergy filter is NEVER dropped (safety). Other constraints
  // relax in tiers, each setting p._relaxed so the UI can be honest about it.
  function poolFor(slot, p) {
    var all = MEALS.filter(function (m) { return m.slot === slot; });
    var safe = all.filter(function (m) { return !allergyHits(m, p.allergyList); });

    // Tier 1: hard diets + allergy + avoid (the ideal match).
    var pool = safe.filter(function (m) { return meetsHardDiets(m, p.diets); })
                   .filter(function (m) { return !avoidHits(m, p.avoidList); });
    if (pool.length) return pool;

    // Tier 2: drop the soft "avoid" list, keep diets + allergy.
    pool = safe.filter(function (m) { return meetsHardDiets(m, p.diets); });
    if (pool.length) { p._relaxed = true; return pool; }

    // Tier 3 (rare, e.g. impossible combos like vegan + keto): drop diet
    // constraints but KEEP allergy safety, and flag it loudly.
    if (safe.length) { p._relaxed = true; p._dietRelaxed = true; return safe; }

    // Tier 4 (only if every meal in the slot conflicts with an allergy):
    // return nothing so generate() can skip the slot rather than serve unsafe food.
    return [];
  }

  /* ----------------------------------------------------------------------
     5. PLAN GENERATION  (the Meal Planning + Pantry + Grocery agents)
     ---------------------------------------------------------------------- */
  function normalize(intake) {
    var skillMaxTime = { 15: 15, 30: 30, 60: 60 };
    return {
      household: Math.max(1, parseInt(intake.household, 10) || 2),
      kids: Math.max(0, parseInt(intake.kids, 10) || 0),
      days: parseInt(intake.days, 10) || 7,
      meals: intake.meals || "bld",
      diets: intake.diets || [],
      avoid: intake.avoid || "",
      avoidList: parseList(intake.avoid),
      allergies: intake.allergies || "",
      allergyList: parseList(intake.allergies),
      skill: intake.skill || "comfortable",
      maxTime: skillMaxTime[intake.time] || 30,
      budget: intake.budget || "moderate",
      store: intake.store || "",
      goals: intake.goals || [],
      pantry: intake.pantry || "",
      pantrySet: parseList(intake.pantry),
      rewards: intake.rewards || [],
      leftovers: intake.leftovers || "love",
      special: intake.special || "",
      snacks: /snack/i.test(intake.special || "") || (intake.snacks === true),
      _relaxed: false
    };
  }

  function pickRotation(pool, count, p) {
    // score once, then rotate through highest-scoring without immediate repeats
    var ranked = pool.map(function (m) { return { m: m, s: scoreMeal(m, p) }; })
      .sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.m; });
    var out = [], idx = 0;
    if (!ranked.length) return out;
    while (out.length < count) {
      out.push(ranked[idx % ranked.length]);
      idx++;
      if (idx >= ranked.length) ranked = shuffle(ranked); // reshuffle after a full pass
    }
    return out;
  }

  function generate(intake) {
    var p = normalize(intake);
    p.medical = detectMedical(intake);

    var slots = p.meals === "dinner" ? ["dinner"] : p.meals === "ld" ? ["lunch", "dinner"] : ["breakfast", "lunch", "dinner"];
    var dinners = pickRotation(poolFor("dinner", p), p.days, p);
    var lunches = slots.indexOf("lunch") !== -1 ? pickRotation(poolFor("lunch", p), p.days, p) : [];
    var breakfasts = slots.indexOf("breakfast") !== -1 ? pickRotation(poolFor("breakfast", p), p.days, p) : [];
    var snackPool = poolFor("snack", p);
    var snacks = p.snacks ? pickRotation(snackPool, p.days, p) : [];

    var days = [];
    for (var i = 0; i < p.days; i++) {
      var day = { name: DAY_NAMES[i % 7], meals: [] };

      if (breakfasts.length && breakfasts[i]) day.meals.push({ slot: "Breakfast", meal: breakfasts[i], leftover: false });

      // Leftover logic for lunch: if user likes leftovers and yesterday's dinner is leftover-able,
      // make today's lunch a remix of it (no new groceries).
      if (slots.indexOf("lunch") !== -1) {
        if (i > 0 && p.leftovers !== "none" && dinners[i - 1] && dinners[i - 1].leftover && (p.leftovers === "love" || i % 2 === 0)) {
          day.meals.push({ slot: "Lunch", meal: dinners[i - 1], leftover: true, leftoverNote: dinners[i - 1].leftover });
        } else if (lunches[i]) {
          day.meals.push({ slot: "Lunch", meal: lunches[i], leftover: false });
        }
      }

      if (dinners[i]) day.meals.push({ slot: "Dinner", meal: dinners[i], leftover: false });
      if (snacks.length && snacks[i]) day.meals.push({ slot: "Snack", meal: snacks[i], leftover: false });
      days.push(day);
    }

    // ---- Grocery list: collect ingredients from NON-leftover meals, dedupe by name ----
    var byName = {};
    days.forEach(function (d) {
      d.meals.forEach(function (entry) {
        if (entry.leftover) return; // leftovers reuse what's already bought
        entry.meal.ing.forEach(function (ing) {
          var key = ing.n.toLowerCase();
          if (!byName[key]) byName[key] = { n: ing.n, d: ing.d, c: ing.c, uses: 0 };
          byName[key].uses++;
        });
      });
    });

    // Remove pantry items (pantry-aware), keep them as "already have".
    var groceryItems = [], pantryUsed = [];
    Object.keys(byName).forEach(function (key) {
      var it = byName[key];
      var inPantry = p.pantrySet.some(function (pp) { return key.indexOf(pp) !== -1 || pp.indexOf(key) !== -1; });
      if (inPantry) pantryUsed.push(it.n); else groceryItems.push(it);
    });

    // Group grocery by department, in canonical order.
    var grouped = {};
    DEPARTMENTS.forEach(function (d) { grouped[d] = []; });
    groceryItems.forEach(function (it) { (grouped[it.d] || (grouped["Household & Misc"])).push(it); });

    // Cost: scaled gently by household size beyond 2.
    var base = groceryItems.reduce(function (a, it) { return a + it.c; }, 0);
    var sizeFactor = 1 + Math.max(0, (p.household - 2)) * 0.16;
    base = base * sizeFactor;
    var low = Math.round(base * 0.92), high = Math.round(base * 1.12);

    // Store comparison.
    var stores = Object.keys(STORE_MULTIPLIERS).map(function (name) {
      return { name: name, total: Math.round(base * STORE_MULTIPLIERS[name]) };
    }).sort(function (a, b) { return a.total - b.total; });
    var maxStore = Math.max.apply(null, stores.map(function (s) { return s.total; }));

    // Budget swaps that actually apply to this list.
    var listNames = groceryItems.map(function (it) { return it.n.toLowerCase(); }).join(" ");
    var swaps = SWAP_RULES.filter(function (r) { return listNames.indexOf(r.from) !== -1; });
    if (p.budget === "tight") { /* keep all */ } else { swaps = swaps.slice(0, 4); }

    // Coupons relevant to departments present.
    var presentDepts = {}; groceryItems.forEach(function (it) { presentDepts[it.d] = true; });
    var coupons = COUPONS.filter(function (c) { return presentDepts[c.dept]; });

    return {
      profile: p, days: days, grouped: grouped, groceryCount: groceryItems.length,
      pantryUsed: pantryUsed, costLow: low, costHigh: high, costBase: base,
      stores: stores, maxStore: maxStore, swaps: swaps, coupons: coupons,
      relaxed: p._relaxed
    };
  }

  /* ----------------------------------------------------------------------
     6. RENDERING
     ---------------------------------------------------------------------- */
  function render(plan) {
    state.plan = plan;
    renderSummary(plan);
    renderDays(plan);
    renderGrocery(plan);
    renderStores(plan);
    renderSwaps(plan);
    renderCoupons(plan);
    renderWellness();
    renderSaved();
    $("#prep-panel").style.display = "none";
    $("#results").classList.add("is-shown");
  }

  function renderSummary(plan) {
    var p = plan.profile;
    var dietTxt = p.diets.length ? p.diets.map(prettyDiet).join(", ") : "no special diet";
    var who = p.household + (p.household === 1 ? " person" : " people") + (p.kids ? " (" + p.kids + " kid" + (p.kids > 1 ? "s" : "") + ")" : "");
    var parts = [p.days + "-day plan", "for " + who, dietTxt];
    if (p.pantrySet.length) parts.push("planned around " + plan.pantryUsed.length + " pantry item" + (plan.pantryUsed.length === 1 ? "" : "s"));
    var msg = parts.join(" · ");
    if (plan.profile._dietRelaxed) msg += " — heads up: that combination of diets is very restrictive, so we loosened diet rules to fill the week (allergies were always respected). Try fewer diet filters for a tighter match.";
    else if (plan.relaxed) msg += " — we loosened a couple of 'avoid' preferences to keep variety; tweak and regenerate anytime.";
    $("#results-summary").textContent = msg;
    if (p.medical) showResultGuardrail();
  }

  function prettyDiet(k) {
    for (var i = 0; i < DIET_OPTIONS.length; i++) if (DIET_OPTIONS[i][1] === k) return DIET_OPTIONS[i][0].toLowerCase();
    return k;
  }

  function showResultGuardrail() {
    if ($("#result-guardrail")) return;
    var g = el("div", "guardrail is-shown");
    g.id = "result-guardrail";
    g.style.display = "flex"; g.style.marginBottom = "1.5rem";
    g.innerHTML = '<span class="g-ico" aria-hidden="true">⚠️</span><p><strong>A note on your plan:</strong> ' +
      'you mentioned something that may be a medical or pregnancy-related need. This plan is general meal planning only. ' +
      'Please confirm any major dietary changes with a qualified medical professional or registered dietitian before acting on them.</p>';
    var head = $(".results-head");
    head.parentNode.insertBefore(g, head.nextSibling);
  }

  function renderDays(plan) {
    var body = $("#plan-body"); body.innerHTML = "";
    plan.days.forEach(function (day, di) {
      var card = el("div", "day-card");
      var headHtml = '<div class="day-card-head"><h4>' + esc(day.name) + '</h4><span class="day-cal">' +
        day.meals.length + " meals</span></div>";
      var rows = day.meals.map(function (entry, mi) {
        var m = entry.meal;
        var tags = "";
        if (entry.leftover) tags += '<span class="leftover-tag">♻ leftover → ' + esc(entry.leftoverNote || "remix") + "</span>";
        if (!entry.leftover && pantryMatchCount(m, plan.profile.pantrySet) > 0) tags += '<span class="pantry-tag">🧺 uses pantry</span>';
        var saved = state.saved.indexOf(m.id) !== -1;
        var actions = '<div class="meal-actions">' +
          '<button class="icon-btn js-view" title="View recipe" data-id="' + m.id + '" aria-label="View ' + esc(m.name) + '">👁</button>' +
          (entry.leftover ? "" :
            '<button class="icon-btn js-regen" title="Swap this meal" data-day="' + di + '" data-meal="' + mi + '" aria-label="Swap ' + esc(m.name) + '">↻</button>') +
          '<button class="icon-btn js-save ' + (saved ? "is-saved" : "") + '" title="Save recipe" data-id="' + m.id + '" aria-label="Save ' + esc(m.name) + '">♡</button>' +
          "</div>";
        return '<div class="meal-row"><span class="meal-slot">' + esc(entry.slot) + '</span>' +
          '<span class="meal-name">' + esc(m.name) + " " + tags + '<br><small style="color:var(--text-mute);font-family:var(--ff-mono);font-size:0.66rem;">' +
          m.time + " min · " + esc(titleCase(m.skill)) + "</small></span>" + actions + "</div>";
      }).join("");
      card.innerHTML = headHtml + rows;
      body.appendChild(card);
    });
    bindMealButtons();
  }

  function renderGrocery(plan) {
    var body = $("#grocery-body"); body.innerHTML = "";
    var any = false;
    DEPARTMENTS.forEach(function (dept) {
      var items = plan.grouped[dept];
      if (!items || !items.length) return;
      any = true;
      var wrap = el("div", "dept");
      wrap.innerHTML = '<div class="dept-head">' + deptIcon(dept) + " " + esc(dept) +
        '<span class="dept-count">' + items.length + "</span></div>";
      items.forEach(function (it, idx) {
        var id = "gi-" + dept.replace(/\W/g, "") + idx;
        var row = el("div", "grocery-item");
        row.innerHTML = '<input type="checkbox" id="' + id + '"><label for="' + id + '">' + esc(titleCase(it.n)) +
          (it.uses > 1 ? ' <span class="gi-qty">×' + it.uses + " meals</span>" : "") + "</label>";
        var cb = row.querySelector("input");
        cb.addEventListener("change", function () { row.classList.toggle("is-checked", cb.checked); });
        wrap.appendChild(row);
      });
      body.appendChild(wrap);
    });
    if (plan.pantryUsed.length) {
      var note = el("div", "dept");
      note.innerHTML = '<div class="dept-head" style="color:var(--gold);border-color:var(--gold);">🧺 Already in your pantry' +
        '<span class="dept-count">' + plan.pantryUsed.length + "</span></div>" +
        '<p style="margin:0;font-size:0.82rem;color:var(--text-mute);">Kept off your list: ' +
        esc(plan.pantryUsed.map(titleCase).join(", ")) + ".</p>";
      body.appendChild(note);
    }
    if (!any) body.innerHTML = '<p style="color:var(--text-mute);">Everything you need is already in your pantry. Nice.</p>';
    $("#grocery-note").textContent = plan.groceryCount + " items · by department";
    $("#cost-val").innerHTML = money(plan.costLow) + "–" + money(plan.costHigh) + ' <small>est.</small>';
  }

  function deptIcon(d) {
    return { "Produce":"🥦","Meat & Seafood":"🍗","Dairy & Eggs":"🥚","Bakery":"🥖","Pantry":"🥫","Frozen":"❄️","Beverages":"🧃","Snacks":"🍿","Household & Misc":"🧻" }[d] || "•";
  }

  function renderStores(plan) {
    var body = $("#store-body"); body.innerHTML = "";
    plan.stores.forEach(function (s, idx) {
      var best = idx === 0;
      var pct = Math.round((s.total / plan.maxStore) * 100);
      var fav = plan.profile.store && plan.profile.store === s.name;
      var row = el("div", "store-row");
      row.innerHTML =
        '<span class="store-name">' + esc(s.name) +
          (best ? '<span class="best-tag">best est.</span>' : "") +
          (fav && !best ? '<span class="best-tag" style="background:var(--gold);">your pick</span>' : "") + "</span>" +
        '<span class="store-price">' + money(s.total) + "</span>" +
        '<span class="store-bar-wrap"><span class="store-bar ' + (best ? "is-best" : "") + '" style="width:' + pct + '%"></span></span>';
      body.appendChild(row);
    });
    var note = el("p", null, "Best estimated basket: <strong style=\"color:var(--sage-2)\">" + esc(plan.stores[0].name) +
      " at " + money(plan.stores[0].total) + "</strong> — about " + money(plan.maxStore - plan.stores[0].total) +
      " under the priciest option. Sample math; connect live pricing to make it real.");
    note.style.cssText = "margin:0.9rem 0 0;font-size:0.82rem;color:var(--text-mute);";
    body.appendChild(note);
  }

  function renderSwaps(plan) {
    var body = $("#swap-body"); body.innerHTML = "";
    if (!plan.swaps.length) { body.innerHTML = '<p style="color:var(--text-mute);font-size:0.88rem;margin:0;">No obvious swaps on this list — it\'s already lean.</p>'; return; }
    var total = 0;
    plan.swaps.forEach(function (sw) {
      total += sw.save;
      var item = el("div", "swap-item");
      item.innerHTML = '<span class="swap-from">' + esc(titleCase(sw.from)) + '</span> → <span class="swap-to">' +
        esc(titleCase(sw.to)) + '</span><span class="swap-save">save ~' + money(sw.save) + "</span>";
      body.appendChild(item);
    });
    var foot = el("p", null, "Swap them all to trim roughly <strong style=\"color:var(--accent-2)\">" + money(total) + "</strong> off the basket.");
    foot.style.cssText = "margin:0.8rem 0 0;font-size:0.85rem;color:var(--text-dim);";
    body.appendChild(foot);
  }

  function renderCoupons(plan) {
    var body = $("#coupon-body"); body.innerHTML = "";
    var rew = plan.profile.rewards;
    var intro = el("p", null, rew.length
      ? "Using your cards: <strong>" + esc(rew.join(", ")) + "</strong>. We'll line up clip-to-card deals here once a coupon API is connected."
      : "No rewards cards selected. Add them in the form and we'll plan around their deals.");
    intro.style.cssText = "margin:0 0 0.8rem;font-size:0.84rem;color:var(--text-mute);";
    body.appendChild(intro);
    plan.coupons.forEach(function (c) {
      var row = el("div", "coupon-item");
      row.innerHTML = '<span class="c-ico">' + c.ico + '</span><span class="c-body"><strong>' + esc(c.text) +
        "</strong> — " + esc(c.detail) + '<span class="c-tag">' + esc(c.tag) + " · sample, not applied</span></span>";
      body.appendChild(row);
    });
  }

  function renderWellness() {
    var toggle = $("#wellness-toggle");
    toggle.checked = state.wellnessOn;
    var body = $("#wellness-body");
    body.style.display = state.wellnessOn ? "grid" : "none";
    if (state.wellnessOn && !body.childNodes.length) {
      shuffle(WELLNESS).slice(0, 4).forEach(function (w) {
        var c = el("div", "wellness-card");
        c.innerHTML = '<span class="w-ico">' + w.ico + '</span><h5>' + esc(w.title) + "</h5><p>" + esc(w.body) + "</p>";
        body.appendChild(c);
      });
    }
  }

  function renderSaved() {
    var grid = $("#saved-body");
    $("#saved-count").textContent = state.saved.length + " saved";
    if (!state.saved.length) {
      grid.innerHTML = '<p class="saved-empty" style="color:var(--text-mute);">Nothing saved yet. Tap ♡ on any meal to keep it for future weeks.</p>';
      return;
    }
    grid.innerHTML = "";
    state.saved.forEach(function (id) {
      var m = MEALS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
      var card = el("div", "saved-card");
      var tags = m.diets.slice(0, 3).map(function (d) { return '<span class="sc-tag">' + esc(prettyDiet(d)) + "</span>"; }).join("");
      card.innerHTML = "<h4>" + esc(m.name) + '</h4><span class="sc-meta">' + esc(titleCase(m.slot)) + " · " + m.time +
        ' min</span><div class="sc-tags">' + tags + '</div><div class="sc-actions">' +
        '<button class="btn btn-ghost btn-sm js-view" data-id="' + m.id + '">View</button>' +
        '<button class="btn btn-ghost btn-sm js-unsave" data-id="' + m.id + '">Remove</button></div>';
      grid.appendChild(card);
    });
    bindMealButtons();
  }

  /* ----------------------------------------------------------------------
     7. INTERACTION: regenerate / save / modal
     ---------------------------------------------------------------------- */
  function bindMealButtons() {
    $$(".js-view").forEach(function (b) { b.onclick = function () { openModal(b.getAttribute("data-id")); }; });
    $$(".js-save").forEach(function (b) { b.onclick = function () { toggleSave(b.getAttribute("data-id")); }; });
    $$(".js-unsave").forEach(function (b) { b.onclick = function () { toggleSave(b.getAttribute("data-id")); }; });
    $$(".js-regen").forEach(function (b) {
      b.onclick = function () { regenMeal(parseInt(b.getAttribute("data-day"), 10), parseInt(b.getAttribute("data-meal"), 10)); };
    });
  }

  function toggleSave(id) {
    var i = state.saved.indexOf(id);
    if (i === -1) { state.saved.push(id); toast("Saved ♡ — it's in your recipe box"); }
    else { state.saved.splice(i, 1); toast("Removed from saved"); }
    saveState();
    if (state.plan) renderDays(state.plan);
    renderSaved();
  }

  function regenMeal(di, mi) {
    if (!state.plan) return;
    var plan = state.plan, p = plan.profile;
    var entry = plan.days[di].meals[mi];
    if (entry.leftover) return;
    var slot = entry.meal.slot;
    var used = {};
    plan.days.forEach(function (d) { d.meals.forEach(function (e) { used[e.meal.id] = true; }); });
    var pool = poolFor(slot, p).filter(function (m) { return m.id !== entry.meal.id; });
    var fresh = pool.filter(function (m) { return !used[m.id]; });
    var chooseFrom = fresh.length ? fresh : pool;
    if (!chooseFrom.length) { toast("No other match for that slot — try adjusting filters"); return; }
    var ranked = chooseFrom.map(function (m) { return { m: m, s: scoreMeal(m, p) }; }).sort(function (a, b) { return b.s - a.s; });
    entry.meal = ranked[0].m;
    // Rebuild downstream (grocery/cost/stores/swaps/coupons depend on meals)
    rebuildDerived(plan);
    renderDays(plan); renderGrocery(plan); renderStores(plan); renderSwaps(plan); renderCoupons(plan);
    toast("Swapped in: " + entry.meal.name);
  }

  // Recompute grocery + costs after a single-meal swap.
  function rebuildDerived(plan) {
    var p = plan.profile;
    var byName = {};
    plan.days.forEach(function (d) {
      d.meals.forEach(function (entry) {
        if (entry.leftover) return;
        entry.meal.ing.forEach(function (ing) {
          var key = ing.n.toLowerCase();
          if (!byName[key]) byName[key] = { n: ing.n, d: ing.d, c: ing.c, uses: 0 };
          byName[key].uses++;
        });
      });
    });
    var groceryItems = [], pantryUsed = [];
    Object.keys(byName).forEach(function (key) {
      var it = byName[key];
      var inPantry = p.pantrySet.some(function (pp) { return key.indexOf(pp) !== -1 || pp.indexOf(key) !== -1; });
      if (inPantry) pantryUsed.push(it.n); else groceryItems.push(it);
    });
    var grouped = {}; DEPARTMENTS.forEach(function (d) { grouped[d] = []; });
    groceryItems.forEach(function (it) { (grouped[it.d] || grouped["Household & Misc"]).push(it); });
    var base = groceryItems.reduce(function (a, it) { return a + it.c; }, 0) * (1 + Math.max(0, p.household - 2) * 0.16);
    var stores = Object.keys(STORE_MULTIPLIERS).map(function (name) { return { name: name, total: Math.round(base * STORE_MULTIPLIERS[name]) }; })
      .sort(function (a, b) { return a.total - b.total; });
    var listNames = groceryItems.map(function (it) { return it.n.toLowerCase(); }).join(" ");
    var presentDepts = {}; groceryItems.forEach(function (it) { presentDepts[it.d] = true; });
    plan.grouped = grouped; plan.groceryCount = groceryItems.length; plan.pantryUsed = pantryUsed;
    plan.costBase = base; plan.costLow = Math.round(base * 0.92); plan.costHigh = Math.round(base * 1.12);
    plan.stores = stores; plan.maxStore = Math.max.apply(null, stores.map(function (s) { return s.total; }));
    plan.swaps = SWAP_RULES.filter(function (r) { return listNames.indexOf(r.from) !== -1; });
    plan.coupons = COUPONS.filter(function (c) { return presentDepts[c.dept]; });
  }

  // ---- Recipe modal ----
  var modalCurrentId = null;
  function openModal(id) {
    var m = MEALS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    modalCurrentId = id;
    $("#modal-title").textContent = m.name;
    $("#modal-meta").textContent = titleCase(m.slot) + " · " + m.time + " min · " + titleCase(m.skill) + " · ~" + money(mealCost(m)) + " ingredients";
    var allerg = m.allergens.length ? m.allergens.map(titleCase).join(", ") : "none flagged";
    var ingHtml = m.ing.map(function (i) { return "<li>" + esc(titleCase(i.n)) + ' <span style="color:var(--text-mute);font-family:var(--ff-mono);font-size:0.72rem;">· ' + esc(i.d) + "</span></li>"; }).join("");
    var stepHtml = m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var dietHtml = m.diets.map(function (d) { return '<span class="sc-tag" style="margin-right:.3rem;">' + esc(prettyDiet(d)) + "</span>"; }).join("");
    $("#modal-body").innerHTML =
      "<div>" + dietHtml + "</div>" +
      "<h4>Ingredients</h4><ul>" + ingHtml + "</ul>" +
      "<h4>Steps</h4><ol>" + stepHtml + "</ol>" +
      '<h4>Allergens to know</h4><p style="font-size:0.9rem;color:var(--text-dim);margin:0;">Contains/may contain: ' + esc(allerg) +
      ". Always double-check labels for your household's allergies. Not medical or allergy advice.</p>";
    var saveBtn = $("#modal-save");
    saveBtn.textContent = state.saved.indexOf(id) !== -1 ? "♥ Saved" : "♡ Save recipe";
    var modal = $("#recipe-modal"); modal.hidden = false; modal.classList.add("is-open");
    $("#modal-close").focus();
  }
  function closeModal() { var m = $("#recipe-modal"); m.classList.remove("is-open"); m.hidden = true; modalCurrentId = null; }

  /* ----------------------------------------------------------------------
     8. QUICK FORM
     ---------------------------------------------------------------------- */
  function buildChips(containerId, options, name) {
    var c = $("#" + containerId); if (!c) return;
    options.forEach(function (opt) {
      var label = Array.isArray(opt) ? opt[0] : opt;
      var val = Array.isArray(opt) ? opt[1] : opt;
      var wrap = el("label", "check-chip");
      wrap.innerHTML = '<input type="checkbox" name="' + name + '" value="' + esc(val) + '"><span>' + esc(label) + "</span>";
      c.appendChild(wrap);
    });
  }

  function readChecks(name) {
    return $$('input[name="' + name + '"]:checked').map(function (i) { return i.value; });
  }

  function quickFormIntake() {
    return {
      household: $("#q-household").value,
      kids: $("#q-kids").value,
      days: $("#q-days").value,
      meals: $("#q-meals").value,
      diets: readChecks("diet"),
      avoid: $("#q-avoid").value,
      allergies: $("#q-allergies").value,
      skill: $("#q-skill").value,
      time: $("#q-time").value,
      budget: $("#q-budget").value,
      store: $("#q-store").value,
      goals: readChecks("goal"),
      pantry: $("#q-pantry").value,
      rewards: readChecks("reward"),
      leftovers: $("#q-leftovers").value,
      special: $("#q-special").value
    };
  }

  function watchGuardrail() {
    var check = function () {
      var probe = { allergies: $("#q-allergies").value, avoid: $("#q-avoid").value, special: $("#q-special").value, diets: readChecks("diet") };
      $("#form-guardrail").classList.toggle("is-shown", detectMedical(probe));
    };
    ["#q-allergies", "#q-avoid", "#q-special"].forEach(function (s) { $(s).addEventListener("input", check); });
  }

  /* ----------------------------------------------------------------------
     9. GUIDED CONVERSATION ENGINE
     ---------------------------------------------------------------------- */
  var SCRIPT = [
    { key: "open", bot: "Hey — I'm your Pantry Assistant. Let's make dinner one less thing yelling at you from the fridge. First: how many people am I planning for?", type: "number", placeholder: "e.g., 4" },
    { key: "kids", bot: "Got it. How many of those are kids? (Helps me pick crowd-pleasers — say 0 if none.)", type: "number", placeholder: "e.g., 2" },
    { key: "days", bot: "How many days should I plan?", type: "choice", options: [["3 days", "3"], ["5 days", "5"], ["Full week", "7"]] },
    { key: "meals", bot: "Which meals do you want covered?", type: "choice", options: [["Dinner only", "dinner"], ["Lunch + dinner", "ld"], ["All three", "bld"]] },
    { key: "diets", bot: "Any eating style I should stick to? Tap all that apply, or 'None'.", type: "multi", options: DIET_OPTIONS, allowNone: true },
    { key: "allergies", bot: "Important one: any allergies or restrictions I must avoid? Type them, or 'none'.", type: "text", placeholder: "e.g., peanuts, shellfish — or 'none'" },
    { key: "avoid", bot: "Anything you just don't like and want me to skip? (Type it, or 'skip'.)", type: "text", placeholder: "e.g., mushrooms — or 'skip'", optional: true },
    { key: "skill", bot: "How do you feel about cooking?", type: "choice", options: [["Keep it simple", "beginner"], ["Comfortable", "comfortable"], ["Bring it on", "confident"]] },
    { key: "time", bot: "On a busy weeknight, how much time do you want to spend?", type: "choice", options: [["15 min", "15"], ["~30 min", "30"], ["45+ is fine", "60"]] },
    { key: "budget", bot: "How's the grocery budget this week?", type: "choice", options: [["Tight", "tight"], ["Moderate", "moderate"], ["Flexible", "flexible"]] },
    { key: "store", bot: "Where do you usually shop? I'll factor it in.", type: "choice", options: [["Aldi", "Aldi"], ["Walmart", "Walmart"], ["Giant", "Giant"], ["Food Lion", "Food Lion"], ["Target", "Target"], ["No preference", ""]] },
    { key: "pantry", bot: "Now the fun part — what's already in your kitchen? I'll plan around it and keep it off your list. (Type a few things, or 'skip'.)", type: "text", placeholder: "e.g., rice, canned beans, eggs, pasta", optional: true },
    { key: "goals", bot: "Last thing — what matters most this week? Tap all that apply.", type: "multi", options: GOAL_OPTIONS, allowNone: true },
    { key: "special", bot: "Anything else on your mind? (One veggie night, school lunches, freezer meals… or 'skip'.)", type: "text", placeholder: "e.g., one vegetarian night", optional: true }
  ];

  var guided = { idx: 0, intake: {}, selected: [] };

  function startGuided(reset) {
    if (reset) { guided = { idx: 0, intake: {}, selected: [] }; $("#chat-log").innerHTML = ""; }
    if (!$("#chat-log").childNodes.length) askGuided();
  }

  function botSay(text) {
    var log = $("#chat-log");
    var msg = el("div", "msg msg-bot", esc(text));
    log.appendChild(msg); log.scrollTop = log.scrollHeight;
  }
  function userSay(text) {
    var log = $("#chat-log");
    var msg = el("div", "msg msg-user", esc(text));
    log.appendChild(msg); log.scrollTop = log.scrollHeight;
  }

  function askGuided() {
    var step = SCRIPT[guided.idx];
    $("#chat-progress-bar").style.width = Math.round((guided.idx / SCRIPT.length) * 100) + "%";
    botSay(step.bot);
    var opts = $("#chat-options"); opts.innerHTML = ""; guided.selected = [];
    var input = $("#chat-input");
    if (step.type === "choice") {
      input.style.display = "none";
      step.options.forEach(function (o) {
        var chip = el("button", "opt-chip", esc(o[0])); chip.type = "button";
        chip.onclick = function () { userSay(o[0]); commitGuided(step, o[1], o[0]); };
        opts.appendChild(chip);
      });
      $("#chat-hint").textContent = "Tap an option above.";
    } else if (step.type === "multi") {
      input.style.display = "none";
      step.options.forEach(function (o) {
        var chip = el("button", "opt-chip", esc(o[0])); chip.type = "button";
        chip.onclick = function () {
          var i = guided.selected.indexOf(o[1]);
          if (i === -1) { guided.selected.push(o[1]); chip.classList.add("is-sel"); }
          else { guided.selected.splice(i, 1); chip.classList.remove("is-sel"); }
        };
        opts.appendChild(chip);
      });
      if (step.allowNone) {
        var none = el("button", "opt-chip", "None of these"); none.type = "button";
        none.onclick = function () { userSay("None"); commitGuided(step, [], "None"); };
        opts.appendChild(none);
      }
      var done = el("button", "opt-chip", "✓ Done"); done.type = "button";
      done.style.cssText = "border-color:var(--sage);color:var(--sage);font-weight:600;";
      done.onclick = function () {
        var labels = guided.selected.map(function (v) { return optLabel(step.options, v); });
        userSay(labels.length ? labels.join(", ") : "None");
        commitGuided(step, guided.selected.slice(), labels.join(", "));
      };
      opts.appendChild(done);
      $("#chat-hint").textContent = "Tap any that apply, then ✓ Done.";
    } else {
      input.style.display = "block";
      input.value = ""; input.placeholder = step.placeholder || "Type your answer…";
      input.focus();
      $("#chat-hint").textContent = step.optional ? "Type an answer, or say 'skip'." : "Type your answer and hit Send.";
    }
  }

  function optLabel(options, val) {
    for (var i = 0; i < options.length; i++) if (options[i][1] === val) return options[i][0];
    return val;
  }

  function commitGuided(step, value, displayMaybe) {
    // adaptive little asides
    if (step.key === "kids" && (parseInt(value, 10) || 0) > 0) setTimeout(function () { botSay("Love it — I'll keep a few kid-friendly wins in rotation."); }, 250);
    if (step.key === "allergies" && value && !/^\s*(none|no|n\/a|skip)\s*$/i.test(value)) {
      if (detectMedical({ allergies: value })) {
        setTimeout(function () { botSay("Thanks for flagging that. Quick boundary: I do general planning, not medical advice — please confirm any big dietary changes with your doctor or a registered dietitian first. I'll steer around what you listed."); }, 250);
      } else {
        setTimeout(function () { botSay("Noted — I'll keep those out of your plan. Double-check labels too, just to be safe."); }, 250);
      }
    }
    if (step.key === "pantry" && value && !/^\s*skip\s*$/i.test(value)) setTimeout(function () { botSay("Perfect, I'll put those to work before adding anything new."); }, 250);

    // store value into intake using the same shape as the quick form
    var v = value;
    if (step.type === "text" && /^\s*(skip|none|no|n\/a)\s*$/i.test(value || "")) v = "";
    guided.intake[step.key === "open" ? "household" : step.key] = v;

    guided.idx++;
    if (guided.idx >= SCRIPT.length) {
      $("#chat-progress-bar").style.width = "100%";
      setTimeout(function () {
        botSay("That's everything I need. Building your week, your grocery list, and a smart-shopping breakdown now… 🍳");
        var intake = mapGuidedIntake(guided.intake);
        setTimeout(function () { finishAndGenerate(intake, "guided"); }, 600);
      }, 300);
    } else {
      setTimeout(askGuided, step.key === "allergies" || step.key === "kids" || step.key === "pantry" ? 700 : 350);
    }
  }

  function mapGuidedIntake(g) {
    return {
      household: g.household, kids: g.kids, days: g.days, meals: g.meals,
      diets: Array.isArray(g.diets) ? g.diets : [], avoid: g.avoid || "", allergies: g.allergies || "",
      skill: g.skill, time: g.time, budget: g.budget, store: g.store || "",
      goals: Array.isArray(g.goals) ? g.goals : [], pantry: g.pantry || "", rewards: [],
      leftovers: "love", special: g.special || ""
    };
  }

  function handleGuidedText(e) {
    e.preventDefault();
    var step = SCRIPT[guided.idx];
    if (!step || (step.type !== "text" && step.type !== "number")) return;
    var val = $("#chat-input").value.trim();
    if (!val && !step.optional) { toast("Mind giving me a quick answer?"); return; }
    if (step.type === "number") { val = (parseInt(val, 10) || (step.key === "kids" ? 0 : 1)).toString(); }
    userSay(val || "skip");
    commitGuided(step, val, val);
  }

  /* ----------------------------------------------------------------------
     9b. SAMPLE KITCHENS
     Canned intakes so a visitor can see a finished plan without filling
     anything in. These fill the quick form and then submit it, so there is
     exactly one path that builds a plan. Nothing here calls a network.
     ---------------------------------------------------------------------- */
  var SAMPLES = {
    family: {
      household: "4", kids: "2", days: "7", meals: "bld",
      diet: ["kidFriendly", "budget"], goal: [], reward: [],
      avoid: "mushrooms", allergies: "",
      skill: "comfortable", time: "30", budget: "tight",
      store: "Aldi", pantry: "rice, pasta, canned tomatoes, frozen peas",
      leftovers: "love"
    },
    glutenfree: {
      household: "2", kids: "0", days: "7", meals: "ld",
      diet: ["glutenFree", "mediterranean"], goal: [], reward: [],
      avoid: "", allergies: "gluten",
      skill: "confident", time: "60", budget: "moderate",
      store: "Trader Joe's", pantry: "olive oil, quinoa, chickpeas",
      leftovers: "some"
    },
    fast: {
      household: "3", kids: "2", days: "5", meals: "dinner",
      diet: ["quick", "kidFriendly"], goal: [], reward: [],
      avoid: "", allergies: "",
      skill: "beginner", time: "15", budget: "tight",
      store: "Walmart", pantry: "eggs, tortillas, frozen veg",
      leftovers: "love"
    }
  };

  function applySample(key) {
    var s = SAMPLES[key];
    if (!s) return;
    var form = $("#quick-form");
    if (!form) return;

    // plain fields
    ["household", "kids", "days", "meals", "avoid", "allergies",
     "skill", "time", "budget", "store", "pantry", "leftovers"].forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (input && s[name] != null) input.value = s[name];
    });

    // checkbox groups
    ["diet", "goal", "reward"].forEach(function (name) {
      var picked = s[name] || [];
      $$('input[name="' + name + '"]', form).forEach(function (box) {
        box.checked = picked.indexOf(box.value) !== -1;
      });
    });

    // the allergy/medical guardrail listens to input events, so let it re-evaluate
    var allergyInput = form.querySelector('[name="allergies"]');
    if (allergyInput) allergyInput.dispatchEvent(new Event("input", { bubbles: true }));

    finishAndGenerate(quickFormIntake(), "quick");
  }

  /* ----------------------------------------------------------------------
     10. SHARED: finish + generate + scroll
     ---------------------------------------------------------------------- */
  function finishAndGenerate(intake, source) {
    state.intake = intake;
    var plan = generate(intake);
    render(plan);
    // clear any prior result guardrail then re-show if needed
    var rg = $("#result-guardrail"); if (rg) rg.remove();
    if (plan.profile.medical) showResultGuardrail();
    scrollToEl("#results");
    if (source === "quick") $("#quick-note").textContent = "Plan ready below ↓";
  }

  function scrollToEl(sel) {
    var n = $(sel); if (!n) return;
    window.scrollTo({ top: n.getBoundingClientRect().top + window.pageYOffset - 70, behavior: "smooth" });
  }

  function buildPrep(plan) {
    var body = $("#prep-body");
    var dinners = [];
    plan.days.forEach(function (d) { d.meals.forEach(function (e) { if (e.slot === "Dinner" && !e.leftover) dinners.push(e.meal); }); });
    var uniq = []; dinners.forEach(function (m) { if (uniq.indexOf(m) === -1) uniq.push(m); });
    var tasks = [
      "Wash and chop sturdy veg (carrots, peppers, broccoli) — store in containers.",
      "Cook a big batch of your grain (rice/pasta) to reuse across 2–3 meals.",
      "Portion proteins into meal-size bags; season what you'll use first.",
      "Make one sauce or dressing to carry through the week.",
      "Pre-stage the leftover remixes so reheats are grab-and-go."
    ];
    var html = '<p style="margin:0 0 0.9rem;color:var(--text-mute);font-size:0.88rem;">A ~45-minute Sunday session to coast through the week:</p><ol style="margin:0;padding-left:1.2rem;display:grid;gap:0.5rem;">';
    tasks.forEach(function (t) { html += '<li style="font-size:0.92rem;color:var(--text-dim);">' + esc(t) + "</li>"; });
    html += "</ol>";
    html += '<p style="margin:1rem 0 0;font-family:var(--ff-mono);font-size:0.74rem;color:var(--sage);">Batch-friendly this week: ' +
      esc(uniq.slice(0, 4).map(function (m) { return m.name; }).join(" · ")) + "</p>";
    body.innerHTML = html;
  }

  /* ----------------------------------------------------------------------
     11. WIRING (DOM ready)
     ---------------------------------------------------------------------- */
  function init() {
    loadState();

    // Year
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

    // Build dynamic chips
    buildChips("q-diets", DIET_OPTIONS, "diet");
    buildChips("q-goals", GOAL_OPTIONS, "goal");
    buildChips("q-rewards", REWARD_OPTIONS, "reward");
    watchGuardrail();

    // Mobile nav
    var toggle = $(".menu-toggle"), mnav = $("#mobile-nav");
    if (toggle) toggle.addEventListener("click", function () {
      var open = mnav.hasAttribute("hidden");
      if (open) { mnav.removeAttribute("hidden"); } else { mnav.setAttribute("hidden", ""); }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#mobile-nav a").forEach(function (a) { a.addEventListener("click", function () { mnav.setAttribute("hidden", ""); toggle.setAttribute("aria-expanded", "false"); }); });

    // Smooth scroll for in-page links
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && $(id)) { e.preventDefault(); scrollToEl(id); }
      });
    });

    // Mode tabs
    var tabGuided = $("#tab-guided"), tabQuick = $("#tab-quick");
    function setMode(mode) {
      var g = mode === "guided";
      tabGuided.setAttribute("aria-selected", g ? "true" : "false");
      tabQuick.setAttribute("aria-selected", g ? "false" : "true");
      $("#panel-guided").classList.toggle("is-active", g);
      $("#panel-quick").classList.toggle("is-active", !g);
      if (g) startGuided(false);
    }
    tabGuided.addEventListener("click", function () { setMode("guided"); });
    tabQuick.addEventListener("click", function () { setMode("quick"); });

    // Guided form submit (text/number answers)
    $("#chat-form").addEventListener("submit", handleGuidedText);

    // Quick form submit
    $("#quick-form").addEventListener("submit", function (e) {
      e.preventDefault();
      finishAndGenerate(quickFormIntake(), "quick");
    });

    // Sample kitchens: fill the real form, then run the normal submit path
    $$(".sample-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applySample(btn.getAttribute("data-sample"));
      });
    });
    $("#quick-reset").addEventListener("click", function () {
      $("#quick-form").reset();
      $$('input[type="checkbox"]', $("#quick-form")).forEach(function (c) { c.checked = false; });
      $("#form-guardrail").classList.remove("is-shown");
      $("#quick-note").textContent = "";
    });

    // Results actions
    $("#btn-regen-week").addEventListener("click", function () {
      if (state.intake) { finishAndGenerate(state.intake, "regen"); toast("Fresh week, fresh ideas 🍽️"); }
    });
    $("#btn-edit").addEventListener("click", function () { scrollToEl("#planner"); });
    $("#btn-print").addEventListener("click", function () { window.print(); });
    $("#btn-prep").addEventListener("click", function () {
      if (!state.plan) return;
      var panel = $("#prep-panel");
      var show = panel.style.display === "none";
      if (show) { buildPrep(state.plan); panel.style.display = "block"; scrollToEl("#prep-panel"); }
      else panel.style.display = "none";
    });

    // Wellness toggle
    $("#wellness-toggle").addEventListener("change", function () {
      state.wellnessOn = this.checked; saveState();
      $("#wellness-body").innerHTML = ""; renderWellness();
    });

    // Modal
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal-dismiss").addEventListener("click", closeModal);
    $("#recipe-modal").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    $("#modal-save").addEventListener("click", function () {
      if (modalCurrentId) { toggleSave(modalCurrentId); $("#modal-save").textContent = state.saved.indexOf(modalCurrentId) !== -1 ? "♥ Saved" : "♡ Save recipe"; }
    });
    $("#modal-similar").addEventListener("click", function () {
      var m = MEALS.filter(function (x) { return x.id === modalCurrentId; })[0]; if (!m) return;
      var similar = MEALS.filter(function (x) { return x.slot === m.slot && x.id !== m.id && x.diets.some(function (d) { return m.diets.indexOf(d) !== -1; }); });
      if (similar.length) { openModal(shuffle(similar)[0].id); } else { toast("No close match in the sample library"); }
    });

    // CTA form
    $("#cta-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#cta-email").value.trim();
      if (!/.+@.+\..+/.test(email)) { $("#cta-note").textContent = "Hmm, that email looks off — mind checking it?"; return; }
      $("#cta-note").textContent = "You're on the list (prototype — nothing was actually sent). Thanks! 🌿";
      $("#cta-form").reset();
    });

    // Reveal on scroll
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      $$(".reveal").forEach(function (n) { io.observe(n); });
    } else {
      $$(".reveal").forEach(function (n) { n.classList.add("is-in"); });
    }

    // Kick off the guided chat so the prototype is alive on load
    startGuided(false);
  }

  // Only boot the UI when a DOM is present (browser). In Node (tests) we skip
  // init and instead expose the pure logic below so it can be verified headlessly.
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }

  // Test hook — no effect in the browser, lets `node` unit-test the generator.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      MEALS: MEALS, DEPARTMENTS: DEPARTMENTS, generate: generate, normalize: normalize,
      poolFor: poolFor, detectMedical: detectMedical, mealCost: mealCost
    };
  }
})();
